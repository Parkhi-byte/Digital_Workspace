import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { UserPlus, User, Sparkles, AlertCircle, CheckCircle, Search, Loader2, ChevronDown, X } from 'lucide-react';

const ROLE_COLORS = {
    admin: 'from-red-500 to-orange-500',
    team_head: 'from-indigo-500 to-purple-500',
    team_member: 'from-cyan-500 to-blue-500'
};

const ROLE_LABELS = {
    admin: 'Admin',
    team_head: 'Team Head',
    team_member: 'Member'
};

const ROLE_BADGE_STYLES = {
    admin: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    team_head: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    team_member: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
};

const getInitials = (name, email) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return email?.[0]?.toUpperCase() || '?';
};

const InviteMember = memo(({
    inviteEmail, setInviteEmail,
    inviteName, setInviteName,
    handleInvite, loading, error, success,
    allUsers = [], usersLoading = false,
    searchUsers, fetchAllUsers,
    isMasterAdmin = false
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const onClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    // Clear selection after successful invite
    useEffect(() => {
        if (success) setSelectedUser(null);
    }, [success]);

    const handleEmailChange = useCallback((e) => {
        const value = e.target.value;
        setInviteEmail(value);
        setSelectedUser(null);
        if (value.trim()) {
            searchUsers(value.trim());
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }
    }, [setInviteEmail, searchUsers]);

    const handleFocus = useCallback(() => {
        if (inviteEmail.trim()) {
            searchUsers(inviteEmail.trim());
        } else {
            fetchAllUsers('');
        }
        setShowDropdown(true);
    }, [inviteEmail, searchUsers, fetchAllUsers]);

    const handleSelectUser = useCallback((user) => {
        setInviteEmail(user.email);
        setInviteName(user.name || '');
        setSelectedUser(user);
        setShowDropdown(false);
    }, [setInviteEmail, setInviteName]);

    const handleClearSelection = useCallback(() => {
        setInviteEmail('');
        setInviteName('');
        setSelectedUser(null);
        setShowDropdown(false);
        inputRef.current?.focus();
    }, [setInviteEmail, setInviteName]);

    return (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-2xl rounded-[2rem] p-8 sticky top-28 overflow-visible">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

            <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-fuchsia-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-fuchsia-500/30 transform -rotate-6 transition-transform hover:rotate-0 duration-500">
                        <UserPlus size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isMasterAdmin ? 'Add Member to Team' : 'Invite Member'}
                        </h2>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">
                            {isMasterAdmin ? 'Direct Team Override' : 'Expand Your Team'}
                        </p>
                    </div>
                </div>

                {(error || success) && (
                    <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${error
                        ? 'bg-red-50/80 text-red-700 border border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                        : 'bg-emerald-50/80 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
                        }`}>
                        {error ? <AlertCircle size={20} className="shrink-0 mt-0.5" /> : <CheckCircle size={20} className="shrink-0 mt-0.5" />}
                        <span className="text-sm font-medium leading-tight">{error || success}</span>
                    </div>
                )}

                <form onSubmit={handleInvite} className="space-y-6">
                    {/* Email with Dropdown */}
                    <div className="space-y-2" ref={dropdownRef}>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Email Address</label>

                        {selectedUser ? (
                            <div className="flex items-center gap-3 p-3 bg-indigo-50/80 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/50 rounded-xl">
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${ROLE_COLORS[selectedUser.role] || ROLE_COLORS.team_member} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                                    {getInitials(selectedUser.name, selectedUser.email)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{selectedUser.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{selectedUser.email}</p>
                                </div>
                                <button type="button" onClick={handleClearSelection} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200">
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
                                </div>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    required
                                    value={inviteEmail}
                                    onChange={handleEmailChange}
                                    onFocus={handleFocus}
                                    placeholder="Search by email or name..."
                                    autoComplete="off"
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl py-4 pl-12 pr-12 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all duration-300 shadow-inner"
                                />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                    {usersLoading
                                        ? <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
                                        : <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                                    }
                                </div>

                                {showDropdown && (
                                    <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto z-[60] dropdown-slide">
                                        {allUsers.length > 0 ? (
                                            <div className="py-1">
                                                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700/50">
                                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                                        Registered Users ({allUsers.length})
                                                    </p>
                                                </div>
                                                {allUsers.map((u) => (
                                                    <button
                                                        key={u._id}
                                                        type="button"
                                                        onClick={() => handleSelectUser(u)}
                                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50/80 dark:hover:bg-indigo-900/20 transition-all duration-150 group/item"
                                                    >
                                                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${ROLE_COLORS[u.role] || ROLE_COLORS.team_member} flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover/item:shadow-md transition-shadow`}>
                                                            {getInitials(u.name, u.email)}
                                                        </div>
                                                        <div className="flex-1 text-left min-w-0">
                                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{u.name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                                                        </div>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${ROLE_BADGE_STYLES[u.role] || ROLE_BADGE_STYLES.team_member}`}>
                                                            {ROLE_LABELS[u.role] || 'Member'}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="px-4 py-8 text-center">
                                                {usersLoading ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Searching users...</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Search className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">No users found</p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500">Try a different search term</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Name field */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
                            </div>
                            <input
                                type="text"
                                value={inviteName}
                                onChange={(e) => setInviteName(e.target.value)}
                                placeholder={selectedUser ? 'Auto-filled from selected user' : 'Optional'}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl py-4 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all duration-300 shadow-inner"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-gray-900 rounded-xl font-bold shadow-xl shadow-gray-900/10 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>{isMasterAdmin ? 'Add to Team' : 'Send Invitation'}</span>
                                <Sparkles size={18} className="group-hover:text-amber-400 transition-colors duration-300" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
});

InviteMember.displayName = 'InviteMember';
export default InviteMember;
