import { Router } from 'express';
import {
  // Event routes
  createEvent,
  getAllEvents,
  getUpcomingEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  // Holiday routes
  createHoliday,
  getAllHolidays,
  getUpcomingHolidays,
  getHolidayById,
  updateHoliday,
  deleteHoliday,
  // Stats
  getCalendarStats,
} from '../controllers/calendar.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * =====================
 * EVENT ROUTES
 * =====================
 */

// Create event (Admin only)
router.post('/events', authenticate, authorize(['Admin']), createEvent);

// Get all events (public)
router.get('/events', getAllEvents);

// Get upcoming events (public)
router.get('/events/upcoming', getUpcomingEvents);

// Get event by ID (public)
router.get('/events/:id', getEventById);

// Update event (Admin only)
router.put('/events/:id', authenticate, authorize(['Admin']), updateEvent);

// Delete event (Admin only)
router.delete('/events/:id', authenticate, authorize(['Admin']), deleteEvent);

/**
 * ========================
 * HOLIDAY ROUTES
 * ========================
 */

// Create holiday (Admin only)
router.post('/holidays', authenticate, authorize(['Admin']), createHoliday);

// Get all holidays (public)
router.get('/holidays', getAllHolidays);

// Get upcoming holidays (public)
router.get('/holidays/upcoming', getUpcomingHolidays);

// Get holiday by ID (public)
router.get('/holidays/:id', getHolidayById);

// Update holiday (Admin only)
router.put('/holidays/:id', authenticate, authorize(['Admin']), updateHoliday);

// Delete holiday (Admin only)
router.delete('/holidays/:id', authenticate, authorize(['Admin']), deleteHoliday);

/**
 * ========================
 * CALENDAR STATS
 * ========================
 */

// Get calendar statistics (public)
router.get('/stats', getCalendarStats);

export default router;
