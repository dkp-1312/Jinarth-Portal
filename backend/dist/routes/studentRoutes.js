import { Router } from 'express';
import { addStudent, getAllStudents, getStudentById, updateStudent, deleteStudent } from '../controllers/student.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
const router = Router();
/**
 * Protected Routes (require authentication)
 */
// Add new student (Admin only)
router.post('/', authenticate, authorize(['Admin']), addStudent);
// Get all students (Admin and Employee)
router.get('/', authenticate, authorize(['Admin', 'Employee']), getAllStudents);
// Get student by ID (Admin and Employee)
router.get('/:id', authenticate, authorize(['Admin', 'Employee']), getStudentById);
// Update student (Admin only)
router.put('/:id', authenticate, authorize(['Admin']), updateStudent);
// Delete student (Admin only)
router.delete('/:id', authenticate, authorize(['Admin']), deleteStudent);
export default router;
