import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  _id: Types.ObjectId;
  recipientEmail: string;
  title: string;
  message: string;
  type: 'Task' | 'Leave' | 'Holiday' | 'System';
  entityType?: 'Task' | 'Leave' | 'Holiday';
  entityId?: Types.ObjectId;
  isRead: boolean;
  expiresAt: Date;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ['Task', 'Leave', 'Holiday', 'System'],
      default: 'System',
      index: true,
    },
    entityType: {
      type: String,
      enum: ['Task', 'Leave', 'Holiday'],
    },
    entityId: {
      type: Schema.Types.ObjectId,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    collection: 'notifications',
  }
);

notificationSchema.index({ recipientEmail: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = model<INotification>('Notification', notificationSchema);

export default Notification;
