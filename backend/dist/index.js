import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './utils/db.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import internRoutes from './routes/internRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
dotenv.config();
// Connect to Database
connectDB();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes
import employeeRoutes from './routes/employeeRoutes.js';
import calendarWfhRoutes from './routes/calendarWfhRoutes.js';
app.use('/api/employees', employeeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/interns', internRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/calendar-wfh', calendarWfhRoutes);
app.use('/api/notifications', notificationRoutes);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});
app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on Port ${process.env.PORT || 5000}`);
});
