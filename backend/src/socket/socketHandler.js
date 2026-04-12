import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { createNotification } from '../utils/notificationService.js';

export const setupSocket = (io) => {
    // Track online users: userId -> socketId
    let onlineUsers = new Map();

    // Video Call Room Management - MUST be outside connection handler
    const videoRooms = new Map(); // roomId -> Map of { userId, userName, socketId }

    // Track active call attempts to detect "Missed Calls"
    const ringingCalls = new Map(); // socketId (caller) -> { recipientId, callerId, callerName, isVideo }

    io.on('connection', (socket) => {
        console.log(`Socket Connected: ${socket.id}`);
        socket.emit("me", socket.id);

        socket.on("setup", (userData) => {
            const userId = userData?._id || userData?.id;
            if (userId) {
                socket.join(userId);
                onlineUsers.set(userId, socket.id);
                console.log(`User ${userId} joined their personal room`);

                // Stability Fix: Join Master Admin to global room for oversight
                if (userData.role === 'master_admin') {
                    socket.join('platform_admin');
                    console.log(`Master Admin ${userId} joined platform oversight room`);
                }

                // Broadcast online users list to everyone
                io.emit("onlineUsers", Array.from(onlineUsers.keys()));
                socket.emit("connected");
            }
        });

        // ── Team Dashboard Rooms ──────────────────────────────────────────
        socket.on("setup_dashboard", ({ teamIds }) => {
            if (Array.from(teamIds).length > 0) {
                teamIds.forEach(id => {
                    socket.join(`team_${id}`);
                });
                console.log(`Socket ${socket.id} joined ${teamIds.length} team rooms`);
            }
        });

        socket.on("disconnect", () => {
            // Find key by value to remove
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

            // Clean up any active ringing call tracking for this socket
            if (ringingCalls.has(socket.id)) {
                ringingCalls.delete(socket.id);
            }
            
            // Also clean up if the disconnected user was a recipient
            if (disconnectedUserId) {
                for (let [callerSocketId, callInfo] of ringingCalls.entries()) {
                    if (callInfo.recipientId === disconnectedUserId) {
                        ringingCalls.delete(callerSocketId);
                    }
                }
            }

            // Clean up video rooms when user disconnects
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
                            console.log(`Room ${roomId} deleted (empty after disconnect)`);
                        }
                    }
                });
            });

            // NOTE: Do NOT broadcast callEnded to everyone — that kills all
            // active calls when any user disconnects. The 1-to-1 call parties
            // handle 'callEnded' via the explicit endCall event.
        });

        // Video Call Room - Single unified handler
        socket.on("joinRoom", ({ roomId, userId, userName, name }) => { // Added 'name' for legacy
            // Handle video call rooms (with userId and userName)
            if (userId && userName) {
                console.log(`${userName} (${userId}) joining video room ${roomId}`);

                // Initialize room if it doesn't exist
                if (!videoRooms.has(roomId)) {
                    videoRooms.set(roomId, new Map());
                }

                const room = videoRooms.get(roomId);

                // Add user to room
                const uid = userId.toString();
                room.set(uid, { userId: uid, userName, socketId: socket.id });
                socket.join(roomId);

                // Get all participants
                const participants = Array.from(room.values()).map(p => ({
                    id: p.userId,
                    name: p.userName
                }));

                // Send full participant list to the user who just joined
                socket.emit("roomJoined", {
                    participants
                });

                // Notify OTHER users in room about new participant
                socket.to(roomId).emit("userJoinedRoom", {
                    userId: uid,
                    userName,
                    participants
                });

                console.log(`[VideoRoom] ${roomId}: ${userName} joined. Total: ${room.size}`);
            } else {
                // Legacy room join (for other features, e.g., scheduled links)
                socket.join(roomId);
                // Notify existing users in the room that a new user has joined
                socket.to(roomId).emit("userJoined", { id: socket.id, name });
            }
        });

        socket.on("leaveRoom", ({ roomId, userId }) => {
            console.log(`User ${userId} leaving room ${roomId}`);

            const room = videoRooms.get(roomId);
            if (room) {
                room.delete(userId);
                socket.leave(roomId);

                const participants = Array.from(room.values()).map(p => ({
                    id: p.userId,
                    name: p.userName
                }));

                // Notify remaining users
                io.to(roomId).emit("userLeftRoom", {
                    userId,
                    participants
                });

                // Clean up empty rooms
                if (room.size === 0) {
                    videoRooms.delete(roomId);
                    console.log(`Room ${roomId} deleted (empty)`);
                }
            }
        });

        // WebRTC Signaling for rooms
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

        // Room messaging
        socket.on("roomMessage", ({ roomId, message }) => {
            console.log(`Message in room ${roomId} from ${message.sender}: ${message.text}`);
            // Broadcast message to all other users in the room
            socket.to(roomId).emit("roomMessage", { message });
        });

        // WebRTC Signaling (legacy 1-to-1 calls)
        socket.on("callUser", ({ userToCall, signalData, from, name, isVideo }) => {
            console.log(`Call initiated from ${from} to ${userToCall} (Video: ${isVideo})`);
            
            // Track this call attempt
            ringingCalls.set(socket.id, {
                recipientId: userToCall,
                callerId: from,
                callerName: name,
                isVideo: !!isVideo
            });
            
            io.to(userToCall).emit("callUser", { signal: signalData, from, name, isVideo });
        });

        socket.on("answerCall", (data) => {
            console.log(`Call answered by ${socket.id} to ${data.to}`);
            
            // Call was answered - remove from ringing tracking
            // We need to find the caller's socket id. Since 'to' is the caller's ID (room),
            // we can look through ringingCalls for where recipientId == socket._id.
            // But 'data.to' is usually the signal recipient.
            
            // Better: When answering, the person who was being called notifies the caller.
            // We can search ringingCalls for any entry where recipientId is the current user.
            for (let [callerSocketId, callInfo] of ringingCalls.entries()) {
                if (callInfo.recipientId === data.to || callInfo.recipientId === socket.id) {
                     ringingCalls.delete(callerSocketId);
                }
            }

            io.to(data.to).emit("callAccepted", data.signal);
        });

        socket.on("ice-candidate", ({ to, candidate }) => {
            console.log(`ICE candidate from ${socket.id} to ${to}`);
            io.to(to).emit("ice-candidate", candidate);
        });

        socket.on("endCall", async ({ to }) => {
            console.log(`Call ended by ${socket.id} for ${to}`);
            
            // Check if this was a missed call (caller hung up before answer)
            const callInfo = ringingCalls.get(socket.id);
            if (callInfo && callInfo.recipientId === to) {
                try {
                    await createNotification(to, {
                        sender: callInfo.callerId,
                        title: 'Missed Call',
                        description: `You missed a ${callInfo.isVideo ? 'video' : 'voice'} call from ${callInfo.callerName}`,
                        type: 'message', // Using message type or custom one?
                        link: '/chat'
                    }, io);
                } catch (error) {
                    console.error("Error creating missed call notification:", error);
                }
                ringingCalls.delete(socket.id);
            }

            io.to(to).emit("callEnded");
        });

        // ── Chat Room Management ──────────────────────────────────────────
        // Clients join a chat room when they open a conversation
        socket.on("joinChat", (chatId) => {
            if (!chatId) return;
            socket.join(chatId);
            console.log(`Socket ${socket.id} joined chat room: ${chatId}`);
        });

        // Clients leave the previous chat room when switching conversations
        socket.on("leaveChat", (chatId) => {
            if (!chatId) return;
            socket.leave(chatId);
            console.log(`Socket ${socket.id} left chat room: ${chatId}`);
        });

        // ── Typing indicators ────────────────────────────────────────────
        socket.on("typing", (room) => socket.in(room).emit("typing", room));
        socket.on("stopTyping", (room) => socket.in(room).emit("stopTyping", room));

        // ── sendMessage ──────────────────────────────────────────────────
        // The HTTP endpoint (POST /api/chat/message) already persisted the
        // message and returned its _id. We receive the saved message here and
        // broadcast it to every member of the conversation so other clients
        // get the update in real-time WITHOUT creating a second DB record.
        socket.on("sendMessage", async ({ room, messageId, text, senderId, senderName, type }) => {
            try {
                // Look up the conversation so we can fan-out to personal rooms too
                const conversation = await Conversation.findById(room)
                    .populate('users', '_id name email');

                if (!conversation) {
                    console.error(`sendMessage: conversation ${room} not found`);
                    return;
                }

                // Build a lightweight broadcast payload (mirrors what the HTTP
                // endpoint already returned to the sender)
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

                // Broadcast to everyone in the socket room (excludes sender
                // since they already have the optimistic message)
                socket.to(room).emit("receiveMessage", broadcastPayload);

                // Also emit to each user's personal room so they get
                // notifications even when that conversation isn't open
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
