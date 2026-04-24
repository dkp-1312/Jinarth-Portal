import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { getMyNotifications, getUnreadNotificationCount, markNotificationAsRead, markAllNotificationsAsRead, } from '../controllers/notification.controller.js';
const router = Router();
router.get('/', authenticate, getMyNotifications);
router.get('/unread-count', authenticate, getUnreadNotificationCount);
router.patch('/read-all', authenticate, markAllNotificationsAsRead);
router.patch('/:id/read', authenticate, markNotificationAsRead);
export default router;
