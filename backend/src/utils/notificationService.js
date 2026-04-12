import Notification from '../models/Notification.js';

/**
 * Creates notifications for multiple users and emits socket events if possible
 * @param {Array<string>} recipientIds - Array of user IDs to receive the notification
 * @param {Object} data - Notification data (title, description, type, link, sender)
 * @param {Object} io - Socket.io instance (optional)
 */
export const createNotifications = async (recipientIds, data, io = null) => {
    try {
        const notifications = recipientIds.map(recipientId => ({
            recipient: recipientId,
            ...data
        }));

        const savedNotifications = await Notification.insertMany(notifications);

        if (io) {
            savedNotifications.forEach(notif => {
                io.to(notif.recipient.toString()).emit('newNotification', notif);
            });
        }

        return savedNotifications;
    } catch (error) {
        console.error('Error creating notifications:', error);
        throw error;
    }
};

/**
 * Creates a notification for a single user
 */
export const createNotification = async (recipientId, data, io = null) => {
    return createNotifications([recipientId], data, io);
};
/**
 * Emits a real-time update event to members of a team or to the entire platform
 * @param {Object} io - Socket.io instance
 * @param {string} teamId - The team ID to notify (optional for global updates)
 * @param {string} updateType - Type of update (TEAM_DATA_UPDATE, TASK_UPDATE, etc.)
 * @param {Array<string>} recipientIds - Optional specific recipients
 */
export const emitTeamUpdate = (io, teamId, updateType, recipientIds = []) => {
    try {
        if (!io) return;

        const payload = {
            teamId,
            updateType,
            timestamp: new Date().toISOString()
        };

        if (recipientIds && recipientIds.length > 0) {
            // Priority: Send to specific users involved
            recipientIds.forEach(id => {
                io.to(id.toString()).emit('team_update', payload);
            });
        } else if (teamId) {
            // Emit only to the specific team room
            io.to(`team_${teamId}`).emit('team_update', payload);
            
            // Also notify the global oversight room for Master Admins
            io.to('platform_admin').emit('team_update', payload);
        } else {
            // Global platform update: Emit to everyone or just admins?
            // Usually global updates (like new teams) should reach everyone in the grid
            io.emit('platform_update', payload);
        }
    } catch (error) {
        console.error('[Socket] emitTeamUpdate failed:', error);
    }
};
