// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Interns
  INTERNS: '/api/interns',
  INTERN_PERFORMANCE: '/api/interns/performance',

  // Students
  STUDENTS: '/api/students',
  STUDENT_PROGRESS: '/api/students/progress',

  // Tasks
  TASKS: '/api/tasks',
  TASKS_STATISTICS: '/api/tasks/statistics',
  TASKS_ASSIGNED: '/api/tasks/assigned',

  // Leaves
  LEAVES: '/api/leaves',
  LEAVES_PENDING: '/api/leaves/pending',

  // Events
  EVENTS: '/api/events',

  // Holidays
  HOLIDAYS: '/api/holidays',
};

// Helper function to build full URL
export const getApiUrl = (endpoint: string) => {
  return `${API_BASE_URL}${endpoint}`;
};
