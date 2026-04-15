import asyncHandler from 'express-async-handler';
import User from '../../models/User.js';
import Team from '../../models/Team.js';
import Task from '../../models/Task.js';
import AuditLog from '../../models/AuditLog.js';

export const getPlatformStats = asyncHandler(async (req, res) => {
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

export const getAuditLogs = asyncHandler(async (req, res) => {
    const logs = await AuditLog.find({}).populate('admin', 'name email').populate('targetUser', 'name email').populate('targetTeam', 'name').sort({ createdAt: -1 }).limit(100);
    res.json(logs);
});

export const sendPlatformBroadcast = asyncHandler(async (req, res) => {
    const { title, message, type = 'info' } = req.body;
    const io = req.app.get('socketio');
    if (io) {
        io.emit('system_broadcast', { title, message, type, sender: req.user.name, timestamp: new Date() });
    }

    await AuditLog.create({ admin: req.user._id, action: 'PLATFORM_BROADCAST_SENT', details: `Broadcast: ${title}` });
    res.json({ message: 'Broadcast sent' });
});
