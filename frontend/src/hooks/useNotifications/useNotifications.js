import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useChatContext } from '../../context/ChatContext';
import { MessageCircle, FileText, UserPlus, Calendar, CheckSquare, Clock, AlertCircle, Bell } from 'lucide-react';
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

const formatNotification = (n) => ({
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
});

export const useNotifications = () => {
    const [filter, setFilter] = useState('all');
    const [dbNotifications, setDbNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Pull stable primitives from context to avoid triggering re-renders
    const { chatsData, setChatsData, setActiveChat, socketRef, socketConnected, user } = useChatContext();
    const navigate = useNavigate();

    // Stable token reference — a string, not an object
    const token = user?.token || (() => {
        try { return JSON.parse(localStorage.getItem('user'))?.token; } catch { return null; }
    })();

    // Keep a stable ref to the token so fetch callbacks don't re-create on every render
    const tokenRef = useRef(token);
    useEffect(() => { tokenRef.current = token; }, [token]);

    // ─── Fetch notifications from API ─────────────────────────────────────────
    // Depend on `filter` only (stable string). Use tokenRef to avoid re-creating the callback.
    const fetchNotifications = useCallback(async (activeFilter) => {
        const tok = tokenRef.current;
        if (!tok) return;

        try {
            setIsLoading(true);
            const params = new URLSearchParams({ limit: '30' });

            if (activeFilter === 'unread') params.set('read', 'false');
            if (activeFilter === 'tasks') { params.append('type', 'task_assigned'); params.append('type', 'task_updated'); }
            if (activeFilter === 'events') { params.append('type', 'event_created'); params.append('type', 'event_reminder'); }
            if (activeFilter === 'messages') params.set('type', 'message');

            const res = await fetch(`/api/notifications?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${tok}` }
            });
            const data = await res.json();

            if (res.ok) {
                const items = data.notifications || [];
                setPages(data.pages || 1);
                setTotal(data.total || 0);
                setDbNotifications(items.map(formatNotification));
            }
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty deps — uses tokenRef so never re-creates

    // Re-fetch whenever the filter changes
    useEffect(() => {
        fetchNotifications(filter);
    }, [filter, fetchNotifications]);

    // ─── Real-time + cross-tab socket listeners ───────────────────────────────
    // Depend on `socketConnected` (boolean) — when socket reconnects, listeners re-attach
    useEffect(() => {
        const socket = socketRef.current;
        if (!socket || !socketConnected) return;

        const handleNewNotification = (notification) => {
            const formatted = {
                ...notification,
                id: notification._id,
                icon: typeIcons[notification.type] || Bell,
                color: typeColors[notification.type] || 'bg-gray-500',
                time: 'Just now'
            };
            setDbNotifications(prev => [formatted, ...prev]);
            toast(notification.title, {
                description: notification.description,
                duration: 5000,
            });
        };

        // Sync read-status changes made in other tabs/devices
        const handleStatusSync = ({ id, allRead, read }) => {
            if (allRead) {
                setDbNotifications(prev => prev.map(n => ({ ...n, read: true })));
            } else if (id !== undefined) {
                setDbNotifications(prev => prev.map(n => n.id === id ? { ...n, read } : n));
            }
        };

        socket.on('newNotification', handleNewNotification);
        socket.on('notificationStatusSync', handleStatusSync);

        return () => {
            socket.off('newNotification', handleNewNotification);
            socket.off('notificationStatusSync', handleStatusSync);
        };
    }, [socketConnected, socketRef]);

    // ─── Chat-derived notifications ───────────────────────────────────────────
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
                    time: lastMsg
                        ? new Date(lastMsg.fullTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Just now',
                    read: false,
                    icon: MessageCircle,
                    color: 'bg-blue-500',
                    link: `/chat`
                };
            });
    }, [chatsData]);

    // Combined sorted list
    const notifications = useMemo(() => {
        return [...chatNotifications, ...dbNotifications].sort((a, b) => {
            const timeA = a.fullTime || a.createdAt || 0;
            const timeB = b.fullTime || b.createdAt || 0;
            return new Date(timeB) - new Date(timeA);
        });
    }, [chatNotifications, dbNotifications]);

    // ─── Actions ──────────────────────────────────────────────────────────────
    const markAsRead = useCallback(async (id) => {
        if (typeof id === 'string' && id.startsWith('chat-')) {
            const chatId = id.replace('chat-', '');
            setActiveChat(chatId);
            navigate('/chat');
            return;
        }

        const tok = tokenRef.current;
        try {
            const res = await fetch(`/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${tok}` }
            });
            if (res.ok) {
                setDbNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            }
        } catch (err) {
            console.error('Failed to mark notification as read', err);
        }
    }, [navigate, setActiveChat]);

    const markAllAsRead = useCallback(async () => {
        const tok = tokenRef.current;
        try {
            const res = await fetch('/api/notifications/read-all', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${tok}` }
            });
            if (res.ok) {
                // Clear DB notifications
                setDbNotifications(prev => prev.map(n => ({ ...n, read: true })));
                // Also clear all chat unread counts so chatNotifications disappears
                setChatsData(prev => {
                    const updated = {};
                    for (const [key, chat] of Object.entries(prev)) {
                        updated[key] = { ...chat, unread: false, unreadCount: 0 };
                    }
                    return updated;
                });
            }
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    }, [setChatsData]);

    const deleteNotification = useCallback(async (id) => {
        if (typeof id === 'string' && id.startsWith('chat-')) return;

        const tok = tokenRef.current;
        try {
            const res = await fetch(`/api/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${tok}` }
            });
            if (res.ok) {
                setDbNotifications(prev => prev.filter(n => n.id !== id));
            }
        } catch (err) {
            console.error('Failed to delete notification', err);
        }
    }, []);

    // ─── Filtered view ────────────────────────────────────────────────────────
    const filteredNotifications = useMemo(() => {
        let filteredChats = chatNotifications;

        if (filter === 'unread') {
            filteredChats = chatNotifications.filter(n => !n.read);
        } else if (filter === 'tasks' || filter === 'events') {
            filteredChats = [];
        } else if (filter === 'messages') {
            filteredChats = chatNotifications;
        }

        // dbNotifications are already server-filtered
        return [...filteredChats, ...dbNotifications].sort((a, b) => {
            const timeA = a.fullTime || a.createdAt || 0;
            const timeB = b.fullTime || b.createdAt || 0;
            return new Date(timeB) - new Date(timeA);
        });
    }, [dbNotifications, chatNotifications, filter]);

    const unreadCount = useMemo(
        () => notifications.filter(n => !n.read).length,
        [notifications]
    );

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
        isLoading,
        refetch: () => fetchNotifications(filter)
    };
};
