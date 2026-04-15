import React, { useState } from 'react';
import { Search } from 'lucide-react';
import UserEditModal from './UserEditModal';
import UserRow from './users/UserRow';

const UsersTab = ({ users, loadingUsers, mutations, currentUser }) => {
    const [userSearch, setUserSearch] = useState('');
    const [editingUser, setEditingUser] = useState(null);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    const handleEditOpen = (user) => setEditingUser(user);
    const handleEditClose = () => setEditingUser(null);

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
                                <UserRow 
                                    key={u._id}
                                    user={u}
                                    i={i}
                                    currentUser={currentUser}
                                    onEdit={handleEditOpen}
                                    onToggleSuspend={handleToggleSuspend}
                                    onImpersonate={handleImpersonate}
                                    onDelete={handleDeleteUser}
                                    mutations={mutations}
                                />
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
