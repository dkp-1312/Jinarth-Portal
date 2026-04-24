# Task Management - Quick Reference Card

## 🎯 Get Started in 60 Seconds

```bash
# Terminal 1: Start Backend
cd backend && npm run dev
# Expected: "Server is running on Port 5000"

# Terminal 2: Start Frontend (new terminal)
cd client && npm run dev
# Expected: "- Local: http://localhost:3000"

# Browser: Go to
http://localhost:3000/login
# Login: admin@jinarth.com / admin123
# Then navigate to Task Management
```

---

## 📍 Pages & URLs

| Page | URL | Purpose |
|------|-----|---------|
| Login | `http://localhost:3000/login` | Admin authentication |
| Create Task | `http://localhost:3000/task-management/create` | New task form |
| View Tasks | `http://localhost:3000/task-management/all` | Task dashboard |
| Dashboard | `http://localhost:3000/dashboard` | Admin dashboard |

---

## 🔐 Default Credentials

```
Email:    admin@jinarth.com
Password: admin123
```

---

## 🚀 Key Commands

```bash
# Start Backend
cd backend && npm run dev

# Start Frontend (new terminal)
cd client && npm run dev

# Install Backend Dependencies
cd backend && npm install

# Install Frontend Dependencies
cd client && npm install

# Create Admin Users (if needed)
cd backend && npx ts-node src/scripts/seed.ts

# View Database (MongoDB Compass or mongosh)
# Connection: mongodb+srv://darshankharva11_db_user:4KsHugHq7tvVeKtg@portal.axjv7wl.mongodb.net
```

---

## 🔌 API Endpoints

```bash
# Health Check (No auth needed)
curl http://localhost:5000/api/health

# Get All Students (Bearer token required)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/students

# Get All Interns (Bearer token required)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/interns

# Create Task (Bearer token required)
curl -X POST http://localhost:5000/api/tasks \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Task Title",
       "description": "Task Description",
       "assignedTo": "USER_ID",
       "assignedToType": "Student",
       "priority": "High",
       "dueDate": "2024-12-31"
     }'
```

---

## ⚙️ Configuration

### Backend `.env`
```
PORT=5000
MONGODB_URI=mongodb+srv://darshankharva11_db_user:4KsHugHq7tvVeKtg@portal.axjv7wl.mongodb.net/jinarthportal
JWT_SECRET=dash@1234
CORS_ORIGIN=http://localhost:3000
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🐛 Quick Troubleshooting

| Error | Fix |
|-------|-----|
| "Port 5000 in use" | `netstat -ano \| findstr :5000` then kill process |
| "Backend not accessible" | Run `cd backend && npm run dev` |
| "Students list empty" | Check students have `status: 'Active'` |
| "401 Unauthorized" | Login again to get new token |
| ".env not loaded" | Restart Next.js server after changing `.env.local` |

---

## 📊 Task Form Fields

```
Title*              [Text Input]           Required
Description*        [Text Area]            Required
Assignee Type*      [Student / Intern]     Required
Assignee*           [Dropdown Search]      Required
Priority*           [Low / Medium / High]  Required
Due Date*           [Date Picker]          Must be future
Tags                [Multi-select]         Optional
Estimated Hours     [Number]               Optional
```

---

## 📈 Dashboard Features

**Statistics Cards:**
- Total Tasks
- Pending Tasks
- In Progress Tasks
- Completed Tasks
- Overdue Tasks

**Filter Options:**
- Status: All / Pending / In Progress / Completed
- Priority: All / Low / Medium / High
- Type: All / Student / Intern

**Table Actions:**
- View task
- Update status (dropdown)
- Delete (with confirmation)

---

## 💾 Environment Variables

| Variable | Where | Value |
|----------|-------|-------|
| `NEXT_PUBLIC_API_URL` | `client/.env.local` | `http://localhost:5000` |
| `PORT` | `backend/.env` | `5000` |
| `MONGODB_URI` | `backend/.env` | Your MongoDB connection |
| `JWT_SECRET` | `backend/.env` | `dash@1234` |
| `CORS_ORIGIN` | `backend/.env` | `http://localhost:3000` |

---

## 🎯 Success Indicators

✅ System is working when you see:

1. Backend terminal: `Server is running on Port 5000`
2. Frontend terminal: `- Local: http://localhost:3000`
3. Browser console: `✓ Successfully fetched X students`
4. Form shows: "Student (X)" and "Intern (X)" buttons
5. Dropdown loads assignees on task form

---

## 📚 Documentation Files

```
./TASK_MANAGEMENT_README.md         ← Summary & Next Steps
./TASK_MANAGEMENT_SETUP.md          ← Complete Setup Guide
./TASK_MANAGEMENT_VERIFICATION.md   ← Verification Checklist
./TASK_MANAGEMENT_ARCHITECTURE.md   ← System Architecture
./QUICK_START.md                    ← Quick Project Start
./API_DOCUMENTATION.md              ← API Reference
```

---

## 🔗 Key File Locations

```
Backend:
  ./backend/src/controllers/task.controller.ts      (Task logic)
  ./backend/src/routes/taskRoutes.ts                (Task endpoints)
  ./backend/src/middlewares/auth.middleware.ts      (Auth logic)
  ./backend/.env                                    (Config)

Frontend:
  ./client/app/task-management/create/page.tsx      (Create form)
  ./client/app/task-management/all/page.tsx         (Task list)
  ./client/lib/api-utils.ts                         (API utilities)
  ./client/.env.local                               (Config)
```

---

## 📋 Ports & URLs

| Service | Port | URL |
|---------|------|-----|
| Backend | 5000 | `http://localhost:5000` |
| Frontend | 3000 | `http://localhost:3000` |
| MongoDB | 27017 | Auto (cloud/local) |

---

## 🚨 Common Issues

**✋ Backend says "EADDRINUSE: address already in use"**
```bash
# Kill process using port 5000
taskkill /PID <PID> /F
# OR change PORT in backend/.env to 5001, 5002, etc.
```

**✋ Student/Intern list shows nothing**
```
1. Check database has active students/interns
2. Make sure status is exactly 'Active' (case-sensitive)
3. Verify JWT token is valid
```

**✋ Getting "Backend server is not accessible"**
```
1. Make sure backend running: npm run dev
2. Check port 5000 is not blocked
3. Verify NEXT_PUBLIC_API_URL in .env.local
4. Restart Next.js after changing .env.local
```

---

## 📞 Need Help?

1. **Check browser console** (F12 → Console) - detailed error messages
2. **Read TASK_MANAGEMENT_SETUP.md** - troubleshooting section
3. **Run verification checklist** in TASK_MANAGEMENT_VERIFICATION.md
4. **Test health endpoint** - `curl localhost:5000/api/health`
5. **Check backend logs** - see terminal where npm run dev was started

---

## ✨ Features Included

✅ Task creation with form validation
✅ Assign tasks to Students or Interns
✅ Task dashboard with statistics
✅ Filter and search tasks
✅ Inline status updates
✅ Delete tasks with confirmation
✅ Searchable assignee dropdown
✅ JWT authentication
✅ Role-based authorization
✅ Comprehensive error handling
✅ Health check system
✅ Beautiful UI with shadcn/ui

---

## 🎊 You're All Set!

Your task management system is **fully implemented** and **ready to use**.

**Next Step:** Start the backend with `npm run dev` (in the backend folder) and enjoy! 🚀

---

**Quick Start Reminder:**
```
1. cd backend && npm run dev    (Terminal 1)
2. cd client && npm run dev     (Terminal 2)
3. Open http://localhost:3000   (Browser)
4. Login → Task Management      (Navigate)
5. Create task                  (Test)
```

---

*Last Updated: December 2024*  
*Status: ✅ Production Ready*
