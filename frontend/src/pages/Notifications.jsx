import React, { useState } from 'react';
import { Bell, Check, X, MessageCircle, Video, FileText, UserPlus, Calendar, Trash2, Filter } from 'lucide-react';

const Notifications = () => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'message',
      title: 'New message from Satyam',
      description: 'Hey! Can we schedule a meeting for tomorrow?',
      time: '5m ago',
      read: false,
      icon: MessageCircle,
      color: 'bg-blue-500'
    },
    {
      id: 2,
      type: 'video',
      title: 'Video call invitation',
      description: 'Prachi invited you to join "Weekly Sync"',
      time: '15m ago',
      read: false,
      icon: Video,
      color: 'bg-green-500'
    },
    {
      id: 3,
      type: 'document',
      title: 'Document shared',
      description: 'Sneha shared "Project_Plan.pdf"',
      time: '1h ago',
      read: true,
      icon: FileText,
      color: 'bg-purple-500'
    },
    {
      id: 4,
      type: 'user',
      title: 'New team member',
      description: 'Parkhi joined your workspace',
      time: '2h ago',
      read: true,
      icon: UserPlus,
      color: 'bg-orange-500'
    },
    {
      id: 5,
      type: 'calendar',
      title: 'Meeting reminder',
      description: 'Team standup in 30 minutes',
      time: '3h ago',
      read: false,
      icon: Calendar,
      color: 'bg-red-500'
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : filter === 'unread'
      ? notifications.filter(n => !n.read)
      : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Stay updated with your team activity.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={markAllAsRead}
              className="text-sm font-medium text-aurora-600 dark:text-aurora-400 hover:text-aurora-700 dark:hover:text-aurora-300 transition-colors"
            >
              Mark all as read
            </button>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'all'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-gray-700'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${filter === 'unread'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-gray-700'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="bg-aurora-100 dark:bg-aurora-900/30 text-aurora-600 dark:text-aurora-400 px-1.5 py-0.5 rounded-full text-xs">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 border-dashed">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="text-gray-400" size={24} />
              </div>
              <h3 className="text-gray-900 dark:text-white font-medium">No notifications</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`group relative p-5 rounded-2xl border transition-all duration-200 ${!notification.read
                      ? 'bg-white dark:bg-gray-800 border-aurora-200 dark:border-aurora-900 shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-900/50 border-transparent hover:bg-white dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm ${notification.color}`}>
                      <Icon size={18} strokeWidth={2.5} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{notification.time}</span>
                      </div>
                      <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-600 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'}`}>
                        {notification.description}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-1 border border-gray-100 dark:border-gray-700">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1.5 text-gray-400 hover:text-aurora-600 hover:bg-aurora-50 dark:hover:bg-aurora-900/20 rounded-md transition-colors"
                          title="Mark as read"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {!notification.read && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-2 h-2 bg-aurora-500 rounded-full"></div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
