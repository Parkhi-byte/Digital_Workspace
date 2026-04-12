import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

const TeamsTab = ({ teams, loadingTeams, mutations }) => {
    const [expandedTeamId, setExpandedTeamId] = useState(null);
    const [inviteEmails, setInviteEmails] = useState({});

    const toggleTeamExpand = (id) => {
        setExpandedTeamId(prev => prev === id ? null : id);
    };

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

    const handleAddMember = (teamId, e) => {
        e.preventDefault();
        const email = inviteEmails[teamId]?.trim();
        if (!email) return;
        mutations.addMember.mutate({ teamId, email }, {
            onSuccess: () => {
                setInviteEmails(prev => ({ ...prev, [teamId]: '' }));
            }
        });
    };

    const handleRemoveMember = (teamId, memberId, name) => {
        if (window.confirm(`Remove ${name} from this team completely?`)) {
            mutations.removeMember.mutate({ teamId, memberId });
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    if (loadingTeams) return <div className="text-center py-10 text-gray-500">Loading teams...</div>;
    if (teams.length === 0) return <div className="text-center py-10 text-gray-500">No teams found.</div>;

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
                                                disabled={mutations.removeMember.isLoading}
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
                                        disabled={mutations.addMember.isLoading}
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
        </div>
    );
};

export default TeamsTab;
