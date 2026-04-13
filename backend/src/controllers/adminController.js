import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Team from '../models/Team.js';
import Task from '../models/Task.js';
import Document from '../models/Document.js';
import { emitTeamUpdate } from '../utils/notificationService.js';
import generateToken from '../utils/generateToken.js';
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
            if (!userId) return { assigned: 0, completed: 0 };
            try {
                const [assigned, completed] = await Promise.all([
                    Task.countDocuments({ team: team._id, assignedTo: userId }),
                    Task.countDocuments({ team: team._id, assignedTo: userId, status: 'Done' })
                ]);
                return { assigned, completed };
            } catch (err) {
                console.error(`Error fetching stats for user ${userId}:`, err);
                return { assigned: 0, completed: 0 };
            }
        };

        if (teamObj.owner && teamObj.owner._id) {
            const stats = await getUserStats(teamObj.owner._id);
            teamObj.owner.tasksAssigned = stats.assigned;
            teamObj.owner.tasksCompleted = stats.completed;
        }

        if (teamObj.members && Array.isArray(teamObj.members)) {
            teamObj.members = await Promise.all(teamObj.members.map(async (member) => {
                if (!member || !member._id) return member;
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

// @desc    Update any user's profile information
// @route   PUT /api/admin/users/:userId
const updateUserAdmin = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { name, email, password } = req.body;

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
        res.status(404);
        throw new Error('User not found');
    }

    if (email && email !== userToUpdate.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            res.status(400);
            throw new Error('Email already in use');
        }
        userToUpdate.email = email;
    }

    if (name) userToUpdate.name = name;
    if (password) userToUpdate.password = password;

    await userToUpdate.save();

    await AuditLog.create({ 
        admin: req.user._id, 
        action: 'USER_PROFILE_UPDATED', 
        targetUser: userToUpdate._id, 
        details: `Updated profile for ${userToUpdate.email}.` 
    });

    res.json({
        _id: userToUpdate._id,
        name: userToUpdate.name,
        email: userToUpdate.email,
        role: userToUpdate.role,
        status: userToUpdate.status
    });
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

    const updatedTeam = await Team.findById(teamId).populate('owner', 'name email role').populate('members', 'name email role');
    res.json(updatedTeam.members);
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

    team.members = team.members.filter(mId => mId.toString() !== memberId);
    await team.save();

    await AuditLog.create({ admin: req.user._id, action: 'TEAM_MEMBER_REMOVED', targetTeam: team._id, targetUser: memberId, details: `Removed user from ${team.name}` });
    emitTeamUpdate(req.app.get('socketio'), team._id, 'MEMBER_REMOVE');

    res.json({ message: 'User removed from team' });
});

// @desc    Get platform-wide statistics
// @route   GET /api/admin/stats
const getPlatformStats = asyncHandler(async (req, res) => {
    const [totalUsers, activeUsers, suspendedUsers, pendingUsers, totalTeams, totalTasks, completedTasks] = await Promise.all([
        User.countDocuments({ status: { $ne: 'pending' } }),
        User.countDocuments({ status: 'active' }),
        User.countDocuments({ status: 'suspended' }),
        User.countDocuments({ status: 'pending' }),
        Team.countDocuments({}),
        Task.countDocuments({}),
        Task.countDocuments({ status: 'Done' })
    ]);

    res.json({ totalUsers, activeUsers, suspendedUsers, pendingUsers, totalTeams, totalTasks, completedTasks });
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
        res.status(400);
        throw new Error('User not found or not pending');
    }

    user.status = 'active';
    await user.save();

    await AuditLog.create({ admin: req.user._id, action: 'USER_APPROVED', targetUser: user._id, details: `Approved ${user.email}` });
    res.json({ message: 'User approved' });
});

// @desc    Reject and delete a pending user
// @route   DELETE /api/admin/users/:userId/reject
const rejectUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user || user.status !== 'pending') {
        res.status(400);
        throw new Error('User not found or not pending');
    }

    await user.deleteOne();
    await AuditLog.create({ admin: req.user._id, action: 'USER_REJECTED', details: `Rejected registration for ${user.email}` });

    res.json({ message: 'User rejected' });
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

    targetUser.status = targetUser.status === 'active' ? 'suspended' : 'active';
    await targetUser.save();

    await AuditLog.create({ admin: req.user._id, action: targetUser.status === 'active' ? 'USER_ACTIVATED' : 'USER_SUSPENDED', targetUser: targetUser._id, details: targetUser.status === 'active' ? 'Reactivated' : 'Suspended' });
    res.json({ _id: targetUser._id, status: targetUser.status });
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

    team.owner = newOwnerId;
    await team.save();

    await AuditLog.create({ admin: req.user._id, action: 'TEAM_OWNERSHIP_TRANSFERRED', targetTeam: team._id, targetUser: newOwnerId, details: `Transferred ${team.name}` });
    res.json(team);
});

// @desc    Create a new team (Master Admin override)
// @route   POST /api/admin/teams
const createTeamAdmin = asyncHandler(async (req, res) => {
    const { name, description, ownerId } = req.body;
    const team = await Team.create({ name, description, owner: ownerId, members: [] });

    await AuditLog.create({ admin: req.user._id, action: 'TEAM_CREATED', targetTeam: team._id, details: `Created team ${team.name}` });
    res.status(201).json(team);
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

// @desc    Impersonate a user
// @route   POST /api/admin/impersonate/:userId
const impersonateUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const targetUser = await User.findById(userId);

    if (!targetUser) {
        res.status(404);
        throw new Error('User not found');
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('Cannot impersonate yourself');
    }

    await AuditLog.create({
        admin: req.user._id,
        action: 'IMPERSONATION_STARTED',
        targetUser: targetUser._id,
        details: `Started impersonating ${targetUser.email}`
    });

    res.json({
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        token: generateToken(targetUser._id),
        isImpersonated: true
    });
});

// @desc    Get specific user's activity timeline
// @route   GET /api/admin/users/:userId/timeline
const getUserTimeline = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const logs = await AuditLog.find({ $or: [{ targetUser: userId }, { admin: userId }] }).populate('admin', 'name email').populate('targetUser', 'name email').populate('targetTeam', 'name').sort({ createdAt: -1 }).limit(50);
    res.json(logs);
});

// @desc    Bulk update user status
// @route   PATCH /api/admin/users/bulk-status
const bulkUpdateUserStatus = asyncHandler(async (req, res) => {
    const { userIds, status } = req.body;
    const filteredIds = userIds.filter(id => id.toString() !== req.user._id.toString());
    const result = await User.updateMany({ _id: { $in: filteredIds } }, { status });

    await AuditLog.create({
        admin: req.user._id,
        action: status === 'active' ? 'BULK_USER_ACTIVATED' : 'BULK_USER_SUSPENDED',
        details: `Bulk updated status to ${status}`
    });

    res.json({ message: `Updated ${result.modifiedCount} users`, modifiedCount: result.modifiedCount });
});

// @desc    Send platform-wide broadcast notification
// @route   POST /api/admin/broadcast
const sendPlatformBroadcast = asyncHandler(async (req, res) => {
    const { title, message, type = 'info' } = req.body;
    const io = req.app.get('socketio');
    if (io) {
        io.emit('system_broadcast', { title, message, type, sender: req.user.name, timestamp: new Date() });
    }

    await AuditLog.create({ admin: req.user._id, action: 'PLATFORM_BROADCAST_SENT', details: `Broadcast: ${title}` });
    res.json({ message: 'Broadcast sent' });
});

export {
    getAllUsersAdmin,
    getAllTeamsAdmin,
    updateUserRole,
    updateUserAdmin,
    deleteUserAdmin,
    deleteTeamAdmin,
    addMemberToTeamAdmin,
    removeMemberFromTeamAdmin,
    getPlatformStats,
    getPendingUsers,
    approveUser,
    rejectUser,
    toggleUserSuspension,
    transferTeamOwnership,
    createTeamAdmin,
    updateTeamDetailsAdmin,
    getAuditLogs,
    impersonateUser,
    getUserTimeline,
    bulkUpdateUserStatus,
    sendPlatformBroadcast
};
