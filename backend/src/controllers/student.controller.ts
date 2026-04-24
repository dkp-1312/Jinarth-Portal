import { Request, Response } from 'express';
import User from '../models/User/index.js';
import Student from '../models/Student/index.js';
import nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config();

// Email transporter configuration (Gmail SMTP)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password',
  },
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Add new Student - Creates user account and student record, sends credentials via email
 */
export const addStudent = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, course, enrollmentDate, expectedGraduationDate, gpa, academicAdvisor, address } = req.body;

    // Validate input
    if (!name || !email || !phone || !course || !enrollmentDate) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, course, and enrollment date are required',
      });
    }

    // Check if email already exists
    let existingUser = await User.findOne({ email });
    let tempPassword = '';
    
    if (existingUser) {
      // In development mode, allow reusing the email
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚠ Email already exists: ${email} (Development mode - allowing)`);
        tempPassword = existingUser.password; // Use existing password (hashed)
      } else {
        // In production, reject duplicate emails
        return res.status(400).json({
          success: false,
          message: 'Email already registered',
        });
      }
    } else {
      // Generate temporary password for new user
      tempPassword = Math.random().toString(36).slice(-10);

      // Create user account for student
      const user = new User({
        name,
        email,
        password: tempPassword,
        phone,
        role: 'Student',
        status: 'Active',
        isEmailVerified: false,
      });

      await user.save();
      console.log(`✓ User account created for student: ${email}`);
      existingUser = user;
    }

    // Check if student record already exists with this email
    let existingStudent = await Student.findOne({ email });
    
    let student;
    if (existingStudent) {
      // Update existing student record
      existingStudent.name = name;
      existingStudent.phone = phone;
      existingStudent.course = course;
      existingStudent.enrollmentDate = enrollmentDate;
      existingStudent.expectedGraduationDate = expectedGraduationDate || null;
      existingStudent.gpa = gpa || null;
      existingStudent.academicAdvisor = academicAdvisor || null;
      existingStudent.address = address || null;
      existingStudent.status = 'Active';
      await existingStudent.save();
      student = existingStudent;
      console.log(`✓ Student record updated: ${email}`);
    } else {
      // Create new student record
      student = new Student({
        name,
        email,
        phone,
        course,
        enrollmentDate,
        expectedGraduationDate: expectedGraduationDate || null,
        gpa: gpa || null,
        academicAdvisor: academicAdvisor || null,
        address: address || null,
        status: 'Active',
      });

      await student.save();
      console.log(`✓ Student record created: ${email}`);
    }

    // Send credentials email
    try {
      // For existing users in dev mode, show actual password only if it's a dev password
      const displayPassword = !existingUser.password.startsWith('$2') 
        ? existingUser.password 
        : tempPassword || 'Check email for your temporary password';
      
      console.log(`📧 Attempting to send email to: ${email}`);
      console.log(`   From: ${process.env.EMAIL_USER}`);
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@jinarthportal.com',
        to: email,
        subject: 'Welcome to Jinarth Portal - Student Dashboard Access',
        html: `
          <h2>Welcome to Jinarth Portal!</h2>
          <p>Dear ${name},</p>
          <p>Your student account has been created successfully. Here are your login credentials:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${displayPassword}</p>
            <p><strong>Login URL:</strong> <a href="http://localhost:3000/login">http://localhost:3000/login</a></p>
          </div>
          <p><strong>Important:</strong> You must change your password within 24 hours of account creation. Failure to do so will result in your account being automatically removed.</p>
          <p>If you have any questions, please contact the academic advisor or administration office.</p>
          <p>Best regards,<br/>Jinarth Infotech Team</p>
        `,
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log(`✓ Email sent successfully to ${email}`);
      console.log(`  Message ID: ${info.messageId}`);
    } catch (emailError: any) {
      console.error(`❌ Email sending failed for ${email}:`, emailError);
      console.error(`   Error Code: ${emailError.code}`);
      console.error(`   Error Message: ${emailError.message}`);
      // Continue anyway - email is optional
    }

    // Return response with credentials
    res.status(201).json({
      success: true,
      message: 'Student added successfully. Credentials sent to email.',
      data: {
        student: {
          _id: student._id,
          name: student.name,
          email: student.email,
          phone: student.phone,
          course: student.course,
          enrollmentDate: student.enrollmentDate,
        },
        credentials: {
          email: existingUser.email,
          tempPassword: tempPassword || '(Using existing account)',
          loginUrl: 'http://localhost:3000/login',
        },
      },
    });
  } catch (error: any) {
    console.error('Error adding student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add student',
      error: error.message,
    });
  }
};

/**
 * Get all students
 */
export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const students = await Student.find({ status: 'Active' }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message,
    });
  }
};

/**
 * Get student by ID
 */
export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student',
      error: error.message,
    });
  }
};

/**
 * Update student details
 */
export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const student = await Student.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update student',
      error: error.message,
    });
  }
};

/**
 * Delete student - Removes student record and related user account
 */
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find and delete student record
    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Also delete the associated user account
    await User.findOneAndDelete({ email: student.email });
    console.log(`✓ Student deleted: ${student.email}`);

    res.json({
      success: true,
      message: 'Student deleted successfully',
      data: student,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete student',
      error: error.message,
    });
  }
};
