import nodemailer from 'nodemailer';
import Notification from '../models/Notification/index.js';
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password',
    },
    tls: {
        rejectUnauthorized: false,
    },
});
const getDefaultExpiryDate = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
export const createNotificationsForRecipients = async ({ recipientEmails, title, message, type, entityType, entityId, createdBy, expiresAt, }) => {
    const uniqueEmails = Array.from(new Set(recipientEmails
        .filter(Boolean)
        .map((email) => email.trim().toLowerCase())));
    if (!uniqueEmails.length)
        return;
    const finalExpiry = expiresAt || getDefaultExpiryDate();
    const payload = uniqueEmails.map((recipientEmail) => ({
        recipientEmail,
        title,
        message,
        type,
        entityType,
        entityId,
        createdBy,
        expiresAt: finalExpiry,
    }));
    await Notification.insertMany(payload);
};
export const sendTaskAssignedEmails = async ({ recipientEmails, taskTitle, dueDate, assignedByName, }) => {
    const uniqueEmails = Array.from(new Set(recipientEmails
        .filter(Boolean)
        .map((email) => email.trim().toLowerCase())));
    await Promise.all(uniqueEmails.map(async (email) => {
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER || 'noreply@jinarthportal.com',
                to: email,
                subject: `New Task Assigned: ${taskTitle}`,
                html: `
            <h3>New Task Assigned</h3>
            <p>You have been assigned a new task.</p>
            <p><strong>Task:</strong> ${taskTitle}</p>
            <p><strong>Assigned By:</strong> ${assignedByName}</p>
            <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
            <p>Please login to the portal to view full details.</p>
          `,
            });
        }
        catch (error) {
            console.error(`Failed to send task assignment email to ${email}:`, error.message);
        }
    }));
};
