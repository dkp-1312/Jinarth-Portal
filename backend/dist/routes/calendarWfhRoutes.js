import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { createWFH, getWFHDays, deleteWFH } from '../controllers/calendar-wfh.controller.js';
import { getCalendarData, getAdminCalendarData } from '../controllers/calendar-wfh.controller.js';
const router = Router();
// WFH routes
router.post('/wfh', authenticate, authorize(['Admin']), createWFH);
router.get('/wfh', authenticate, getWFHDays);
router.delete('/wfh/:id', authenticate, authorize(['Admin']), deleteWFH);
// Calendar data aggregation
router.get('/data', authenticate, getCalendarData);
router.get('/admin-data', authenticate, authorize(['Admin']), getAdminCalendarData);
export default router;
