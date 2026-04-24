import { Schema, model } from 'mongoose';
/**
 * Employee Schema - MongoDB schema for Employee collection
 */
const employeeSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Employee name is required'],
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
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^(\d{10}|0\d{9,})$/, 'Phone number must be 10 digits'],
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
    },
    designation: {
        type: String,
        required: [true, 'Designation is required'],
    },
    joinDate: {
        type: Date,
        required: [true, 'Join date is required'],
        default: Date.now,
    },
    status: {
        type: String,
        enum: {
            values: ['Active', 'On Leave', 'Inactive'],
            message: 'Invalid status',
        },
        default: 'Active',
    },
    tasksCreated: {
        type: Number,
        default: 0,
        min: 0,
    },
    tasksCompleted: {
        type: Number,
        default: 0,
        min: 0,
    },
    address: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
    collection: 'employees',
});
/**
 * Indexes
 */
employeeSchema.index({ email: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });
const Employee = model('Employee', employeeSchema);
export default Employee;
