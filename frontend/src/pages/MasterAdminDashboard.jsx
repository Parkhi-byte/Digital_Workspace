import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    Users, Grid, Shield, Search, Trash2, Edit2, ChevronDown, ChevronUp, Crown, Ban, CheckCircle, Activity, Key
} from 'lucide-react';

const MasterAdminDashboard = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('teams');
    const [userSearch, setUserSearch] = useState('');
    const [expandedTeamId, setExpandedTeamId] = useState(null);
    const [inviteEmails, setInviteEmails] = useState({});
    const [editingTeam, setEditingTeam] = useState(null);

    const headers = {
        'Authorization': `Bearer ${user?.token}`,
        'Content-Type': 'application/json'
    };

    // ─── Data Fetching ───────────────────────────────────────────────

    const fetchStats = async () => {
        const res = await fetch('/api/admin/stats', { headers });
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
    };

    const fetchTeams = async () => {
        const res = await fetch('/api/admin/teams', { headers });
        if (!res.ok) throw new Error('Failed to fetch teams');
        return res.json();
    };

    const fetchUsers = async () => {
        const res = await fetch('/api/admin/users', { headers });
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
    };

    const fetchAuditLogs = async () => {
        const res = await fetch('/api/admin/audit-logs', { headers });
        if (!res.ok) throw new Error('Failed to fetch audit logs');
        return res.json();
    };

    const fetchPendingUsers = async () => {
        const res = await fetch('/api/admin/users/pending', { headers });
        if (!res.ok) throw new Error('Failed to fetch pending users');
        return res.json();
    };

    const { data: stats } = useQuery({ queryKey: ['adminStats'], queryFn: fetchStats, enabled: !!user });
    const { data: teams = [], isLoading: loadingTeams } = useQuery({ queryKey: ['adminTeams'], queryFn: fetchTeams, enabled: !!user });
    const { data: users = [], isLoading: loadingUsers } = useQuery({ queryKey: ['adminUsers'], queryFn: fetchUsers, enabled: !!user });
    const { data: auditLogs = [], isLoading: loadingLogs } = useQuery({ queryKey: ['adminAuditLogs'], queryFn: fetchAuditLogs, enabled: !!user });
    const { data: pendingUsers = [], isLoading: loadingPending } = useQuery({ queryKey: ['adminPendingUsers'], queryFn: fetchPendingUsers, enabled: !!user });

    // ─── Mutations ───────────────────────────────────────────────────

    const deleteTeamMutation = useMutation({
        mutationFn: async (teamId) => {
            const res = await fetch(`/api/admin/teams/${teamId}`, { method: 'DELETE', headers });
            if (!res.ok) throw new Error('Failed to delete team');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminTeams']);
            queryClient.invalidateQueries(['adminStats']);
            toast.success('Team deleted globally');
        },
        onError: (err) => toast.error(err.message)
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (userId) => {
            const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE', headers });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminUsers']);
            queryClient.invalidateQueries(['adminTeams']);
            queryClient.invalidateQueries(['adminStats']);
            toast.success('User deleted completely');
        },
        onError: (err) => toast.error('Failed to delete user')
    });

    const changeRoleMutation = useMutation({
        mutationFn: async ({ userId, newRole }) => {
            const res = await fetch(`/api/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ role: newRole })
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to update role');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminUsers']);
            queryClient.invalidateQueries(['adminStats']);
            toast.success('User role updated');
        },
        onError: (err) => toast.error(err.message)
    });

    const addMemberMutation = useMutation({
        mutationFn: async ({ teamId, email }) => {
            const res = await fetch(`/api/admin/teams/${teamId}/members`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ email })
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to add member');
            }
            return res.json();
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['adminTeams']);
            toast.success('User added to team');
            setInviteEmails(prev => ({ ...prev, [variables.teamId]: '' }));
        },
        onError: (err) => toast.error(err.message)
    });

    const removeMemberMutation = useMutation({
        mutationFn: async ({ teamId, memberId }) => {
            const res = await fetch(`/api/admin/teams/${teamId}/members/${memberId}`, {
                method: 'DELETE',
                headers
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to remove member');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminTeams']);
            toast.success('User removed from team');
        },
        onError: (err) => toast.error(err.message)
    });

    const toggleSuspendMutation = useMutation({
        mutationFn: async (userId) => {
            const res = await fetch(`/api/admin/users/${userId}/suspend`, { method: 'PATCH', headers });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['adminUsers']);
            queryClient.invalidateQueries(['adminStats']);
            queryClient.invalidateQueries(['adminAuditLogs']);
            toast.success(data.message);
        },
        onError: (err) => toast.error('Failed to toggle suspension')
    });

    const approveUserMutation = useMutation({
        mutationFn: async (userId) => {
            const res = await fetch(`/api/admin/users/${userId}/approve`, { method: 'POST', headers });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['adminPendingUsers']);
            queryClient.invalidateQueries(['adminUsers']);
            queryClient.invalidateQueries(['adminStats']);
            queryClient.invalidateQueries(['adminAuditLogs']);
            toast.success(data.message);
        },
        onError: (err) => toast.error('Failed to approve user')
    });

    const rejectUserMutation = useMutation({
        mutationFn: async (userId) => {
            const res = await fetch(`/api/admin/users/${userId}/reject`, { method: 'DELETE', headers });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['adminPendingUsers']);
            queryClient.invalidateQueries(['adminStats']);
            queryClient.invalidateQueries(['adminAuditLogs']);
            toast.success(data.message);
        },
        onError: (err) => toast.error('Failed to reject user')
    });

    const transferTeamMutation = useMutation({
        mutationFn: async ({ teamId, newOwnerId }) => {
            const res = await fetch(`/api/admin/teams/${teamId}/transfer`, {
                method: 'PATCH', headers, body: JSON.stringify({ newOwnerId })
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminTeams']);
            queryClient.invalidateQueries(['adminAuditLogs']);
            toast.success('Team ownership transferred');
        },
        onError: (err) => toast.error('Transfer failed')
    });

    const updateTeamMutation = useMutation({
        mutationFn: async ({ teamId, name, description }) => {
            const res = await fetch(`/api/admin/teams/${teamId}`, {
                method: 'PUT', headers, body: JSON.stringify({ name, description })
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminTeams']);
            queryClient.invalidateQueries(['adminAuditLogs']);
            setEditingTeam(null);
            toast.success('Team details updated');
        },
        onError: (err) => toast.error('Update failed')
    });

    // ─── Handlers ────────────────────────────────────────────────────

    const handleDeleteTeam = (id, name) => {
        if (window.confirm(`Are you absolutely sure you want to delete the team "${name}" completely? This cannot be undone.`)) {
            deleteTeamMutation.mutate(id);
        }
    };

    const handleDeleteUser = (id, name) => {
        if (window.confirm(`Are you absolutely sure you want to delete user "${name}"? All their data will be removed.`)) {
            deleteUserMutation.mutate(id);
        }
    };

    const handleToggleSuspend = (id, name, status) => {
        const isActive = status === 'active';
        if (window.confirm(`Are you sure you want to ${isActive ? 'suspend' : 'reactivate'} user "${name}"?`)) {
            toggleSuspendMutation.mutate(id);
        }
    };

    const handleApprove = (id, name) => {
        if (window.confirm(`Approve registration for ${name}?`)) {
            approveUserMutation.mutate(id);
        }
    };

    const handleReject = (id, name) => {
        if (window.confirm(`Reject registration for ${name}? Their request will be completely deleted.`)) {
            rejectUserMutation.mutate(id);
        }
    };

    const handleTransferOwnership = (teamId, teamName, newOwnerId) => {
        if (!newOwnerId) return;
        if (window.confirm(`Transfer ownership of "${teamName}" to this user?`)) {
            transferTeamMutation.mutate({ teamId, newOwnerId });
        }
    };

    const handleRoleChange = (userId, newRole) => {
        changeRoleMutation.mutate({ userId, newRole });
    };

    const handleAddMember = (teamId, e) => {
        e.preventDefault();
        const email = inviteEmails[teamId]?.trim();
        if (!email) return;
        addMemberMutation.mutate({ teamId, email });
    };

    const handleRemoveMember = (teamId, memberId, name) => {
        if (window.confirm(`Remove ${name} from this team completely?`)) {
            removeMemberMutation.mutate({ teamId, memberId });
        }
    };

    const toggleTeamExpand = (id) => {
        setExpandedTeamId(prev => prev === id ? null : id);
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    // ─── Render Helpers ──────────────────────────────────────────────

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    const StatCard = ({ title, value, sub, icon: Icon, colorClass }) => (
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-2">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClass} text-white shadow-md`}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{title}</span>
            </div>
            <p className="text-4xl font-black text-gray-900 dark:text-white mb-1">
                {value !== undefined ? value : '-'}
            </p>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{sub}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/30">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-[120px] animate-blob" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[700px] h-[700px] bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* ─── Header ────────────────────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <Crown className="text-amber-500" size={32} />
                            Master Admin Panel
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">
                            Platform-wide oversight — all teams, all users, all activity.
                        </p>
                    </div>
                    <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 text-xs font-black tracking-widest uppercase shadow-lg shadow-amber-500/20">
                        Master Admin
                    </div>
                </div>

                {/* ─── Stats Row ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
                    <StatCard
                        title="Total Users"
                        value={stats?.totalUsers}
                        sub="Across all workspaces"
                        icon={Users}
                        colorClass="from-blue-500 to-indigo-600"
                    />
                    <StatCard
                        title="Active / Suspended"
                        value={`${stats?.activeUsers || 0} / ${stats?.suspendedUsers || 0}`}
                        sub="User status breakdown"
                        icon={Activity}
                        colorClass="from-emerald-500 to-teal-600"
                    />
                    <StatCard
                        title="Pending Approvals"
                        value={stats?.pendingUsers || 0}
                        sub="Awaiting review"
                        icon={Shield}
                        colorClass="from-amber-500 to-orange-600"
                    />
                    <StatCard
                        title="Total Teams"
                        value={stats?.totalTeams}
                        sub="Active workspaces"
                        icon={Grid}
                        colorClass="from-purple-500 to-pink-600"
                    />
                    <StatCard
                        title="Team Heads"
                        value={stats?.teamHeads}
                        sub="Managing teams"
                        icon={Shield}
                        colorClass="from-violet-500 to-fuchsia-600"
                    />
                    <StatCard
                        title="Members"
                        value={stats?.teamMembers}
                        sub="Active collaborators"
                        icon={Users}
                        colorClass="from-emerald-500 to-teal-600"
                    />
                </div>

                {/* ─── Tab Bar ───────────────────────────────────────────── */}
                <div className="flex items-center gap-6 border-b border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('teams')}
                        className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'teams' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        All Teams
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'users' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        All Users
                    </button>
                    <button
                        onClick={() => setActiveTab('audit')}
                        className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'audit' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        Audit Logs
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`pb-4 text-sm font-bold border-b-2 transition-colors relative ${activeTab === 'pending' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        Pending Requests
                        {pendingUsers.length > 0 && (
                            <span className="absolute -top-1 -right-4 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse shadow-md border border-white dark:border-gray-900">
                                {pendingUsers.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* ─── Teams Tab ─────────────────────────────────────────── */}
                {activeTab === 'teams' && (
                    <div className="space-y-4">
                        {loadingTeams ? (
                            <div className="text-center py-10 text-gray-500">Loading teams...</div>
                        ) : teams.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">No teams found.</div>
                        ) : (
                            <AnimatePresence>
                                {teams.map((team) => (
                                    <motion.div
                                        key={team._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-sm overflow-hidden"
                                    >
                                        <div
                                            className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                                            onClick={() => toggleTeamExpand(team._id)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xl shadow-inner">
                                                    {team.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                        {team.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">Owner:</span>
                                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{team.owner?.name || 'Unknown'}</span>
                                                        <span className="text-xs text-gray-400">({team.owner?.email || 'N/A'})</span>
                                                        <select
                                                            className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 border-none rounded outline-none cursor-pointer p-0.5"
                                                            onChange={(e) => handleTransferOwnership(team._id, team.name, e.target.value)}
                                                            value=""
                                                            onClick={(e) => e.stopPropagation()}
                                                            title="Transfer Ownership"
                                                        >
                                                            <option value="" disabled>Transfer...</option>
                                                            {team.members?.map(m => (
                                                                <option key={m._id} value={m._id}>{m.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold font-mono">
                                                    {team.members?.length || 0} Members
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteTeam(team._id, team.name); }}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete completely"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                                <div className="text-gray-400">
                                                    {expandedTeamId === team._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                </div>
                                            </div>
                                        </div>

                                        {expandedTeamId === team._id && (
                                            <div className="px-5 pb-5 pt-2 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30">
                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-2">Team Members</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {team.members?.map(m => (
                                                        <div key={m._id} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 shadow-sm">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold">
                                                                {getInitials(m.name)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{m.name}</p>
                                                                <p className="text-xs text-gray-500 truncate">{m.email}</p>
                                                            </div>
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                                                Member
                                                            </span>
                                                            <button 
                                                                className="ml-auto text-gray-400 hover:text-red-500"
                                                                onClick={() => handleRemoveMember(team._id, m._id, m.name)}
                                                                disabled={removeMemberMutation.isLoading}
                                                            >
                                                                &times;
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {(!team.members || team.members.length === 0) && (
                                                        <div className="text-sm text-gray-500 italic p-2">No other members in this team.</div>
                                                    )}
                                                </div>
                                                <form onSubmit={(e) => handleAddMember(team._id, e)} className="mt-4 flex gap-2 w-full max-w-sm ml-2">
                                                    <input 
                                                        type="email" 
                                                        placeholder="User email to add..." 
                                                        value={inviteEmails[team._id] || ''}
                                                        onChange={(e) => setInviteEmails(prev => ({ ...prev, [team._id]: e.target.value }))}
                                                        className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
                                                    />
                                                    <button 
                                                        type="submit" 
                                                        disabled={addMemberMutation.isLoading}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-1.5 text-sm font-bold transition-colors disabled:opacity-50"
                                                    >
                                                        Add
                                                    </button>
                                                </form>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                )}

                {/* ─── Users Tab ─────────────────────────────────────────── */}
                {activeTab === 'users' && (
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
                                                        value={u.role === 'admin' ? 'team_head' : u.role} // alias admin to team_head for display
                                                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                        disabled={changeRoleMutation.isLoading || u._id === user._id}
                                                        className="text-xs font-bold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300 cursor-pointer disabled:opacity-50 outline-none focus:border-indigo-500"
                                                    >
                                                        <option value="team_member">Member</option>
                                                        <option value="team_head">Team Head</option>
                                                        <option value="master_admin">Master Admin</option>
                                                    </select>
                                                    <button
                                                        onClick={() => handleToggleSuspend(u._id, u.name, u.status)}
                                                        disabled={u._id === user._id || toggleSuspendMutation.isLoading}
                                                        className={`p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent ${u.status !== 'suspended' ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                                                        title={u._id === user._id ? "Cannot suspend yourself" : (u.status !== 'suspended' ? "Suspend user" : "Reactivate user")}
                                                    >
                                                        {u.status !== 'suspended' ? <Ban size={16} /> : <CheckCircle size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(u._id, u.name)}
                                                        disabled={u._id === user._id || deleteUserMutation.isLoading}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                                        title={u._id === user._id ? "Cannot delete yourself" : "Delete user completely"}
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
                )}

                {/* ─── Audit Logs Tab ─────────────────────────────────────────── */}
                {activeTab === 'audit' && (
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-xl overflow-hidden p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Platform Activity Log</h2>
                        <div className="space-y-4">
                            {loadingLogs ? (
                                <div className="text-center py-10 text-gray-500">Loading logs...</div>
                            ) : auditLogs.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">No activity recorded yet.</div>
                            ) : (
                                auditLogs.map((log) => (
                                    <div key={log._id} className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                        <div className="mt-1">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center">
                                                <Activity size={16} />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                <span className="font-bold">{log.admin?.name || 'System'}</span> performed <span className="font-bold text-indigo-500">{log.action}</span>
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{log.details}</p>
                                            <p className="text-xs text-gray-400 mt-2">{new Date(log.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* ─── Pending Requests Tab ──────────────────────────────────────── */}
                {activeTab === 'pending' && (
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-xl overflow-hidden p-6 max-w-4xl mx-auto">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Shield className="text-amber-500" size={24} />
                            Registration Approvals
                        </h2>
                        
                        <div className="space-y-4">
                            {loadingPending ? (
                                <div className="text-center py-10 text-gray-500 font-medium">Checking for pending requests...</div>
                            ) : pendingUsers.length === 0 ? (
                                <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">All caught up!</h3>
                                    <p className="text-sm text-gray-500">There are no pending registrations requiring your approval right now.</p>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {pendingUsers.map((u) => (
                                        <motion.div
                                            key={u._id}
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-xl border border-amber-100 dark:border-amber-900/30 shadow-inner shrink-0">
                                                    {getInitials(u.name)}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{u.name}</h3>
                                                    <p className="text-sm text-gray-500 mb-1">{u.email}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 inline-block">
                                                            Requested Role: Team Head
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(u.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                                <button
                                                    onClick={() => handleReject(u._id, u.name)}
                                                    disabled={rejectUserMutation.isLoading}
                                                    className="flex-1 sm:flex-none px-4 py-2 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
                                                >
                                                    Reject & Delete
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(u._id, u.name)}
                                                    disabled={approveUserMutation.isLoading}
                                                    className="flex-1 sm:flex-none px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MasterAdminDashboard;
