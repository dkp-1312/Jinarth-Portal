import { Schema, model } from 'mongoose';
/**
 * Intern Schema - MongoDB schema for Intern collection
 * Stores information about interns including personal details, skills, and performance
 */
const internSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Intern name is required'],
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
        match: [/^(\d{10}|0\d{9,})$/, 'Phone number must be 10 digits (with or without leading 0)'],
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        enum: {
            values: [
                'Web Development',
                'Mobile Development',
                'Backend Development',
                'Frontend Development',
                'Full Stack Development',
                'UI/UX Design',
                'Graphic Design',
                'QA Testing',
                'DevOps',
                'Data Science',
                'Machine Learning',
                'Cloud Engineering',
                'Cybersecurity',
                'Database Administration',
                'System Administration',
                'Business Analysis',
                'Product Management',
                'Project Management',
                'Marketing',
                'Sales',
                'HR',
                'Finance',
                'Operations',
                'Other'
            ],
            message: 'Please select a valid department',
        },
    },
    skills: {
        type: [String],
        default: [],
        validate: {
            validator: function (v) {
                return v.length <= 10;
            },
            message: 'Skills cannot exceed 10 items',
        },
    },
    joinDate: {
        type: Date,
        required: [true, 'Join date is required'],
        default: Date.now,
    },
    mentor: {
        type: String,
        trim: true,
    },
    expectedEndDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: {
            values: ['Active', 'Completed', 'On Leave', 'Inactive'],
            message: 'Invalid status',
        },
        default: 'Active',
    },
    performanceRating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot exceed 5'],
    },
    tasksCompleted: {
        type: Number,
        default: 0,
        min: 0,
    },
    projectsAssigned: {
        type: Number,
        default: 0,
        min: 0,
    },
    certifications: {
        type: [String],
        default: [],
    },
    address: {
        type: String,
        trim: true,
    },
    emergencyContact: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
    collection: 'interns',
});
/**
 * Indexes for better query performance
 */
internSchema.index({ email: 1 });
internSchema.index({ department: 1 });
internSchema.index({ status: 1 });
internSchema.index({ joinDate: -1 });
/**
 * Virtual for calculating internship duration
 */
internSchema.virtual('internshipDuration').get(function () {
    const now = new Date();
    const joinDate = new Date(this.joinDate);
    const durationMs = now.getTime() - joinDate.getTime();
    const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
    const durationMonths = Math.floor(durationDays / 30);
    return {
        days: durationDays,
        months: durationMonths,
    };
});
// Export the Intern model
const Intern = model('Intern', internSchema);
export default Intern;
