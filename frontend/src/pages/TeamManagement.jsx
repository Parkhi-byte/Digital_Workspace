import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, X, Shield, Mail, Search, MoreVertical } from 'lucide-react';

const TeamManagement = () => {
  const { user, addTeamMember, removeTeamMember } = useAuth();
  const [memberEmail, setMemberEmail] = useState('');
  const [memberName, setMemberName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get all users from localStorage to find members by email
  const getAllUsers = () => {
    return JSON.parse(localStorage.getItem('users') || '[]');
  };

  const handleAddMember = () => {
    setError('');
    setSuccess('');

    if (!memberEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    const result = addTeamMember(memberEmail.trim(), memberName.trim() || undefined);

    if (result.success) {
      setSuccess('Team member added successfully!');
      setMemberEmail('');
      setMemberName('');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRemoveMember = (email) => {
    if (window.confirm(`Are you sure you want to remove ${email} from your team?`)) {
      const result = removeTeamMember(email);
      if (result.success) {
        setSuccess('Team member removed successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error);
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  if (!user || user.role !== 'team_head') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="text-gray-400" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Access Restricted</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Only Team Heads can access the Team Management portal. Please contact your administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  const allUsers = getAllUsers();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your team members, roles, and permissions.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium flex items-center border border-blue-100 dark:border-blue-800">
              <Shield size={16} className="mr-2" />
              Team Head Access
            </span>
          </div>
        </div>

        {/* Notifications */}
        {(error || success) && (
          <div className={`mb-8 p-4 rounded-xl border flex items-center animate-fade-in ${error
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
              : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
            }`}>
            {error || success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Member Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-aurora-50 dark:bg-aurora-900/20 rounded-lg text-aurora-600 dark:text-aurora-400">
                  <UserPlus size={20} />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Invite Member</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-aurora-500/20 focus:border-aurora-500 transition-all text-sm"
                      placeholder="colleague@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-aurora-500/20 focus:border-aurora-500 transition-all text-sm"
                    placeholder="John Doe"
                  />
                </div>

                <button
                  onClick={handleAddMember}
                  className="w-full bg-gradient-to-r from-aurora-600 to-purple-600 hover:from-aurora-700 hover:to-purple-700 text-white py-2.5 rounded-xl font-semibold shadow-lg shadow-aurora-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Send Invitation
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Invited members will receive an email notification. They must have an existing account or sign up with the invited email address.
                </p>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                    <Users size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Team Members <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{user.teamMembers?.length || 0}</span>
                  </h2>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search members..."
                    className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-aurora-500 w-full sm:w-64"
                  />
                </div>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {user.teamMembers && user.teamMembers.length > 0 ? (
                  user.teamMembers.map((member, index) => {
                    const fullUser = allUsers.find(u => u.email === member.email);
                    const displayName = member.name || fullUser?.name || 'Unknown User';
                    const initials = displayName.charAt(0).toUpperCase();

                    return (
                      <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'][index % 4]
                              }`}>
                              {initials}
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{displayName}</h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium border border-green-100 dark:border-green-800">
                              Active
                            </span>
                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                              <MoreVertical size={16} />
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member.email)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Remove member"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-700">
                      <Users className="text-gray-300 dark:text-gray-600" size={32} />
                    </div>
                    <h3 className="text-gray-900 dark:text-white font-medium mb-1">No team members yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Invite your first team member to get started.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
