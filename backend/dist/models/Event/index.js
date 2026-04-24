import { Schema, model } from 'mongoose';
/**
 * Event Schema - MongoDB schema for Events collection
 */
const eventSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    date: {
        type: Date,
        required: [true, 'Event date is required'],
    },
    time: {
        type: String,
        required: [true, 'Event time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format'],
    },
    description: {
        type: String,
        required: [true, 'Event description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters'],
        maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    eventType: {
        type: String,
        enum: {
            values: ['Meeting', 'Conference', 'Training', 'Workshop', 'Seminar', 'Holiday', 'Other'],
            message: 'Invalid event type',
        },
        default: 'Meeting',
    },
    location: {
        type: String,
        trim: true,
    },
    organizer: {
        type: String,
        trim: true,
    },
    attendees: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
    collection: 'events',
});
/**
 * Indexes for better query performance
 */
eventSchema.index({ date: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ createdAt: -1 });
const Event = model('Event', eventSchema);
export default Event;
