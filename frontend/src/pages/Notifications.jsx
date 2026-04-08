
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications/useNotifications';
import NotificationFilters from '../components/Notifications/NotificationFilters';
import NotificationItem from '../components/Notifications/NotificationItem';
import { Bell, Filter, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardListSkeleton } from '../components/SkeletonLoader';

const Notifications = () => {
  const { filter: paramFilter } = useParams();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  const {
    filter,
    setFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    filteredNotifications,
    unreadCount,
    notifications,
    isLoading
  } = useNotifications();


  useEffect(() => {
    if (paramFilter && ['all', 'unread', 'tasks', 'events', 'messages'].includes(paramFilter)) {
      setFilter(paramFilter);
    } else {
      setFilter('all');
    }
  }, [paramFilter, setFilter]);

  const handleFilterChange = (newFilter) => {
    navigate(newFilter === 'all' ? '/notifications' : `/notifications/${newFilter}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/30 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-gray-900 to-indigo-600 dark:from-white dark:to-indigo-400 bg-clip-text text-transparent">Notifications</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Stay updated with your team activity.</p>
          </div>

          <div className="flex items-center gap-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md p-1.5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
            >
              <CheckCircle size={16} />
              <span>Mark all read</span>
            </button>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl transition-all ${
                showFilters 
                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
              }`}
              title="Filter Notifications"
            >
              <Filter size={20} fill={showFilters ? "currentColor" : "none"} />
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <NotificationFilters filter={filter} setFilter={handleFilterChange} unreadCount={unreadCount} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notifications List */}
        {isLoading ? (
          <CardListSkeleton count={5} />
        ) : (
          <motion.div className="space-y-4">
            <AnimatePresence mode='popLayout'>
              {filteredNotifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-20 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-dashed border-gray-300 dark:border-gray-700"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Bell className="text-gray-400 dark:text-gray-500" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">No notifications</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">You're all caught up!</p>
                </motion.div>
              ) : (
                filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <NotificationItem
                      notification={notification}
                      markAsRead={markAsRead}
                      deleteNotification={deleteNotification}
                    />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
