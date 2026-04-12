import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Crown, Ban, CheckCircle, Trash2 } from 'lucide-react';

const UsersTab = ({ users, loadingUsers, mutations, currentUser }) => {
    const [userSearch, setUserSearch] = useState('');

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    const handleRoleChange = (userId, newRole) => {
        mutations.changeRole.mutate({ userId, newRole });
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

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    return (
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
                            <th className="font-bold py-4 px-6 uppercase tracking-wider text-xs">Teams</th>
                            <th className="font-bold py-4 px-6 uppercase tracking-wider text-xs w-48">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loadingUsers ? (
                            <tr><td colSpan="4" className="text-center py-10 text-gray-500">Loading users...</td></tr>
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
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                                            {getInitials(u.name)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 dark:text-white truncate">{u.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                                        ${u.role === 'master_admin' ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 shadow-md' :
                                            u.role === 'team_head' || u.role === 'admin' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400' :
                                                'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                                        }`}
                                    >
                                        {u.role === 'master_admin' && <Crown size={12} />}
                                        {u.role === 'master_admin' ? 'Master Admin' : u.role === 'team_head' || u.role === 'admin' ? 'Team Head' : 'Team Member'}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    {u.teams && u.teams.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {u.teams.slice(0, 2).map((t, idx) => (
                                                <span key={idx} className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded">
                                                    {t}
                                                </span>
                                            ))}
                                            {u.teams.length > 2 && <span className="text-xs text-gray-500">+{u.teams.length - 2} more</span>}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">—</span>
                                    )}
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <select
                                            value={u.role === 'admin' ? 'team_head' : u.role}
                                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                            disabled={mutations.changeRole.isLoading || u._id === currentUser?._id}
                                            className="text-xs font-bold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300 cursor-pointer disabled:opacity-50 outline-none focus:border-indigo-500"
                                        >
                                            <option value="team_member">Member</option>
                                            <option value="team_head">Team Head</option>
                                            <option value="master_admin">Master Admin</option>
                                        </select>
                                        <button
                                            onClick={() => handleToggleSuspend(u._id, u.name, u.status)}
                                            disabled={u._id === currentUser?._id || mutations.toggleSuspend.isLoading}
                                            className={`p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent ${u.status !== 'suspended' ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                                            title={u._id === currentUser?._id ? "Cannot suspend yourself" : (u.status !== 'suspended' ? "Suspend user" : "Reactivate user")}
                                        >
                                            {u.status !== 'suspended' ? <Ban size={16} /> : <CheckCircle size={16} />}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(u._id, u.name)}
                                            disabled={u._id === currentUser?._id || mutations.deleteUser.isLoading}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                            title={u._id === currentUser?._id ? "Cannot delete yourself" : "Delete user completely"}
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
    );
};

export default UsersTab;
