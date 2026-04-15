import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Filter, Calendar as CalendarIcon, ChevronRight, Globe } from 'lucide-react';
import moment from 'moment';

const CalendarSidebar = ({ events, onSelectEvent, activeFilters, onFilterChange }) => {

    // Sort and filter upcoming events (next 14 days)
    const upcomingEvents = useMemo(() => {
        const now = new Date();
        const twoWeeksLater = new Date();
        twoWeeksLater.setDate(now.getDate() + 14);

        return events
            .filter(evt => new Date(evt.start) >= now && new Date(evt.start) <= twoWeeksLater)
            .sort((a, b) => new Date(a.start) - new Date(b.start))
            .slice(0, 5); // Show top 5
    }, [events]);

    const colors = [
        { color: '#3b82f6', label: 'Blue' },
        { color: '#10b981', label: 'Green' },
        { color: '#ef4444', label: 'Red' },
        { color: '#f59e0b', label: 'Orange' },
        { color: '#8b5cf6', label: 'Purple' },
        { color: '#ec4899', label: 'Pink' },
        { color: '#6366f1', label: 'Indigo' }
    ];

    const toggleFilter = (color) => {
        if (activeFilters.includes(color)) {
            onFilterChange(activeFilters.filter(c => c !== color));
        } else {
            onFilterChange([...activeFilters, color]);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col overflow-hidden">

            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700/50">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Schedule
                </h2>
                <div className="flex items-center justify-between mt-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Upcoming
                    </div>
                </div>
            </div>

            {/* Upcoming Events List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                {upcomingEvents.length > 0 ? (
                    upcomingEvents.map(evt => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.01, x: 2 }}
                            key={evt._id || evt.id}
                            onClick={() => onSelectEvent(evt)}
                            className="group relative p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:bg-white dark:hover:bg-gray-700/50 hover:shadow-md transition-all cursor-pointer"
                        >
                            <div className="flex gap-3">
                                <div className="flex flex-col items-center justify-center min-w-[3rem] px-2 py-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <span className="text-xs font-bold text-gray-400 uppercase">
                                        {moment(evt.start).format('MMM')}
                                    </span>
                                    <span className="text-lg font-extrabold text-gray-900 dark:text-white leading-none mt-0.5">
                                        {moment(evt.start).format('D')}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0 py-0.5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div
                                            className="w-2 h-2 rounded-full ring-2 ring-white dark:ring-gray-800"
                                            style={{ backgroundColor: evt.color || '#3b82f6' }}
                                        />
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                            {moment(evt.start).format('h:mm A')}
                                        </span>
                                        {evt.isGlobal && (
                                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-[9px] font-black text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 uppercase tracking-tighter">
                                                <Globe size={8} /> Global
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate leading-snug">
                                        {evt.title || 'Untitled Event'}
                                    </h4>
                                </div>
                                <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                            <CalendarIcon size={20} className="text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No upcoming events</p>
                        <p className="text-xs text-gray-400 mt-1">Enjoy your free time!</p>
                    </div>
                )}
            </div>

            {/* Filters Footer */}
            <div className="p-5 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Filter by Color
                    </span>
                    {activeFilters.length > 0 && (
                        <button
                            onClick={() => onFilterChange([])}
                            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            Reset
                        </button>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    {colors.map(c => (
                        <button
                            key={c.color}
                            onClick={() => toggleFilter(c.color)}
                            className={`
                                w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ring-2 ring-offset-2 dark:ring-offset-gray-900
                                ${activeFilters.includes(c.color)
                                    ? 'ring-indigo-500/30 scale-110'
                                    : 'ring-transparent hover:scale-105 opacity-70 hover:opacity-100'}
                            `}
                            style={{ backgroundColor: c.color }}
                            title={c.label}
                        >
                            {activeFilters.includes(c.color) && (
                                <Filter size={12} className="text-white drop-shadow-sm" strokeWidth={3} />
                            )}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default CalendarSidebar;
