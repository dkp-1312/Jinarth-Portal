import { Request, Response } from 'express';
import Notification from '../models/Notification/index.js';

export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const email = (req as any).user?.email;
    if (!email) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const notifications = await Notification.find({
      recipientEmail: email.toLowerCase(),
      expiresAt: { $gte: new Date() },
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
    });
  }
};

export const getUnreadNotificationCount = async (req: Request, res: Response) => {
  try {
    const email = (req as any).user?.email;
    if (!email) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const count = await Notification.countDocuments({
      recipientEmail: email.toLowerCase(),
      isRead: false,
      expiresAt: { $gte: new Date() },
    });

    return res.json({ success: true, count });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch unread notification count',
      error: error.message,
    });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const email = (req as any).user?.email;
    const { id } = req.params;
    if (!email) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientEmail: email.toLowerCase() },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.json({ success: true, data: notification });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message,
    });
  }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const email = (req as any).user?.email;
    if (!email) return res.status(401).json({ success: false, message: 'Unauthorized' });

    await Notification.updateMany(
      { recipientEmail: email.toLowerCase(), isRead: false },
      { isRead: true }
    );

    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message,
    });
  }
};
