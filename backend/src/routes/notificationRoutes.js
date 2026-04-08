import express from 'express';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll, clearRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.get('/count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/clear-all', clearAll);
router.delete('/clear-read', clearRead);
router.delete('/:id', deleteNotification);

export default router;
