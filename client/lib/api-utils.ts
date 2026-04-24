/**
 * API Utility Functions for Task Assignment
 * Centralized API calls for students and interns
 */

export interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  status: string;
  enrollmentDate: string;
  gpa?: number;
}

export interface Intern {
  _id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  status: string;
  joinDate: string;
  skills?: string;
}

export interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  status: string;
  joinDate: string;
}

export interface Assignee {
  id: string;
  name: string;
  email: string;
  type: 'Student' | 'Intern' | 'Employee';
  phone: string;
  details: string; // course for student, department for intern
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Check if backend API is available
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.warn('Backend health check failed:', error);
    return false;
  }
}

/**
 * Get all active students
 */
export async function getAllStudents(token: string): Promise<Student[]> {
  try {
    const backendUrl = `${API_BASE_URL}/api/students`;
    console.log(`📡 Fetching students from: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `HTTP ${response.status}: ${errorData.message || 'Failed to fetch students'}\n` +
        `URL: ${backendUrl}\n` +
        `Make sure backend server is running on ${API_BASE_URL}`
      );
    }

    const { data } = await response.json();
    console.log(`✓ Successfully fetched ${data?.length || 0} students`);
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching students:', error);
    throw error;
  }
}

/**
 * Get all active interns
 */
export async function getAllInterns(token: string): Promise<Intern[]> {
  try {
    const backendUrl = `${API_BASE_URL}/api/interns`;
    console.log(`📡 Fetching interns from: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `HTTP ${response.status}: ${errorData.message || 'Failed to fetch interns'}\n` +
        `URL: ${backendUrl}\n` +
        `Make sure backend server is running on ${API_BASE_URL}`
      );
    }

    const { data } = await response.json();
    console.log(`✓ Successfully fetched ${data?.length || 0} interns`);
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching interns:', error);
    throw error;
  }
}

/**
 * Get all active employees
 */
export async function getAllEmployees(token: string): Promise<Employee[]> {
  try {
    const backendUrl = `${API_BASE_URL}/api/employees`;
    console.log(`📡 Fetching employees from: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `HTTP ${response.status}: ${errorData.message || 'Failed to fetch employees'}\n` +
        `URL: ${backendUrl}\n`
      );
    }

    const { data } = await response.json();
    console.log(`✓ Successfully fetched ${data?.length || 0} employees`);
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching employees:', error);
    throw error;
  }
}

/**
 * Get all students and interns combined
 */
export async function getAllAssignees(token: string): Promise<Assignee[]> {
  try {
    // Check backend health first
    const isHealthy = await checkBackendHealth();
    if (!isHealthy) {
      throw new Error(
        `❌ Backend server is not accessible at ${API_BASE_URL}\n\n` +
        `To fix this:\n` +
        `1. Make sure the backend server is running\n` +
        `2. Run: cd backend && npm run dev\n` +
        `3. Check that port 5000 is not blocked\n` +
        `4. Verify NEXT_PUBLIC_API_URL environment variable if needed`
      );
    }

    console.log('📡 Fetching all assignees...');
    const [students, interns, employees] = await Promise.all([
      getAllStudents(token),
      getAllInterns(token),
      getAllEmployees(token).catch(() => []), // gracefully handle if employee API isn't fully robust yet
    ]);

    const assignees: Assignee[] = [
      ...students.map((s: Student) => ({
        id: s._id,
        name: s.name,
        email: s.email,
        type: 'Student' as const,
        phone: s.phone,
        details: s.course,
      })),
      ...interns.map((i: Intern) => ({
        id: i._id,
        name: i.name,
        email: i.email,
        type: 'Intern' as const,
        phone: i.phone,
        details: i.department,
      })),
      ...employees.map((e: Employee) => ({
        id: e._id,
        name: e.name,
        email: e.email,
        type: 'Employee' as const,
        phone: e.phone,
        details: e.designation,
      })),
    ];

    console.log(`✓ Fetched ${assignees.length} total assignees (${students.length} students + ${interns.length} interns + ${employees.length} employees)`);
    return assignees;
  } catch (error) {
    console.error('Error fetching assignees:', error);
    throw error;
  }
}

/**
 * Get students only
 */
export async function getStudentAssignees(
  token: string
): Promise<Assignee[]> {
  try {
    const students = await getAllStudents(token);
    return students.map((s: Student) => ({
      id: s._id,
      name: s.name,
      email: s.email,
      type: 'Student' as const,
      phone: s.phone,
      details: s.course,
    }));
  } catch (error) {
    console.error('Error fetching student assignees:', error);
    throw error;
  }
}

/**
 * Get interns only
 */
export async function getInternAssignees(
  token: string
): Promise<Assignee[]> {
  try {
    const interns = await getAllInterns(token);
    return interns.map((i: Intern) => ({
      id: i._id,
      name: i.name,
      email: i.email,
      type: 'Intern' as const,
      phone: i.phone,
      details: i.department,
    }));
  } catch (error) {
    console.error('Error fetching intern assignees:', error);
    throw error;
  }
}

/**
 * Get assignees by type
 */
export async function getAssigneesByType(
  token: string,
  type: 'Student' | 'Intern' | 'Employee'
): Promise<Assignee[]> {
  if (type === 'Student') {
    return getStudentAssignees(token);
  } else if (type === 'Intern') {
    return getInternAssignees(token);
  } else {
    // Return employees (helper not defined individually above, but can be derived)
    const employees = await getAllEmployees(token);
    return employees.map((e: Employee) => ({
      id: e._id,
      name: e.name,
      email: e.email,
      type: 'Employee' as const,
      phone: e.phone,
      details: e.designation,
    }));
  }
}

/**
 * Search assignees by name or email
 */
export function searchAssignees(
  assignees: Assignee[],
  query: string,
  type?: 'Student' | 'Intern' | 'Employee'
): Assignee[] {
  let filtered = assignees;

  if (type) {
    filtered = filtered.filter((a) => a.type === type);
  }

  if (!query.trim()) {
    return filtered;
  }

  const lowerQuery = query.toLowerCase();
  return filtered.filter(
    (a) =>
      a.name.toLowerCase().includes(lowerQuery) ||
      a.email.toLowerCase().includes(lowerQuery)
  );
}
