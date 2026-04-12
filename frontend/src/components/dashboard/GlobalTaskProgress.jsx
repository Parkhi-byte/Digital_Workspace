import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const GlobalTaskProgress = ({ completionRate, todoTasks, inProgressTasks, completedTasks }) => {
    return (
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-500" /> Task Overview
            </h3>
            <div className="flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-gray-700" />
                        <motion.path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="url(#progressGradient)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            initial={{ strokeDasharray: '0, 100' }}
                            animate={{ strokeDasharray: `${completionRate}, 100` }}
                            transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                        />
                        <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-black text-gray-900 dark:text-white">{completionRate}%</span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                    <p className="text-lg font-black text-blue-600 dark:text-blue-400">{todoTasks}</p>
                    <p className="text-[10px] font-bold text-blue-500/80 uppercase">To Do</p>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                    <p className="text-lg font-black text-amber-600 dark:text-amber-400">{inProgressTasks}</p>
                    <p className="text-[10px] font-bold text-amber-500/80 uppercase">Active</p>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{completedTasks}</p>
                    <p className="text-[10px] font-bold text-emerald-500/80 uppercase">Done</p>
                </div>
            </div>
        </div>
    );
};

export default GlobalTaskProgress;
