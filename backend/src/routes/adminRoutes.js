import express from 'express';
import { protect, masterAdmin } from '../middleware/authMiddleware.js';
import {
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
} from '../controllers/adminController.js';

const router = express.Router();

router.use(protect, masterAdmin);

// Impersonation
router.route('/impersonate/:userId')
    .post(impersonateUser);

// Users Management
router.route('/users')
    .get(getAllUsersAdmin);

router.route('/users/pending')
    .get(getPendingUsers);

router.route('/users/bulk-status')
    .patch(bulkUpdateUserStatus);

router.route('/users/:userId')
    .put(updateUserAdmin)
    .delete(deleteUserAdmin);

router.route('/users/:userId/role')
    .patch(updateUserRole);

router.route('/users/:userId/suspend')
    .patch(toggleUserSuspension);

router.route('/users/:userId/approve')
    .post(approveUser);

router.route('/users/:userId/reject')
    .delete(rejectUser);

router.route('/users/:userId/timeline')
    .get(getUserTimeline);

// Teams Management
router.route('/teams')
    .get(getAllTeamsAdmin)
    .post(createTeamAdmin);

router.route('/teams/:teamId')
    .put(updateTeamDetailsAdmin)
    .delete(deleteTeamAdmin);

router.route('/teams/:teamId/transfer')
    .patch(transferTeamOwnership);

router.route('/teams/:teamId/members')
    .post(addMemberToTeamAdmin);

router.route('/teams/:teamId/members/:memberId')
    .delete(removeMemberFromTeamAdmin);

// Platform Stats & Logs
router.route('/audit-logs')
    .get(getAuditLogs);

router.route('/stats')
    .get(getPlatformStats);

// Announcements
router.route('/broadcast')
    .post(sendPlatformBroadcast);

export default router;
