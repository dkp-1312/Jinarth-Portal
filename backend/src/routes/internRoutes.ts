import { Router } from 'express';
import { 
  addIntern, 
  getAllInterns, 
  getInternById, 
  updateIntern,
  deleteIntern 
} from '../controllers/intern.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * Protected Routes (require authentication)
 */

// Add new intern (Admin only)
router.post('/', authenticate, authorize(['Admin']), addIntern);

// Get all interns (Admin and Employee)
router.get('/', authenticate, authorize(['Admin', 'Employee']), getAllInterns);

// Get intern by ID (Admin and Employee)
router.get('/:id', authenticate, authorize(['Admin', 'Employee']), getInternById);

// Update intern (Admin only)
router.put('/:id', authenticate, authorize(['Admin']), updateIntern);

// Delete intern (Admin only)
router.delete('/:id', authenticate, authorize(['Admin']), deleteIntern);

export default router;
