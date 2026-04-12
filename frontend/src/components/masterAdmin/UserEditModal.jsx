import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, X, Shield, Mail, Key } from 'lucide-react';

const UserEditModal = ({ user, isOpen, onClose, onUpdate, isLoading }) => {
    const [form, setForm] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        if (user) {
            setForm({ name: user.name, email: user.email, password: '' });
        }
    }, [user]);

    if (!user) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate({
            userId: user._id,
            ...form
        });
    };

    const ROLE_LABELS = {
        master_admin: 'Master Admin',
        team_head: 'Team Head',
        admin: 'Team Head',
        team_member: 'Member'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 dark:border-gray-700/50"
                    >
                        <div className="p-6 sm:p-8">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                        <Edit2 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">User Profile</h3>
                                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{ROLE_LABELS[user.role] || 'Team Member'}</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Shield className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={form.name}
                                            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-4 pl-12 pr-4 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                                            placeholder="Enter full name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={form.email}
                                            onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-4 pl-12 pr-4 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                                            placeholder="Enter email address"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">New Password (Optional)</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Key className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        </div>
                                        <input
                                            type="password"
                                            value={form.password}
                                            onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-4 pl-12 pr-4 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                                            placeholder="Leave blank to keep current"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all shadow-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-black shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UserEditModal;
