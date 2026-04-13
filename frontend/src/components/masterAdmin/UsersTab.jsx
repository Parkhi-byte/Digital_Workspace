import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Crown, Ban, CheckCircle, Trash2, Edit2, ArrowLeftRight } from 'lucide-react';
import UserEditModal from './UserEditModal';

const UsersTab = ({ users, loadingUsers, mutations, currentUser }) => {
    const [userSearch, setUserSearch] = useState('');
    const [editingUser, setEditingUser] = useState(null);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    const handleEditOpen = (user) => {
        setEditingUser(user);
    };

    const handleEditClose = () => {
        setEditingUser(null);
    };

    const handleUpdateUser = (formData) => {
        mutations.updateUser.mutate(formData, {
            onSuccess: () => handleEditClose()
        });
    };

    const handleToggleSuspend = (id, name, status) => {
        const isActive = status === 'active';
        if (window.confirm(`Are you sure you want to ${isActive ? 'suspend' : 'reactivate'} user "${name}"?`)) {
            mutations.toggleSuspend.mutate(id);
        }
    };

    const handleDeleteUser = (id, name) => {
        if (window.confirm(`Are you absolutely sure you want to delete user "${name}"? All their data will be removed.`)) {
            mutations.deleteUser.mutate(id);
        }
    };

    const handleImpersonate = (userId) => {
        if (window.confirm('Are you sure you want to enter Shadow Mode as this user? You will be able to see their full dashboard.')) {
            mutations.impersonateUser.mutate(userId);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const ROLE_LABELS = {
        master_admin: 'Master Admin',
        team_head: 'Team Head',
        admin: 'Team Head',
        team_member: 'Member'
    };

    return (
        <div className="relative">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700/50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-900/30">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white shrink-0">
                        All Users <span className="text-gray-400 font-medium text-base ml-1">({filteredUsers.length})</span>
                    </h2>
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700/50 text-gray-500 dark:text-gray-400">
                                <th className="font-bold py-4 px-6 uppercase tracking-wider text-xs">User</th>
                                <th className="font-bold py-4 px-6 uppercase tracking-wider text-xs">Role</th>
                                <th className="font-bold py-4 px-6 uppercase tracking-wider text-xs font-medium">Status</th>
                                <th className="font-bold py-4 px-6 uppercase tracking-wider text-xs w-48">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingUsers ? (
                                <tr><td colSpan="4" className="text-center py-10 text-gray-500 font-medium tracking-tight">Loading users...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-10 text-gray-500">No users found matching "{userSearch}"</td></tr>
                            ) : filteredUsers.map((u, i) => (
                                <motion.tr
                                    key={u._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors"
                                >
                                    <td className="py-4 px-6">
                                        <div 
                                            className="flex items-center gap-3 cursor-pointer group/user"
                                            onClick={() => handleEditOpen(u)}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold shadow-md shrink-0 group-hover/user:scale-110 transition-transform">
                                                {getInitials(u.name)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-900 dark:text-white truncate tracking-tight group-hover/user:text-indigo-600 transition-colors uppercase text-xs">{u.name}</p>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate font-medium">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                                            ${u.role === 'master_admin' ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 shadow-md' :
                                                u.role === 'team_head' || u.role === 'admin' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400' :
                                                    'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                                            }`}
                                        >
                                            {u.role === 'master_admin' && <Crown size={12} />}
                                            {ROLE_LABELS[u.role] || 'Member'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${u.status === 'active' ? 'text-green-500' : u.status === 'suspended' ? 'text-red-500' : 'text-amber-500'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEditOpen(u)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-[10px] font-black uppercase tracking-widest"
                                            >
                                                <Edit2 size={14} />
                                                <span>View Profile</span>
                                            </button>
                                            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
                                            <button
                                                onClick={() => handleToggleSuspend(u._id, u.name, u.status)}
                                                disabled={u._id === currentUser?._id || mutations.toggleSuspend.isLoading}
                                                className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${u.status !== 'suspended' ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                                                title={u.status !== 'suspended' ? "Suspend user" : "Reactivate user"}
                                            >
                                                {u.status !== 'suspended' ? <Ban size={16} /> : <CheckCircle size={16} />}
                                            </button>
                                            <button
                                                onClick={() => handleImpersonate(u._id)}
                                                disabled={u._id === currentUser?._id || mutations.impersonateUser.isLoading}
                                                className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors disabled:opacity-30"
                                                title="Impersonate (Shadow Mode)"
                                            >
                                                <ArrowLeftRight size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(u._id, u.name)}
                                                disabled={u._id === currentUser?._id || mutations.deleteUser.isLoading}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30"
                                                title="Delete user completely"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <UserEditModal 
                user={editingUser}
                isOpen={!!editingUser}
                onClose={handleEditClose}
                onUpdate={handleUpdateUser}
                isLoading={mutations.updateUser.isLoading}
            />
        </div>
    );
};

export default UsersTab;
