
import React from 'react';
import { Search, Shield, BadgeCheck, Mail, X, MoreHorizontal, User, Filter, ArrowUpDown, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatRole = (role) => {
    if (!role) return 'Member';
    return role
        .toLowerCase()
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const TeamList = ({ filteredMembers, teamMembers, searchTerm, setSearchTerm, hoveredMember, setHoveredMember, handleRemoveMember }) => {
    const [roleFilter, setRoleFilter] = React.useState('all');
    const [sortBy, setSortBy] = React.useState('name');
    const [sortOrder, setSortOrder] = React.useState('asc');
    const [showSortMenu, setShowSortMenu] = React.useState(false);

    // Helper function to normalize role values
    const normalizeRole = (role) => {
        if (!role) return 'member';
        const normalized = role.toLowerCase();
        if (normalized.includes('admin') || normalized === 'owner') return 'admin';
        return 'member';
    };

    // Apply filters and sorting
    const processedMembers = React.useMemo(() => {
        let members = [...filteredMembers];

        // Apply role filter
        if (roleFilter !== 'all') {
            members = members.filter(m => normalizeRole(m.role) === roleFilter);
        }

        // Apply sorting
        members.sort((a, b) => {
            let comparison = 0;

            if (sortBy === 'name') {
                comparison = (a.name || '').localeCompare(b.name || '');
            } else if (sortBy === 'role') {
                comparison = (a.role || '').localeCompare(b.role || '');
            } else if (sortBy === 'tasks') {
                const aTasks = a.completedTasks || 0;
                const bTasks = b.completedTasks || 0;
                comparison = aTasks - bTasks;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return members;
    }, [filteredMembers, roleFilter, sortBy, sortOrder]);


    const roleCount = React.useMemo(() => {
        return {
            all: teamMembers.length,
            admin: teamMembers.filter(m => normalizeRole(m.role) === 'admin').length,
            member: teamMembers.filter(m => normalizeRole(m.role) === 'member').length,
        };
    }, [teamMembers]);

    return (
        <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-[2rem] shadow-xl min-h-[600px] flex flex-col relative">

            {/* Search / Toolbar */}
            <div className="p-8 pb-4 border-b border-white/10 dark:border-gray-700/30 z-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Team Members</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm font-medium">
                            You have <span className="text-indigo-600 dark:text-indigo-400 font-bold">{processedMembers.length}</span> {roleFilter !== 'all' ? `${roleFilter}(s)` : 'active members'}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        {/* Search */}
                        <div className="relative group flex-1 md:w-80">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search members..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-11 pr-4 py-3.5 bg-white/50 dark:bg-gray-900/50 border border-transparent focus:border-indigo-500/50 rounded-2xl text-sm placeholder-gray-400 text-gray-900 dark:text-white shadow-sm focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 outline-none backdrop-blur-sm"
                            />
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSortMenu(!showSortMenu)}
                                className="flex items-center gap-2 px-4 py-3.5 bg-white/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900 border border-transparent hover:border-indigo-500/50 rounded-2xl text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm transition-all duration-300 whitespace-nowrap"
                            >
                                <ArrowUpDown size={16} />
                                <span>Sort</span>
                                <ChevronDown size={16} className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {showSortMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                                    >
                                        <div className="p-2">
                                            {[
                                                { value: 'name', label: 'Name' },
                                                { value: 'role', label: 'Role' },
                                                { value: 'tasks', label: 'Tasks Completed' },
                                            ].map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        if (sortBy === option.value) {
                                                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                                        } else {
                                                            setSortBy(option.value);
                                                            setSortOrder('asc');
                                                        }
                                                        setShowSortMenu(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${sortBy === option.value
                                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                                        }`}
                                                >
                                                    {option.label} {sortBy === option.value && (sortOrder === 'asc' ? '↑' : '↓')}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <Filter size={14} />
                        <span>Filter:</span>
                    </div>
                    {[
                        { value: 'all', label: 'All', count: roleCount.all },
                        { value: 'admin', label: 'Admins', count: roleCount.admin },
                        { value: 'member', label: 'Members', count: roleCount.member },
                    ].map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setRoleFilter(filter.value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${roleFilter === filter.value
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 scale-105'
                                : 'bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 shadow-sm'
                                }`}
                        >
                            {filter.label} <span className="opacity-75">({filter.count})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto overflow-x-visible p-6 space-y-3 custom-scrollbar">
                <AnimatePresence>
                    {processedMembers.length > 0 ? (
                        processedMembers.map((member, idx) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05, type: 'spring', stiffness: 100 }}
                                key={member._id}
                                onMouseEnter={() => setHoveredMember(member._id)}
                                onMouseLeave={() => setHoveredMember(null)}
                                className="group relative bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 rounded-3xl p-4 md:p-5 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:z-10 transition-all duration-500"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                <div className="flex items-center gap-4 lg:grid lg:grid-cols-[1fr_180px_180px] lg:gap-6 lg:items-center">
                                    {/* Left: Avatar + Info */}
                                    <div className="flex items-center gap-5 min-w-0">
                                        {/* Avatar */}
                                        <div className={`relative w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-white dark:ring-gray-800 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${member.role === 'admin' || member.role === 'team_head'
                                            ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600'
                                            : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                                            }`}>
                                            {member.name?.[0]?.toUpperCase() || <User size={24} />}

                                            {(member.role === 'admin' || member.role === 'team_head') && (
                                                <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 p-1 rounded-full border-2 border-white dark:border-gray-800 shadow-sm z-10">
                                                    <Shield size={10} fill="currentColor" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-gray-900 dark:text-white text-base md:text-lg flex items-center gap-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                <span className="truncate">{member.name || 'Anonymous User'}</span>
                                                {member.role === 'admin' && (
                                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border border-violet-300 shadow-sm flex-shrink-0 inline-flex items-center gap-1">
                                                        <BadgeCheck size={10} /> ADMIN
                                                    </span>
                                                )}
                                                {member.role === 'team_head' && (
                                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white border border-amber-200 shadow-sm flex-shrink-0 inline-flex items-center gap-1">
                                                        <Shield size={10} /> HEAD
                                                    </span>
                                                )}
                                            </h4>
                                            <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-0.5 font-medium truncate">
                                                <Mail size={12} className="mr-1.5 opacity-60 flex-shrink-0" />
                                                <span className="truncate">{member.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Center: Efficiency Stats (Desktop only) */}
                                    <div className="hidden lg:flex flex-col justify-center">
                                        {(() => {
                                            const tasksCompleted = member.tasksCompleted || 0;
                                            const totalTasks = member.totalTasks || member.tasksAssigned || 10;
                                            const efficiency = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;

                                            return (
                                                <>
                                                    <div className="flex justify-between text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                                                        <span>Efficiency</span>
                                                        <span className="text-indigo-500">{efficiency}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 dark:bg-gray-700/50 h-1.5 rounded-full overflow-hidden mb-2">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${efficiency}%` }}
                                                            transition={{ delay: 0.5 + (idx * 0.1), duration: 1 }}
                                                            className={`h-full rounded-full ${efficiency > 80 ? 'bg-emerald-500' : efficiency > 50 ? 'bg-indigo-500' : 'bg-orange-500'}`}
                                                        />
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium" title="Tasks actually completed by this member">
                                                        {tasksCompleted}/{totalTasks} tasks done
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>

                                    {/* Right: Role badge + Actions */}
                                    <div className="flex items-center justify-end gap-3 flex-shrink-0 ml-auto lg:ml-0">
                                        <div className={`min-w-[100px] text-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors whitespace-nowrap ${member.role === 'admin' || member.role === 'team_head'
                                            ? 'bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-700 border-violet-200 dark:from-violet-900/40 dark:to-fuchsia-900/40 dark:text-violet-300 dark:border-violet-700'
                                            : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-200 dark:from-blue-900/40 dark:to-cyan-900/40 dark:text-blue-300 dark:border-blue-700'
                                            }`}>
                                            {formatRole(member.role)}
                                        </div>

                                        <div className="relative group/menu">
                                            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all">
                                                <MoreHorizontal size={20} />
                                            </button>

                                            {/* Dropdown */}
                                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-[100] transform origin-top-right scale-95 group-hover/menu:scale-100">
                                                <div className="p-1">
                                                    <button className="w-full text-left px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors flex items-center gap-2">
                                                        <User size={14} /> View Profile
                                                    </button>
                                                    {handleRemoveMember && !member.isOwner && member.role !== 'admin' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveMember(member._id);
                                                            }}
                                                            className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
                                                        >
                                                            <X size={14} /> Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-24 text-center"
                        >
                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                                <Search size={32} className="text-gray-300 dark:text-gray-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No members found</h3>
                            <p className="text-gray-500 text-sm mt-1">Try adjusting your search terms</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-gray-900 via-white/80 dark:via-gray-900/80 to-transparent pointer-events-none" />
        </div>
    );
};

export default TeamList;
