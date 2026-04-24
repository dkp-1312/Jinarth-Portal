import Task from '../models/Task/index.js';
import User from '../models/User/index.js';
import Student from '../models/Student/index.js';
import Intern from '../models/Intern/index.js';
import Employee from '../models/Employee/index.js';
import { createNotificationsForRecipients, sendTaskAssignedEmails, } from '../services/notification.service.js';
const ROLE_MODEL_MAP = {
    Student,
    Intern,
    Employee,
};
const getModelByAssigneeType = (assigneeType) => ROLE_MODEL_MAP[assigneeType];
/**
 * Create and assign task to student or intern
 */
export const createTask = async (req, res) => {
    try {
        const { title, description, assignedToType, dueDate, priority, tags, estimatedHours, roleFilter = '', assignToAll = false, assignedTo, assignedToIds = [], } = req.body;
        const assignedBy = req.user?.id;
        const userRole = req.user?.role;
        // Validate input
        if (!title || !description || !assignedToType || !dueDate) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, assignedToType, and dueDate are required',
            });
        }
        if (!['Student', 'Intern', 'Employee'].includes(assignedToType)) {
            return res.status(400).json({
                success: false,
                message: 'assignedToType must be Student, Intern, or Employee',
            });
        }
        // Prevent Employee from assigning tasks to other Employees
        if (assignedToType === 'Employee' && userRole === 'Employee') {
            return res.status(403).json({
                success: false,
                message: 'Employees cannot assign tasks to other employees. Only Admin can.',
            });
        }
        const model = getModelByAssigneeType(assignedToType);
        const explicitAssignees = Array.isArray(assignedToIds)
            ? assignedToIds
            : assignedTo
                ? [assignedTo]
                : [];
        const filterQuery = {};
        if (roleFilter && assignedToType === 'Student')
            filterQuery.course = roleFilter;
        if (roleFilter && assignedToType === 'Employee')
            filterQuery.designation = roleFilter;
        if (roleFilter && assignedToType === 'Intern')
            filterQuery.department = roleFilter;
        const assigneeRecords = assignToAll
            ? await model.find(filterQuery).select('_id name email')
            : await model.find({ _id: { $in: explicitAssignees }, ...filterQuery }).select('_id name email');
        if (!assigneeRecords.length) {
            return res.status(404).json({
                success: false,
                message: `No ${assignedToType.toLowerCase()} found for selected assignment`,
            });
        }
        // Validate due date is in the future
        if (new Date(dueDate) <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Due date must be in the future',
            });
        }
        // Create task
        const task = new Task({
            title,
            description,
            assignedBy,
            assignedTo: assigneeRecords.map((assignee) => assignee._id),
            assignedToType,
            assignmentScope: assignToAll ? 'All' : 'Selected',
            roleFilter,
            dueDate,
            priority: priority || 'Medium',
            tags: tags || [],
            estimatedHours: estimatedHours || 0,
        });
        await task.save();
        const recipientEmails = assigneeRecords
            .map((assignee) => assignee.email)
            .filter(Boolean);
        const assigner = await User.findById(assignedBy).select('name email');
        await createNotificationsForRecipients({
            recipientEmails,
            title: 'New Task Assigned',
            message: `You have a new task: ${title}`,
            type: 'Task',
            entityType: 'Task',
            entityId: task._id,
            createdBy: assignedBy,
            expiresAt: new Date(dueDate),
        });
        await sendTaskAssignedEmails({
            recipientEmails,
            taskTitle: title,
            dueDate: new Date(dueDate),
            assignedByName: assigner?.name || 'Admin',
        });
        console.log(`✓ Task created: ${task._id} - Assigned to ${assigneeRecords.length} ${assignedToType}(s) [${assignToAll ? 'All' : 'Selected'}]`);
        res.status(201).json({
            success: true,
            message: `Task assigned successfully to ${assigneeRecords.length} ${assignedToType.toLowerCase()}(s)`,
            data: task,
        });
    }
    catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create task',
            error: error.message,
        });
    }
};
/**
 * Get all tasks for a specific student or intern
 */
export const getTasksByAssignee = async (req, res) => {
    try {
        const userRole = req.user?.role;
        const userEmail = req.user?.email;
        let { assigneeId, assigneeType } = req.query;
        if (!userRole || !userEmail) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        // Automatically resolve ID for Roles using their authenticated email
        if (['Student', 'Intern', 'Employee'].includes(userRole)) {
            assigneeType = userRole;
            let profile;
            if (userRole === 'Student') {
                profile = await Student.findOne({ email: userEmail });
            }
            else if (userRole === 'Intern') {
                profile = await Intern.findOne({ email: userEmail });
            }
            else if (userRole === 'Employee') {
                profile = await Employee.findOne({ email: userEmail });
            }
            if (!profile) {
                // Safe fallback if student/intern/employee object not constructed yet
                return res.json({ success: true, count: 0, data: [] });
            }
            assigneeId = profile._id.toString();
        }
        else {
            // Admin must pass the query parameter explicitly
            if (!assigneeId || !assigneeType) {
                return res.status(400).json({
                    success: false,
                    message: 'assigneeId and assigneeType query parameters are required',
                });
            }
        }
        const query = { assignedTo: assigneeId, assignedToType: assigneeType };
        const tasks = await Task.find(query)
            .populate('assignedBy', 'name email')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            count: tasks.length,
            data: tasks,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks',
            error: error.message,
        });
    }
};
/**
 * Get all tasks created by admin (filter by status, priority, etc.)
 */
export const getAllTasks = async (req, res) => {
    try {
        const { status, priority, assignedToType } = req.query;
        const query = {};
        if (status)
            query.status = status;
        if (priority)
            query.priority = priority;
        if (assignedToType)
            query.assignedToType = assignedToType;
        const tasks = await Task.find(query)
            .populate('assignedBy', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            count: tasks.length,
            data: tasks,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks',
            error: error.message,
        });
    }
};
/**
 * Get task by ID
 */
export const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id)
            .populate('assignedBy', 'name email')
            .populate('assignedTo', 'name email');
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }
        res.json({
            success: true,
            data: task,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch task',
            error: error.message,
        });
    }
};
/**
 * Update task details
 */
export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        // Validate priority if provided
        if (updateData.priority && !['Low', 'Medium', 'High', 'Urgent'].includes(updateData.priority)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid priority value',
            });
        }
        // Validate status if provided
        if (updateData.status && !['Pending', 'In Progress', 'Submitted', 'Completed', 'On Hold', 'Cancelled'].includes(updateData.status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value',
            });
        }
        // Update completed date if status changed to Completed
        if (updateData.status === 'Completed') {
            updateData.completedAt = new Date();
        }
        const task = await Task.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }
        console.log(`✓ Task updated: ${id}`);
        res.json({
            success: true,
            message: 'Task updated successfully',
            data: task,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update task',
            error: error.message,
        });
    }
};
/**
 * Update task status
 */
export const updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required',
            });
        }
        if (!['Pending', 'In Progress', 'Submitted', 'Completed', 'On Hold', 'Cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value',
            });
        }
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }
        task.taskSolutions = task.taskSolutions ?? [];
        // Role-based status enforcement
        // Only assigner (Admin/Employee who created it) can mark as Completed
        if (status === 'Completed') {
            if (userRole !== 'Admin' && task.assignedBy.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Only the assigner can verify and make it completed. Please submit the solution first.',
                });
            }
            task.completedAt = new Date();
            if (!task.taskSolutions || task.taskSolutions.length === 0) {
                task.taskSolutions = [
                    {
                        assigneeId: userId,
                        submittedAt: new Date(),
                        status: 'Submitted',
                    },
                ];
            }
        }
        if (status === 'Submitted') {
            const alreadySubmitted = task.taskSolutions?.some((solution) => solution.assigneeId?.toString() === userId);
            if (!alreadySubmitted) {
                task.taskSolutions.push({
                    assigneeId: userId,
                    submittedAt: new Date(),
                    status: 'Submitted',
                });
            }
        }
        task.status = status;
        const updatedTask = await task.save();
        res.json({
            success: true,
            message: `Task status updated to ${status}`,
            data: updatedTask,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update task status',
            error: error.message,
        });
    }
};
/**
 * Delete task
 */
export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findByIdAndDelete(id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }
        console.log(`✓ Task deleted: ${id}`);
        res.json({
            success: true,
            message: 'Task deleted successfully',
            data: task,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete task',
            error: error.message,
        });
    }
};
/**
 * Get task statistics
 */
export const getTaskStatistics = async (req, res) => {
    try {
        const totalTasks = await Task.countDocuments();
        const pendingTasks = await Task.countDocuments({ status: 'Pending' });
        const inProgressTasks = await Task.countDocuments({ status: 'In Progress' });
        const completedTasks = await Task.countDocuments({ status: 'Completed' });
        const overdueTasks = await Task.countDocuments({
            dueDate: { $lt: new Date() },
            status: { $ne: 'Completed' },
        });
        res.json({
            success: true,
            data: {
                totalTasks,
                pendingTasks,
                inProgressTasks,
                completedTasks,
                overdueTasks,
                completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message,
        });
    }
};
/**
 * Submit task solution (by assignee: Student, Intern, or Employee)
 * Changes status to 'Submitted' and saves the solution content
 */
export const submitTaskSolution = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, attachments = [] } = req.body;
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Solution content is required',
            });
        }
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        task.taskSolutions = task.taskSolutions ?? [];
        const allowedRoles = ['Student', 'Intern', 'Employee'];
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Only the task assignee can submit a solution.',
            });
        }
        if (task.status === 'Cancelled') {
            return res.status(400).json({
                success: false,
                message: `Task is already ${task.status}. Cannot submit.`,
            });
        }
        const profileModel = getModelByAssigneeType(userRole);
        const assigneeProfile = await profileModel.findOne({ email: req.user?.email }).select('_id');
        if (!assigneeProfile) {
            return res.status(404).json({ success: false, message: 'Assignee profile not found' });
        }
        const assigneeId = assigneeProfile._id.toString();
        const isAssignee = task.assignedTo.some((id) => id.toString() === assigneeId);
        if (!isAssignee) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this task.',
            });
        }
        const existingIndex = task.taskSolutions.findIndex((solution) => solution.assigneeId?.toString() === assigneeId);
        const submissionPayload = {
            assigneeId,
            submittedAt: new Date(),
            content: content.trim(),
            attachments: Array.isArray(attachments)
                ? attachments.map((attachment) => ({
                    fileName: attachment.fileName,
                    fileUrl: attachment.fileUrl,
                }))
                : [],
            status: 'Submitted',
            feedback: '',
            reviewedBy: null,
            reviewedAt: null,
        };
        if (existingIndex >= 0) {
            task.taskSolutions[existingIndex] = submissionPayload;
        }
        else {
            task.taskSolutions.push(submissionPayload);
        }
        task.status = 'Submitted';
        await task.save();
        const assigner = await User.findById(task.assignedBy).select('email');
        if (assigner?.email) {
            await createNotificationsForRecipients({
                recipientEmails: [assigner.email],
                title: 'Task Submitted',
                message: `A submission was received for task "${task.title}".`,
                type: 'Task',
                entityType: 'Task',
                entityId: task._id,
                expiresAt: new Date(task.dueDate),
            });
        }
        console.log(`✓ Task solution submitted: ${id} by user ${userId}`);
        res.json({
            success: true,
            message: 'Solution submitted successfully. Status changed to Submitted.',
            data: task,
        });
    }
    catch (error) {
        console.error('Error submitting task solution:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit solution',
            error: error.message,
        });
    }
};
/**
 * Review a specific assignee submission
 * Accessible by Admin and Employee
 */
export const reviewTaskSolution = async (req, res) => {
    try {
        const { id } = req.params;
        const { assigneeId, feedback = '' } = req.body;
        const reviewerId = req.user?.id;
        const reviewerRole = req.user?.role;
        if (!['Admin', 'Employee'].includes(reviewerRole)) {
            return res.status(403).json({ success: false, message: 'Only Admin/Employee can review submissions' });
        }
        if (!assigneeId) {
            return res.status(400).json({ success: false, message: 'assigneeId is required' });
        }
        const task = await Task.findById(id);
        if (!task)
            return res.status(404).json({ success: false, message: 'Task not found' });
        task.taskSolutions = task.taskSolutions ?? [];
        const solution = task.taskSolutions.find((entry) => entry.assigneeId?.toString() === assigneeId);
        if (!solution) {
            return res.status(404).json({ success: false, message: 'Submission not found for this assignee' });
        }
        solution.status = 'Reviewed';
        solution.feedback = feedback;
        solution.reviewedBy = reviewerId;
        solution.reviewedAt = new Date();
        await task.save();
        return res.json({
            success: true,
            message: 'Submission reviewed successfully',
            data: solution,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to review submission',
            error: error.message,
        });
    }
};
/**
 * Get tasks assigned BY the current user (Employee "Assigned Tasks" page)
 */
export const getTasksAssignedByUser = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const { status, priority, assignedToType } = req.query;
        const query = { assignedBy: userId };
        if (status)
            query.status = status;
        if (priority)
            query.priority = priority;
        if (assignedToType)
            query.assignedToType = assignedToType;
        const tasks = await Task.find(query)
            .populate('assignedBy', 'name email role')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            count: tasks.length,
            data: tasks,
        });
    }
    catch (error) {
        console.error('Error fetching tasks assigned by user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch assigned tasks',
            error: error.message,
        });
    }
};
