# Jinarth Student & Intern Task Management Portal

Complete full-stack application with Next.js frontend and Node.js backend.

## Project Structure

```
jinarthportal/
├── client/                  # Next.js Frontend
│   ├── app/                 # App Router pages
│   ├── components/          # Reusable components
│   ├── lib/                 # Utilities
│   ├── package.json
│   └── .env.local           # Local environment (API URL)
│
└── backend/                 # Express Backend
    ├── src/
    │   ├── controllers/     # Business logic
    │   ├── models/          # MongoDB schemas
    │   ├── routes/          # API routes
    │   ├── middlewares/     # Express middlewares
    │   ├── utils/           # Utility functions
    │   └── index.ts         # Entry point
    ├── package.json
    ├── tsconfig.json
    └── .env                 # Backend environment
```

## Prerequisites

- Node.js 16+ and npm
- MongoDB (local or Atlas)

## Installation

### 1.Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

Backend will start on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd client
npm install
# .env.local already configured for localhost:5000
npm run dev
```

Frontend will start on `http://localhost:3000`

## API Endpoints

The backend exposes the following REST APIs:

### Interns Management
- `GET /api/interns` - List all interns
- `POST /api/interns` - Create intern
- `GET /api/interns/:id` - Get intern details
- `PUT /api/interns/:id` - Update intern
- `DELETE /api/interns/:id` - Delete intern
- `GET /api/interns/performance` - Get performance statistics

### Students Management
- `GET /api/students` - List all students  
- `POST /api/students` - Create student
- `GET /api/students/:id` - Get student details
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/progress` - Get progress statistics

### Tasks Management
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/assigned` - Get assigned tasks
- `GET /api/tasks/statistics` - Get task statistics

### Leave Management
- `GET /api/leaves` - List all leaves
- `POST /api/leaves` - Create leave request
- `GET /api/leaves/:id` - Get leave details
- `PUT /api/leaves/:id` - Update leave (approve/reject)
- `DELETE /api/leaves/:id` - Delete leave
- `GET /api/leaves/pending` - Get pending leave requests

### Events Management
- `GET /api/events` - List all events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Holidays Management
- `GET /api/holidays` - List all holidays
- `POST /api/holidays` - Create holiday
- `GET /api/holidays/:id` - Get holiday details
- `PUT /api/holidays/:id` - Update holiday
- `DELETE /api/holidays/:id` - Delete holiday

## Frontend Pages

The frontend includes the following pages:

- `/` - Home/Dashboard
- `/dashboard/overview` - Dashboard overview
- `/dashboard/analytics` - Analytics
- `/dashboard/reports` - Reports
- `/intern/list` - List interns
- `/intern/add` - Add new intern
- `/intern/performance` - Intern performance
- `/student/list` - List students
- `/student/add` - Add new student
- `/student/progress` - Student progress
- `/task-management/all` - All tasks
- `/task-management/create` - Create task
- `/task-management/assigned` - Assigned tasks
- `/leave/request` - Request leave
- `/leave/approve` - Approve leaves
- `/leave/history` - Leave history
- `/calendar/view` - Calendar view
- `/calendar/events` - Events management
- `/calendar/holidays` - Holidays management

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/jinarth-portal
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Response Format

All API endpoints return JSON responses:

**Success Response:**
```json
{
  "success": true,
  "data": { /* resource data */ },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

## Sidebar Navigation

The application includes a comprehensive sidebar with sections for:
- Dashboard
- Intern Management
- Student Management
- Task Management
- Leave Management
- Calendar & Events
- Settings

## UI Components

The frontend uses shadcn/ui components including:
- Button
- Card
- Table
- Badge
- Breadcrumb
- Dropdown Menu
- Sidebar
- Separator
- And more...

## Next Steps

1. Make sure MongoDB is running
2. Install dependencies for both backend and frontend
3. Ensure backend is running on port 5000
4. Ensure frontend environment variable points to backend
5. Access the application at `http://localhost:3000`

## Troubleshooting

### Backend not connecting
- Ensure MongoDB service is running
- Check connection string in .env
- Verify PORT 5000 is not in use

### Frontend API errors (404)
- Verify .env.local has NEXT_PUBLIC_API_URL=http://localhost:5000
- Ensure backend server is running
- Check network tab in browser DevTools

### CORS errors
- Ensure frontend URL is in CORS_ORIGIN in backend .env
- Restart backend after changing CORS settings

## Support

For issues or questions, please refer to the individual README files in `backend/` and `client/` directories.
