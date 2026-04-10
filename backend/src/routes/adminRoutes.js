import express from 'express';
import { protect, masterAdmin } from '../middleware/authMiddleware.js';
import {
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
} from '../controllers/adminController.js';

const router = express.Router();

router.use(protect, masterAdmin);

router.route('/users')
    .get(getAllUsersAdmin);

router.route('/users/pending')
    .get(getPendingUsers);

router.route('/users/:userId/role')
    .patch(updateUserRole);

router.route('/users/:userId/suspend')
    .patch(toggleUserSuspension);

router.route('/users/:userId/approve')
    .post(approveUser);

router.route('/users/:userId/reject')
    .delete(rejectUser);

router.route('/users/:userId')
    .delete(deleteUserAdmin);

router.route('/teams')
    .get(getAllTeamsAdmin);

router.route('/teams/:teamId')
    .put(updateTeamDetailsAdmin)
    .delete(deleteTeamAdmin);

router.route('/teams/:teamId/transfer')
    .patch(transferTeamOwnership);

router.route('/teams/:teamId/members')
    .post(addMemberToTeamAdmin);

router.route('/teams/:teamId/members/:memberId')
    .delete(removeMemberFromTeamAdmin);

router.route('/audit-logs')
    .get(getAuditLogs);

router.route('/stats')
    .get(getPlatformStats);

export default router;
