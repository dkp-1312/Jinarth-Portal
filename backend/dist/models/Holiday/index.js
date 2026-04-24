import { Schema, model } from 'mongoose';
/**
 * Holiday Schema - MongoDB schema for Holidays collection
 */
const holidaySchema = new Schema({
    name: {
        type: String,
        required: [true, 'Holiday name is required'],
        trim: true,
        minlength: [3, 'Name must be at least 3 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    date: {
        type: Date,
        required: [true, 'Holiday date is required'],
        unique: true,
        sparse: true,
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
        default: 'India',
    },
    type: {
        type: String,
        enum: {
            values: ['National', 'Regional', 'Religious', 'Corporate', 'Other'],
            message: 'Invalid holiday type',
        },
        default: 'National',
    },
    description: {
        type: String,
        trim: true,
    },
    isOptional: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    collection: 'holidays',
});
/**
 * Indexes for better query performance
 */
holidaySchema.index({ date: 1 });
holidaySchema.index({ country: 1 });
holidaySchema.index({ type: 1 });
holidaySchema.index({ createdAt: -1 });
const Holiday = model('Holiday', holidaySchema);
export default Holiday;
