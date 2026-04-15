import asyncHandler from 'express-async-handler';
import User from '../../models/User.js';
import Team from '../../models/Team.js';
import AuditLog from '../../models/AuditLog.js';
import generateToken from '../../utils/generateToken.js';
import { emitTeamUpdate } from '../../utils/notificationService.js';

export const getAllUsersAdmin = asyncHandler(async (req, res) => {
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

export const updateUserRole = asyncHandler(async (req, res) => {
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

export const updateUserAdmin = asyncHandler(async (req, res) => {
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

export const deleteUserAdmin = asyncHandler(async (req, res) => {
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

export const getPendingUsers = asyncHandler(async (req, res) => {
    const pendingUsers = await User.find({ status: 'pending' }).select('-password').sort({ createdAt: -1 });
    res.json(pendingUsers);
});

export const approveUser = asyncHandler(async (req, res) => {
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

export const rejectUser = asyncHandler(async (req, res) => {
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

export const toggleUserSuspension = asyncHandler(async (req, res) => {
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

export const impersonateUser = asyncHandler(async (req, res) => {
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

export const getUserTimeline = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const logs = await AuditLog.find({ $or: [{ targetUser: userId }, { admin: userId }] }).populate('admin', 'name email').populate('targetUser', 'name email').populate('targetTeam', 'name').sort({ createdAt: -1 }).limit(50);
    res.json(logs);
});

export const bulkUpdateUserStatus = asyncHandler(async (req, res) => {
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
