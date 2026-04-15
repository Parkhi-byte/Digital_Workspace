import express from 'express';
import { protect, masterAdmin } from '../middleware/authMiddleware.js';
import * as userAdmin from '../controllers/admin/userAdminController.js';
import * as teamAdmin from '../controllers/admin/teamAdminController.js';
import * as systemAdmin from '../controllers/admin/systemAdminController.js';

const router = express.Router();

router.use(protect, masterAdmin);

router.route('/impersonate/:userId')
    .post(userAdmin.impersonateUser);

router.route('/users')
    .get(userAdmin.getAllUsersAdmin);

router.route('/users/pending')
    .get(userAdmin.getPendingUsers);

router.route('/users/bulk-status')
    .patch(userAdmin.bulkUpdateUserStatus);

router.route('/users/:userId')
    .put(userAdmin.updateUserAdmin)
    .delete(userAdmin.deleteUserAdmin);

router.route('/users/:userId/role')
    .patch(userAdmin.updateUserRole);

router.route('/users/:userId/suspend')
    .patch(userAdmin.toggleUserSuspension);

router.route('/users/:userId/approve')
    .post(userAdmin.approveUser);

router.route('/users/:userId/reject')
    .delete(userAdmin.rejectUser);

router.route('/users/:userId/timeline')
    .get(userAdmin.getUserTimeline);

router.route('/teams')
    .get(teamAdmin.getAllTeamsAdmin)
    .post(teamAdmin.createTeamAdmin);

router.route('/teams/:teamId')
    .put(teamAdmin.updateTeamDetailsAdmin)
    .delete(teamAdmin.deleteTeamAdmin);

router.route('/teams/:teamId/transfer')
    .patch(teamAdmin.transferTeamOwnership);

router.route('/teams/:teamId/members')
    .post(teamAdmin.addMemberToTeamAdmin);

router.route('/teams/:teamId/members/:memberId')
    .delete(teamAdmin.removeMemberFromTeamAdmin);

router.route('/audit-logs')
    .get(systemAdmin.getAuditLogs);

router.route('/stats')
    .get(systemAdmin.getPlatformStats);

router.route('/broadcast')
    .post(systemAdmin.sendPlatformBroadcast);

export default router;
