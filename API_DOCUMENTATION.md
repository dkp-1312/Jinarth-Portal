# Task Management API Documentation

## Overview
The Jinarth Portal provides API endpoints for managing students, interns, and task assignments. These endpoints enable admins to fetch lists of students and interns for task assignment purposes.

## API Endpoints

### 1. Get All Students
**Endpoint:** `GET /api/students`

**Authentication:** Required (Bearer Token)
**Authorization:** Admin only

**Description:** Retrieves all active students from the system.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "course": "Computer Science",
      "status": "Active",
      "enrollmentDate": "2024-01-15",
      "expectedGraduationDate": "2028-01-15",
      "gpa": 3.8,
      "academicAdvisor": "Dr. Smith",
      "address": "123 Main St",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    },
    // ... more students
  ]
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

---

### 2. Get All Interns
**Endpoint:** `GET /api/interns`

**Authentication:** Required (Bearer Token)
**Authorization:** Admin only

**Description:** Retrieves all active interns from the system.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "9876543211",
      "department": "Engineering",
      "status": "Active",
      "joinDate": "2024-06-01",
      "skills": "JavaScript, React, Node.js",
      "createdAt": "2024-06-01T10:00:00Z",
      "updatedAt": "2024-06-01T10:00:00Z"
    },
    // ... more interns
  ]
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

---

### 3. Get Student by ID
**Endpoint:** `GET /api/students/:id`

**Authentication:** Required (Bearer Token)
**Authorization:** Admin only

**Description:** Retrieves a specific student by their ID.

**Request Parameters:**
- `id` (string, required): Student MongoDB ObjectId

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "course": "Computer Science",
    "status": "Active",
    "enrollmentDate": "2024-01-15",
    "expectedGraduationDate": "2028-01-15",
    "gpa": 3.8,
    "academicAdvisor": "Dr. Smith",
    "address": "123 Main St",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Student not found"
}
```

---

### 4. Get Intern by ID
**Endpoint:** `GET /api/interns/:id`

**Authentication:** Required (Bearer Token)
**Authorization:** Admin only

**Description:** Retrieves a specific intern by their ID.

**Request Parameters:**
- `id` (string, required): Intern MongoDB ObjectId

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "9876543211",
    "department": "Engineering",
    "status": "Active",
    "joinDate": "2024-06-01",
    "skills": "JavaScript, React, Node.js",
    "createdAt": "2024-06-01T10:00:00Z",
    "updatedAt": "2024-06-01T10:00:00Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Intern not found"
}
```

---

## Frontend API Utilities

### Using the API Utility Functions

Located at: `@/lib/api-utils.ts`

#### 1. Get All Assignees (Students + Interns)
```typescript
import { getAllAssignees } from '@/lib/api-utils';

const token = localStorage.getItem('token');
const assignees = await getAllAssignees(token);
```

#### 2. Get Students Only
```typescript
import { getAllStudents, getStudentAssignees } from '@/lib/api-utils';

const token = localStorage.getItem('token');

// Option 1: Raw student data
const students = await getAllStudents(token);

// Option 2: Formatted as Assignee objects
const studentAssignees = await getStudentAssignees(token);
```

#### 3. Get Interns Only
```typescript
import { getAllInterns, getInternAssignees } from '@/lib/api-utils';

const token = localStorage.getItem('token');

// Option 1: Raw intern data
const interns = await getAllInterns(token);

// Option 2: Formatted as Assignee objects
const internAssignees = await getInternAssignees(token);
```

#### 4. Get Assignees by Type
```typescript
import { getAssigneesByType } from '@/lib/api-utils';

const token = localStorage.getItem('token');

// Get students
const students = await getAssigneesByType(token, 'Student');

// Get interns
const interns = await getAssigneesByType(token, 'Intern');
```

#### 5. Search Assignees
```typescript
import { searchAssignees } from '@/lib/api-utils';

const results = searchAssignees(assignees, 'john', 'Student');
// Returns: Assignee[] matching "john" in Student type
```

---

## Example Usage in Task Assignment

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getAllAssignees, type Assignee } from '@/lib/api-utils';

export default function CreateTaskPage() {
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    getAllAssignees(token)
      .then(setAssignees)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  const students = assignees.filter(a => a.type === 'Student');
  const interns = assignees.filter(a => a.type === 'Intern');

  return (
    <div>
      <h2>Assign Task</h2>
      <select>
        <option>Select Assignee</option>
        {students.length > 0 && (
          <optgroup label={`Students (${students.length})`}>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} - {s.details}
              </option>
            ))}
          </optgroup>
        )}
        {interns.length > 0 && (
          <optgroup label={`Interns (${interns.length})`}>
            {interns.map(i => (
              <option key={i.id} value={i.id}>
                {i.name} - {i.details}
              </option>
            ))}
          </optgroup>
        )}
      </select>
    </div>
  );
}
```

---

## Error Handling

All API endpoints follow consistent error handling:

**Authentication Error (401):**
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

**Authorization Error (403):**
```json
{
  "success": false,
  "message": "Forbidden: Admin access required"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "message": "Failed to fetch [resource]",
  "error": "error details"
}
```

---

## Response Types

### Assignee Object (Frontend)
```typescript
interface Assignee {
  id: string;              // Student/Intern MongoDB ID
  name: string;            // Full name
  email: string;           // Email address
  type: 'Student' | 'Intern';  // Type
  phone: string;           // Phone number
  details: string;         // Course (for Student) or Department (for Intern)
}
```

### Student Object (Backend)
```typescript
interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  status: 'Active' | 'Inactive' | 'Graduated' | 'Suspended';
  enrollmentDate: Date;
  expectedGraduationDate?: Date;
  gpa?: number;
  academicAdvisor?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Intern Object (Backend)
```typescript
interface Intern {
  _id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  status: 'Active' | 'Inactive' | 'Completed';
  joinDate: Date;
  skills?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Caching Considerations

For production use, consider implementing caching:

```typescript
// Example with React Query
import { useQuery } from '@tanstack/react-query';
import { getAllAssignees } from '@/lib/api-utils';

export function useAssignees() {
  const token = localStorage.getItem('token');
  
  return useQuery({
    queryKey: ['assignees'],
    queryFn: () => getAllAssignees(token),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting middleware for production endpoints.

---

## Pagination (Future Enhancement)

Current endpoints return all records. For large datasets, consider adding pagination:

```
GET /api/students?page=1&limit=20
GET /api/interns?page=1&limit=20
```
