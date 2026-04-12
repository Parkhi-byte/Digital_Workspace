import React from 'react';
import { Calendar } from 'lucide-react';

const UpcomingEvents = ({ events, onViewAll }) => {
    return (
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar size={18} className="text-indigo-500" /> Upcoming
                </h3>
                <button onClick={onViewAll} className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700">View All</button>
            </div>
            {events.length > 0 ? (
                <div className="space-y-3">
                    {events.map((event, i) => (
                        <div key={event._id || i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 dark:bg-gray-900/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                                {new Date(event.start || event.date).getDate()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{event.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    {new Date(event.start || event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No upcoming events</p>
                </div>
            )}
        </div>
    );
};

export default UpcomingEvents;
