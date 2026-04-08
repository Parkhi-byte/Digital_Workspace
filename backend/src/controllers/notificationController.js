import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';

// @desc    Get unread notification count (lightweight for header badge)
// @route   GET /api/notifications/count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({ recipient: req.user._id, read: false });
    res.json({ count });
});

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Filtering
    const query = { recipient: req.user._id };
    if (req.query.read !== undefined) {
        query.read = req.query.read === 'true';
    }
    if (req.query.type) {
        query.type = req.query.type;
    }

    const [notifications, total] = await Promise.all([
        Notification.find(query)
            .populate('sender', 'name email pic')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Notification.countDocuments(query)
    ]);

    res.json({
        notifications,
        page,
        pages: Math.ceil(total / limit),
        total
    });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, recipient: req.user._id },
        { read: true },
        { returnDocument: 'after' }
    );

    if (!notification) {
        res.status(404);
        throw new Error('Notification not found or unauthorized');
    }

    // Sync status across other tabs/devices
    const io = req.app.get('socketio');
    if (io) {
        io.to(req.user._id.toString()).emit('notificationStatusSync', {
            id: req.params.id,
            read: true
        });
    }

    res.json(notification);
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { recipient: req.user._id, read: false },
        { read: true }
    );

    // Sync status across other tabs/devices
    const io = req.app.get('socketio');
    if (io) {
        io.to(req.user._id.toString()).emit('notificationStatusSync', {
            allRead: true
        });
    }

    res.json({ message: 'All notifications marked as read' });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({ 
        _id: req.params.id, 
        recipient: req.user._id 
    });

    if (!notification) {
        res.status(404);
        throw new Error('Notification not found or unauthorized');
    }

    await notification.deleteOne();
    res.json({ id: req.params.id });
});

// @desc    Clear all notifications
// @route   DELETE /api/notifications/clear-all
// @access  Private
export const clearAll = asyncHandler(async (req, res) => {
    await Notification.deleteMany({ recipient: req.user._id });
    res.json({ message: 'All notifications cleared' });
});

// @desc    Clear read notifications
// @route   DELETE /api/notifications/clear-read
// @access  Private
export const clearRead = asyncHandler(async (req, res) => {
    await Notification.deleteMany({ recipient: req.user._id, read: true });
    res.json({ message: 'Read notifications cleared' });
});
