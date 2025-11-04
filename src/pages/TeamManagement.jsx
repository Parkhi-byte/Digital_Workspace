import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, X, Shield, User } from 'lucide-react';

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
    } else {
      setError(result.error);
    }
  };

  const handleRemoveMember = (email) => {
    setError('');
    setSuccess('');

    if (window.confirm(`Are you sure you want to remove ${email} from your team?`)) {
      const result = removeTeamMember(email);
      
      if (result.success) {
        setSuccess('Team member removed successfully!');
      } else {
        setError(result.error);
      }
    }
  };

  if (!user || user.role !== 'team_head') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="mx-auto text-gray-400 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h2>
          <p className="text-gray-600">Only team heads can access team management.</p>
        </div>
      </div>
    );
  }

  const allUsers = getAllUsers();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl animate-float">
            <Users className="text-white" size={32} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Team Management</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">Manage your team members</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Team Member */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <UserPlus size={20} className="text-blue-600" />
              <span>Add Team Member</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="member@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Member name"
                />
              </div>

              <button
                onClick={handleAddMember}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Add Member
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The user must already have an account with the email address provided.
              </p>
            </div>
          </div>
        </div>

        {/* Team Members List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                  <Users size={20} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="text-gray-800 dark:text-white">Team Members ({user.teamMembers?.length || 0})</span>
              </h2>
              {user.role === 'team_head' && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center space-x-1">
                  <Shield size={14} />
                  <span>Team Head</span>
                </span>
              )}
            </div>

            {user.teamMembers && user.teamMembers.length > 0 ? (
              <div className="space-y-3">
                {user.teamMembers.map((member, index) => {
                  const fullUser = allUsers.find(u => u.email === member.email);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {(member.name || fullUser?.name || member.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">
                            {member.name || fullUser?.name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(member.email)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove member"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-600">No team members yet. Add your first member!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;

