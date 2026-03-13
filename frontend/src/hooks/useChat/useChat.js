
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChatContext } from '../../context/ChatContext';
import { validateFile } from '../../utils/fileValidation';
import { toast } from 'sonner';

export const useChat = () => {
    const { user } = useAuth();
    const {
        activeChat,
        setActiveChat,
        chatsData,
        setChatsData,
        totalUnreadCount,
        socketRef,
        socketConnected,
        isLoadingHistory,
        fetchedChats,
        setFetchedChats,
        setIsLoadingHistory,
        onlineUsers,
        startCall
    } = useChatContext();

    const [message, setMessage] = useState('');
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typingTimer, setTypingTimer] = useState(null);

    // 1. Join/leave socket chat rooms when active chat changes
    const prevChatRef = useRef(null);
    useEffect(() => {
        if (!socketRef.current || !socketConnected) return;

        // Leave the previous chat room
        if (prevChatRef.current && prevChatRef.current !== activeChat) {
            socketRef.current.emit('leaveChat', prevChatRef.current);
        }

        // Join the new chat room
        if (activeChat) {
            socketRef.current.emit('joinChat', activeChat);
        }

        prevChatRef.current = activeChat;
    }, [activeChat, socketConnected, socketRef]);

    // 2. Listen for typing events (UI specific)
    useEffect(() => {
        if (!socketRef.current) return;

        const handleTyping = (room) => {
            if (activeChat === room) setIsTyping(true);
        };
        const handleStopTyping = (room) => {
            if (activeChat === room) setIsTyping(false);
        };

        socketRef.current.on('typing', handleTyping);
        socketRef.current.on('stopTyping', handleStopTyping);

        return () => {
            socketRef.current?.off('typing', handleTyping);
            socketRef.current?.off('stopTyping', handleStopTyping);
        };
    }, [activeChat, socketRef]);

    // 2. Fetch History on Chat Switch
    // 2. Fetch History on Chat Switch
    useEffect(() => {
        if (!activeChat || !user) return;

        // Only fetch if not already cached
        if (fetchedChats.has(activeChat)) return;

        let mounted = true;

        const fetchHistory = async () => {
            setIsLoadingHistory(true);
            try {
                const token = user.token || JSON.parse(localStorage.getItem('user'))?.token;
                if (!token) return;

                const res = await fetch(`/api/chat/${encodeURIComponent(activeChat)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const responseData = await res.json();

                if (res.ok && mounted) {
                    const messagesArray = responseData.messages || responseData;
                    const formattedMessages = messagesArray.map(msg => ({
                        id: msg._id,
                        text: msg.text,
                        sender: msg.sender.name,
                        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        isMe: msg.sender._id === user._id,
                        senderAvatar: msg.sender.name ? msg.sender.name[0] : 'U',
                        type: msg.type || 'text',
                        fullTime: msg.createdAt
                    }));

                    setChatsData(prev => ({
                        ...prev,
                        [activeChat]: {
                            ...prev[activeChat],
                            messages: formattedMessages,
                            unread: false,
                            unreadCount: 0
                        }
                    }));
                    setFetchedChats(prev => new Set([...prev, activeChat]));
                }
            } catch (err) {
                console.error("Failed to fetch chat history", err);
            } finally {
                if (mounted) setIsLoadingHistory(false);
            }
        };

        fetchHistory();

        return () => {
            mounted = false;
        };
    }, [activeChat, user, fetchedChats]); // Removed stable setters from dependencies

    const handleSend = async (msgType = 'text', msgContent = message) => {
        if ((msgContent.trim() || msgType === 'image' || msgType === 'file') && user && activeChat) {
            const tempId = Date.now();
            const tempMsg = {
                id: tempId,
                text: msgContent,
                sender: user.name,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: true,
                senderAvatar: user.name[0],
                type: msgType,
                fullTime: new Date().toISOString()
            };

            // Optimistic Update
            setChatsData(prev => ({
                ...prev,
                [activeChat]: {
                    ...prev[activeChat],
                    messages: [...(prev[activeChat]?.messages || []), tempMsg]
                }
            }));

            try {
                const token = user.token || JSON.parse(localStorage.getItem('user'))?.token;
                const res = await fetch('/api/chat/message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        chatId: activeChat,
                        text: msgContent,
                        type: msgType
                    })
                });

                if (!res.ok) throw new Error('Failed to send message');

                const savedMessage = await res.json();

                // Update with real ID
                setChatsData(prev => ({
                    ...prev,
                    [activeChat]: {
                        ...prev[activeChat],
                        messages: prev[activeChat].messages.map(msg =>
                            msg.id === tempId ? { ...msg, id: savedMessage._id, fullTime: savedMessage.createdAt } : msg
                        )
                    }
                }));

                if (socketRef.current && socketConnected) {
                    socketRef.current.emit('sendMessage', {
                        room: activeChat,
                        messageId: savedMessage._id,
                        text: msgContent,
                        senderId: user._id || user.id,
                        senderName: user.name,
                        type: msgType
                    });
                }
            } catch (err) {
                console.error('Failed to send message:', err);
                setChatsData(prev => ({
                    ...prev,
                    [activeChat]: {
                        ...prev[activeChat],
                        messages: prev[activeChat].messages.filter(msg => msg.id !== tempId)
                    }
                }));
            }

            if (msgType === 'text') setMessage('');
        }
    };

    const handleFileUpload = async (file) => {
        if (!file) return;

        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
            toast.error(validation.error);
            return;
        }

        setIsUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const token = user.token || JSON.parse(localStorage.getItem('user'))?.token;

            const res = await fetch('/api/chat/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!res.ok) throw new Error(`Upload failed`);

            const data = await res.json();
            if (data.url) {
                const fileType = file.type.startsWith('image/') ? 'image' : 'file';
                handleSend(fileType, data.url);
            }
        } catch (err) {
            console.error("Upload failed", err);
            toast.error("Failed to upload file. Please try again.");
        } finally {
            setIsUploadingFile(false);
        }
    };

    const handleTyping = (e) => {
        setMessage(e.target.value);
        if (!socketRef.current || !activeChat) return;

        if (!typingTimer) {
            socketRef.current.emit("typing", activeChat);
        }

        if (typingTimer) clearTimeout(typingTimer);

        const timer = setTimeout(() => {
            socketRef.current.emit("stopTyping", activeChat);
            setTypingTimer(null);
        }, 3000);

        setTypingTimer(timer);
    };

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (typingTimer) {
                clearTimeout(typingTimer);
            }
        };
    }, [typingTimer]);

    const handleCreateGroup = async (groupName) => {
        try {
            const token = user.token || JSON.parse(localStorage.getItem('user'))?.token;
            const res = await fetch('/api/chat/group', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: groupName, users: "[]" })
            });
            const data = await res.json();
            if (res.ok) {
                setChatsData(prev => ({
                    ...prev,
                    [data._id]: {
                        id: data._id,
                        name: data.chatName,
                        type: 'group',
                        isGroupChat: true,
                        users: data.users || [], // Include users
                        groupAdmin: data.groupAdmin,
                        onlineCount: 1,
                        messages: [],
                        unread: false,
                        unreadCount: 0
                    }
                }));
                setActiveChat(data._id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAccessChat = async (userId) => {
        try {
            const token = user.token || JSON.parse(localStorage.getItem('user'))?.token;
            const res = await fetch(`/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId })
            });
            const data = await res.json();
            if (res.ok) {
                if (!chatsData[data._id]) {
                    let displayName = data.chatName;
                    if (!data.isGroupChat) {
                        const otherUser = data.users.find(u => u._id !== user._id);
                        displayName = otherUser?.name;
                    }
                    setChatsData(prev => ({
                        ...prev,
                        [data._id]: {
                            id: data._id,
                            name: displayName,
                            type: data.isGroupChat ? 'group' : 'private',
                            isGroupChat: data.isGroupChat,
                            users: data.users || [],
                            groupAdmin: data.groupAdmin,
                            onlineCount: data.users.length,
                            messages: [],
                            unread: false,
                            unreadCount: 0
                        }
                    }));
                }
                setActiveChat(data._id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const addToGroup = async (chatId, userId) => {
        try {
            const token = user.token || JSON.parse(localStorage.getItem('user'))?.token;
            const res = await fetch('/api/chat/groupadd', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ chatId, userId })
            });
            const data = await res.json();
            if (res.ok) {
                setChatsData(prev => ({
                    ...prev,
                    [chatId]: {
                        ...prev[chatId],
                        onlineCount: data.users.length,
                        users: data.users // Update users list
                    }
                }));
            }
        } catch (err) { }
    };

    const removeFromGroup = async (chatId, userId) => {
        try {
            const token = user.token || JSON.parse(localStorage.getItem('user'))?.token;
            const res = await fetch('/api/chat/groupremove', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ chatId, userId })
            });
            const data = await res.json();
            if (res.ok) {
                if (userId === user._id) {
                    setChatsData(prev => {
                        const newState = { ...prev };
                        delete newState[chatId];
                        return newState;
                    });
                    setActiveChat(null);
                } else {
                    setChatsData(prev => ({
                        ...prev,
                        [chatId]: {
                            ...prev[chatId],
                            onlineCount: data.users.length,
                            users: data.users // Update users list
                        }
                    }));
                }
            }
        } catch (err) { }
    };

    const searchUsers = async (query) => {
        try {
            const token = user.token || JSON.parse(localStorage.getItem('user'))?.token;
            const res = await fetch(`/api/auth/users?search=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                return data;
            }
            return [];
        } catch (err) {
            console.error('Search users failed:', err);
            return [];
        }
    };

    const renameGroup = async (chatId, chatName) => {
        if (!chatName || !chatName.trim()) return;
        try {
            const token = user.token || JSON.parse(localStorage.getItem('user'))?.token;
            const res = await fetch('/api/chat/rename', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ chatId, chatName: chatName.trim() })
            });
            const data = await res.json();
            if (res.ok) {
                setChatsData(prev => ({
                    ...prev,
                    [chatId]: {
                        ...prev[chatId],
                        name: data.chatName
                    }
                }));
            }
        } catch (err) {
            console.error('Rename group failed:', err);
        }
    };

    const getActiveOnlineCount = () => {
        const chat = chatsData[activeChat];
        if (!chat || !chat.users) return 0;
        // Count users who are in the onlineUsers set
        const count = chat.users.reduce((acc, u) => {
            return acc + (onlineUsers.has(u._id) ? 1 : 0);
        }, 0);
        return count;
    };

    return {
        message, setMessage,
        messages: chatsData[activeChat]?.messages || [],
        activeChat, setActiveChat,
        chats: Object.keys(chatsData),
        chatsData,
        activeOnlineCount: getActiveOnlineCount(),
        handleSend, handleCreateGroup, searchUsers, handleAccessChat,
        isTyping, handleTyping, handleFileUpload,
        renameGroup, addToGroup, removeFromGroup,
        user, isLoadingHistory, isUploadingFile, totalUnreadCount, startCall
    };
};
