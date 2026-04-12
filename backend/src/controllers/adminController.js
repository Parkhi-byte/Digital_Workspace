import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Team from '../models/Team.js';
import Task from '../models/Task.js';
import Document from '../models/Document.js';
import { createNotifications, createNotification, emitTeamUpdate } from '../utils/notificationService.js';
import Activity from '../models/Activity.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Get all users (platform-wide)
// @route   GET /api/admin/users
// @access  Private (Master Admin only)
const getAllUsersAdmin = asyncHandler(async (req, res) => {
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
                { email: { $regex: req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
            ],
        }
        : {};

    const users = await User.find({ ...keyword, status: { $ne: 'pending' } }).select('-password').sort({ createdAt: -1 });

    // Also get the teams they are part of to display in the UI
    const usersWithTeams = await Promise.all(users.map(async (user) => {
        // Find teams where user is owner or member
        const teams = await Team.find({
            $or: [
                { owner: user._id },
                { members: user._id }
            ]
        }).select('name');
        
        return {
            ...user.toObject(),
            teams: teams.map(t => t.name)
        };
    }));

    res.json(usersWithTeams);
});

// @desc    Get all teams (platform-wide)
// @route   GET /api/admin/teams
// @access  Private (Master Admin only)
const getAllTeamsAdmin = asyncHandler(async (req, res) => {
    const teams = await Team.find({})
        .populate('owner', 'name email role')
        .populate('members', 'name email role')
        .sort({ createdAt: -1 });

    // Enrich teams with task statistics
    const enrichedTeams = await Promise.all(teams.map(async (team) => {
        const teamObj = team.toObject();
        
        // Helper to get stats for a user in this team context
        const getUserStats = async (userId) => {
            const assigned = await Task.countDocuments({ team: team._id, assignedTo: userId });
            const completed = await Task.countDocuments({ team: team._id, assignedTo: userId, status: 'Done' });
            return { assigned, completed };
        };

        // Enrich Owner
        if (teamObj.owner) {
            const { assigned, completed } = await getUserStats(teamObj.owner._id);
            teamObj.owner.tasksAssigned = assigned;
            teamObj.owner.tasksCompleted = completed;
        }

        // Enrich Members
        if (teamObj.members) {
            teamObj.members = await Promise.all(teamObj.members.map(async (member) => {
                const { assigned, completed } = await getUserStats(member._id);
                return { ...member, tasksAssigned: assigned, tasksCompleted: completed };
            }));
        }

        return teamObj;
    }));

    res.json(enrichedTeams);
});

// @desc    Update any user's role
// @route   PATCH /api/admin/users/:userId/role
// @access  Private (Master Admin only)
const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const { userId } = req.params;

    const validRoles = ['team_member', 'team_head', 'admin', 'master_admin'];
    if (!validRoles.includes(role)) {
        res.status(400);
        throw new Error('Invalid role');
    }

    const targetUser = await User.findById(userId);

    if (!targetUser) {
        res.status(404);
        throw new Error('User not found');
    }

    // Prevent downgrading oneself
    if (targetUser._id.toString() === req.user._id.toString() && role !== 'master_admin') {
        res.status(400);
        throw new Error('Cannot downgrade your own role');
    }

    const oldRole = targetUser.role;
    targetUser.role = role;
    const updatedUser = await targetUser.save();

    await AuditLog.create({
        admin: req.user._id,
        action: 'ROLE_CHANGED',
        targetUser: updatedUser._id,
        details: `Role changed from ${oldRole} to ${role}`
    });

    // Real-time Update
    emitTeamUpdate(req.app.get('socketio'), null, 'ROLE_UPDATE', [updatedUser._id]);

    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
    });
});

// @desc    Delete any user
// @route   DELETE /api/admin/users/:userId
// @access  Private (Master Admin only)
const deleteUserAdmin = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user._id.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('Cannot delete your own account');
    }

    // Remove user from all teams
    await Team.updateMany(
        { members: user._id },
        { $pull: { members: user._id } }
    );

    // If user owns teams, we should probably delete the teams or assign to another head?
    // Let's delete teams owned by the user (or we could reassign them, but deletion is simple for now)
    await Team.deleteMany({ owner: user._id });

    await user.deleteOne();

    await AuditLog.create({
        admin: req.user._id,
        action: 'USER_DELETED_PERMANENTLY',
        details: `Deleted user ${user.email} permanently`
    });

    res.json({ message: 'User removed completely' });
});

// @desc    Delete any team
// @route   DELETE /api/admin/teams/:teamId
// @access  Private (Master Admin only)
const deleteTeamAdmin = asyncHandler(async (req, res) => {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    await team.deleteOne();

    // Also delete any activities associated with this team
    await Activity.deleteMany({ team: teamId });

    await AuditLog.create({
        admin: req.user._id,
        action: 'TEAM_DELETED',
        details: `Deleted team ${team.name}`
    });

    res.json({ message: 'Team removed' });
});

// @desc    Add member to any team
// @route   POST /api/admin/teams/:teamId/members
// @access  Private (Master Admin only)
const addMemberToTeamAdmin = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Email is required');
    }

    const team = await Team.findById(teamId);
    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check if user is already in team
    if (team.members.includes(userToAdd._id) || team.owner.toString() === userToAdd._id.toString()) {
        res.status(400);
        throw new Error('User is already a member or owner of this team');
    }

    team.members.push(userToAdd._id);
    await team.save();

    await AuditLog.create({
        admin: req.user._id,
        action: 'TEAM_MEMBER_ADDED',
        targetTeam: team._id,
        targetUser: userToAdd._id,
        details: `Added ${userToAdd.email} to team ${team.name}`
    });

    // Real-time Update
    emitTeamUpdate(req.app.get('socketio'), team._id, 'MEMBER_ADD');

    res.json({ message: 'User added to team', user: { _id: userToAdd._id, name: userToAdd.name, email: userToAdd.email } });
});

// @desc    Remove member from any team
// @route   DELETE /api/admin/teams/:teamId/members/:memberId
// @access  Private (Master Admin only)
const removeMemberFromTeamAdmin = asyncHandler(async (req, res) => {
    const { teamId, memberId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    if (team.owner.toString() === memberId) {
        res.status(400);
        throw new Error('Cannot remove the team owner');
    }

    if (!team.members.includes(memberId)) {
        res.status(404);
        throw new Error('User is not a member of this team');
    }

    team.members = team.members.filter(mId => mId.toString() !== memberId);
    await team.save();

    await AuditLog.create({
        admin: req.user._id,
        action: 'TEAM_MEMBER_REMOVED',
        targetTeam: team._id,
        targetUser: memberId,
        details: `Removed user from team ${team.name}`
    });

    // Real-time Update
    emitTeamUpdate(req.app.get('socketio'), team._id, 'MEMBER_REMOVE');

    res.json({ message: 'User removed from team' });
});

// @desc    Get platform-wide statistics
// @route   GET /api/admin/stats
// @access  Private (Master Admin only)
const getPlatformStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments({ status: { $ne: 'pending' } });
    const activeUsers = await User.countDocuments({ status: 'active' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });
    const pendingUsers = await User.countDocuments({ status: 'pending' });
    const teamHeads = await User.countDocuments({ role: { $in: ['team_head', 'admin'] }, status: { $ne: 'pending' } });
    const teamMembers = await User.countDocuments({ role: 'team_member', status: { $ne: 'pending' } });
    const totalTeams = await Team.countDocuments({});
    
    // Platform-wide counts
    const totalTasks = await Task.countDocuments({});
    const completedTasks = await Task.countDocuments({ status: 'Done' });
    const totalDocuments = await Document.countDocuments({});
    const totalActivities = await Activity.countDocuments({});

    res.json({
        totalUsers,
        activeUsers,
        suspendedUsers,
        pendingUsers,
        teamHeads,
        teamMembers,
        totalTeams,
        totalTasks,
        completedTasks,
        totalDocuments,
        totalActivities
    });
});

// @desc    Get pending approval users (Team Heads awaiting)
// @route   GET /api/admin/users/pending
// @access  Private (Master Admin only)
const getPendingUsers = asyncHandler(async (req, res) => {
    const pendingUsers = await User.find({ status: 'pending' }).select('-password').sort({ createdAt: -1 });
    res.json(pendingUsers);
});

// @desc    Approve a pending user
// @route   POST /api/admin/users/:userId/approve
// @access  Private (Master Admin only)
const approveUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.status !== 'pending') {
        res.status(400);
        throw new Error('User is not in pending state');
    }

    user.status = 'active';
    await user.save();

    await AuditLog.create({
        admin: req.user._id,
        action: 'USER_APPROVED',
        targetUser: user._id,
        details: `Approved Team Head account for ${user.email}`
    });

    // Real-time Update
    emitTeamUpdate(req.app.get('socketio'), null, 'USER_APPROVED', [user._id]);

    res.json({ message: `${user.name}'s account has been approved.`, user });
});

// @desc    Reject and delete a pending user
// @route   DELETE /api/admin/users/:userId/reject
// @access  Private (Master Admin only)
const rejectUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.status !== 'pending') {
        res.status(400);
        throw new Error('User is not in pending state');
    }

    const email = user.email;
    const name = user.name;
    await user.deleteOne();

    await AuditLog.create({
        admin: req.user._id,
        action: 'USER_REJECTED',
        details: `Rejected and removed Team Head registration for ${email}`
    });

    res.json({ message: `Registration request from ${name} has been rejected and removed.` });
});

// @desc    Toggle user suspension (soft delete)
// @route   PATCH /api/admin/users/:userId/suspend
// @access  Private (Master Admin only)
const toggleUserSuspension = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const targetUser = await User.findById(userId);

    if (!targetUser) {
        res.status(404);
        throw new Error('User not found');
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('Cannot suspend yourself');
    }

    // Toggle between active and suspended
    targetUser.status = targetUser.status === 'active' ? 'suspended' : 'active';
    await targetUser.save();

    await AuditLog.create({
        admin: req.user._id,
        action: targetUser.status === 'active' ? 'USER_ACTIVATED' : 'USER_SUSPENDED',
        targetUser: targetUser._id,
        details: targetUser.status === 'active' ? 'Reactivated user account' : 'Suspended user account'
    });

    res.json({
        _id: targetUser._id,
        status: targetUser.status,
        message: targetUser.status === 'active' ? 'User reactivated successfully' : 'User suspended successfully'
    });
});

// @desc    Transfer team ownership
// @route   PATCH /api/admin/teams/:teamId/transfer
// @access  Private (Master Admin only)
const transferTeamOwnership = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const { newOwnerId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    const newOwner = await User.findById(newOwnerId);
    if (!newOwner) {
        res.status(404);
        throw new Error('New owner user not found');
    }

    if (team.owner.toString() === newOwnerId) {
        res.status(400);
        throw new Error('User is already the owner of this team');
    }

    const oldOwnerId = team.owner;

    // Remove new owner from members if they were a member
    team.members = team.members.filter(m => m.toString() !== newOwnerId.toString());
    
    // Add old owner to members so they aren't fully ejected
    if (!team.members.includes(oldOwnerId)) {
        team.members.push(oldOwnerId);
    }

    team.owner = newOwnerId;
    await team.save();

    await AuditLog.create({
        admin: req.user._id,
        action: 'TEAM_OWNERSHIP_TRANSFERRED',
        targetTeam: team._id,
        targetUser: newOwnerId,
        details: `Transferred ownership of ${team.name} to ${newOwner.email}`
    });

    // Real-time Update
    emitTeamUpdate(req.app.get('socketio'), team._id, 'OWNERSHIP_TRANSFER');

    res.json(team);
});

// @desc    Update team details overrides
// @route   PUT /api/admin/teams/:teamId
// @access  Private (Master Admin only)
const updateTeamDetailsAdmin = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const { name, description } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    team.name = name || team.name;
    team.description = description !== undefined ? description : team.description;
    
    await team.save();

    await AuditLog.create({
        admin: req.user._id,
        action: 'TEAM_DETAILS_UPDATED',
        targetTeam: team._id,
        details: `Updated details for ${team.name}`
    });

    res.json(team);
});

// @desc    Get recent audit logs
// @route   GET /api/admin/audit-logs
// @access  Private (Master Admin only)
const getAuditLogs = asyncHandler(async (req, res) => {
    // Get last 100 audit logs
    const logs = await AuditLog.find({})
        .populate('admin', 'name email')
        .populate('targetUser', 'name email')
        .populate('targetTeam', 'name')
        .sort({ createdAt: -1 })
        .limit(100);

    res.json(logs);
});

export {
    getAllUsersAdmin,
    getAllTeamsAdmin,
    updateUserRole,
    deleteUserAdmin,
    deleteTeamAdmin,
    addMemberToTeamAdmin,
    removeMemberFromTeamAdmin,
    getPlatformStats,
    toggleUserSuspension,
    transferTeamOwnership,
    updateTeamDetailsAdmin,
    getAuditLogs,
    getPendingUsers,
    approveUser,
    rejectUser
};
