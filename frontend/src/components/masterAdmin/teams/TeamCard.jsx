import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const TeamCard = ({ team, isExpanded, onToggle, onDelete, onTransferOwnership }) => {
    return (
        <div
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
            onClick={() => onToggle(team._id)}
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
                        <span className="text-xs font-bold text-gray-700 dark:text-300">{team.owner?.name || 'Unknown'}</span>
                        <span className="text-xs text-gray-400">({team.owner?.email || 'N/A'})</span>
                        <select
                            className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 border-none rounded outline-none cursor-pointer p-0.5"
                            onChange={(e) => onTransferOwnership(team._id, team.name, e.target.value)}
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
                    onClick={(e) => { e.stopPropagation(); onDelete(team._id, team.name); }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete completely"
                >
                    <Trash2 size={18} />
                </button>
                <div className="text-gray-400">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>
        </div>
    );
};

export default TeamCard;
