# Task Management System - Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER / CLIENT                          │
│  http://localhost:3000                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          Task Management Frontend (Next.js)              │   │
│  │                                                          │   │
│  │  /task-management/create      /task-management/all      │   │
│  │   ┌───────────────────────┐    ┌─────────────────────┐  │   │
│  │   │  Create Task Form     │    │  Task Dashboard     │  │   │
│  │   │  - Title              │    │  - Statistics       │  │   │
│  │   │  - Description        │    │  - Filtering        │  │   │
│  │   │  - Priority           │    │  - Task Table       │  │   │
│  │   │  - Due Date           │    │  - Inline Updates   │  │   │
│  │   │  - Assignee Select    │    │  - Delete/Actions   │  │   │
│  │   └───────────────────────┘    └─────────────────────┘  │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │         lib/api-utils.ts (API Layer)               │ │   │
│  │  │  - getAllStudents(token)                           │ │   │
│  │  │  - getAllInterns(token)                            │ │   │
│  │  │  - getAllAssignees(token)                          │ │   │
│  │  │  - checkBackendHealth()                            │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                    │                             │
│                                    │ HTTP Fetch                  │
│                                    │ Bearer Token Auth            │
│                                    │                             │
└────────────────────────────────────┼─────────────────────────────┘
                                     │
                ┌────────────────────┴────────────────────┐
                │                                         │
                │      Next.js Dev Server                │
                │  (API Proxy/Rewrites)                  │
                │  localhost:3000                        │
                │                                        │
                │  /api/* → http://localhost:5000/api/* │
                │                                        │
                └────────────────────┬────────────────────┘
                                     │
                                     │ HTTP Request
                                     │ (Rewritten)
                                     │
┌────────────────────────────────────┼─────────────────────────────┐
│                                    ▼                              │
│            BACKEND API SERVER (Express.js/Node.js)               │
│               http://localhost:5000                              │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              API Routes & Controllers                      │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │        GET /api/students                             │ │ │
│  │  │  ├─ Middleware: authenticate, authorize(['Admin'])   │ │ │
│  │  │  ├─ Controller: getAllStudents()                     │ │ │
│  │  │  └─ Returns: { success, count, data }               │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │        GET /api/interns                              │ │ │
│  │  │  ├─ Middleware: authenticate, authorize(['Admin'])   │ │ │
│  │  │  ├─ Controller: getAllInterns()                      │ │ │
│  │  │  └─ Returns: { success, count, data }               │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │        Task Management Endpoints                     │ │ │
│  │  │  POST   /api/tasks             - Create Task        │ │ │
│  │  │  GET    /api/tasks             - Get All Tasks      │ │ │
│  │  │  GET    /api/tasks/assignee    - Get by Assignee    │ │ │
│  │  │  GET    /api/tasks/:id         - Get Single Task    │ │ │
│  │  │  PUT    /api/tasks/:id         - Update Task        │ │ │
│  │  │  PATCH  /api/tasks/:id/status - Update Status      │ │ │
│  │  │  DELETE /api/tasks/:id         - Delete Task        │ │ │
│  │  │  GET    /api/tasks/stats       - Task Statistics    │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │        Health Check Endpoint                         │ │ │
│  │  │  GET /api/health                                    │ │ │
│  │  │  └─ Returns: { success: true, message: "..."  }    │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Authentication & Authorization                │ │
│  │  - JWT Token validation (Bearer token)                     │ │
│  │  - Role-based access control (Admin, Student, Intern)     │ │
│  │  - User context extraction from JWT                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Database Models (Mongoose)                    │ │
│  │                                                            │ │
│  │  Student Model                                            │ │
│  │  ├─ name, email, phone                                    │ │
│  │  ├─ course, gpa                                           │ │
│  │  ├─ status: 'Active'                                      │ │
│  │  ├─ enrollmentDate                                        │ │
│  │  └─ _id (ObjectId)                                        │ │
│  │                                                            │ │
│  │  Intern Model                                             │ │
│  │  ├─ name, email, phone                                    │ │
│  │  ├─ department, skills                                    │ │
│  │  ├─ status: 'Active'                                      │ │
│  │  ├─ joinDate                                              │ │
│  │  └─ _id (ObjectId)                                        │ │
│  │                                                            │ │
│  │  Task Model (Discriminator Pattern)                       │ │
│  │  ├─ title, description                                    │ │
│  │  ├─ assignedTo: ObjectId (Student or Intern)             │ │
│  │  ├─ assignedToType: 'Student' | 'Intern'                │ │
│  │  ├─ assignedBy: Admin ID                                 │ │
│  │  ├─ priority: 'Low' | 'Medium' | 'High' | 'Urgent'      │ │
│  │  ├─ status: 'Pending' | 'In Progress' | 'Completed'     │ │
│  │  ├─ dueDate                                               │ │
│  │  ├─ tags: []                                              │ │
│  │  ├─ estimatedHours                                        │ │
│  │  ├─ completedAt (if status = 'Completed')               │ │
│  │  └─ timestamps (createdAt, updatedAt)                    │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                    │                             │
└────────────────────────────────────┼─────────────────────────────┘
                                     │
                                     │ Mongoose
                                     │ MongoDB Driver
                                     │
┌────────────────────────────────────┼─────────────────────────────┐
│                                    ▼                              │
│                    MONGODB DATABASE                              │
│                  (Cloud Atlas or Local)                          │
│                                                                  │
│  Collections:                                                   │
│  ├─ students     (with status: 'Active')                      │
│  ├─ interns      (with status: 'Active')                      │
│  ├─ tasks        (with discriminator fields)                  │
│  ├─ users        (admin accounts)                             │
│  └─ (other collections)                                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagrams

### 1. Creating a Task

```
┌─────────────────────┐
│   Admin User        │
│  Fills Task Form    │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────┐
│  Create Task Page            │
│  /task-management/create     │
├──────────────────────────────┤
│  1. Fetch assignees          │  ┌──────────────────────┐
│     getAllAssignees(token)   │─►│ getAllAssignees()    │
│  2. Show Student/Intern list │  │ checkBackendHealth() │
│  3. User selects assignee    │  │ getAllStudents()     │
│  4. Fills task details       │  │ getAllInterns()      │
│  5. Clicks "Create Task"     │  └──────────────────────┘
└──────────┬───────────────────┘
           │
           │ API Request
           │ POST /api/tasks
           │ Bearer Token
           │
           ▼
┌──────────────────────────────┐
│  Backend Task Controller     │
├──────────────────────────────┤
│  1. Verify JWT token         │
│  2. Check Admin role         │
│  3. Validate task fields     │
│  4. Verify assignee exists   │
│  5. Check due date is future │
│  6. Save task to DB          │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  MongoDB Database            │
│  Insert Task Document        │
└──────────┬───────────────────┘
           │
           ▼ JSON Response
           │ 201 Created
           │ { success: true, task: {...} }
           │
           ▼
┌──────────────────────────────┐
│  Create Task Page            │
│  Show Success Modal          │
│  Display new task details    │
│  Auto-redirect dashboard     │
└──────────────────────────────┘
```

### 2. Viewing All Tasks

```
┌─────────────────────┐
│   Admin User        │
│  Opens Task List    │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────┐
│  All Tasks Page              │
│  /task-management/all        │
├──────────────────────────────┤
│  1. Load page                │
│  2. Fetch tasks              │  ┌──────────────────────┐
│     getAllTasks(token)       │─►│ GET /api/tasks       │
│  3. Fetch statistics         │  │ GET /api/tasks/stats │
│     getTaskStatistics()      │  └──────────────────────┘
│  4. Render table             │
│  5. Apply filters            │
│  6. Allow inline updates     │
└──────────┬───────────────────┘
           │
           │ API Request
           │ GET /api/tasks?filters
           │ Bearer Token
           │
           ▼
┌──────────────────────────────┐
│  Backend Task Controller     │
├──────────────────────────────┤
│  1. Verify JWT token         │
│  2. Check Admin role         │
│  3. Query tasks with filters │
│  4. Populate assignee data   │
│  5. Return task list         │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  MongoDB Database            │
│  Query tasks collection      │
│  with filters & sorting      │
└──────────┬───────────────────┘
           │
           ▼ JSON Response
           │ 200 OK
           │ { success: true, count: N, data: [...] }
           │
           ▼
┌──────────────────────────────┐
│  All Tasks Page              │
│  1. Display statistics cards │
│  2. Render task table        │
│  3. Show filter dropdowns    │
│  4. Enable status updates    │
│  5. Enable delete buttons    │
└──────────────────────────────┘
```

### 3. Updating Task Status

```
┌──────────────────────────┐
│  Admin User              │
│  Clicks Status Dropdown  │
│  Selects New Status      │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  API Call                │
│  PATCH /api/tasks/:id/st │
│  Bearer Token            │
│  { status: "Completed" } │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Backend Controller      │
│  1. Verify JWT           │
│  2. Get task by ID       │
│  3. Update status        │
│  4. If status=Completed: │
│     Set completedAt now  │
│  5. Save to DB           │
└──────────┬───────────────┘
           │
           ▼ JSON Response
           │ 200 OK
           │ { success: true, task: {...} }
           │
           ▼
┌──────────────────────────┐
│  Frontend               │
│  Update table UI        │
│  Show success toast     │
└──────────────────────────┘
```

---

## 🔐 Authentication & Authorization Flow

```
┌──────────────────────────┐
│  Login Page              │
│  Email + Password        │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  POST /api/auth/login    │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Auth Controller         │
│  1. Find user            │
│  2. Verify password      │
│  3. Generate JWT token   │
│  4. Return token         │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Browser localStorage    │
│  Save: token = JWT       │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Subsequent API Calls    │
│  Header: Authorization:  │
│  Bearer <YOUR_JWT_TOKEN> │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Backend Middleware      │
│  authenticate():         │
│  1. Extract token header │
│  2. Verify JWT sig       │
│  3. Extract user data    │
│  4. Attach to req.user   │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Authorization Check     │
│  authorize(['Admin']):   │
│  1. Check user role      │
│  2. Allow/Deny access    │
│  3. Return 403 if denied │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Controller Function     │
│  Execute business logic  │
└──────────────────────────┘
```

---

## 🔌 Integration Points

### Frontend → Backend API Calls

**From `client/lib/api-utils.ts`:**

1. **getAllStudents(token)**
   - Endpoint: `GET /api/students`
   - Auth: Bearer token in Authorization header
   - Returns: `{ success, count, data: Student[] }`
   - Used in: Create task form (Student assignee list)

2. **getAllInterns(token)**
   - Endpoint: `GET /api/interns`
   - Auth: Bearer token in Authorization header
   - Returns: `{ success, count, data: Intern[] }`
   - Used in: Create task form (Intern assignee list)

3. **checkBackendHealth()**
   - Endpoint: `GET /api/health`
   - No auth required
   - Returns: `{ success: true, message: "Server is running" }`
   - Used in: Pre-flight check before data fetching

4. **createTask(taskData)** [Not yet in api-utils, called directly]
   - Endpoint: `POST /api/tasks`
   - Auth: Bearer token required
   - Request: Task object with title, description, assignedTo, etc.
   - Returns: `{ success, task: TaskObject }`
   - Used in: Create task form submission

5. **getTasks(filters)** [Not yet in api-utils, called directly]
   - Endpoint: `GET /api/tasks?status=Pending&priority=High&type=Student`
   - Auth: Bearer token required
   - Returns: `{ success, count, data: Task[] }`
   - Used in: All tasks dashboard

6. **getTaskStatistics()** [Not yet in api-utils, called directly]
   - Endpoint: `GET /api/tasks/stats`
   - Auth: Bearer token required
   - Returns: `{ success, stats: { total, pending, completed, etc } }`
   - Used in: Dashboard statistics cards

---

## 📦 File Structure Summary

```
backend/
├── src/
│   ├── index.ts                      # Express app, route registration
│   ├── controllers/
│   │   ├── task.controller.ts        # Task CRUD operations
│   │   ├── student.controller.ts     # Student operations
│   │   └── intern.controller.ts      # Intern operations
│   ├── routes/
│   │   ├── taskRoutes.ts             # Task endpoints
│   │   ├── studentRoutes.ts          # Student endpoints
│   │   └── internRoutes.ts           # Intern endpoints
│   ├── models/
│   │   ├── Task/                     # Task Mongoose schema
│   │   ├── Student/                  # Student Mongoose schema
│   │   └── Intern/                   # Intern Mongoose schema
│   ├── middlewares/
│   │   └── auth.middleware.ts        # JWT validation & authorization
│   └── utils/
│       ├── db.ts                     # MongoDB connection
│       └── type.ts                   # TypeScript types
├── .env                              # Environment variables
└── package.json                      # Dependencies

client/
├── app/
│   ├── task-management/
│   │   ├── create/page.tsx           # Task creation form page
│   │   └── all/page.tsx              # Task dashboard/list page
│   ├── layout.tsx                    # Root layout
│   └── login/page.tsx                # Login page
├── lib/
│   ├── api-utils.ts                  # API utility functions
│   ├── api.ts                        # API configuration
│   └── utils.ts                      # Utility functions
├── components/
│   └── ui/                           # shadcn/ui components
├── .env.local                        # Environment variables
├── next.config.ts                    # Next.js config (API rewrites)
└── package.json                      # Dependencies
```

---

## 🔄 Request/Response Examples

### Create Task Request

```http
POST /api/tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Complete Project Setup",
  "description": "Configure development environment and deploy",
  "assignedTo": "507f1f77bcf86cd799439011",
  "assignedToType": "Student",
  "priority": "High",
  "dueDate": "2024-12-31T00:00:00Z",
  "estimatedHours": 8,
  "tags": ["setup", "backend"]
}
```

### Create Task Response

```json
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Complete Project Setup",
    "description": "Configure development environment and deploy",
    "assignedTo": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "assignedToType": "Student",
    "priority": "High",
    "status": "Pending",
    "dueDate": "2024-12-31T00:00:00Z",
    "createdAt": "2024-12-20T10:30:00Z"
  }
}
```

---

## 🎯 Key Design Patterns

1. **Discriminator Pattern (Task Model)**
   - Single Task collection
   - `assignedToType` field determines if Student or Intern
   - Allows polymorphic references in same collection

2. **API Utility Layer**
   - Centralized API calls in `lib/api-utils.ts`
   - Reusable fetch functions
   - Consistent error handling
   - Single source of truth for API endpoints

3. **Health Check Pattern**
   - `checkBackendHealth()` called before data operations
   - Prevents generic 404 errors
   - Provides actionable error messages

4. **Bearer Token Authentication**
   - JWT stored in localStorage
   - Sent in Authorization header
   - Verified and decoded on backend
   - User context extracted for logging and validation

5. **Middleware Stack**
   - Authentication middleware checks token validity
   - Authorization middleware checks user role
   - Applied to protected routes

---

## ⚡ Performance Considerations

1. **API Rewriting** (next.config.ts)
   - Proxies requests through Next.js dev server
   - Prevents CORS issues in development
   - Not needed in production with proper CORS

2. **Health Checks**
   - Called before each batch of requests
   - Returns immediately if backend is down
   - Avoids long timeout waiting for failed requests

3. **Data Fetching Strategy**
   - Promise.all() for parallel requests
   - Only fetches active students/interns
   - Pagination can be added for large datasets

4. **Caching Opportunities** (Future)
   - Cache students/interns list in localStorage
   - Implement React Query for API caching
   - Add stale-while-revalidate pattern

---

**Generated:** December 2024  
**Status:** ✅ Complete
