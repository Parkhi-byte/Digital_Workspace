import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import {
    Users, Clock, Zap, Video, Plus, Calendar, ArrowRight, Sparkles, TrendingUp,
    CheckCircle, ListTodo, FileText, Shield, BarChart3, Target, AlertTriangle,
    Database, Activity, FileSearch, LayoutGrid, HardDrive
} from 'lucide-react';
import { APP_FEATURES } from '../constants';
import { motion } from 'framer-motion';
import { DashboardSkeleton } from '../components/SkeletonLoader';

import StatCard from '../components/dashboard/StatCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import UpcomingEvents from '../components/dashboard/UpcomingEvents';
import GlobalTaskProgress from '../components/dashboard/GlobalTaskProgress';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        const headers = { 'Authorization': `Bearer ${user.token}` };
        let dashboardData = { teamMembers: [], activities: [], tasks: [], events: [], documents: [], teams: [], platformStats: null, auditLogs: [] };

        if (user.role === 'master_admin') {
            try {
                const statsRes = await fetch('/api/admin/stats', { headers });
                if (statsRes.ok) dashboardData.platformStats = await statsRes.json();
            } catch (e) {}

            try {
                const auditRes = await fetch('/api/admin/audit-logs', { headers });
                if (auditRes.ok) dashboardData.auditLogs = await auditRes.json();
            } catch (e) {}

            try {
                const eventRes = await fetch('/api/events', { headers });
                if (eventRes.ok) dashboardData.events = await eventRes.json();
            } catch (e) {}

            return dashboardData;
        }

        try {
            const teamRes = await fetch('/api/team', { headers });
            const teams = await teamRes.json();
            if (teamRes.ok && Array.isArray(teams)) {
                dashboardData.teams = teams;
                if (teams.length > 0) {
                    const primaryTeam = teams[0];
                    dashboardData.teamMembers = primaryTeam.members || [];
                    try {
                        const activityRes = await fetch(`/api/team/activity/${primaryTeam.id}`, { headers });
                        if (activityRes.ok) dashboardData.activities = await activityRes.json();
                    } catch (e) {}
                }
            }
        } catch (e) {}

        try {
            const taskRes = await fetch('/api/tasks', { headers });
            if (taskRes.ok) dashboardData.tasks = await taskRes.json();
        } catch (e) {}

        try {
            const eventRes = await fetch('/api/events', { headers });
            if (eventRes.ok) dashboardData.events = await eventRes.json();
        } catch (e) {}

        if (dashboardData.teams.length > 0) {
            try {
                const teamId = dashboardData.teams[0].id || dashboardData.teams[0]._id;
                const docRes = await fetch(`/api/documents?teamId=${teamId}`, { headers });
                if (docRes.ok) {
                    const docData = await docRes.json();
                    dashboardData.documents = docData.documents || [];
                }
            } catch (e) {}
        }

        return dashboardData;
    };

    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['dashboardData', user?._id],
        queryFn: fetchDashboardData,
        staleTime: 0,
        refetchOnMount: true,
        enabled: !!user,
        retry: 1
    });

    const activities = user?.role === 'master_admin' ? dashboardData?.auditLogs || [] : dashboardData?.activities || [];
    const teamMembers = dashboardData?.teamMembers || [];
    const tasks = dashboardData?.tasks || [];
    const events = dashboardData?.events || [];
    const documents = dashboardData?.documents || [];
    const teams = dashboardData?.teams || [];
    const platformStats = dashboardData?.platformStats || null;
    const isMemberWithNoTeam = user?.role === 'team_member' && teams.length === 0;
    const isMasterAdmin = user?.role === 'master_admin';

    const analytics = useMemo(() => {
        if (isMasterAdmin && platformStats) {
            const completionRate = platformStats.totalTasks > 0 ? Math.round((platformStats.completedTasks / platformStats.totalTasks) * 100) : 0;
            const now = new Date();
            const upcomingEvents = events
                .filter(e => new Date(e.start || e.date) >= now)
                .sort((a, b) => new Date(a.start || a.date) - new Date(b.start || b.date))
                .slice(0, 5);

            return {
                totalTasks: platformStats.totalTasks,
                completedTasks: platformStats.completedTasks,
                completionRate,
                totalDocuments: platformStats.totalDocuments,
                totalMembers: platformStats.teamMembers,
                totalTeams: platformStats.totalTeams,
                inProgressTasks: platformStats.totalTasks - platformStats.completedTasks,
                upcomingEvents,
                overdueTasks: [],
                highPriorityTasks: [],
                weekData: [],
                maxWeekCount: 1
            };
        }

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'Done').length;
        const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
        const todoTasks = tasks.filter(t => t.status === 'To Do').length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const now = new Date();
        const upcomingEvents = events
            .filter(e => new Date(e.start || e.date) >= now)
                .sort((a, b) => new Date(a.start || a.date) - new Date(b.start || b.date))
            .slice(0, 5);

        const overdueTasks = tasks.filter(t => {
            if (!t.dueDate || t.status === 'Done') return false;
            return new Date(t.dueDate) < now;
        });

        const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'Done');

        const weekData = [];
        for (let i = 6; i >= 0; i--) {
            const day = new Date();
            day.setDate(day.getDate() - i);
            const dayStr = day.toLocaleDateString('en-US', { weekday: 'short' });
            const count = tasks.filter(t => {
                if (!t.completedAt) return false;
                const d = new Date(t.completedAt);
                return d.toDateString() === day.toDateString();
            }).length;
            weekData.push({ day: dayStr, count });
        }
        const maxWeekCount = Math.max(...weekData.map(d => d.count), 1);

        return {
            totalTasks, completedTasks, inProgressTasks, todoTasks, completionRate,
            upcomingEvents, overdueTasks, highPriorityTasks,
            totalDocuments: documents.length,
            totalMembers: teamMembers.length,
            weekData, maxWeekCount
        };
    }, [tasks, events, documents, teamMembers, isMasterAdmin, platformStats]);

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    if (isLoading) return <DashboardSkeleton />;

    if (isMemberWithNoTeam) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/30 flex items-center justify-center p-4">
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-[120px] animate-blob" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[700px] h-[700px] bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 relative z-10 text-center"
                >
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/10">
                        <Users size={32} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                        Welcome to Aurora, {user.name.split(' ')[0]}!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 font-medium mb-8">
                        It looks like you haven't been assigned to a team yet. Please wait for a Team Head or Admin to invite you to their workspace.
                    </p>
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30 text-sm text-indigo-800 dark:text-indigo-300 font-medium">
                        Once invited, your dashboard will automatically update with your team's tasks, events, and activities.
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/30">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-[120px] animate-blob" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[700px] h-[700px] bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
                <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-gradient-to-br from-pink-500/15 to-purple-500/15 rounded-full blur-[100px] animate-blob animation-delay-4000" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4"
                >
                    <div>
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                            <Calendar size={16} className="text-indigo-500" />
                            {today}
                        </p>
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">
                            {isMasterAdmin ? (
                                <>System <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">Overview</span></>
                            ) : (
                                <>Welcome back, <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">{user.name.split(' ')[0]}</span></>
                            )}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
                            <Sparkles size={16} className="text-yellow-500" />
                            {isMasterAdmin ? 'Platform-wide statistics and management' : 'Ready to make today productive?'}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                        {isMasterAdmin && (
                             <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/admin')}
                                className="w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl text-sm font-bold hover:bg-white dark:hover:bg-gray-800 transition-all shadow-lg"
                            >
                                <LayoutGrid size={18} strokeWidth={2.5} /> Control Center
                            </motion.button>
                        )}
                        {!isMasterAdmin && user.role !== 'team_member' && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/kanban', { state: { openNewTask: true } })}
                                className="w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl text-sm font-bold hover:bg-white dark:hover:bg-gray-800 transition-all shadow-lg"
                            >
                                <Plus size={18} strokeWidth={2.5} /> New Task
                            </motion.button>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(isMasterAdmin ? '/admin' : '/video-call')}
                            className="w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/30"
                        >
                            {isMasterAdmin ? <Users size={18} strokeWidth={2.5} /> : <Video size={18} strokeWidth={2.5} />} 
                            {isMasterAdmin ? 'Manage Users' : 'New Meeting'}
                        </motion.button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <StatCard 
                        label={isMasterAdmin ? 'Platform Tasks' : 'Total Tasks'}
                        value={analytics.totalTasks}
                        sub={isMasterAdmin ? `${analytics.completedTasks} completed across platform` : `${analytics.completedTasks} completed`}
                        icon={ListTodo}
                        color="from-blue-500 to-indigo-600"
                        shadowColor="shadow-blue-500/20"
                        onClick={() => navigate(isMasterAdmin ? '/admin' : '/kanban')}
                    />
                    <StatCard 
                        label={isMasterAdmin ? 'Global Completion' : 'Completion'}
                        value={`${analytics.completionRate}%`}
                        sub={isMasterAdmin ? 'Efficiency across all teams' : `${analytics.inProgressTasks} in progress`}
                        icon={Target}
                        color="from-emerald-500 to-teal-600"
                        shadowColor="shadow-emerald-500/20"
                        onClick={() => navigate(isMasterAdmin ? '/admin' : '/kanban')}
                    />
                    <StatCard 
                        label={isMasterAdmin ? 'Total Files' : 'Documents'}
                        value={analytics.totalDocuments}
                        sub={isMasterAdmin ? 'Total cloud storage used' : 'Files stored'}
                        icon={FileText}
                        color="from-orange-500 to-red-500"
                        shadowColor="shadow-orange-500/20"
                        onClick={() => navigate(isMasterAdmin ? '/admin' : '/document-share')}
                    />
                    <StatCard 
                        label={isMasterAdmin ? 'Total Users' : 'Team Members'}
                        value={analytics.totalMembers}
                        sub={isMasterAdmin ? `${analytics.totalTeams} active teams` : 'Active collaborators'}
                        icon={Users}
                        color="from-purple-500 to-pink-600"
                        shadowColor="shadow-purple-500/20"
                        onClick={() => navigate(isMasterAdmin ? '/admin' : '/team-management')}
                    />
                </div>

                <div className="mb-10">
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2"
                    >
                        {isMasterAdmin ? (
                            <><Database size={24} className="text-indigo-500" /> Administrative Tools</>
                        ) : (
                            <><Zap size={24} className="text-indigo-500" /> Quick Access</>
                        )}
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {(isMasterAdmin ? [
                            {
                                title: 'Identity Registry',
                                description: 'Manage all platform users, roles, and account statuses globally.',
                                icon: Users,
                                path: '/admin',
                                iconBg: 'from-blue-500 to-indigo-600',
                                stats: 'Global User base'
                            },
                            {
                                title: 'Team Divisions',
                                description: 'Oversee all teams, transfer ownership, and monitor workspace health.',
                                icon: Shield,
                                path: '/admin',
                                iconBg: 'from-purple-500 to-pink-600',
                                stats: 'Workspace Control'
                            },
                            {
                                title: 'Audit Logs',
                                description: 'Detailed history of administrative actions and system-wide changes.',
                                icon: FileSearch,
                                path: '/admin',
                                iconBg: 'from-amber-400 to-orange-500',
                                stats: 'System Transparency'
                            },
                            {
                                title: 'Maintenance',
                                description: 'Configure platform settings, view system logs, and manage storage.',
                                icon: HardDrive,
                                path: '/admin',
                                iconBg: 'from-emerald-500 to-teal-600',
                                stats: 'System Health'
                            }
                        ] : APP_FEATURES).map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -4 }}
                                onClick={() => navigate(feature.path)}
                                className="cursor-pointer group"
                            >
                                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-xl hover:border-indigo-400/50 dark:hover:border-indigo-500/50">
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                        <feature.icon size={24} strokeWidth={2} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 font-medium">{feature.description}</p>
                                    <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
                                        {feature.stats} <ArrowRight size={16} className="ml-1" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <BarChart3 size={20} className="text-indigo-500" /> {isMasterAdmin ? 'Platform Progress' : 'Weekly Progress'}
                                </h3>
                                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{isMasterAdmin ? 'Overall Completion' : 'Last 7 days'}</span>
                            </div>
                            {isMasterAdmin ? (
                                <div className="space-y-4 py-4">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Task Completion Rate</span>
                                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{analytics.completionRate}%</span>
                                    </div>
                                    <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${analytics.completionRate}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30">
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Total Activities</p>
                                            <p className="text-xl font-black text-indigo-600">{platformStats?.totalActivities || 0}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30">
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Active Teams</p>
                                            <p className="text-xl font-black text-purple-600">{platformStats?.totalTeams || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-end gap-3 h-32">
                                    {analytics.weekData.map((d, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{d.count}</span>
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${Math.max((d.count / analytics.maxWeekCount) * 100, 8)}%` }}
                                                transition={{ delay: 0.5 + i * 0.08, type: 'spring', stiffness: 100 }}
                                                className={`w-full rounded-xl ${d.count > 0 ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-md shadow-indigo-500/20' : 'bg-gray-200 dark:bg-gray-700'}`}
                                            />
                                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{d.day}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <ActivityFeed 
                            activities={activities} 
                            isMasterAdmin={isMasterAdmin} 
                            onViewAll={() => navigate(isMasterAdmin ? '/admin' : '/notifications')} 
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-6"
                    >
                        {(analytics.overdueTasks.length > 0 || analytics.highPriorityTasks.length > 0) && (
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-3xl p-5 border border-amber-200/50 dark:border-amber-700/50 shadow-lg">
                                <div className="flex items-center gap-2 mb-4">
                                    <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400" />
                                    <h3 className="font-bold text-amber-900 dark:text-amber-200">Needs Attention</h3>
                                </div>
                                {analytics.overdueTasks.length > 0 && (
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm text-amber-800 dark:text-amber-300 font-medium">Overdue tasks</span>
                                        <span className="px-2.5 py-1 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold">{analytics.overdueTasks.length}</span>
                                    </div>
                                )}
                                {analytics.highPriorityTasks.length > 0 && (
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm text-amber-800 dark:text-amber-300 font-medium">High priority</span>
                                        <span className="px-2.5 py-1 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold">{analytics.highPriorityTasks.length}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <UpcomingEvents 
                            events={analytics.upcomingEvents} 
                            onViewAll={() => navigate('/calendar')} 
                        />

                        <GlobalTaskProgress 
                            completionRate={analytics.completionRate}
                            todoTasks={analytics.todoTasks}
                            inProgressTasks={analytics.inProgressTasks}
                            completedTasks={analytics.completedTasks}
                        />

                        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg">
                                        <Shield size={24} strokeWidth={2} />
                                    </div>
                                    <span className="text-xs font-black bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-md">Active</span>
                                </div>
                                <h3 className="text-3xl font-black mb-2">
                                    {isMasterAdmin ? 'Master Access' : (user.role === 'admin' ? 'Admin Access' : 'Member')}
                                </h3>
                                <p className="text-indigo-100 text-sm mb-6 font-medium">
                                    {isMasterAdmin ? 'Full platform control and oversight.' : (user.role === 'admin' ? 'Manage your workspace.' : 'Collaborate with your team.')}
                                </p>

                                {(isMasterAdmin || user.role === 'admin') ? (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate(isMasterAdmin ? '/admin' : '/team-management')}
                                        className="w-full py-3.5 bg-white text-indigo-600 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all shadow-xl"
                                    >
                                        {isMasterAdmin ? 'Control Center' : 'Manage Team'}
                                    </motion.button>
                                ) : (
                                    <div className="flex -space-x-3 mt-2">
                                        {teamMembers.length > 0 ? teamMembers.slice(0, 5).map(m => (
                                            <div key={m._id} className="w-11 h-11 rounded-full border-2 border-white/50 bg-white/20 backdrop-blur-md flex items-center justify-center text-sm font-bold shadow-lg" title={m.name}>
                                                {m.name.charAt(0)}
                                            </div>
                                        )) : (
                                            <p className="text-sm opacity-80">No team members</p>
                                        )}
                                        {teamMembers.length > 5 && (
                                            <div className="w-11 h-11 rounded-full border-2 border-white/50 bg-white/20 backdrop-blur-md flex items-center justify-center text-sm font-bold shadow-lg">
                                                +{teamMembers.length - 5}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div >
    );
};

export default Dashboard;
