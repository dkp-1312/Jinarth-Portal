import { Router } from 'express';
import { login, register, getCurrentUser, logout } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
const router = Router();
/**
 * Public Routes
 */
// Login endpoint
router.post('/login', login);
// Register endpoint (for testing - should be restricted in production)
router.post('/register', register);
/**
 * Protected Routes (require authentication)
 */
// Get current logged-in user
router.get('/me', authenticate, getCurrentUser);
// Logout
router.post('/logout', authenticate, logout);
export default router;
