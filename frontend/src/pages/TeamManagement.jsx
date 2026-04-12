import React from 'react';
import { useTeamManagement } from '../hooks/useTeamManagement/useTeamManagement';
import { Trash2, Edit2, Users, LayoutGrid, ArrowLeft, Search, Shield, Activity, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TeamStats from '../components/TeamManagement/TeamStats';
import InviteMember from '../components/TeamManagement/InviteMember';
import TeamList from '../components/TeamManagement/TeamList';
import TeamSelector from '../components/TeamManagement/TeamSelector';

const TeamManagement = () => {
  const {
    isTeamOwner,
    inviteEmail,
    setInviteEmail,
    inviteName,
    setInviteName,
    searchTerm,
    setSearchTerm,
    error,
    success,
    loading,
    hoveredMember,
    setHoveredMember,
    teamMembers,
    filteredMembers,
    stats,
    handleInvite,
    handleRemoveMember,
    teams,
    currentTeam,
    currentTeamId,
    setCurrentTeamId,
    createTeam,
    updateTeamDetails,
    deleteTeam,
    activities,
    isAdmin,
    isMasterAdmin,
    allUsers,
    usersLoading,
    searchUsers,
    fetchAllUsers
  } = useTeamManagement();

  if (!loading && teams.length === 1 && teams[0].id === 'default' && !isTeamOwner && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/30 flex items-center justify-center p-4">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-[120px] animate-blob" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[700px] h-[700px] bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 relative z-10 text-center"
        >
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/10">
            <Users size={32} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
            No Team Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 font-medium mb-8">
            You are currently not assigned to any team. Your Team Head or Admin must invite you to their workspace to view team members.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/30">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[700px] h-[700px] bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/15 to-blue-500/15 rounded-full blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section - Hide if Master Admin and no team selected */}
        {(!isMasterAdmin || currentTeamId) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Team Name & Selector */}
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  {isMasterAdmin && currentTeamId && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentTeamId(null)}
                        className="p-2.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2 font-bold text-sm shadow-sm"
                    >
                        <ArrowLeft size={18} /> Back
                    </motion.button>
                  )}
                  <TeamSelector
                    teams={teams}
                    currentTeam={currentTeam}
                    setCurrentTeamId={setCurrentTeamId}
                    isAdmin={isAdmin}
                    isTeamOwner={isTeamOwner}
                    createTeam={createTeam}
                  />
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                    {isMasterAdmin 
                      ? `Platform Oversight: Monitoring ${currentTeam?.name || 'teams'} and their members across the entire system.`
                      : (currentTeam?.description || 'Manage your team members, track performance, and collaborate efficiently.')}
                  </p>
                  {isTeamOwner && (
                    <button
                      onClick={() => {
                        const newName = prompt("Rename team:", currentTeam?.name);
                        if (newName) updateTeamDetails(newName, currentTeam?.description);
                      }}
                      className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      title="Edit team name"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Team Info Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {teamMembers.slice(0, 4).map((m, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md"
                        title={m.name || m.email}
                      >
                        {m.name?.[0]?.toUpperCase() || m.email[0].toUpperCase()}
                      </div>
                    ))}
                    {teamMembers.length > 4 && (
                      <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        +{teamMembers.length - 4}
                      </div>
                    )}
                  </div>
                  <div className="border-l border-gray-300 dark:border-gray-600 pl-4">
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{teamMembers.length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">Members</p>
                  </div>
                  {isTeamOwner && (
                    <button
                      onClick={() => deleteTeam(currentTeam.id)}
                      className="ml-2 p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete team"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {isMasterAdmin && !currentTeamId ? (
            <div className="mb-12">
              <div className="mb-8">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white flex items-center gap-4 tracking-tight">
                  <span className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-500/20">
                    <LayoutGrid size={32} />
                  </span>
                  Platform Teams
                </h2>
                <p className="text-gray-600 dark:text-gray-400 font-medium mt-3 text-lg">Select a team to supervise members and performance metrics.</p>
              </div>

              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl relative overflow-hidden">
                {/* Decorative background elements inside the box */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -ml-32 -mb-32" />

                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                    <div className="relative w-full md:w-[400px] group">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                      <input
                        type="text"
                        placeholder="Search teams by name or owner..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium text-gray-900 dark:text-white shadow-sm"
                      />
                    </div>
                    <div className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                      Total Teams: <span className="text-indigo-600 dark:text-indigo-400">{teams.filter(t => t.id !== 'default').length}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(teams.filter(t => t.id !== 'default' && (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase())))).map((team, idx) => (
                      <motion.div
                        key={team.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        onClick={() => setCurrentTeamId(team.id)}
                        className="cursor-pointer group relative bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-700 rounded-[2rem] p-6 transition-all shadow-md hover:shadow-xl hover:border-indigo-500/30"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                            <Shield size={24} />
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Members</span>
                            <p className="text-xl font-black text-gray-900 dark:text-white">{team.totalMemberCount || team.members?.length || 0}</p>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{team.name}</h3>
                        
                        <div className="flex items-center gap-3 mb-6 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl">
                           <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-[10px] font-bold text-indigo-600 shadow-sm">
                              {team.owner?.name?.[0] || 'L'}
                           </div>
                           <div className="overflow-hidden">
                              <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none mb-1">Head</p>
                              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{team.owner?.name || 'Lead Admin'}</p>
                           </div>
                        </div>

                        <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-widest group-hover:gap-2 transition-all">
                          <span>Manage Workspace</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <TeamStats stats={stats} activities={activities} />
          )}
        </motion.div>

        {/* Main Content */}
        {!currentTeamId && isMasterAdmin ? null : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 grid grid-cols-1 xl:grid-cols-12 gap-6"
          >
          {/* Invite Panel */}
          <AnimatePresence>
            {isTeamOwner && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="xl:col-span-4"
              >
                <div className="sticky top-6">
                  <InviteMember
                    inviteEmail={inviteEmail}
                    setInviteEmail={setInviteEmail}
                    inviteName={inviteName}
                    setInviteName={setInviteName}
                    handleInvite={handleInvite}
                    loading={loading}
                    error={error}
                    success={success}
                    allUsers={allUsers}
                    usersLoading={usersLoading}
                    searchUsers={searchUsers}
                    fetchAllUsers={fetchAllUsers}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Team List */}
          <motion.div
            layout
            className={isTeamOwner ? "xl:col-span-8" : "xl:col-span-12"}
          >
            <TeamList
              filteredMembers={filteredMembers}
              teamMembers={teamMembers}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              hoveredMember={hoveredMember}
              setHoveredMember={setHoveredMember}
              handleRemoveMember={isTeamOwner ? handleRemoveMember : undefined}
            />
          </motion.div>
        </motion.div>
      )}
      </div>
    </div>
  );
};

export default TeamManagement;
