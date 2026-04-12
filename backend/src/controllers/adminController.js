import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Team from '../models/Team.js';
import Task from '../models/Task.js';
import Document from '../models/Document.js';
import { emitTeamUpdate } from '../utils/notificationService.js';
import Activity from '../models/Activity.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Get all users (platform-wide)
// @route   GET /api/admin/users
const getAllUsersAdmin = asyncHandler(async (req, res) => {
    const search = req.query.search;
    const query = search 
        ? { $or: [{ name: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }, { email: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }] }
        : {};

    const users = await User.find({ ...query, status: { $ne: 'pending' } }).select('-password').sort({ createdAt: -1 });

    const usersWithTeams = await Promise.all(users.map(async (user) => {
        const teams = await Team.find({ $or: [{ owner: user._id }, { members: user._id }] }).select('name');
        return { ...user.toObject(), teams: teams.map(t => t.name) };
    }));

    res.json(usersWithTeams);
});

// @desc    Get all teams (platform-wide)
// @route   GET /api/admin/teams
const getAllTeamsAdmin = asyncHandler(async (req, res) => {
    const teams = await Team.find({}).populate('owner', 'name email role').populate('members', 'name email role').sort({ createdAt: -1 });

    const enrichedTeams = await Promise.all(teams.map(async (team) => {
        const teamObj = team.toObject();
        const getUserStats = async (userId) => {
            const [assigned, completed] = await Promise.all([
                Task.countDocuments({ team: team._id, assignedTo: userId }),
                Task.countDocuments({ team: team._id, assignedTo: userId, status: 'Done' })
            ]);
            return { assigned, completed };
        };

        if (teamObj.owner) {
            const stats = await getUserStats(teamObj.owner._id);
            teamObj.owner.tasksAssigned = stats.assigned;
            teamObj.owner.tasksCompleted = stats.completed;
        }

        if (teamObj.members) {
            teamObj.members = await Promise.all(teamObj.members.map(async (member) => {
                const stats = await getUserStats(member._id);
                return { ...member, tasksAssigned: stats.assigned, tasksCompleted: stats.completed };
            }));
        }
        return teamObj;
    }));

    res.json(enrichedTeams);
});

// @desc    Update any user's role
// @route   PATCH /api/admin/users/:userId/role
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

    if (targetUser._id.toString() === req.user._id.toString() && role !== 'master_admin') {
        res.status(400);
        throw new Error('Cannot downgrade your own role');
    }

    const oldRole = targetUser.role;
    targetUser.role = role;
    await targetUser.save();

    await AuditLog.create({ admin: req.user._id, action: 'ROLE_CHANGED', targetUser: targetUser._id, details: `Role changed from ${oldRole} to ${role}` });
    emitTeamUpdate(req.app.get('socketio'), null, 'ROLE_UPDATE', [targetUser._id]);

    res.json({ _id: targetUser._id, name: targetUser.name, email: targetUser.email, role: targetUser.role });
});

// @desc    Delete any user
// @route   DELETE /api/admin/users/:userId
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

    await Promise.all([
        Team.updateMany({ members: user._id }, { $pull: { members: user._id } }),
        Team.deleteMany({ owner: user._id }),
        user.deleteOne()
    ]);

    await AuditLog.create({ admin: req.user._id, action: 'USER_DELETED_PERMANENTLY', details: `Deleted user ${user.email} permanently` });
    res.json({ message: 'User removed completely' });
});

// @desc    Delete any team
// @route   DELETE /api/admin/teams/:teamId
const deleteTeamAdmin = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const team = await Team.findById(teamId);

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    await team.deleteOne();
    await Activity.deleteMany({ team: teamId });
    await AuditLog.create({ admin: req.user._id, action: 'TEAM_DELETED', details: `Deleted team ${team.name}` });

    res.json({ message: 'Team removed' });
});

// @desc    Add member to any team
// @route   POST /api/admin/teams/:teamId/members
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

    if (team.members.includes(userToAdd._id) || team.owner.toString() === userToAdd._id.toString()) {
        res.status(400);
        throw new Error('User is already a member or owner');
    }

    team.members.push(userToAdd._id);
    await team.save();

    await AuditLog.create({ admin: req.user._id, action: 'TEAM_MEMBER_ADDED', targetTeam: team._id, targetUser: userToAdd._id, details: `Added ${userToAdd.email} to ${team.name}` });
    emitTeamUpdate(req.app.get('socketio'), team._id, 'MEMBER_ADD');

    res.json({ message: 'User added to team', user: { _id: userToAdd._id, name: userToAdd.name, email: userToAdd.email } });
});

// @desc    Remove member from any team
// @route   DELETE /api/admin/teams/:teamId/members/:memberId
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
        throw new Error('User is not a member');
    }

    team.members = team.members.filter(mId => mId.toString() !== memberId);
    await team.save();

    await AuditLog.create({ admin: req.user._id, action: 'TEAM_MEMBER_REMOVED', targetTeam: team._id, targetUser: memberId, details: `Removed user from ${team.name}` });
    emitTeamUpdate(req.app.get('socketio'), team._id, 'MEMBER_REMOVE');

    res.json({ message: 'User removed from team' });
});

// @desc    Get platform-wide statistics
// @route   GET /api/admin/stats
const getPlatformStats = asyncHandler(async (req, res) => {
    const [totalUsers, activeUsers, suspendedUsers, pendingUsers, teamHeads, teamMembers, totalTeams, totalTasks, completedTasks, totalDocuments, totalActivities] = await Promise.all([
        User.countDocuments({ status: { $ne: 'pending' } }),
        User.countDocuments({ status: 'active' }),
        User.countDocuments({ status: 'suspended' }),
        User.countDocuments({ status: 'pending' }),
        User.countDocuments({ role: { $in: ['team_head', 'admin'] }, status: { $ne: 'pending' } }),
        User.countDocuments({ role: 'team_member', status: { $ne: 'pending' } }),
        Team.countDocuments({}),
        Task.countDocuments({}),
        Task.countDocuments({ status: 'Done' }),
        Document.countDocuments({}),
        Activity.countDocuments({})
    ]);

    res.json({ totalUsers, activeUsers, suspendedUsers, pendingUsers, teamHeads, teamMembers, totalTeams, totalTasks, completedTasks, totalDocuments, totalActivities });
});

// @desc    Get pending approval users
// @route   GET /api/admin/users/pending
const getPendingUsers = asyncHandler(async (req, res) => {
    const pendingUsers = await User.find({ status: 'pending' }).select('-password').sort({ createdAt: -1 });
    res.json(pendingUsers);
});

// @desc    Approve a pending user
// @route   POST /api/admin/users/:userId/approve
const approveUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user || user.status !== 'pending') {
        res.status(user ? 400 : 404);
        throw new Error(!user ? 'User not found' : 'User is not pending');
    }

    user.status = 'active';
    await user.save();

    await AuditLog.create({ admin: req.user._id, action: 'USER_APPROVED', targetUser: user._id, details: `Approved Team Head ${user.email}` });
    emitTeamUpdate(req.app.get('socketio'), null, 'USER_APPROVED', [user._id]);

    res.json({ message: `${user.name}'s account approved.`, user });
});

// @desc    Reject and delete a pending user
// @route   DELETE /api/admin/users/:userId/reject
const rejectUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user || user.status !== 'pending') {
        res.status(user ? 400 : 404);
        throw new Error(!user ? 'User not found' : 'User is not pending');
    }

    const { email, name } = user;
    await user.deleteOne();
    await AuditLog.create({ admin: req.user._id, action: 'USER_REJECTED', details: `Rejected registration for ${email}` });

    res.json({ message: `Registration from ${name} rejected.` });
});

// @desc    Toggle user suspension
// @route   PATCH /api/admin/users/:userId/suspend
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

    targetUser.status = targetUser.status === 'active' ? 'suspended' : 'active';
    await targetUser.save();

    await AuditLog.create({ admin: req.user._id, action: targetUser.status === 'active' ? 'USER_ACTIVATED' : 'USER_SUSPENDED', targetUser: targetUser._id, details: targetUser.status === 'active' ? 'Reactivated account' : 'Suspended account' });
    res.json({ _id: targetUser._id, status: targetUser.status, message: `User ${targetUser.status}` });
});

// @desc    Transfer team ownership
// @route   PATCH /api/admin/teams/:teamId/transfer
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
        throw new Error('New owner not found');
    }

    if (team.owner.toString() === newOwnerId) {
        res.status(400);
        throw new Error('User is already owner');
    }

    const oldOwnerId = team.owner;
    team.members = team.members.filter(m => m.toString() !== newOwnerId.toString());
    if (!team.members.includes(oldOwnerId)) team.members.push(oldOwnerId);
    team.owner = newOwnerId;
    await team.save();

    await AuditLog.create({ admin: req.user._id, action: 'TEAM_OWNERSHIP_TRANSFERRED', targetTeam: team._id, targetUser: newOwnerId, details: `Transferred ${team.name} to ${newOwner.email}` });
    emitTeamUpdate(req.app.get('socketio'), team._id, 'OWNERSHIP_TRANSFER');

    res.json(team);
});

// @desc    Update team details overrides
// @route   PUT /api/admin/teams/:teamId
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

    await AuditLog.create({ admin: req.user._id, action: 'TEAM_DETAILS_UPDATED', targetTeam: team._id, details: `Updated ${team.name}` });
    res.json(team);
});

// @desc    Get recent audit logs
// @route   GET /api/admin/audit-logs
const getAuditLogs = asyncHandler(async (req, res) => {
    const logs = await AuditLog.find({}).populate('admin', 'name email').populate('targetUser', 'name email').populate('targetTeam', 'name').sort({ createdAt: -1 }).limit(100);
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
