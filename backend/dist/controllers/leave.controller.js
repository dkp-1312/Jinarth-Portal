import Leave from '../models/Leave/index.js';
import User from '../models/User/index.js';
import { createNotificationsForRecipients } from '../services/notification.service.js';
/**
 * Submit a new leave request
 */
export const submitLeaveRequest = async (req, res) => {
    try {
        const { fullName, email, leaveType, startDate, endDate, numberOfDays, reason, contactNumber } = req.body;
        // Support both authenticated and public submissions
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (!fullName || !email || !leaveType || !startDate || !endDate || !numberOfDays || !reason) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be filled',
            });
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        if (start > end) {
            return res.status(400).json({
                success: false,
                message: 'End date cannot be before start date',
            });
        }
        if (numberOfDays < 1) {
            return res.status(400).json({ success: false, message: 'Leave must be at least 1 day' });
        }
        if (reason.length < 10) {
            return res.status(400).json({ success: false, message: 'Reason must be at least 10 characters' });
        }
        const leave = new Leave({
            fullName,
            email,
            leaveType,
            startDate: start,
            endDate: end,
            numberOfDays,
            reason,
            contactNumber: contactNumber || '',
            status: 'Pending',
            ...(userId && { userId }),
            ...(userRole && ['Student', 'Intern', 'Employee'].includes(userRole) && { userRole }),
        });
        await leave.save();
        const reviewers = await User.find({ role: { $in: ['Admin', 'Employee'] }, status: 'Active' }).select('email');
        await createNotificationsForRecipients({
            recipientEmails: reviewers.map((reviewer) => reviewer.email).filter(Boolean),
            title: 'New Leave Request',
            message: `${fullName} submitted a ${leaveType} leave request.`,
            type: 'Leave',
            entityType: 'Leave',
            entityId: leave._id,
            createdBy: userId,
            expiresAt: new Date(endDate),
        });
        console.log(`✓ Leave request submitted: ${leave._id} - ${fullName}`);
        res.status(201).json({
            success: true,
            message: 'Leave request submitted successfully',
            data: leave,
        });
    }
    catch (error) {
        console.error('Error submitting leave request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit leave request',
            error: error.message,
        });
    }
};
/**
 * Get all pending leave requests (for approval)
 */
export const getPendingLeaves = async (req, res) => {
    try {
        const userRole = req.user?.role;
        const query = { status: 'Pending' };
        // Employees can only see Student and Intern leaves for approval
        if (userRole === 'Employee') {
            query.userRole = { $ne: 'Employee' };
        }
        const leaves = await Leave.find(query).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: leaves,
            count: leaves.length,
        });
    }
    catch (error) {
        console.error('Error fetching pending leaves:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending leaves',
            error: error.message,
        });
    }
};
/**
 * Get all leave requests (Admin)
 */
export const getAllLeaves = async (req, res) => {
    try {
        const { status } = req.query;
        const userRole = req.user?.role;
        const query = {};
        if (status) {
            query.status = status;
        }
        // Employees can only see Student and Intern leaves
        if (userRole === 'Employee') {
            query.userRole = { $ne: 'Employee' };
        }
        const leaves = await Leave.find(query).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: leaves,
            count: leaves.length,
        });
    }
    catch (error) {
        console.error('Error fetching leaves:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leaves',
            error: error.message,
        });
    }
};
/**
 * Get leave request by ID
 */
export const getLeaveById = async (req, res) => {
    try {
        const { id } = req.params;
        const leave = await Leave.findById(id);
        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found',
            });
        }
        res.json({
            success: true,
            data: leave,
        });
    }
    catch (error) {
        console.error('Error fetching leave:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leave request',
            error: error.message,
        });
    }
};
/**
 * Approve a leave request
 */
export const approveLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const approvedBy = req.user?.name || 'Admin';
        const userRole = req.user?.role;
        const leave = await Leave.findById(id);
        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found',
            });
        }
        if (leave.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: `Leave request is already ${leave.status.toLowerCase()}`,
            });
        }
        // Employees cannot approve other employees' or their own leave. Only admin can.
        if (userRole === 'Employee' && leave.userRole === 'Employee') {
            return res.status(403).json({
                success: false,
                message: "Employees cannot approve other employees' or their own leave. Only admin can.",
            });
        }
        // Fallback for cases where userRole wasn't stored in the leave document
        if (userRole === 'Employee' && !leave.userRole) {
            const requester = await User.findOne({ email: leave.email });
            if (requester?.role === 'Employee') {
                return res.status(403).json({
                    success: false,
                    message: "Employees cannot approve other employees' or their own leave. Only admin can.",
                });
            }
        }
        leave.status = 'Approved';
        leave.approvedBy = approvedBy;
        leave.approvalDate = new Date();
        leave.rejectionReason = undefined;
        await leave.save();
        await createNotificationsForRecipients({
            recipientEmails: [leave.email],
            title: 'Leave Request Approved',
            message: `Your leave request from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} has been approved.`,
            type: 'Leave',
            entityType: 'Leave',
            entityId: leave._id,
            expiresAt: new Date(leave.startDate),
        });
        console.log(`✓ Leave approved: ${leave._id} - ${leave.fullName} - Approved by: ${approvedBy}`);
        res.json({
            success: true,
            message: 'Leave request approved successfully',
            data: leave,
        });
    }
    catch (error) {
        console.error('Error approving leave:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve leave request',
            error: error.message,
        });
    }
};
/**
 * Reject a leave request
 */
export const rejectLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectionReason } = req.body;
        const approvedBy = req.user?.name || 'Admin';
        const userRole = req.user?.role;
        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required',
            });
        }
        const leave = await Leave.findById(id);
        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found',
            });
        }
        if (leave.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: `Leave request is already ${leave.status.toLowerCase()}`,
            });
        }
        // Employees cannot reject other employees' or their own leave. Only admin can.
        if (userRole === 'Employee' && leave.userRole === 'Employee') {
            return res.status(403).json({
                success: false,
                message: "Employees cannot reject other employees' or their own leave. Only admin can.",
            });
        }
        // Fallback for cases where userRole wasn't stored in the leave document
        if (userRole === 'Employee' && !leave.userRole) {
            const requester = await User.findOne({ email: leave.email });
            if (requester?.role === 'Employee') {
                return res.status(403).json({
                    success: false,
                    message: "Employees cannot reject other employees' or their own leave. Only admin can.",
                });
            }
        }
        leave.status = 'Rejected';
        leave.rejectionReason = rejectionReason;
        leave.approvedBy = approvedBy;
        leave.approvalDate = new Date();
        await leave.save();
        await createNotificationsForRecipients({
            recipientEmails: [leave.email],
            title: 'Leave Request Rejected',
            message: `Your leave request was rejected. Reason: ${rejectionReason}`,
            type: 'Leave',
            entityType: 'Leave',
            entityId: leave._id,
            expiresAt: new Date(leave.startDate),
        });
        console.log(`✓ Leave rejected: ${leave._id} - ${leave.fullName} - Rejected by: ${approvedBy}`);
        res.json({
            success: true,
            message: 'Leave request rejected successfully',
            data: leave,
        });
    }
    catch (error) {
        console.error('Error rejecting leave:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject leave request',
            error: error.message,
        });
    }
};
/**
 * Get leave statistics
 */
export const getLeaveStatistics = async (req, res) => {
    try {
        const totalLeaves = await Leave.countDocuments();
        const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
        const approvedLeaves = await Leave.countDocuments({ status: 'Approved' });
        const rejectedLeaves = await Leave.countDocuments({ status: 'Rejected' });
        res.json({
            success: true,
            data: {
                totalLeaves,
                pendingLeaves,
                approvedLeaves,
                rejectedLeaves,
                approvalRate: totalLeaves > 0 ? ((approvedLeaves / totalLeaves) * 100).toFixed(2) : 0,
            },
        });
    }
    catch (error) {
        console.error('Error fetching leave statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leave statistics',
            error: error.message,
        });
    }
};
/**
 * Get leave requests for the logged-in user (Student/Intern/Employee)
 */
export const getMyLeaves = async (req, res) => {
    try {
        const userEmail = req.user?.email;
        if (!userEmail) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const leaves = await Leave.find({ email: userEmail }).sort({ createdAt: -1 });
        res.json({ success: true, count: leaves.length, data: leaves });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch your leaves', error: error.message });
    }
};
/**
 * Get approved leaves for calendar display (by logged-in user's email)
 */
export const getApprovedLeavesByEmail = async (req, res) => {
    try {
        const userEmail = req.user?.email;
        if (!userEmail)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const leaves = await Leave.find({ email: userEmail, status: 'Approved' }).sort({ startDate: 1 });
        res.json({ success: true, count: leaves.length, data: leaves });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch approved leaves', error: error.message });
    }
};
