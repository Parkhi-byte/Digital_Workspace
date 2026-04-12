import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, Clock, ArrowRight } from 'lucide-react';

const ActivityFeed = ({ activities, isMasterAdmin, onViewAll }) => {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Activity size={24} className="text-indigo-500" />
                    {isMasterAdmin ? 'System Activity' : 'Recent Activity'}
                </h2>
                <button onClick={onViewAll} className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold flex items-center gap-1 group">
                    View All <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
            {activities.length > 0 ? (
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg">
                    <div className="space-y-4">
                        {activities.slice(0, 6).map((activity, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0"
                            >
                                <div className={`mt-1 w-10 h-10 rounded-xl bg-gradient-to-br ${isMasterAdmin ? 'from-amber-500 to-orange-600' : 'from-indigo-500 to-purple-600'} text-white flex items-center justify-center shrink-0 shadow-md`}>
                                    {isMasterAdmin ? <Activity size={18} /> : <Users size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                                        {isMasterAdmin ? (
                                            <><span className="font-black text-indigo-600 dark:text-indigo-400">{activity.admin?.name || 'Admin'}</span> {activity.details}</>
                                        ) : (
                                            <><span className="font-black">Team Admin</span> {activity.text}</>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                                        {new Date(activity.createdAt).toLocaleDateString()} • {new Date(activity.createdAt).toLocaleTimeString()}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg min-h-[200px] flex items-center justify-center text-center">
                    <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                            <Clock size={28} className="text-indigo-500" />
                        </div>
                        <div>
                            <p className="text-gray-900 dark:text-white font-bold text-lg">All caught up!</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">No recent activity.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityFeed;
