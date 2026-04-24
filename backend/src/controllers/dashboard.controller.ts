import { Request, Response } from 'express';
import User from '../models/User/index.js';
import Task from '../models/Task/index.js';
import Leave from '../models/Leave/index.js';
import Student from '../models/Student/index.js';
import Intern from '../models/Intern/index.js';
import Employee from '../models/Employee/index.js';

/**
 * Get dashboard stats
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalInterns = await User.countDocuments({ role: 'Intern' });
    const totalStudents = await User.countDocuments({ role: 'Student' });
    
    // Active Tasks (not completed/cancelled)
    const activeTasks = await Task.countDocuments({ status: { $in: ['Pending', 'In Progress'] } });
    
    const pendingApprovals = await Leave.countDocuments({ status: 'Pending' });

    // Additional fields needed by frontend
    const completedTasks = await Task.countDocuments({ status: 'Completed' });
    const pendingLeaves = pendingApprovals; // Use the same value
    
    // avgCompletion
    const totalTasksForCompletion = await Task.countDocuments({ status: { $nin: ['Cancelled'] } });
    const avgCompletion = totalTasksForCompletion > 0 ? Math.round((completedTasks / totalTasksForCompletion) * 100) : 0;
    
    const teamMembers = await User.countDocuments();

    // recentActivity (mocked from Tasks)
    const recentTasks = await Task.find().sort({ createdAt: -1 }).limit(5);
    const recentActivity = recentTasks.map(task => ({
      title: `Task: ${task.title}`,
      description: task.description ? task.description.substring(0, 50) + '...' : '',
      time: task.createdAt instanceof Date ? task.createdAt.toLocaleDateString() : ''
    }));

    const stats = {
      totalInterns,
      totalStudents,
      activeTasks,
      pendingApprovals,
      completedTasks,
      pendingLeaves,
      avgCompletion,
      teamMembers,
      recentActivity
    };
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
    });
  }
};

/**
 * Get analytics data
 */
export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'Completed' });
    const taskSuccessRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Avg tasks per day (roughly last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const tasksLast30Days = await Task.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const uniqueAssigneesCount = await Task.distinct('assignedTo').then(res => res.length);
    // Rough calc for average
    const avgTasksPerDay = uniqueAssigneesCount > 0 ? Math.round((tasksLast30Days / 30) / uniqueAssigneesCount) || 1 : 0;

    const activeUsers = await User.countDocuments({ status: 'Active' });

    const userGrowthApril = await totalInternsAndStudents();
    
    // Real dynamic counts where possible, mocked where schema doesn't support easily yet
    const analytics = {
      taskSuccessRate,
      avgTasksPerDay,
      activeUsers,
      avgResponseTime: 24, // mocked (hours)
      departmentPerformance: [
        { name: 'Engineering', percentage: 85 },
        { name: 'Marketing', percentage: 72 },
        { name: 'Design', percentage: 90 },
      ],
      platformUsage: 82, // mapped percentages
      userRetention: 95,
      moduleAdoption: 68,
      avgSessionDuration: 45, // mins
      userGrowth: [
        { month: 'Jan', value: 30 },
        { month: 'Feb', value: 45 },
        { month: 'Mar', value: 60 },
        { month: 'Apr', value: userGrowthApril || 80 },
      ]
    };
    
    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
    });
  }
};

// Helper for total users roughly
async function totalInternsAndStudents() {
   try {
     return await User.countDocuments({ role: { $in: ['Intern', 'Student'] } });
   } catch (e) {
     return 80;
   }
}

/**
 * Get reports
 */
export const getDashboardReports = async (req: Request, res: Response) => {
  try {
    // Return dummy reports data for now
    const reports = {
      availableReports: 12,
      generatedThisMonth: 5,
      lastGenerated: new Date(),
    };
    
    res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
    });
  }
};
/**
 * Get stats for portal users (Student, Intern, Employee)
 */
export const getPortalDashboardStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const userEmail = (req as any).user?.email;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Resolve profile ID as tasks are assigned to profile IDs
    const ROLE_MODEL_MAP: Record<string, any> = { Student, Intern, Employee };
    const model = ROLE_MODEL_MAP[userRole];
    let profileId = userId;
    
    if (model) {
      const profile = await model.findOne({ email: userEmail }).select('_id');
      if (profile) {
        profileId = (profile._id as any).toString();
      }
    }

    // 1. Task Stats
    const totalTasks = await Task.countDocuments({ assignedTo: profileId });
    const pendingTasks = await Task.countDocuments({ assignedTo: profileId, status: 'Pending' });
    const completedTasks = await Task.countDocuments({ assignedTo: profileId, status: 'Completed' });
    const urgentTasks = await Task.countDocuments({ assignedTo: profileId, priority: 'Urgent', status: { $ne: 'Completed' } });

    // 2. Leave Stats
    const totalLeaves = await Leave.countDocuments({ email: userEmail });
    const pendingLeaves = await Leave.countDocuments({ email: userEmail, status: 'Pending' });
    const approvedLeaves = await Leave.countDocuments({ email: userEmail, status: 'Approved' });

    // 3. Activity (Recent Tasks)
    const recentTasks = await Task.find({ assignedTo: profileId })
      .sort({ updatedAt: -1 })
      .limit(5);

    const activity = recentTasks.map(t => ({
      title: t.title,
      status: t.status,
      time: t.updatedAt
    }));

    res.json({
      success: true,
      data: {
        tasks: { total: totalTasks, pending: pendingTasks, completed: completedTasks, urgent: urgentTasks },
        leaves: { total: totalLeaves, pending: pendingLeaves, approved: approvedLeaves },
        activity
      }
    });
  } catch (error: any) {
    console.error('Error fetching portal stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch portal stats', error: error.message });
  }
};
