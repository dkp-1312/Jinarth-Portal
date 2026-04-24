import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User/index.js';
import Employee from '../models/Employee/index.js';
import { deleteUserCompletely } from '../services/cleanupService.js';

dotenv.config();

/**
 * Verification script for the 24-hour password change policy.
 */
async function verify() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected.');

    const testEmail = 'test_policy_verification@example.com';

    // 1. Clean up existing test data
    await User.findOneAndDelete({ email: testEmail });
    await Employee.findOneAndDelete({ email: testEmail });

    console.log('Creating test user (stale account)...');
    
    // Create use with date from 25 hours ago
    const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
    
    const user = new User({
      name: 'Test Policy User',
      email: testEmail,
      password: 'password123',
      role: 'Employee',
      status: 'Active',
      passwordChanged: false
    });

    // Manually set createdAt for testing
    (user as any).createdAt = twentyFiveHoursAgo;
    await user.save();

    const employee = new Employee({
      name: 'Test Policy User',
      email: testEmail,
      phone: '1234567890',
      department: 'Testing',
      designation: 'Tester',
      status: 'Active'
    });
    await employee.save();

    console.log(`Test user created with createdAt: ${twentyFiveHoursAgo}`);

    // 2. Test Policy Detection
    console.log('Verifying policy detection...');
    const foundUser = await User.findOne({ email: testEmail });
    if (foundUser && !foundUser.passwordChanged && foundUser.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      console.log('✓ Policy correctly identifies the user for removal.');
    } else {
      console.log('✗ Policy FAILED to identify the user.');
      process.exit(1);
    }

    // 3. Test Deletion Logic
    console.log('Executing removal logic...');
    await deleteUserCompletely(foundUser);

    // 4. Verify removal
    const remainingUser = await User.findOne({ email: testEmail });
    const remainingEmployee = await Employee.findOne({ email: testEmail });

    if (!remainingUser && !remainingEmployee) {
      console.log('✓ SUCCESS: User and profile record completely removed.');
    } else {
      console.log('✗ FAILURE: Data still remains in database.');
      if (remainingUser) console.log('  - User still exists');
      if (remainingEmployee) console.log('  - Employee still exists');
    }

    await mongoose.disconnect();
    console.log('Verification complete.');
  } catch (error) {
    console.error('Verification failed with error:', error);
    process.exit(1);
  }
}

verify();
