import mongoose, { Schema } from 'mongoose';
const StudentSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Phone is required'],
        validate: {
            validator: function (value) {
                return /^(\d{10}|0\d{9,})$|^$/.test(value);
            },
            message: 'Phone number must be valid (10+ digits)',
        },
    },
    course: {
        type: String,
        required: [true, 'Course is required'],
        enum: [
            'Computer Science',
            'Information Technology',
            'Electronics',
            'Mechanical Engineering',
            'Civil Engineering',
            'Electrical Engineering',
            'Chemical Engineering',
            'Data Science',
            'Artificial Intelligence',
            'Cybersecurity',
            'Business Administration',
            'Finance',
            'Marketing',
            'Human Resources',
            'Law',
            'Medicine',
            'Nursing',
            'Architecture',
            'Design',
            'Other',
        ],
    },
    enrollmentDate: {
        type: Date,
        required: [true, 'Enrollment date is required'],
    },
    expectedGraduationDate: {
        type: Date,
        default: null,
    },
    gpa: {
        type: Number,
        min: 0,
        max: 4.0,
        default: null,
    },
    academicAdvisor: {
        type: String,
        default: null,
    },
    address: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Graduated', 'Suspended'],
        default: 'Active',
    },
}, {
    timestamps: true,
});
const Student = mongoose.model('Student', StudentSchema);
export default Student;
