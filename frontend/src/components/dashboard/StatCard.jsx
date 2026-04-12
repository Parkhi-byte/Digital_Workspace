import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ label, value, sub, icon: Icon, color, shadowColor, onClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`cursor-pointer bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-5 border border-gray-200/50 dark:border-gray-700/50 shadow-lg ${shadowColor} hover:shadow-xl transition-all group`}
        >
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon size={20} strokeWidth={2} />
                </div>
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">{value}</p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{sub}</p>
        </motion.div>
    );
};

export default StatCard;
