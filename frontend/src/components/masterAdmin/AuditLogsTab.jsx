import React from 'react';
import { Activity } from 'lucide-react';

const AuditLogsTab = ({ logs, loadingLogs }) => (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-xl overflow-hidden p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Platform Activity Log</h2>
        <div className="space-y-4">
            {loadingLogs ? (
                <div className="text-center py-10 text-gray-500">Loading logs...</div>
            ) : logs.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No activity recorded yet.</div>
            ) : (
                logs.map((log) => (
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
);

export default AuditLogsTab;
