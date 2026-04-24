import { Schema, model, Document, Types } from 'mongoose';

/**
 * Leave Interface - Defines the structure of a Leave Request document
 */
export interface ILeave extends Document {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  userId?: Types.ObjectId;
  userRole?: 'Student' | 'Intern' | 'Employee';
  contactNumber?: string;
  leaveType: 'Casual' | 'Sick' | 'Annual' | 'Maternity' | 'Paternity' | 'Unpaid';
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvalDate?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Leave Schema - MongoDB schema for Leave collection
 * Handles leave request management
 */
const leaveSchema = new Schema<ILeave>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    userRole: {
      type: String,
      enum: ['Student', 'Intern', 'Employee'],
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    leaveType: {
      type: String,
      required: [true, 'Leave type is required'],
      enum: {
        values: ['Casual', 'Sick', 'Annual', 'Maternity', 'Paternity', 'Unpaid'],
        message: 'Invalid leave type',
      },
      default: 'Casual',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    numberOfDays: {
      type: Number,
      required: [true, 'Number of days is required'],
      min: [1, 'Leave must be at least 1 day'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      minlength: [10, 'Reason must be at least 10 characters'],
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Approved', 'Rejected'],
        message: 'Invalid status',
      },
      default: 'Pending',
    },
    approvedBy: {
      type: String,
      trim: true,
    },
    approvalDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'leaves',
  }
);

/**
 * Indexes for better query performance
 */
leaveSchema.index({ email: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ startDate: 1 });
leaveSchema.index({ createdAt: -1 });

const Leave = model<ILeave>('Leave', leaveSchema);

export default Leave;
