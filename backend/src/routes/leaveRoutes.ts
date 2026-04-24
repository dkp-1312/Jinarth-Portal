import { Router } from 'express';
import {
  submitLeaveRequest,
  getPendingLeaves,
  getAllLeaves,
  getLeaveById,
  approveLeave,
  rejectLeave,
  getLeaveStatistics,
  getMyLeaves,
  getApprovedLeavesByEmail,
} from '../controllers/leave.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// Submit leave request (authenticated - for portals; also public for backward compat)
router.post('/', authenticate, submitLeaveRequest);

// Get leave statistics (Admin and Employee) - MUST come before /:id route
router.get('/stats', authenticate, authorize(['Admin', 'Employee']), getLeaveStatistics);

// Get MY leave requests (Student/Intern/Employee viewing their own)
router.get('/my', authenticate, getMyLeaves);

// Get MY approved leaves for calendar
router.get('/my-approved', authenticate, getApprovedLeavesByEmail);

// Get pending leaves (Admin and Employee)
router.get('/pending', authenticate, authorize(['Admin', 'Employee']), getPendingLeaves);

// Get all leaves (Admin and Employee)
router.get('/', authenticate, authorize(['Admin', 'Employee']), getAllLeaves);

// Get leave by ID (Admin and Employee)
router.get('/:id', authenticate, authorize(['Admin', 'Employee']), getLeaveById);

// Approve leave (Admin and Employee)
router.patch('/:id/approve', authenticate, authorize(['Admin', 'Employee']), approveLeave);

// Reject leave (Admin and Employee)
router.patch('/:id/reject', authenticate, authorize(['Admin', 'Employee']), rejectLeave);

export default router;
