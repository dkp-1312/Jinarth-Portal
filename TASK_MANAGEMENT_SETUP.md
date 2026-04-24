# Task Management System - Setup & Usage Guide

## ✅ System Status

The complete task management system is **ready to use**. All backend APIs and frontend pages have been implemented with enhanced error handling and health checks.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Start Backend Server
```bash
cd backend
npm run dev
```

**Expected Output:**
```
Server is running on Port 5000
✓ Database connected
```

### Step 2: Start Frontend Dev Server  
```bash
cd client
npm run dev
```

**Expected Output:**
```
▲ Next.js 14.1.0
- Local: http://localhost:3000
```

### Step 3: Open Task Management
1. Go to `http://localhost:3000/login`
2. Login with admin credentials:
   - Email: `admin@jinarth.com`
   - Password: `admin123`
3. Navigate to **Task Management** in the sidebar
   - **Create Task**: `/task-management/create` - Assign tasks to students/interns
   - **View All Tasks**: `/task-management/all` - Manage existing tasks

---

## 📋 Features

### Create Task Page (`/task-management/create`)

**Features:**
- ✅ Form-based task creation
- ✅ Student/Intern toggle with counts
- ✅ Searchable assignee dropdown (up to 50 results)
- ✅ Green confirmation box for selected person
- ✅ Task details: title, description, due date, priority, tags, estimated hours
- ✅ Success confirmation modal
- ✅ Auto-redirect after 5 seconds

**How to Use:**
1. Enter task details (title, description, etc.)
2. Click "Student" or "Intern" button to select type
3. Search for person by name or email
4. Confirm selection (shows name and email in green box)
5. Set priority, due date, and other details
6. Click "Create Task"
7. Confirm creation in success modal

### View All Tasks Page (`/task-management/all`)

**Features:**
- ✅ Task statistics dashboard (Total, Pending, In Progress, Completed, Overdue)
- ✅ Filter by Status, Priority, and Type
- ✅ Complete task list table with columns:
  - Title
  - Assigned To (person's name)
  - Type (Student/Intern)
  - Priority
  - Status (with inline dropdown to change)
  - Due Date (with overdue indicator)
  - Actions (Delete, Details)
- ✅ Inline status updates via dropdown
- ✅ Delete tasks with confirmation
- ✅ Overdue task detection and visual indicators

---

## 🔧 Configuration

### Environment Variables

**Frontend** (`client/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://[credentials]@[cluster]/jinarthportal
JWT_SECRET=dash@1234
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### Next.js Configuration
The frontend is configured with API rewrites in `next.config.ts`:
- Routes `/api/*` requests to `http://localhost:5000/api/*`
- Enables seamless communication between frontend and backend in development

---

## 🧪 API Endpoints

All endpoints require Bearer token authentication and are located at:

```
Base URL: http://localhost:5000/api/tasks
```

### Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| `POST` | `/api/tasks` | Create new task | ✅ Admin |
| `GET` | `/api/tasks` | Get all tasks with filters | ✅ Admin |
| `GET` | `/api/tasks/assignee?id=X&type=Student` | Get tasks by assignee | ✅ Any |
| `GET` | `/api/tasks/stats` | Get task statistics | ✅ Admin |
| `GET` | `/api/tasks/:id` | Get task by ID | ✅ Any |
| `PUT` | `/api/tasks/:id` | Update task | ✅ Admin |
| `PATCH` | `/api/tasks/:id/status` | Update task status | ✅ Any |
| `DELETE` | `/api/tasks/:id` | Delete task | ✅ Admin |

---

## 🛠️ Troubleshooting

### Issue: "Backend server is not accessible"

**Error Message:**
```
❌ Backend server is not accessible at http://localhost:5000
To fix this:
1. Make sure the backend server is running
2. Run: cd backend && npm run dev
3. Check that port 5000 is not blocked
4. Verify NEXT_PUBLIC_API_URL environment variable if needed
```

**Solutions:**

1. **Backend not running** (Most common)
   ```bash
   cd backend
   npm run dev
   ```

2. **Port 5000 blocked**
   - Check if another process is using port 5000
   - On Windows: `netstat -ano | findstr :5000`
   - Kill process: `taskkill /PID <PID> /F`
   - Or change `PORT` in `.env` and `NEXT_PUBLIC_API_URL` in `client/.env.local`

3. **CORS issues**
   - Verify `CORS_ORIGIN=http://localhost:3000` in `backend/.env`
   - Restart backend after changing `.env`

4. **Environment variable not loaded**
   - Verify `.env.local` exists in `client/` directory
   - Check `NEXT_PUBLIC_API_URL=http://localhost:5000`
   - **Important:** Restart Next.js after changing `.env.local`

### Issue: "Failed to fetch students/interns"

**Debugging Steps:**

1. **Check browser console** (F12 → Console tab)
   - Look for detailed error message
   - Shows exact URL being attempted
   - Lists troubleshooting steps

2. **Test backend health manually**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Expected response:
   ```json
   {"success":true,"message":"Server is running"}
   ```

3. **Test students endpoint** (with valid JWT token)
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/students
   ```

4. **Check Next.js logs**
   - Terminal where `npm run dev` is running
   - Look for API rewrite messages
   - Check for CORS errors

### Issue: "401 Unauthorized" or "403 Forbidden"

- JWT token is missing or invalid
- Login again at `/login` to get new token
- Token stored in browser localStorage with key `token`
- Bearer token required in Authorization header: `Bearer YOUR_TOKEN`

### Issue: "No students/interns shown in dropdown"

1. Verify admin has created student/intern records
2. Check database directly:
   ```bash
   # In MongoDB connection
   db.students.find() // Should return records
   db.interns.find()  // Should return records
   ```

3. Ensure students/interns have `status: 'active'`
   - API only returns active records
   - Check in MongoDB or database client

---

## 📊 Data Structure

### Task Model
```typescript
{
  title: string;              // Required
  description: string;        // Required
  assignedTo: ObjectId;       // Student or Intern ID
  assignedToType: 'Student' | 'Intern';
  assignedBy: Admin ID;       // Auto-set from JWT
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  dueDate: Date;             // Must be future date
  tags?: string[];           // Optional
  estimatedHours?: number;   // Optional
  completedAt?: Date;        // Auto-set when status = 'Completed'
  createdAt: Date;           // Auto-generated
  updatedAt: Date;           // Auto-generated
}
```

### Student Model
```typescript
{
  name: string;
  email: string;
  phone: string;
  course: string;
  status: 'active' | 'inactive' | 'graduated';
  enrollmentDate: Date;
  gpa?: number;
}
```

### Intern Model
```typescript
{
  name: string;
  email: string;
  phone: string;
  department: string;
  status: 'active' | 'inactive' | 'completed';
  joinDate: Date;
  skills?: string;
}
```

---

## 🎯 Example: Creating a Task via API

### Request
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete Project Setup",
    "description": "Setup and configure the new development environment",
    "assignedTo": "USER_ID_HERE",
    "assignedToType": "Student",
    "priority": "High",
    "dueDate": "2024-12-31",
    "estimatedHours": 8,
    "tags": ["setup", "backend"]
  }'
```

### Response
```json
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "_id": "TASK_ID",
    "title": "Complete Project Setup",
    "status": "Pending",
    "priority": "High",
    "assignedTo": {
      "_id": "USER_ID",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-12-20T10:30:00Z"
  }
}
```

---

## 📚 Additional Resources

- **API Documentation**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Quick Start Guide**: See [QUICK_START.md](./QUICK_START.md)
- **Admin Auth Setup**: See [ADMIN_AUTH_SETUP.md](./ADMIN_AUTH_SETUP.md)

---

## ✨ Next Steps**

After confirming task management is working:

1. **Create Task Detail Page** - View full task information and edit
2. **Add Task Submission System** - Allow students to submit completed work
3. **Implement Task Feedback** - Admin review and feedback on submissions
4. **Real-time Notifications** - Alert students of new task assignments
5. **File Attachments** - Support for uploading task files and submissions
6. **Task Comments** - Discussion threads for task-related questions

---

## 💡 Tips & Best Practices

1. **Always start backend first** - Frontend health checks fail if backend is down
2. **Check browser console** - Detailed error messages help diagnose issues
3. **Use admin account** - Most task operations require Admin role
4. **Verify environment variables** - Both `.env` and `.env.local` must be set correctly
5. **Clear API cache** - F12 → Application → LocalStorage → Clear if seeing stale data
6. **Check MongoDB** - Directly query database if API seems to work but no data shows

---

## 🐛 Debug Mode

Enable detailed logging by adding to `client/lib/api-utils.ts`:

```typescript
const DEBUG = true; // Set to true for verbose logging

if (DEBUG) {
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('Token:', token?.substring(0, 20) + '...');
}
```

---

**Last Updated:** December 2024  
**Status:** ✅ Production Ready
