import { Router } from 'express';
import { createTask, getTasksByAssignee, getTasksAssignedByUser, getAllTasks, getTaskById, updateTask, updateTaskStatus, submitTaskSolution, reviewTaskSolution, deleteTask, getTaskStatistics, } from '../controllers/task.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
const router = Router();
/**
 * Protected Routes (require authentication)
 */
// Submit task solution (Assignee: Student, Intern, Employee)
router.patch('/:id/submit', authenticate, submitTaskSolution);
router.patch('/:id/review', authenticate, authorize(['Admin', 'Employee']), reviewTaskSolution);
// Create task (Admin and Employee)
router.post('/', authenticate, authorize(['Admin', 'Employee']), createTask);
// Get all tasks (Admin and Employee)
router.get('/', authenticate, authorize(['Admin', 'Employee']), getAllTasks);
// Get tasks by assignee (Admin, Employee, Student, or Intern - can see own tasks)
router.get('/assignee', authenticate, getTasksByAssignee);
// Get tasks assigned BY the current user (Employee or Admin view of tasks they created)
router.get('/assigned-by-me', authenticate, authorize(['Admin', 'Employee']), getTasksAssignedByUser);
// Get task statistics (Admin and Employee)
router.get('/stats', authenticate, authorize(['Admin', 'Employee']), getTaskStatistics);
// Get task by ID
router.get('/:id', authenticate, getTaskById);
// Update task (Admin and Employee)
router.put('/:id', authenticate, authorize(['Admin', 'Employee']), updateTask);
// Update task status (Admin, Employee, Student, or Intern)
router.patch('/:id/status', authenticate, updateTaskStatus);
// Delete task (Admin and Employee)
router.delete('/:id', authenticate, authorize(['Admin', 'Employee']), deleteTask);
export default router;
