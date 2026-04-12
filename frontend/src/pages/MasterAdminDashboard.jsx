import React, { useState } from 'react';
import { useMasterAdminData } from '../hooks/useMasterAdminData';
import MasterAdminHeader from '../components/masterAdmin/MasterAdminHeader';
import StatSection from '../components/masterAdmin/StatSection';
import TeamsTab from '../components/masterAdmin/TeamsTab';
import UsersTab from '../components/masterAdmin/UsersTab';
import AuditLogsTab from '../components/masterAdmin/AuditLogsTab';
import PendingApprovalsTab from '../components/masterAdmin/PendingApprovalsTab';

const MasterAdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('teams');
    const {
        user,
        stats,
        teams,
        loadingTeams,
        users,
        loadingUsers,
        auditLogs,
        loadingLogs,
        pendingUsers,
        loadingPending,
        mutations
    } = useMasterAdminData();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/30">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-[120px] animate-blob" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[700px] h-[700px] bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <MasterAdminHeader />
                
                <StatSection stats={stats} />

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

                {/* ─── Render Active Tab ─────────────────────────────────── */}
                <div className="min-h-[400px]">
                    {activeTab === 'teams' && (
                        <TeamsTab 
                            teams={teams} 
                            loadingTeams={loadingTeams} 
                            mutations={mutations} 
                        />
                    )}
                    {activeTab === 'users' && (
                        <UsersTab 
                            users={users} 
                            loadingUsers={loadingUsers} 
                            mutations={mutations} 
                            currentUser={user}
                        />
                    )}
                    {activeTab === 'audit' && (
                        <AuditLogsTab 
                            logs={auditLogs} 
                            loadingLogs={loadingLogs} 
                        />
                    )}
                    {activeTab === 'pending' && (
                        <PendingApprovalsTab 
                            pendingUsers={pendingUsers} 
                            loadingPending={loadingPending} 
                            mutations={mutations} 
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default MasterAdminDashboard;
