import { Router } from 'express';
import { login, register, getCurrentUser, logout, changePassword, updateUserProfile } from '../controllers/auth.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

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

// Change Password
router.put('/change-password', authenticate, changePassword);
router.put('/update-profile', authenticate, updateUserProfile);

export default router;
