import { Request, Response } from 'express';
import User from '../models/User/index.js';
import Employee from '../models/Employee/index.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const addEmployee = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, department, designation } = req.body;

    if (!name || !email || !phone || !department || !designation) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, department, and designation are required',
      });
    }

    let existingUser = await User.findOne({ email });
    let tempPassword = '';

    if (existingUser) {
      if (process.env.NODE_ENV === 'development') {
        tempPassword = existingUser.password;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Email already registered',
        });
      }
    } else {
      tempPassword = Math.random().toString(36).slice(-10);
      const user = new User({
        name,
        email,
        password: tempPassword,
        phone,
        role: 'Employee',
        status: 'Active',
        isEmailVerified: false,
      });

      await user.save();
      existingUser = user;
    }

    let existingEmployee = await Employee.findOne({ email });
    let employee;

    if (existingEmployee) {
      existingEmployee.name = name;
      existingEmployee.phone = phone;
      existingEmployee.department = department;
      existingEmployee.designation = designation;
      existingEmployee.status = 'Active';
      await existingEmployee.save();
      employee = existingEmployee;
    } else {
      employee = new Employee({
        name,
        email,
        phone,
        department,
        designation,
        joinDate: new Date(),
        status: 'Active',
      });
      await employee.save();
    }

    try {
      const displayPassword = !existingUser.password.startsWith('$2')
        ? existingUser.password
        : tempPassword || 'Check email for your temporary password';

      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@jinarthportal.com',
        to: email,
        subject: 'Welcome to Jinarth Portal - Employee Dashboard Access',
        html: `
          <h2>Welcome to Jinarth Portal!</h2>
          <p>Dear ${name},</p>
          <p>Your employee account has been created successfully. Here are your login credentials:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${displayPassword}</p>
            <p><strong>Login URL:</strong> <a href="http://localhost:3000/login">http://localhost:3000/login</a></p>
          </div>
          <p><strong>Important:</strong> You must change your password within 24 hours of account creation. Failure to do so will result in your account being automatically removed.</p>
          <p>If you have any questions, please contact the HR department.</p>
          <p>Best regards,<br/>Jinarth Infotech Team</p>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError: any) {
      console.error('Email sending failed for employee:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Employee added successfully. Credentials sent to email.',
      data: {
        employee,
        credentials: {
          email: existingUser.email,
          tempPassword: tempPassword || '(Using existing account)',
          loginUrl: 'http://localhost:3000/login',
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to add employee',
      error: error.message,
    });
  }
};

export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await Employee.find({ status: 'Active' }).sort({ createdAt: -1 });
    res.json({ success: true, count: employees.length, data: employees });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch employees', error: error.message });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, data: employee });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch employee', error: error.message });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const employee = await Employee.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, message: 'Employee updated successfully', data: employee });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update employee', error: error.message });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByIdAndDelete(id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    await User.findOneAndDelete({ email: employee.email });
    res.json({ success: true, message: 'Employee deleted successfully', data: employee });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete employee', error: error.message });
  }
};
