import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { getDashboardStats, getDashboardAnalytics, getDashboardReports, getPortalDashboardStats } from '../controllers/dashboard.controller.js';
const router = Router();
/**
 * Get dashboard stats (Admin/Employee focus)
 */
router.get('/stats', authenticate, authorize(['Admin', 'Employee']), getDashboardStats);
/**
 * Get portal user stats (Student, Intern, Employee)
 */
router.get('/portal-stats', authenticate, getPortalDashboardStats);
/**
 * Get analytics data
 */
router.get('/analytics', authenticate, authorize(['Admin', 'Employee']), getDashboardAnalytics);
/**
 * Get reports
 */
router.get('/reports', authenticate, authorize(['Admin', 'Employee']), getDashboardReports);
export default router;
