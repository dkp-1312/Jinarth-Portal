import jwt from 'jsonwebtoken';
import User from '../models/User/index.js';
const signOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d'),
};
/**
 * Login Controller - Handles admin/user login
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }
        // Find user and select password field
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log(`Login attempt for non-existent email: ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid email ',
            });
        }
        // Check if user is active
        if (user.status !== 'Active') {
            console.log(`Login attempt for inactive user: ${email} (status: ${user.status})`);
            return res.status(403).json({
                success: false,
                message: `User account is ${user.status}. Please contact administrator.`,
            });
        }
        // Compare password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            console.log(`Invalid password attempt for: ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid password',
            });
        }
        // Check if user has explicit role
        if (!['Admin', 'Student', 'Intern', 'Employee'].includes(user.role)) {
            console.log(`Login attempt by unauthorized role: ${email} (role: ${user.role})`);
            return res.status(403).json({
                success: false,
                message: 'Unauthorized role',
            });
        }
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        // Generate JWT token
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, signOptions);
        console.log(`✓ Successful login: ${email}`);
        // Return user data without password
        const userData = user.toObject();
        delete userData.password;
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: userData,
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message,
        });
    }
};
;
/**
 * Register Controller - Allows creating new admin/users
 */
export const register = async (req, res) => {
    try {
        const { name, email, password, role = 'Admin', phone } = req.body;
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required',
            });
        }
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered',
            });
        }
        // Create new user
        const user = new User({
            name,
            email,
            password,
            role,
            phone,
            status: 'Active',
        });
        await user.save();
        // Generate JWT token
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, signOptions);
        const userData = user.toObject();
        delete userData.password;
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: userData,
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message,
        });
    }
};
/**
 * Get Current User - Gets logged-in user's profile
 */
export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        const userData = user.toObject();
        delete userData.password;
        res.json({
            success: true,
            user: userData,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get user',
            error: error.message,
        });
    }
};
/**
 * Logout Controller
 */
export const logout = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: error.message,
        });
    }
};
/**
 * Change Password Controller
 */
export const changePassword = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { currentPassword, newPassword } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required',
            });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters',
            });
        }
        // Find the user with password
        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        // Check if current password is correct
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect current password',
            });
        }
        // Update password
        user.password = newPassword;
        await user.save();
        res.json({
            success: true,
            message: 'Password changed successfully',
        });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password',
            error: error.message,
        });
    }
};
