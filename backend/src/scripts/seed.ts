/**
 * Seed Script - Creates test admin users in the database
 * Run this once to set up initial admin accounts
 * Usage: npx ts-node src/scripts/seed.ts
 */

import dotenv from 'dotenv';
import { connectDB } from '../utils/db.js';
import User from '../models/User/index.js';

dotenv.config();

async function seedAdmins() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    // Check if admins already exist
    const existingAdmins = await User.countDocuments({ role: 'Admin' });

    if (existingAdmins > 0) {
      console.log(`✓ Found ${existingAdmins} existing admin(s). Skipping seed.`);
      process.exit(0);
    }

    console.log('Creating admin users...');

    // Admin 1
    const admin1 = new User({
      name: 'Admin One',
      email: 'darshan.kharva11@gmail.com',
      password: 'admin123',
      phone: '9601054584',
      role: 'Admin',
      status: 'Active',
      isEmailVerified: true,
    });

    // Admin 2
    const admin2 = new User({
      name: 'Admin Two',
      email: 'admin2@jinarth.com',
      password: 'admin123',
      phone: '9876543211',
      role: 'Admin',
      status: 'Active',
      isEmailVerified: true,
    });

    await admin1.save();
    console.log('✓ Admin 1 created: darshan.kharva11@gmail.com (password: admin123)');
    
    await admin2.save();
    console.log('✓ Admin 2 created: admin2@jinarth.com (password: admin123)');

    console.log('');
    console.log('✓ Admin users created successfully!');
    console.log('');
    console.log('Login Credentials:');
    console.log('  Admin 1: darshan.kharva11@gmail.com / admin123');
    console.log('  Admin 2: admin2@jinarth.com / admin123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedAdmins();
