import User from '../models/User/index.js';
import Employee from '../models/Employee/index.js';
import Intern from '../models/Intern/index.js';
import Student from '../models/Student/index.js';

/**
 * Completely removes a user and their associated role-specific profile record.
 */
export const deleteUserCompletely = async (user: any) => {
  const email = user.email;
  
  // Delete from specific role collections
  if (user.role === 'Employee') {
    await Employee.findOneAndDelete({ email });
  } else if (user.role === 'Intern') {
    await Intern.findOneAndDelete({ email });
  } else if (user.role === 'Student') {
    await Student.findOneAndDelete({ email });
  }
  
  // Delete from User collection
  await User.findByIdAndDelete(user._id);
  console.log(`[Cleanup] Successfully removed ${user.role}: ${email}`);
};

/**
 * Cleanup service to remove users who haven't changed their password within 24 hours of account creation.
 * This applies to roles: Employee, Intern, and Student.
 */
export const startCleanupJob = () => {
  // Run every hour
  const ONE_HOUR = 60 * 60 * 1000;
  
  console.log('Task: Initializing user cleanup job (24h password change policy)...');

  setInterval(async () => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Find users who:
      // 1. Have roles Employee, Intern, or Student
      // 2. Haven't changed their password
      // 3. Were created more than 24 hours ago
      const usersToDelete = await User.find({
        role: { $in: ['Employee', 'Intern', 'Student'] },
        passwordChanged: false,
        createdAt: { $lt: twentyFourHoursAgo }
      });

      if (usersToDelete.length > 0) {
        console.log(`[Cleanup] Found ${usersToDelete.length} users who failed to change their password within 24 hours. Removing...`);
        
        for (const user of usersToDelete) {
          await deleteUserCompletely(user);
        }
      }
    } catch (error) {
      console.error('[Cleanup] Error during user cleanup job:', error);
    }
  }, ONE_HOUR);
};
