import { Router } from 'express';
import {
  addEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employee.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// Routes for employee management (Only Admin mostly, similar to intern/student)
router.post('/', authenticate, authorize(['Admin']), addEmployee);
router.get('/', authenticate, authorize(['Admin', 'Employee']), getAllEmployees);
router.get('/:id', authenticate, authorize(['Admin', 'Employee']), getEmployeeById);
router.put('/:id', authenticate, authorize(['Admin']), updateEmployee);
router.delete('/:id', authenticate, authorize(['Admin']), deleteEmployee);

export default router;
