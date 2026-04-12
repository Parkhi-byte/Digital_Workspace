import React from 'react';
import { Crown } from 'lucide-react';

const MasterAdminHeader = () => (
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
);

export default MasterAdminHeader;
