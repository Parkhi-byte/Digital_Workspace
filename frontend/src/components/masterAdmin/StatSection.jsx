import React from 'react';
import { Users, Grid, Activity, Shield } from 'lucide-react';

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

const StatSection = ({ stats }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
);

export default StatSection;
