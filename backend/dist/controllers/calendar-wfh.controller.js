import WorkFromHome from '../models/WorkFromHome/index.js';
import Holiday from '../models/Holiday/index.js';
import Leave from '../models/Leave/index.js';
/**
 * Create a WFH day (Admin only)
 */
export const createWFH = async (req, res) => {
    try {
        const { date, title, description, applicableTo } = req.body;
        const createdBy = req.user?.id;
        if (!date) {
            return res.status(400).json({ success: false, message: 'Date is required' });
        }
        const wfh = new WorkFromHome({
            date: new Date(date),
            title: title || 'Work From Home',
            description,
            applicableTo: applicableTo || ['Student', 'Intern', 'Employee'],
            createdBy,
        });
        await wfh.save();
        res.status(201).json({ success: true, message: 'WFH day created', data: wfh });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create WFH day', error: error.message });
    }
};
/**
 * Get all WFH days (filtered by role for non-admins)
 */
export const getWFHDays = async (req, res) => {
    try {
        const userRole = req.user?.role;
        const { year, month } = req.query;
        let query = {};
        // Filter by role for non-admin users
        if (userRole && userRole !== 'Admin') {
            query.applicableTo = userRole;
        }
        // Filter by month/year if provided
        if (year && month) {
            const startOfMonth = new Date(Number(year), Number(month) - 1, 1);
            const endOfMonth = new Date(Number(year), Number(month), 0, 23, 59, 59);
            query.date = { $gte: startOfMonth, $lte: endOfMonth };
        }
        const wfhDays = await WorkFromHome.find(query).sort({ date: 1 });
        res.json({ success: true, count: wfhDays.length, data: wfhDays });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch WFH days', error: error.message });
    }
};
/**
 * Delete a WFH day (Admin only)
 */
export const deleteWFH = async (req, res) => {
    try {
        const { id } = req.params;
        const wfh = await WorkFromHome.findByIdAndDelete(id);
        if (!wfh)
            return res.status(404).json({ success: false, message: 'WFH day not found' });
        res.json({ success: true, message: 'WFH day deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete WFH day', error: error.message });
    }
};
/**
 * Get calendar data for the current user
 * Returns: holidays, wfh days, approved leaves (for portals)
 */
export const getCalendarData = async (req, res) => {
    try {
        const userRole = req.user?.role;
        const userEmail = req.user?.email;
        const { year, month } = req.query;
        let dateFilter = {};
        if (year && month) {
            const startOfMonth = new Date(Number(year), Number(month) - 1, 1);
            const endOfMonth = new Date(Number(year), Number(month), 0, 23, 59, 59);
            dateFilter = { $gte: startOfMonth, $lte: endOfMonth };
        }
        // Get holidays
        const holidayQuery = year && month ? { date: dateFilter } : {};
        const holidays = await Holiday.find(holidayQuery).sort({ date: 1 });
        // Get WFH days (filtered by role)
        const wfhQuery = {};
        if (userRole !== 'Admin') {
            wfhQuery.applicableTo = userRole;
        }
        if (year && month)
            wfhQuery.date = dateFilter;
        const wfhDays = await WorkFromHome.find(wfhQuery).sort({ date: 1 });
        // Get approved leaves for non-admin users
        let approvedLeaves = [];
        if (userEmail && userRole !== 'Admin') {
            const leaveQuery = { email: userEmail, status: 'Approved' };
            approvedLeaves = await Leave.find(leaveQuery).sort({ startDate: 1 });
        }
        res.json({
            success: true,
            data: {
                holidays,
                wfhDays,
                approvedLeaves,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch calendar data', error: error.message });
    }
};
/**
 * Get admin calendar data — all holidays, wfh days, and all approved leaves with user info
 */
export const getAdminCalendarData = async (req, res) => {
    try {
        const { year, month } = req.query;
        let dateFilter = {};
        if (year && month) {
            const startOfMonth = new Date(Number(year), Number(month) - 1, 1);
            const endOfMonth = new Date(Number(year), Number(month), 0, 23, 59, 59);
            dateFilter = { $gte: startOfMonth, $lte: endOfMonth };
        }
        const holidayQuery = year && month ? { date: dateFilter } : {};
        const holidays = await Holiday.find(holidayQuery).sort({ date: 1 });
        const wfhQuery = year && month ? { date: dateFilter } : {};
        const wfhDays = await WorkFromHome.find(wfhQuery).populate('createdBy', 'name email').sort({ date: 1 });
        // Fetch all leaves that overlap with this month (Approved and Pending)
        const leaveQuery = {
            status: { $in: ['Approved', 'Pending'] }
        };
        if (year && month) {
            leaveQuery.startDate = { $lte: dateFilter.$lte };
            leaveQuery.endDate = { $gte: dateFilter.$gte };
        }
        const approvedLeaves = await Leave.find(leaveQuery).sort({ startDate: 1 });
        res.json({
            success: true,
            data: { holidays, wfhDays, approvedLeaves },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch admin calendar data', error: error.message });
    }
};
