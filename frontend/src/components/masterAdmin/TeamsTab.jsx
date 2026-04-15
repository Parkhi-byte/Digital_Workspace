import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TeamCard from './teams/TeamCard';

const TeamsTab = ({ teams, loadingTeams, mutations }) => {
    const [expandedTeamId, setExpandedTeamId] = useState(null);
    const [inviteEmails, setInviteEmails] = useState({});

    const toggleTeamExpand = (id) => setExpandedTeamId(prev => (prev === id ? null : id));

    const handleDeleteTeam = (id, name) => {
        if (window.confirm(`Are you absolutely sure you want to delete the team "${name}" completely? This cannot be undone.`)) {
            mutations.deleteTeam.mutate(id);
        }
    };

    const handleTransferOwnership = (teamId, teamName, newOwnerId) => {
        if (!newOwnerId) return;
        if (window.confirm(`Transfer ownership of "${teamName}" to this user?`)) {
            mutations.transferTeam.mutate({ teamId, newOwnerId });
        }
    };

    // Member management is now handled on the dedicated Team Management route

    // Redirected to the main Team route for member actions

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    if (loadingTeams) return <div className="text-center py-10 text-gray-500 font-medium">Loading teams...</div>;
    if (teams.length === 0) return <div className="text-center py-10 text-gray-500 font-medium">No teams found.</div>;

    return (
        <div className="space-y-4">
            <AnimatePresence>
                {teams.map((team) => (
                    <motion.div
                        key={team._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-sm overflow-hidden"
                    >
                        <TeamCard 
                            team={team}
                            isExpanded={expandedTeamId === team._id}
                            onToggle={toggleTeamExpand}
                            onDelete={handleDeleteTeam}
                            onTransferOwnership={handleTransferOwnership}
                        />

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
                                        </div>
                                    ))}
                                    {(!team.members || team.members.length === 0) && (
                                        <div className="text-sm text-gray-500 italic p-2">No members in this team.</div>
                                    )}
                                </div>
                                <div className="mt-4 flex justify-end px-2">
                                    <a 
                                        href={`/team?teamId=${team._id}`}
                                        className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors flex items-center gap-1 group"
                                    >
                                        Manage Members & Performance 
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </a>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default TeamsTab;
