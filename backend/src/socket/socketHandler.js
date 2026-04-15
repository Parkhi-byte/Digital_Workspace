import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { createNotification } from '../utils/notificationService.js';

export const setupSocket = (io) => {
    let onlineUsers = new Map();
    const videoRooms = new Map();
    const ringingCalls = new Map();

    io.on('connection', (socket) => {
        socket.emit("me", socket.id);

        socket.on("setup", (userData) => {
            const userId = userData?._id || userData?.id;
            if (userId) {
                socket.join(userId);
                onlineUsers.set(userId, socket.id);
                if (userData.role === 'master_admin') {
                    socket.join('platform_admin');
                }
                io.emit("onlineUsers", Array.from(onlineUsers.keys()));
                socket.emit("connected");
            }
        });

        socket.on("setup_dashboard", ({ teamIds }) => {
            if (Array.from(teamIds).length > 0) {
                teamIds.forEach(id => {
                    socket.join(`team_${id}`);
                });
            }
        });

        socket.on("disconnect", () => {
            let disconnectedUserId;
            for (let [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    disconnectedUserId = userId;
                    break;
                }
            }

            if (disconnectedUserId) {
                onlineUsers.delete(disconnectedUserId);
                io.emit("onlineUsers", Array.from(onlineUsers.keys()));
            }

            if (ringingCalls.has(socket.id)) {
                ringingCalls.delete(socket.id);
            }
            
            if (disconnectedUserId) {
                for (let [callerSocketId, callInfo] of ringingCalls.entries()) {
                    if (callInfo.recipientId === disconnectedUserId) {
                        ringingCalls.delete(callerSocketId);
                    }
                }
            }

            videoRooms.forEach((room, roomId) => {
                room.forEach((participant, userId) => {
                    if (participant.socketId === socket.id) {
                        room.delete(userId);
                        const participants = Array.from(room.values()).map(p => ({
                            id: p.userId,
                            name: p.userName
                        }));
                        io.to(roomId).emit("userLeftRoom", {
                            userId,
                            participants
                        });
                        if (room.size === 0) {
                            videoRooms.delete(roomId);
                        }
                    }
                });
            });
        });

        socket.on("joinRoom", ({ roomId, userId, userName, name }) => {
            if (userId && userName) {
                if (!videoRooms.has(roomId)) {
                    videoRooms.set(roomId, new Map());
                }
                const room = videoRooms.get(roomId);
                const uid = userId.toString();
                room.set(uid, { userId: uid, userName, socketId: socket.id });
                socket.join(roomId);
                const participants = Array.from(room.values()).map(p => ({
                    id: p.userId,
                    name: p.userName
                }));
                socket.emit("roomJoined", { participants });
                socket.to(roomId).emit("userJoinedRoom", {
                    userId: uid,
                    userName,
                    participants
                });
            } else {
                socket.join(roomId);
                socket.to(roomId).emit("userJoined", { id: socket.id, name });
            }
        });

        socket.on("leaveRoom", ({ roomId, userId }) => {
            const room = videoRooms.get(roomId);
            if (room) {
                room.delete(userId);
                socket.leave(roomId);
                const participants = Array.from(room.values()).map(p => ({
                    id: p.userId,
                    name: p.userName
                }));
                io.to(roomId).emit("userLeftRoom", {
                    userId,
                    participants
                });
                if (room.size === 0) {
                    videoRooms.delete(roomId);
                }
            }
        });

        socket.on("sendOffer", ({ to, offer, roomId }) => {
            const room = videoRooms.get(roomId);
            if (room) {
                const recipient = Array.from(room.values()).find(p => p.userId === to);
                if (recipient) {
                    const sender = Array.from(room.values()).find(p => p.socketId === socket.id);
                    if (sender) {
                        io.to(recipient.socketId).emit("receiveOffer", {
                            from: sender.userId,
                            fromName: sender.userName,
                            offer
                        });
                    }
                }
            }
        });

        socket.on("sendAnswer", ({ to, answer, roomId }) => {
            const room = videoRooms.get(roomId);
            if (room) {
                const recipient = Array.from(room.values()).find(p => p.userId === to);
                if (recipient) {
                    const sender = Array.from(room.values()).find(p => p.socketId === socket.id);
                    if (sender) {
                        io.to(recipient.socketId).emit("receiveAnswer", {
                            from: sender.userId,
                            answer
                        });
                    }
                }
            }
        });

        socket.on("sendIceCandidate", ({ to, candidate, roomId }) => {
            const room = videoRooms.get(roomId);
            if (room) {
                const recipient = Array.from(room.values()).find(p => p.userId === to);
                if (recipient) {
                    io.to(recipient.socketId).emit("receiveIceCandidate", {
                        from: Array.from(room.values()).find(p => p.socketId === socket.id)?.userId,
                        candidate
                    });
                }
            }
        });

        socket.on("roomMessage", ({ roomId, message }) => {
            socket.to(roomId).emit("roomMessage", { message });
        });

        socket.on("callUser", ({ userToCall, signalData, from, name, isVideo }) => {
            ringingCalls.set(socket.id, {
                recipientId: userToCall,
                callerId: from,
                callerName: name,
                isVideo: !!isVideo
            });
            io.to(userToCall).emit("callUser", { signal: signalData, from, name, isVideo });
        });

        socket.on("answerCall", (data) => {
            for (let [callerSocketId, callInfo] of ringingCalls.entries()) {
                if (callInfo.recipientId === data.to || callInfo.recipientId === socket.id) {
                     ringingCalls.delete(callerSocketId);
                }
            }
            io.to(data.to).emit("callAccepted", data.signal);
        });

        socket.on("ice-candidate", ({ to, candidate }) => {
            io.to(to).emit("ice-candidate", candidate);
        });

        socket.on("endCall", async ({ to }) => {
            const callInfo = ringingCalls.get(socket.id);
            if (callInfo && callInfo.recipientId === to) {
                try {
                    await createNotification(to, {
                        sender: callInfo.callerId,
                        title: 'Missed Call',
                        description: `You missed a ${callInfo.isVideo ? 'video' : 'voice'} call from ${callInfo.callerName}`,
                        type: 'message',
                        link: '/chat'
                    }, io);
                } catch (error) {
                    console.error("Error creating missed call notification:", error);
                }
                ringingCalls.delete(socket.id);
            }
            io.to(to).emit("callEnded");
        });

        socket.on("joinChat", (chatId) => {
            if (!chatId) return;
            socket.join(chatId);
        });

        socket.on("leaveChat", (chatId) => {
            if (!chatId) return;
            socket.leave(chatId);
        });

        socket.on("typing", (room) => socket.in(room).emit("typing", room));
        socket.on("stopTyping", (room) => socket.in(room).emit("stopTyping", room));

        socket.on("sendMessage", async ({ room, messageId, text, senderId, senderName, type }) => {
            try {
                const conversation = await Conversation.findById(room)
                    .populate('users', '_id name email');

                if (!conversation) return;

                const broadcastPayload = {
                    _id: messageId,
                    chat: {
                        _id: conversation._id,
                        chatName: conversation.chatName,
                        isGroupChat: conversation.isGroupChat,
                        users: conversation.users,
                        groupAdmin: conversation.groupAdmin
                    },
                    text,
                    sender: { _id: senderId, name: senderName },
                    type: type || 'text',
                    createdAt: new Date().toISOString()
                };

                socket.to(room).emit("receiveMessage", broadcastPayload);

                conversation.users.forEach(u => {
                    if (u._id.toString() === senderId.toString()) return;
                    io.to(u._id.toString()).emit("receiveMessage", broadcastPayload);
                });
            } catch (error) {
                console.error("Socket sendMessage error:", error);
            }
        });
    });
};
