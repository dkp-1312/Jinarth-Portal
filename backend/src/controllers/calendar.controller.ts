import { Request, Response } from 'express';
import Event from '../models/Event/index.js';
import Holiday from '../models/Holiday/index.js';
import User from '../models/User/index.js';
import { createNotificationsForRecipients } from '../services/notification.service.js';

/**
 * =====================
 * EVENT MANAGEMENT APIS
 * =====================
 */

/**
 * Create a new event
 */
export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, date, time, description, eventType, location, organizer, attendees } = req.body;

    // Validate input
    if (!title || !date || !time || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title, date, time, and description are required',
      });
    }

    // Validate time format
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid time in HH:MM format',
      });
    }

    const event = new Event({
      title,
      date: new Date(date),
      time,
      description,
      eventType: eventType || 'Meeting',
      location: location || '',
      organizer: organizer || 'Admin',
      attendees: attendees || [],
    });

    await event.save();
    const users = await User.find({ status: 'Active' }).select('email');
    await createNotificationsForRecipients({
      recipientEmails: users.map((user: any) => user.email).filter(Boolean),
      title: 'New Event',
      message: `New event added: ${title} on ${new Date(date).toLocaleDateString()}.`,
      type: 'System',
      expiresAt: new Date(date),
    });
    console.log(`✓ Event created: ${event._id} - ${title}`);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error: any) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message,
    });
  }
};

/**
 * Get all events with optional filtering
 */
export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const { eventType, startDate, endDate } = req.query;
    const query: any = {};

    if (eventType) {
      query.eventType = eventType;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate as string);
      }
    }

    const events = await Event.find(query).sort({ date: 1 });

    res.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message,
    });
  }
};

/**
 * Get upcoming events
 */
export const getUpcomingEvents = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const now = new Date();
    const futureDate = new Date(now.getTime() + (Number(days) * 24 * 60 * 60 * 1000));

    const events = await Event.find({
      date: { $gte: now, $lte: futureDate },
    }).sort({ date: 1 });

    res.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error: any) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming events',
      error: error.message,
    });
  }
};

/**
 * Get event by ID
 */
export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error.message,
    });
  }
};

/**
 * Update event
 */
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate time if provided
    if (updates.time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(updates.time)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid time in HH:MM format',
      });
    }

    const event = await Event.findByIdAndUpdate(
      id,
      { ...updates, date: updates.date ? new Date(updates.date) : undefined },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    console.log(`✓ Event updated: ${event._id}`);

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  } catch (error: any) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message,
    });
  }
};

/**
 * Delete event
 */
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    console.log(`✓ Event deleted: ${event._id}`);

    res.json({
      success: true,
      message: 'Event deleted successfully',
      data: event,
    });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message,
    });
  }
};

/**
 * ========================
 * HOLIDAY MANAGEMENT APIS
 * ========================
 */

/**
 * Create a new holiday
 */
export const createHoliday = async (req: Request, res: Response) => {
  try {
    const { name, date, country, type, description, isOptional } = req.body;

    // Validate input
    if (!name || !date || !country) {
      return res.status(400).json({
        success: false,
        message: 'Name, date, and country are required',
      });
    }

    const holiday = new Holiday({
      name,
      date: new Date(date),
      country,
      type: type || 'National',
      description: description || '',
      isOptional: isOptional || false,
    });

    await holiday.save();
    const users = await User.find({ status: 'Active' }).select('email');
    await createNotificationsForRecipients({
      recipientEmails: users.map((user: any) => user.email).filter(Boolean),
      title: 'New Holiday',
      message: `Holiday declared: ${name} on ${new Date(date).toLocaleDateString()}.`,
      type: 'Holiday',
      entityType: 'Holiday',
      entityId: holiday._id,
      expiresAt: new Date(date),
    });
    console.log(`✓ Holiday created: ${holiday._id} - ${name}`);

    res.status(201).json({
      success: true,
      message: 'Holiday created successfully',
      data: holiday,
    });
  } catch (error: any) {
    console.error('Error creating holiday:', error);
    
    // Handle unique constraint error for date
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A holiday already exists on this date',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create holiday',
      error: error.message,
    });
  }
};

/**
 * Get all holidays with optional filtering
 */
export const getAllHolidays = async (req: Request, res: Response) => {
  try {
    const { country, type, year } = req.query;
    const query: any = {};

    if (country) {
      query.country = country;
    }

    if (type) {
      query.type = type;
    }

    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const holidays = await Holiday.find(query).sort({ date: 1 });

    res.json({
      success: true,
      data: holidays,
      count: holidays.length,
    });
  } catch (error: any) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch holidays',
      error: error.message,
    });
  }
};

/**
 * Get upcoming holidays
 */
export const getUpcomingHolidays = async (req: Request, res: Response) => {
  try {
    const { country = 'India', days = 365 } = req.query;
    const now = new Date();
    const futureDate = new Date(now.getTime() + (Number(days) * 24 * 60 * 60 * 1000));

    const holidays = await Holiday.find({
      country,
      date: { $gte: now, $lte: futureDate },
    }).sort({ date: 1 });

    res.json({
      success: true,
      data: holidays,
      count: holidays.length,
    });
  } catch (error: any) {
    console.error('Error fetching upcoming holidays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming holidays',
      error: error.message,
    });
  }
};

/**
 * Get holiday by ID
 */
export const getHolidayById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const holiday = await Holiday.findById(id);

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found',
      });
    }

    res.json({
      success: true,
      data: holiday,
    });
  } catch (error: any) {
    console.error('Error fetching holiday:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch holiday',
      error: error.message,
    });
  }
};

/**
 * Update holiday
 */
export const updateHoliday = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const holiday = await Holiday.findByIdAndUpdate(
      id,
      { ...updates, date: updates.date ? new Date(updates.date) : undefined },
      { new: true, runValidators: true }
    );

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found',
      });
    }

    console.log(`✓ Holiday updated: ${holiday._id}`);

    res.json({
      success: true,
      message: 'Holiday updated successfully',
      data: holiday,
    });
  } catch (error: any) {
    console.error('Error updating holiday:', error);
    
    // Handle unique constraint error for date
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A holiday already exists on this date',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update holiday',
      error: error.message,
    });
  }
};

/**
 * Delete holiday
 */
export const deleteHoliday = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const holiday = await Holiday.findByIdAndDelete(id);

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found',
      });
    }

    console.log(`✓ Holiday deleted: ${holiday._id}`);

    res.json({
      success: true,
      message: 'Holiday deleted successfully',
      data: holiday,
    });
  } catch (error: any) {
    console.error('Error deleting holiday:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete holiday',
      error: error.message,
    });
  }
};

/**
 * Get calendar statistics
 */
export const getCalendarStats = async (req: Request, res: Response) => {
  try {
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({
      date: { $gte: new Date() },
    });
    const pastEvents = await Event.countDocuments({
      date: { $lt: new Date() },
    });

    const totalHolidays = await Holiday.countDocuments();
    const upcomingHolidays = await Holiday.countDocuments({
      date: { $gte: new Date() },
    });

    res.json({
      success: true,
      data: {
        events: {
          total: totalEvents,
          upcoming: upcomingEvents,
          past: pastEvents,
        },
        holidays: {
          total: totalHolidays,
          upcoming: upcomingHolidays,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching calendar stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar statistics',
      error: error.message,
    });
  }
};
