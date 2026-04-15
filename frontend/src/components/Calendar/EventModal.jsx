
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash, Calendar, Clock, AlignLeft, Type, Check, Globe } from 'lucide-react';
import moment from 'moment';
import { useAuth } from '../../context/AuthContext';

const EventModal = ({ show, onClose, event, onSave, onDelete }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [allDay, setAllDay] = useState(false);
    const [color, setColor] = useState('#3b82f6');
    const [isGlobal, setIsGlobal] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (show) {
            if (event) {
                setTitle(event.title || '');
                setDescription(event.description || '');
                setStart(event.start ? moment(event.start).format('YYYY-MM-DDTHH:mm') : '');
                setEnd(event.end ? moment(event.end).format('YYYY-MM-DDTHH:mm') : '');
                setAllDay(event.allDay || false);
                setColor(event.color || '#3b82f6');
                setIsGlobal(event.isGlobal || false);
            } else {
                // Defaults for new event
                setTitle('');
                setDescription('');
                setStart('');
                setEnd('');
                setAllDay(false);
                setColor('#3b82f6');
                setIsGlobal(false);
            }
        }
    }, [show, event]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            title,
            description,
            start: new Date(start),
            end: new Date(end),
            allDay,
            color,
            isGlobal: user.role === 'master_admin' ? isGlobal : false
        });
    };

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 dark:border-gray-700 ring-1 ring-black/5 flex flex-col max-h-[90vh]"
                    >
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 flex items-center gap-2">
                                    {event && event._id ? 'Edit Event' : 'Create Event'}
                                    {event?.isGlobal && (
                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-[10px] font-black text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 uppercase tracking-tighter">
                                            <Globe size={10} /> Global
                                        </span>
                                    )}
                                </h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all duration-200"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">

                            {/* Title Input */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Type size={14} className="text-indigo-500" /> Event Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 font-medium"
                                    placeholder="e.g., Team Brainstorming Session"
                                />
                            </div>

                            {/* Date & Time Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Calendar size={14} className="text-indigo-500" /> Start
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={start}
                                        onChange={(e) => setStart(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all duration-200 text-sm text-gray-900 dark:text-gray-100 font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Clock size={14} className="text-indigo-500" /> End
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={end}
                                        onChange={(e) => setEnd(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all duration-200 text-sm text-gray-900 dark:text-gray-100 font-medium"
                                    />
                                </div>
                            </div>

                            {/* All Day Toggle */}
                            <div className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        id="allDay"
                                        checked={allDay}
                                        onChange={(e) => setAllDay(e.target.checked)}
                                        className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 transition-all checked:border-indigo-500 checked:bg-indigo-500"
                                    />
                                    <Check size={12} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={3} />
                                </div>
                                <label htmlFor="allDay" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none flex-1">
                                    All Day Event
                                </label>
                            </div>

                            {/* Global Event Toggle (Master Admin only) */}
                            {user?.role === 'master_admin' && (
                                <div className="flex items-center gap-3 p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isGlobal"
                                            checked={isGlobal}
                                            onChange={(e) => setIsGlobal(e.target.checked)}
                                            className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-gray-800 transition-all checked:border-indigo-500 checked:bg-indigo-500"
                                        />
                                        <Check size={12} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={3} />
                                    </div>
                                    <label htmlFor="isGlobal" className="text-sm font-bold text-indigo-700 dark:text-indigo-300 cursor-pointer select-none flex-1">
                                        Global Event (Visible to All)
                                    </label>
                                </div>
                            )}

                            {/* Description Input */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <AlignLeft size={14} className="text-indigo-500" /> Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="3"
                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all duration-200 resize-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 text-sm"
                                    placeholder="Add notes..."
                                ></textarea>
                            </div>

                            {/* Color Picker */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                                    Color
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        { color: '#3b82f6', label: 'Blue' },
                                        { color: '#10b981', label: 'Green' },
                                        { color: '#ef4444', label: 'Red' },
                                        { color: '#f59e0b', label: 'Orange' },
                                        { color: '#8b5cf6', label: 'Purple' },
                                        { color: '#ec4899', label: 'Pink' },
                                        { color: '#6366f1', label: 'Indigo' }
                                    ].map((c) => (
                                        <button
                                            key={c.color}
                                            type="button"
                                            onClick={() => setColor(c.color)}
                                            className={`group relative w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center ${color === c.color ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800 scale-110 shadow-lg' : 'hover:scale-110'}`}
                                            style={{ backgroundColor: c.color }}
                                            title={c.label}
                                        >
                                            {color === c.color && (
                                                <Check size={14} className="text-white drop-shadow-md" strokeWidth={3} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </form>

                        {/* Action Buttons */}
                        {(!event?._id || user?._id === event?.user || user?.role === 'master_admin') ? (
                            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 shrink-0">
                                <div className="flex gap-3">
                                    {event && event._id && onDelete && (
                                        <button
                                            type="button"
                                            onClick={onDelete}
                                            className="px-4 py-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 group text-sm"
                                        >
                                            <Trash size={16} className="group-hover:scale-110 transition-transform" />
                                            <span className="hidden sm:inline">Delete</span>
                                        </button>
                                    )}
                                    <div className="flex-1"></div>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-5 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-xl font-bold transition-all duration-200 text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        onClick={handleSubmit}
                                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 text-sm"
                                    >
                                        {event && event._id ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 shrink-0 flex justify-end">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-8 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-bold transition-all duration-200 text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EventModal;
