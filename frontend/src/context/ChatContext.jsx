
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import io from 'socket.io-client';
import { logger } from '../utils/logger';

// Use files from public/sounds to avoid cache issues
const ringtoneSound = '/sounds/ringtone.mp3';

const ChatContext = createContext();

const SOCKET_URL = import.meta.env.PROD 
    ? 'https://digital-workspace.onrender.com' 
    : 'http://localhost:4000';


export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [activeChat, setActiveChat] = useState(null);
    const [chatsData, setChatsData] = useState({});
    const [socketConnected, setSocketConnected] = useState(false);
    const socketRef = useRef();
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [fetchedChats, setFetchedChats] = useState(new Set());
    const sentMessageIdsRef = useRef(new Set());
    const processedMessageIdsRef = useRef(new Set());
    const [onlineUsers, setOnlineUsers] = useState(new Set()); // New state for online users

    const ringtoneRef = useRef(null);

    // Initialize sounds
    useEffect(() => {
        // Add cache-busting parameter to avoid ERR_CACHE_OPERATION_NOT_SUPPORTED in some environments
        ringtoneRef.current = new Audio(`${ringtoneSound}?t=${Date.now()}`);
        ringtoneRef.current.loop = true;
    }, []);

    // Calculate total unread count whenever chatsData changes
    useEffect(() => {
        const count = Object.values(chatsData).reduce((total, chat) => {
            return total + (chat.unreadCount || 0);
        }, 0);
        setTotalUnreadCount(count);
    }, [chatsData]);

    const activeChatRef = useRef(activeChat);
    useEffect(() => {
        activeChatRef.current = activeChat;

        // Reset unread for active chat
        if (activeChat) {
            setChatsData(prev => {
                if (!prev[activeChat]) return prev;
                return {
                    ...prev,
                    [activeChat]: {
                        ...prev[activeChat],
                        unread: false,
                        unreadCount: 0
                    }
                };
            });
        }
    }, [activeChat]);

    // Fetch User Chats
    const fetchUserChats = useCallback(async () => {
        const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;
        if (!token) return;

        try {
            const res = await fetch('/api/chat', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                setChatsData(prevChatsData => {
                    const newChatsData = { ...prevChatsData };
                    let hasChanges = false;

                    data.forEach(chat => {
                        let displayName = chat.chatName;
                        if (!chat.isGroupChat && chat.users) {
                            const otherUser = chat.users.find(u => u._id !== (user?._id || user?.id)) || chat.users[0];
                            displayName = otherUser?.name || "Unknown User";
                        }

                        let initialMessages = [];
                        if (chat.latestMessage) {
                            const msg = chat.latestMessage;
                            const senderName = msg.sender?.name || "Unknown";

                            initialMessages = [{
                                id: msg._id,
                                text: msg.text,
                                sender: senderName,
                                time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                isMe: (msg.sender?._id || msg.sender) === (user?._id || user?.id),
                                senderAvatar: senderName ? senderName[0] : 'U',
                                type: msg.type || 'text',
                                fullTime: msg.createdAt
                            }];
                        }

                        if (!newChatsData[chat._id]) {
                            newChatsData[chat._id] = {
                                id: chat._id,
                                name: displayName,
                                type: chat.isGroupChat ? 'group' : 'private',
                                isGroupChat: chat.isGroupChat,
                                users: chat.users || [],
                                groupAdmin: chat.groupAdmin,
                                onlineCount: chat.users?.length || 0,
                                messages: initialMessages,
                                unread: false,
                                unreadCount: 0
                            };
                            hasChanges = true;
                        }
                    });

                    return hasChanges ? newChatsData : prevChatsData;
                });
            }
        } catch (err) {
            logger.error("Failed to fetch chats", err);
        }
    }, [user]);

    // Unlock audio context on first interaction
    useEffect(() => {
        const unlockAudio = () => {
            // Use a silent sound to unlock audio context without playing the ringtone
            const audio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
            audio.play().catch(() => { });
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
        };

        document.addEventListener('click', unlockAudio);
        document.addEventListener('keydown', unlockAudio);

        return () => {
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
        };
    }, []);

    useEffect(() => {
        if (user) {
            fetchUserChats();
        }
    }, [user, fetchUserChats]);

    // Socket Connection
    useEffect(() => {
        if (!user) return;

        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket'], // Force WebSocket — Vercel does not proxy WS upgrades
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10,
            timeout: 20000,
        });


        socketRef.current.on('connect', () => {
            logger.log('Socket connected/reconnected');
            // Identify ourselves to the server so we join our personal room
            socketRef.current.emit('setup', user);
            setSocketConnected(true);
            // Re-join the active chat room after reconnect
            if (activeChatRef.current) {
                socketRef.current.emit('joinChat', activeChatRef.current);
            }
        });

        socketRef.current.on('disconnect', () => {
            logger.log('Socket disconnected');
            setSocketConnected(false);
            setOnlineUsers(new Set()); // Clear online users on disconnect
        });

        // Listen for online users updates
        socketRef.current.on('onlineUsers', (users) => {
            setOnlineUsers(new Set(users));
        });

        socketRef.current.on('receiveMessage', (newMessage) => {
            // Deduplicate: message may arrive via the socket room channel
            // AND via the personal-room fan-out simultaneously.
            const msgId = newMessage._id?.toString();
            if (msgId && processedMessageIdsRef.current.has(msgId)) return;
            if (msgId) processedMessageIdsRef.current.add(msgId);

            // Ignore messages sent by the current user (they already have
            // the optimistic message in state)
            const senderId = newMessage.sender?._id?.toString() || newMessage.sender?.toString();
            const isOwnMessage = senderId && senderId === (user?._id?.toString() || user?.id?.toString());
            if (isOwnMessage) return;

            const formattedMsg = {
                id: newMessage._id,
                text: newMessage.text,
                sender: newMessage.sender.name,
                time: new Date(newMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: false,
                senderAvatar: newMessage.sender.name ? newMessage.sender.name[0] : 'U',
                type: newMessage.type || 'text',
                fullTime: newMessage.createdAt
            };

            let chatId = newMessage.chat?._id || newMessage.room;

            setChatsData(prev => {
                const isCurrentChat = chatId === activeChatRef.current;
                const existingChat = prev[chatId];

                if (existingChat) {
                    // Try to play sound immediately on reception if possible, otherwise it catches.
                    return {
                        ...prev,
                        [chatId]: {
                            ...existingChat,
                            messages: [...(existingChat.messages || []), formattedMsg],
                            unread: !isCurrentChat,
                            unreadCount: isCurrentChat ? 0 : (existingChat.unreadCount || 0) + 1
                        }
                    };
                }

                if (newMessage.chat) {
                    let displayName = newMessage.chat.chatName;
                    if (!newMessage.chat.isGroupChat && newMessage.chat.users) {
                        const otherUser = newMessage.chat.users.find(u => u._id !== user._id) || newMessage.chat.users[0];
                        displayName = otherUser?.name || "Unknown User";
                    }

                    return {
                        ...prev,
                        [chatId]: {
                            id: chatId,
                            name: displayName,
                            type: newMessage.chat.isGroupChat ? 'group' : 'private',
                            isGroupChat: newMessage.chat.isGroupChat,
                            users: newMessage.chat.users || [],
                            groupAdmin: newMessage.chat.groupAdmin,
                            messages: [formattedMsg],
                            unread: !isCurrentChat,
                            unreadCount: isCurrentChat ? 0 : 1
                        }
                    };
                }

                return prev;
            });

            if (chatId !== activeChatRef.current) {
                // Removed notification sound as per user request
            }
        });

        // Listen for incoming 1-on-1 calls
        socketRef.current.on('callUser', ({ from, name, signal, isVideo }) => {
            logger.log('Receiving call from', name, 'Video:', isVideo);
            setCall({ isReceivingCall: true, from, name, signal, isVideo, iceCandidates: [] });
        });

        // Buffer all incoming ICE candidates to avoid race conditions
        socketRef.current.on('ice-candidate', (candidate) => {
            setCall(prev => {
                // Ignore if not actively managing a call
                if (!prev.isReceivingCall && !prev.userToCall) return prev;
                return {
                    ...prev,
                    iceCandidates: [...(prev.iceCandidates || []), candidate]
                };
            });
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [user]);

    // Video Call State
    const [call, setCall] = useState({});
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [isCalling, setIsCalling] = useState(false);

    const startCall = (userId, userName, isVideo = true) => {
        // Reset any leftover state from a previous call first
        setCallAccepted(false);
        setCallEnded(false);
        setIsCalling(true);
        setCall({ isReceivingCall: false, userToCall: userId, name: userName, isVideo, iceCandidates: [] });
    };

    const answerCall = () => {
        setCallAccepted(true);
    };

    const endCall = () => {
        // Socket signaling (endCall emit) is handled by useDirectCall.leaveCall
        // before it calls this function. Here we just clean up context state.
        setCall({});
        setCallAccepted(false);
        setCallEnded(true);
        setIsCalling(false);
        setTimeout(() => setCallEnded(false), 500);
    };



    useEffect(() => {
        if (call.isReceivingCall && !callAccepted) {
            logger.log("Attempting to play ringtone");
            ringtoneRef.current?.play()
                .then(() => logger.log("Ringtone played successfully"))
                .catch(e => logger.error("Ringtone play failed:", e));
        } else {
            if (ringtoneRef.current) {
                ringtoneRef.current.pause();
                ringtoneRef.current.currentTime = 0;
            }
        }
    }, [call.isReceivingCall, callAccepted]);

    const value = {
        activeChat,
        setActiveChat,
        chatsData,
        setChatsData,
        totalUnreadCount,
        socketRef,
        socketConnected,
        isLoadingHistory,
        setIsLoadingHistory,
        fetchedChats,
        setFetchedChats,
        fetchUserChats,
        user,
        onlineUsers,
        chats: Object.values(chatsData), // Export chats as array
        // Call additions
        call,
        callAccepted,
        callEnded,
        isCalling,
        startCall,
        answerCall,
        endCall,
        setCallAccepted
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
};
