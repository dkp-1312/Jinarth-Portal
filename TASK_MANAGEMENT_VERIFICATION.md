# Task Management - Verification Checklist

Complete this checklist to ensure the task management system is properly configured and ready to use.

## ✅ Backend Setup

- [ ] **Clone/Download Repository**
  - [ ] Backend files exist in `c:\Users\Admin\Desktop\jinarthportal\backend\`
  - [ ] `backend/package.json` exists

- [ ] **Install Dependencies**
  ```bash
  cd backend
  npm install
  ```
  - [ ] `node_modules/` folder created
  - [ ] `package-lock.json` exists

- [ ] **Environment Configuration**
  - [ ] `backend/.env` exists with correct values:
    ```
    PORT=5000
    NODE_ENV=development
    MONGODB_URI=mongodb+srv://[your-credentials]
    JWT_SECRET=dash@1234
    CORS_ORIGIN=http://localhost:3000
    ```
  - [ ] MongoDB URI is valid and database is accessible
  - [ ] JWT_SECRET is set (at least 8 characters)

- [ ] **Database Models**
  - [ ] Task model exists: `backend/src/models/Task/index.ts`
  - [ ] Student model exists: `backend/src/models/User/index.ts` (Student discriminator)
  - [ ] Intern model exists: `backend/src/models/Intern/index.ts`

- [ ] **Controllers**
  - [ ] Task controller exists: `backend/src/controllers/task.controller.ts`
    - [ ] Has `createTask` function
    - [ ] Has `getAllTasks` function
    - [ ] Has `getTasksByAssignee` function
    - [ ] Has `updateTask` function
    - [ ] Has `updateTaskStatus` function
    - [ ] Has `deleteTask` function
  - [ ] Student controller exists: `backend/src/controllers/student.controller.ts`
  - [ ] Intern controller exists: `backend/src/controllers/intern.controller.ts`

- [ ] **Routes**
  - [ ] Task routes exist: `backend/src/routes/taskRoutes.ts`
    - [ ] POST /api/tasks
    - [ ] GET /api/tasks
    - [ ] GET /api/tasks/assignee
    - [ ] GET /api/tasks/:id
    - [ ] PUT /api/tasks/:id
    - [ ] PATCH /api/tasks/:id/status
    - [ ] DELETE /api/tasks/:id
  - [ ] Student routes exist and have `getAllStudents` endpoint
  - [ ] Intern routes exist and have `getAllInterns` endpoint
  - [ ] Routes registered in `backend/src/index.ts`:
    - [ ] `app.use('/api/tasks', taskRoutes)`
    - [ ] `app.use('/api/students', studentRoutes)`
    - [ ] `app.use('/api/interns', internRoutes)`

- [ ] **Middleware**
  - [ ] Auth middleware exists: `backend/src/middlewares/auth.middleware.ts`
  - [ ] Exports `authenticate` function
  - [ ] Exports `authorize` function

- [ ] **Health Check Endpoint**
  - [ ] Backend has health check endpoint: `GET /api/health`
  - [ ] Returns: `{ "success": true, "message": "Server is running" }`

---

## ✅ Frontend Setup

- [ ] **Repository Structure**
  - [ ] Frontend files exist in `c:\Users\Admin\Desktop\jinarthportal\client\`
  - [ ] `client/package.json` exists
  - [ ] `client/next.config.ts` exists

- [ ] **Install Dependencies**
  ```bash
  cd client
  npm install
  ```
  - [ ] `node_modules/` folder created
  - [ ] `package-lock.json` exists

- [ ] **Environment Configuration**
  - [ ] `client/.env.local` exists with:
    ```
    NEXT_PUBLIC_API_URL=http://localhost:5000
    ```
  - [ ] Variable name is exactly `NEXT_PUBLIC_API_URL` (must start with `NEXT_PUBLIC_`)

- [ ] **Next.js Configuration**
  - [ ] `client/next.config.ts` has rewrites configuration:
    ```typescript
    rewrites: async () => ({
      fallback: [{
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/:path*`,
      }],
    })
    ```

- [ ] **API Utilities**
  - [ ] `client/lib/api-utils.ts` exists
    - [ ] Exports `checkBackendHealth()` function
    - [ ] Exports `getAllStudents(token)` function
    - [ ] Exports `getAllInterns(token)` function
    - [ ] Exports `getAllAssignees(token)` function
    - [ ] Has `API_BASE_URL` const pointing to backend
    - [ ] Has detailed error messages with troubleshooting steps

- [ ] **UI Components**
  - [ ] SidebarProvider component can be imported from `shadcn/ui`
  - [ ] SidebarInset component can be imported from `shadcn/ui`
  - [ ] Alert component can be imported from `shadcn/ui`

- [ ] **Task Management Pages**
  - [ ] Create task page exists: `client/app/task-management/create/page.tsx`
    - [ ] Has form for task details
    - [ ] Has Student/Intern toggle buttons
    - [ ] Has searchable dropdown for assignee selection
    - [ ] Has green confirmation box for selected person
    - [ ] Wrapped with `<SidebarProvider>` and `<SidebarInset>`
    - [ ] Uses `getAllAssignees()` from api-utils
    - [ ] Shows success modal on task creation
  - [ ] All tasks page exists: `client/app/task-management/all/page.tsx`
    - [ ] Shows task statistics dashboard
    - [ ] Has filtering by Status, Priority, Type
    - [ ] Has task table with manage options
    - [ ] Status dropdown for inline updates
    - [ ] Delete action with confirmation
    - [ ] Wrapped with `<SidebarProvider>` and `<SidebarInset>`

- [ ] **Authentication**
  - [ ] Auth provider exists: `client/app/providers/auth-provider.tsx`
  - [ ] Token stored in localStorage with key `token`
  - [ ] Bearer token sent in API requests via Authorization header

---

## 🧪 Startup Procedure

### Step 1: Start Backend

```bash
cd backend
npm run dev
# Expected output: Server is running on Port 5000
```

- [ ] Terminal shows "Server is running on Port 5000"
- [ ] No database connection errors
- [ ] No CORS errors
- [ ] Ready to handle requests

### Step 2: Start Frontend

```bash
cd client
npm run dev
# Expected output: - Local: http://localhost:3000
```

- [ ] Terminal shows "- Local: http://localhost:3000"
- [ ] Next.js compilation successful
- [ ] Ready to serve frontend

### Step 3: Test Login

1. Open `http://localhost:3000/login` in browser
2. Enter credentials:
   - Email: `admin@jinarth.com`
   - Password: `admin123`

- [ ] Login page loads without errors
- [ ] Can click login button
- [ ] Redirected to dashboard on successful login
- [ ] Token appears in localStorage (F12 → Application → localStorage → `token`)

### Step 4: Test Task Management

**Navigate to Create Task:**
1. Open `http://localhost:3000/task-management/create`
2. Check browser console (F12 → Console tab)

- [ ] Page loads without SidebarProvider errors
- [ ] Console shows no errors
- [ ] Console shows: "📡 Fetching all assignees..."
- [ ] Student and Intern buttons show counts (e.g., "Student (5)")
- [ ] If errors, check detailed error message in console

**Create a Task:**
1. Fill in task details (title, description, etc.)
2. Select a student or intern from dropdown
3. Click "Create Task"

- [ ] Form accepts all inputs
- [ ] Dropdown shows students/interns (1-50 results)
- [ ] Can select a person from dropdown
- [ ] Green confirmation box shows selected person's name
- [ ] "Create Task" button submits form
- [ ] Success modal appears
- [ ] Task created in database

**View All Tasks:**
1. Navigate to `http://localhost:3000/task-management/all`

- [ ] Page loads without errors
- [ ] Statistics cards show (Total, Pending, In Progress, etc.)
- [ ] Task table displays (if any tasks exist)
- [ ] Can see all created tasks
- [ ] Can filter by Status, Priority, Type
- [ ] Can change task status via dropdown
- [ ] Can delete tasks with confirmation

---

## 🐛 Troubleshooting Verification

### If Backend Fails to Start

- [ ] Check port 5000 is not in use:
  ```bash
  netstat -ano | findstr :5000
  ```
  
- [ ] If port is in use, either:
  - [ ] Kill process: `taskkill /PID <PID> /F`
  - [ ] Or change PORT in `backend/.env` to different port
  - [ ] Update `NEXT_PUBLIC_API_URL` in `client/.env.local` to match

- [ ] Check MongoDB connection:
  ```bash
  # Test URI in mongosh or MongoDB Compass
  # Verify MONGODB_URI in .env is correct
  ```

- [ ] Check Node.js version:
  ```bash
  node --version
  # Should be v16.0.0 or higher
  ```

### If Frontend Fails to Start

- [ ] Check port 3000 is not in use
- [ ] Verify `client/.env.local` exists and has `NEXT_PUBLIC_API_URL`
- [ ] Clear Next.js cache:
  ```bash
  rm -r client/.next
  npm run dev
  ```
- [ ] Check Node.js version matches backend

### If API Calls Fail (404 Errors)

- [ ] Verify backend is running: Check terminal output
- [ ] Check health endpoint:
  ```bash
  curl http://localhost:5000/api/health
  # Should return: {"success":true,"message":"Server is running"}
  ```
- [ ] Check browser console (F12 → Console):
  - [ ] Detailed error message should appear
  - [ ] Error should suggest fixes
  
- [ ] Verify CORS configuration:
  - [ ] `backend/.env` has `CORS_ORIGIN=http://localhost:3000`
  - [ ] Restart backend after changing `.env`

- [ ] Verify API_BASE_URL:
  - [ ] Browser console logs should show: "📡 Fetching students from: http://localhost:5000/api/students"
  - [ ] If not, check `.env.local` exists with correct NEXT_PUBLIC_API_URL

### If Assignee List is Empty

- [ ] Check database has student/intern records:
  ```bash
  # In MongoDB, run:
  db.students.find({ status: 'Active' }).count()
  db.interns.find({ status: 'Active' }).count()
  ```

- [ ] Ensure student/intern status is exactly "Active" (case-sensitive)

- [ ] Check API response manually:
  ```bash
  curl -H "Authorization: Bearer YOUR_TOKEN" \
    http://localhost:5000/api/students
  ```
  - [ ] Response should have `{ "success": true, "data": [...] }`

---

## ✨ Success Indicators

✅ **System is ready when you see:**

1. Backend terminal:
   ```
   Server is running on Port 5000
   ```

2. Frontend terminal:
   ```
   - Local: http://localhost:3000
   ```

3. Browser console (F12 → Console):
   ```
   ✓ Successfully fetched 5 students
   ✓ Successfully fetched 3 interns
   ✓ Fetched 8 total assignees (5 students + 3 interns)
   ```

4. Task management form loads with:
   - Student button showing "(5)" or higher count
   - Intern button showing "(3)" or higher count
   - Searchable dropdown working

5. Can successfully:
   - Create a task and assign to student/intern
   - View all tasks in dashboard
   - Filter tasks by status/priority
   - Update task status inline
   - Delete tasks

---

## 📝 Notes

- **Port 5000**: Backend must run on this port (or update `.env` and `.env.local`)
- **Port 3000**: Frontend must run on this port (configurable in Next.js)
- **CORS**: Backend must allow requests from `http://localhost:3000`
- **JWT Token**: Required for all API calls (from login)
- **MongoDB**: Must be accessible with configured connection string
- **Admin Users**: Must exist in database (created via seed script)

---

**Generated:** December 2024  
**Last Updated:** December 2024  
**Status:** Ready to Verify ✅
