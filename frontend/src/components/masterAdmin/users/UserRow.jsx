import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Ban, CheckCircle, Trash2, Edit2, ArrowLeftRight } from 'lucide-react';

const UserRow = ({ user, i, currentUser, onEdit, onToggleSuspend, onImpersonate, onDelete, mutations }) => {
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
        <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="border-b border-gray-100 dark:border-gray-800 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors"
        >
            <td className="py-4 px-6">
                <div 
                    className="flex items-center gap-3 cursor-pointer group/user"
                    onClick={() => onEdit(user)}
                >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold shadow-md shrink-0 group-hover/user:scale-110 transition-transform">
                        {getInitials(user.name)}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white truncate tracking-tight group-hover/user:text-indigo-600 transition-colors uppercase text-xs">{user.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate font-medium">{user.email}</p>
                    </div>
                </div>
            </td>
            <td className="py-4 px-6 text-center">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                    ${user.role === 'master_admin' ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 shadow-md' :
                        user.role === 'team_head' || user.role === 'admin' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400' :
                            'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                    }`}
                >
                    {user.role === 'master_admin' && <Crown size={12} />}
                    {ROLE_LABELS[user.role] || 'Member'}
                </span>
            </td>
            <td className="py-4 px-6 text-center">
                <span className={`text-[10px] font-black uppercase tracking-widest ${user.status === 'active' ? 'text-green-500' : user.status === 'suspended' ? 'text-red-500' : 'text-amber-500'}`}>
                    {user.status}
                </span>
            </td>
            <td className="py-4 px-6">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onEdit(user)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-[10px] font-black uppercase tracking-widest"
                    >
                        <Edit2 size={14} />
                        <span>View Profile</span>
                    </button>
                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
                    <button
                        onClick={() => onToggleSuspend(user._id, user.name, user.status)}
                        disabled={user._id === currentUser?._id || mutations.toggleSuspend.isLoading}
                        className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${user.status !== 'suspended' ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                        title={user.status !== 'suspended' ? "Suspend user" : "Reactivate user"}
                    >
                        {user.status !== 'suspended' ? <Ban size={16} /> : <CheckCircle size={16} />}
                    </button>
                    <button
                        onClick={() => onImpersonate(user._id)}
                        disabled={user._id === currentUser?._id || mutations.impersonateUser.isLoading}
                        className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors disabled:opacity-30"
                        title="Impersonate (Shadow Mode)"
                    >
                        <ArrowLeftRight size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(user._id, user.name)}
                        disabled={user._id === currentUser?._id || mutations.deleteUser.isLoading}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30"
                        title="Delete user completely"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </motion.tr>
    );
};

export default UserRow;
