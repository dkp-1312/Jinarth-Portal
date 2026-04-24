import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
/**
 * User Schema - MongoDB schema for User collection
 * Handles Admin login and user management
 */
const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false, // Don't return password by default
    },
    phone: {
        type: String,
        match: [/^(\d{10}|0\d{9,})$|^$/, 'Phone number must be 10 digits (with or without leading 0) or empty'],
    },
    role: {
        type: String,
        enum: {
            values: ['Admin', 'Intern', 'Student', 'Manager', 'Employee'],
            message: 'Invalid role',
        },
        default: 'Intern',
    },
    status: {
        type: String,
        enum: {
            values: ['Active', 'Inactive', 'Suspended'],
            message: 'Invalid status',
        },
        default: 'Active',
    },
    profileImage: {
        type: String,
    },
    department: {
        type: String,
    },
    lastLogin: {
        type: Date,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    collection: 'users',
});
/**
 * Indexes for better query performance
 */
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
/**
 * Pre-save middleware to hash password
 */
userSchema.pre('save', async function (next) {
    // Only hash if password is new or modified
    if (!this.isModified('password')) {
        next();
        return;
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
/**
 * Method to compare password with stored hash
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};
// Export the User model
const User = model('User', userSchema);
export default User;
