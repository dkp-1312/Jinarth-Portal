import { Schema, model, Document, Types } from 'mongoose';

/**
 * Task Interface - Defines the structure of a Task document
 */
export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  assignedBy: Types.ObjectId; // Admin who assigned the task
  assignedTo: Types.ObjectId[]; // Users in selected role who receive the task
  assignedToType: 'Intern' | 'Student' | 'Employee'; // Type of assignment
  assignmentScope: 'All' | 'Selected';
  roleFilter?: string;
  dueDate: Date;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Submitted' | 'Completed' | 'On Hold' | 'Cancelled';
  tags?: string[];
  estimatedHours?: number;
  attachments?: {
    fileName: string;
    fileUrl: string;
    uploadedAt: Date;
  }[];
  taskSolutions: {
    assigneeId: Types.ObjectId;
    submittedAt: Date;
    content?: string;
    attachments?: {
      fileName: string;
      fileUrl: string;
    }[];
    status: 'Submitted' | 'Reviewed';
    feedback?: string;
    reviewedBy?: Types.ObjectId;
    reviewedAt?: Date;
  }[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Task Schema - MongoDB schema for Task collection
 * Stores task assignments from admin to interns/students with tracking and submission
 */
const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigner (Admin) is required'],
    },
    assignedTo: [
      {
        type: Schema.Types.ObjectId,
        refPath: 'assignedToType',
        required: true,
      },
    ],
    assignedToType: {
      type: String,
      enum: {
        values: ['Intern', 'Student', 'Employee'],
        message: 'Assigned type must be Intern, Student, or Employee',
      },
      required: true,
    },
    assignmentScope: {
      type: String,
      enum: {
        values: ['All', 'Selected'],
        message: 'assignmentScope must be All or Selected',
      },
      default: 'Selected',
    },
    roleFilter: {
      type: String,
      trim: true,
      default: '',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      validate: {
        validator: function (v: Date) {
          return v > new Date();
        },
        message: 'Due date must be in the future',
      },
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High', 'Urgent'],
        message: 'Invalid priority level',
      },
      default: 'Medium',
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'In Progress', 'Submitted', 'Completed', 'On Hold', 'Cancelled'],
        message: 'Invalid status',
      },
      default: 'Pending',
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (v: string[]) {
          return v.length <= 10;
        },
        message: 'Tags cannot exceed 10 items',
      },
    },
    estimatedHours: {
      type: Number,
      default: 0,
      min: [0, 'Estimated hours cannot be negative'],
      max: [500, 'Estimated hours cannot exceed 500'],
    },
    attachments: {
      type: [
        {
          fileName: { type: String, required: true },
          fileUrl: { type: String, required: true },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
      validate: {
        validator: function (v: any[]) {
          return v.length <= 10;
        },
        message: 'Cannot attach more than 10 files',
      },
    },
    taskSolutions: {
      type: [
        {
          assigneeId: { type: Schema.Types.ObjectId, required: true, refPath: 'assignedToType' },
          submittedAt: { type: Date, required: true },
          content: { type: String, trim: true },
          attachments: [
            {
              fileName: { type: String, required: true },
              fileUrl: { type: String, required: true },
            },
          ],
          status: {
            type: String,
            enum: ['Submitted', 'Reviewed'],
            default: 'Submitted',
          },
          feedback: {
            type: String,
            maxlength: [2000, 'Feedback cannot exceed 2000 characters'],
          },
          reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
          reviewedAt: { type: Date },
        },
      ],
      default: [],
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'tasks',
  }
);

/**
 * Indexes for better query performance
 */
taskSchema.index({ assignedBy: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ assignedBy: 1, createdAt: -1 });

/**
 * Virtual for checking if task is overdue
 */
taskSchema.virtual('isOverdue').get(function () {
  return this.dueDate < new Date() && this.status !== 'Completed' && this.status !== 'Cancelled';
});

/**
 * Virtual for calculating days until due
 */
taskSchema.virtual('daysUntilDue').get(function () {
  const now = new Date();
  const dueDate = new Date(this.dueDate);
  const durationMs = dueDate.getTime() - now.getTime();
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
  return durationDays;
});

/**
 * Virtual for calculating time taken to complete (if completed)
 */
taskSchema.virtual('completionTime').get(function () {
  if (!this.completedAt) return null;
  const createdDate = new Date(this.createdAt);
  const completedDate = new Date(this.completedAt);
  const durationMs = completedDate.getTime() - createdDate.getTime();
  const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
  const durationHours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return {
    days: durationDays,
    hours: durationHours,
  };
});

/**
 * Pre-save middleware to validate submission before marking as completed
 */
taskSchema.pre('save', function (next) {
  if (this.status === 'Completed' && (!this.taskSolutions || this.taskSolutions.length === 0)) {
    throw new Error('Task cannot be marked as completed without at least one submission');
  }
  next();
});

// Export the Task model
const Task = model<ITask>('Task', taskSchema);

export default Task;
