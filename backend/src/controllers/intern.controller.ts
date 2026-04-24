import { Request, Response } from 'express';
import User from '../models/User/index.js';
import Intern from '../models/Intern/index.js';
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
 * Add new Intern - Creates user account and intern record, sends credentials via email
 */
export const addIntern = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, department, skills = [] } = req.body;

    // Validate input
    if (!name || !email || !phone || !department) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and department are required',
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

      // Create user account for intern
      const user = new User({
        name,
        email,
        password: tempPassword,
        phone,
        role: 'Intern',
        status: 'Active',
        isEmailVerified: false,
      });

      await user.save();
      console.log(`✓ User account created for intern: ${email}`);
      existingUser = user;
    }

    // Check if intern record already exists with this email
    let existingIntern = await Intern.findOne({ email });
    
    let intern;
    if (existingIntern) {
      // Update existing intern record
      existingIntern.name = name;
      existingIntern.phone = phone;
      existingIntern.department = department;
      existingIntern.skills = skills;
      existingIntern.status = 'Active';
      await existingIntern.save();
      intern = existingIntern;
      console.log(`✓ Intern record updated: ${email}`);
    } else {
      // Create new intern record
      intern = new Intern({
        name,
        email,
        phone,
        department,
        skills,
        joinDate: new Date(),
        status: 'Active',
      });

      await intern.save();
      console.log(`✓ Intern record created: ${email}`);
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
        subject: 'Welcome to Jinarth Portal - Intern Dashboard Access',
        html: `
          <h2>Welcome to Jinarth Portal!</h2>
          <p>Dear ${name},</p>
          <p>Your intern account has been created successfully. Here are your login credentials:</p>
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
      message: 'Intern added successfully. Credentials sent to email.',
      data: {
        intern: {
          _id: intern._id,
          name: intern.name,
          email: intern.email,
          phone: intern.phone,
          department: intern.department,
          joinDate: intern.joinDate,
        },
        credentials: {
          email: existingUser.email,
          tempPassword: tempPassword || '(Using existing account)',
          loginUrl: 'http://localhost:3000/login',
        },
      },
    });
  } catch (error: any) {
    console.error('Error adding intern:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add intern',
      error: error.message,
    });
  }
};

/**
 * Get all interns
 */
export const getAllInterns = async (req: Request, res: Response) => {
  try {
    const interns = await Intern.find({ status: 'Active' }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: interns.length,
      data: interns,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interns',
      error: error.message,
    });
  }
};

/**
 * Get intern by ID
 */
export const getInternById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const intern = await Intern.findById(id);

    if (!intern) {
      return res.status(404).json({
        success: false,
        message: 'Intern not found',
      });
    }

    res.json({
      success: true,
      data: intern,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch intern',
      error: error.message,
    });
  }
};

/**
 * Update intern details
 */
export const updateIntern = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const intern = await Intern.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!intern) {
      return res.status(404).json({
        success: false,
        message: 'Intern not found',
      });
    }

    res.json({
      success: true,
      message: 'Intern updated successfully',
      data: intern,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update intern',
      error: error.message,
    });
  }
};

/**
 * Delete intern - Removes intern record and related user account
 */
export const deleteIntern = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find and delete intern record
    const intern = await Intern.findByIdAndDelete(id);

    if (!intern) {
      return res.status(404).json({
        success: false,
        message: 'Intern not found',
      });
    }

    // Also delete the associated user account
    await User.findOneAndDelete({ email: intern.email });
    console.log(`✓ Intern deleted: ${intern.email}`);

    res.json({
      success: true,
      message: 'Intern deleted successfully',
      data: intern,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete intern',
      error: error.message,
    });
  }
};
