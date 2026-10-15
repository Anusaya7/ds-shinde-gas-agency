import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', NotificationController.getNotifications);
router.get('/unread-count', NotificationController.getUnreadCount);
router.put('/read-all', NotificationController.markAllAsRead);
router.patch('/read-all', NotificationController.markAllAsRead);
router.put('/:id/read', NotificationController.markAsRead);
router.patch('/:id/read', NotificationController.markAsRead);

export default router;
