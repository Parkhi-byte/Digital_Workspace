import React, { useState } from 'react';
import { Bell, Check, X, MessageCircle, Video, FileText, UserPlus, Calendar } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'message',
      title: 'New message from Satyam Katiyar',
      description: 'Hey! Can we schedule a meeting for tomorrow?',
      time: '5 minutes ago',
      read: false,
      icon: MessageCircle,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      type: 'video',
      title: 'Video call invitation',
      description: 'Prachi Gangwar invited you to join a video call',
      time: '15 minutes ago',
      read: false,
      icon: Video,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 3,
      type: 'document',
      title: 'Document shared',
      description: 'Sneha Gangwar shared a new document: Project_Plan.pdf',
      time: '1 hour ago',
      read: true,
      icon: FileText,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 4,
      type: 'user',
      title: 'New team member',
      description: 'Parkhi joined your workspace',
      time: '2 hours ago',
      read: true,
      icon: UserPlus,
      color: 'from-orange-500 to-amber-500'
    },
    {
      id: 5,
      type: 'calendar',
      title: 'Meeting reminder',
      description: 'Team standup in 30 minutes',
      time: '3 hours ago',
      read: false,
      icon: Calendar,
      color: 'from-red-500 to-rose-500'
    },
    {
      id: 6,
      type: 'message',
      title: 'New message from Prachi Gangwar',
      description: 'Thanks for the update on the project!',
      time: 'Yesterday',
      read: true,
      icon: MessageCircle,
      color: 'from-blue-500 to-cyan-500'
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-aurora-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl animate-float">
              <Bell className="text-white" size={32} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Notifications</h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2"
            >
              <Check size={16} />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="text-gray-400" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No notifications</h3>
            <p className="text-gray-600">You're all caught up! New notifications will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`bg-gradient-to-br ${notification.color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="text-white" size={20} strokeWidth={2.5} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{notification.description}</p>
                          <p className="text-xs text-gray-500">{notification.time}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <Check size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

