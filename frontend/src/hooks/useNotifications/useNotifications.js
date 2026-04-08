import { useState, useMemo, useEffect, useCallback } from 'react';
import { useChatContext } from '../../context/ChatContext';
import { MessageCircle, Video, FileText, UserPlus, Calendar, CheckSquare, Clock, AlertCircle, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const typeIcons = {
    'task_assigned': CheckSquare,
    'task_updated': CheckSquare,
    'event_created': Calendar,
    'event_reminder': Clock,
    'document_shared': FileText,
    'team_update': UserPlus,
    'message': MessageCircle,
    'deadline': AlertCircle
};

const typeColors = {
    'task_assigned': 'bg-emerald-500',
    'task_updated': 'bg-blue-500',
    'event_created': 'bg-purple-500',
    'event_reminder': 'bg-red-500',
    'document_shared': 'bg-indigo-500',
    'team_update': 'bg-fuchsia-500',
    'message': 'bg-blue-500',
    'deadline': 'bg-amber-500'
};

export const useNotifications = () => {
    const [filter, setFilter] = useState('all');
    const [dbNotifications, setDbNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const { chatsData, setActiveChat, socketRef, user } = useChatContext();
    const navigate = useNavigate();

    // Fetch notifications from API
    const fetchNotifications = useCallback(async () => {
        const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;
        if (!token) return;

        try {
            setIsLoading(true);
            // Mapping frontend filters to backend query params
            let queryParams = '?limit=30'; // Default limit
            if (filter === 'unread') queryParams += '&read=false';
            if (filter === 'tasks') queryParams += '&type=task_assigned&type=task_updated';
            if (filter === 'events') queryParams += '&type=event_created&type=event_reminder';
            if (filter === 'messages') queryParams += '&type=message';
            
            const res = await fetch(`/api/notifications${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (res.ok) {
                // Backend now returns { notifications, total, pages, page }
                const items = data.notifications || [];
                setPages(data.pages || 1);
                setTotal(data.total || 0);
                
                setDbNotifications(items.map(n => ({
                    ...n,
                    id: n._id,
                    icon: typeIcons[n.type] || Bell,
                    color: typeColors[n.type] || 'bg-gray-500',
                    time: new Date(n.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                })));
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setIsLoading(false);
        }
    }, [user, filter]); // Added filter as dependency to trigger re-fetch

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Handle real-time notifications via socket
    useEffect(() => {
        if (!socketRef.current) return;

        const handleNewNotification = (notification) => {
            const formattedNotif = {
                ...notification,
                id: notification._id,
                icon: typeIcons[notification.type] || Bell,
                color: typeColors[notification.type] || 'bg-gray-500',
                time: 'Just now'
            };
            setDbNotifications(prev => [formattedNotif, ...prev]);

            // Show toast popup for real-time notification
            toast(notification.title, {
                description: notification.description,
                duration: 5000,
            });
        };

        socketRef.current.on('newNotification', handleNewNotification);

        return () => {
            if (socketRef.current) {
                socketRef.current.off('newNotification', handleNewNotification);
            }
        };
    }, [socketRef]);

    // Generate notifications from unread chats
    const chatNotifications = useMemo(() => {
        if (!chatsData) return [];
        return Object.values(chatsData)
            .filter(chat => chat.unreadCount > 0)
            .map(chat => {
                const lastMsg = chat.messages[chat.messages.length - 1];
                return {
                    id: `chat-${chat.id}`,
                    chatId: chat.id,
                    type: 'message',
                    title: `New message from ${chat.name}`,
                    description: lastMsg ? lastMsg.text : 'You have a new message',
                    time: lastMsg ? new Date(lastMsg.fullTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
                    read: false,
                    icon: MessageCircle,
                    color: 'bg-blue-500',
                    link: `/chat`
                };
            });
    }, [chatsData]);

    // Combine database and chat notifications
    const notifications = useMemo(() => {
        return [...chatNotifications, ...dbNotifications].sort((a, b) => {
            const timeA = a.fullTime || a.createdAt || new Date();
            const timeB = b.fullTime || b.createdAt || new Date();
            return new Date(timeB) - new Date(timeA);
        });
    }, [chatNotifications, dbNotifications]);

    const markAsRead = async (id) => {
        if (typeof id === 'string' && id.startsWith('chat-')) {
            const chatId = id.replace('chat-', '');
            setActiveChat(chatId);
            navigate('/chat');
            return;
        }

        const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;
        try {
            const res = await fetch(`/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setDbNotifications(prev => prev.map(n =>
                    n.id === id ? { ...n, read: true } : n
                ));
            }
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
    };

    const markAllAsRead = async () => {
        const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;
        try {
            const res = await fetch('/api/notifications/read-all', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setDbNotifications(prev => prev.map(n => ({ ...n, read: true })));
            }
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    const deleteNotification = async (id) => {
        if (typeof id === 'string' && id.startsWith('chat-')) {
            return;
        }

        const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;
        try {
            const res = await fetch(`/api/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setDbNotifications(prev => prev.filter(n => n.id !== id));
            }
        } catch (err) {
            console.error("Failed to delete notification", err);
        }
    };

    const filteredNotifications = useMemo(() => {
        // Chat notifications are still client-side based on filter
        let filteredChats = chatNotifications;
        
        if (filter === 'unread') {
            filteredChats = chatNotifications.filter(n => !n.read);
        } else if (filter === 'tasks' || filter === 'events') {
            filteredChats = []; // Chats obviously aren't tasks or events
        } else if (filter === 'messages') {
            filteredChats = chatNotifications;
        }

        // dbNotifications are already filtered by the server!
        return [...filteredChats, ...dbNotifications].sort((a, b) => {
            const timeA = a.fullTime || a.createdAt || new Date();
            const timeB = b.fullTime || b.createdAt || new Date();
            return new Date(timeB) - new Date(timeA);
        });
    }, [dbNotifications, chatNotifications, filter]);

    const unreadCount = notifications.filter(n => !n.read).length;

    return {
        filter,
        setFilter,
        notifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        filteredNotifications,
        unreadCount,
        pages,
        total,
        isLoading
    };
};
