import { Schema, model } from 'mongoose';
const wfhSchema = new Schema({
    date: {
        type: Date,
        required: [true, 'Date is required'],
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        default: 'Work From Home',
    },
    description: {
        type: String,
        trim: true,
    },
    applicableTo: {
        type: [String],
        enum: ['Student', 'Intern', 'Employee'],
        default: ['Student', 'Intern', 'Employee'],
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
    collection: 'workfromhome',
});
wfhSchema.index({ date: 1 });
wfhSchema.index({ applicableTo: 1 });
const WorkFromHome = model('WorkFromHome', wfhSchema);
export default WorkFromHome;
