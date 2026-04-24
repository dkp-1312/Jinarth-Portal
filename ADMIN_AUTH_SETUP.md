# Admin Authentication Setup Guide

## Overview
The application now has a complete admin authentication system that allows two admins to securely log in to the dashboard locally on your PC.

## Architecture

### Components

1. **Backend (Node.js + Express)**
   - User model with password hashing (bcrypt)
   - JWT token-based authentication
   - Login and register endpoints
   - Auth middleware for protected routes

2. **Frontend (Next.js)**
   - Login page with form validation
   - Auth context/provider for state management
   - Protected routes that redirect unauthorized users
   - Token storage in localStorage

3. **Database (MongoDB)**
   - Users collection with authentication fields
   - Hashed passwords using bcryptjs
   - Role-based access control

---

## Setup Instructions

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

This will install:
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation
- `mongoose` - MongoDB ODM
- Other required dependencies

### Step 2: Configure Environment Variables

Create a `.env` file in the backend directory (copy from `.env.example`):

```bash
# Backend/.env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/jinarthportal
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

> **Important**: Change `JWT_SECRET` to a strong random string in production!

### Step 3: Set Up MongoDB

**Option A: Local MongoDB**
```bash
# If you have MongoDB installed locally, ensure it's running
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Get your connection string
4. Replace in .env: 
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jinarthportal
   ```

### Step 4: Create Admin Users

Run the seed script to create two test admin accounts:

```bash
npx ts-node src/scripts/seed.ts
```

This creates:
- **Admin 1**: `admin@jinarth.com` / `admin123`
- **Admin 2**: `admin2@jinarth.com` / `admin123`

> **Tip**: Change passwords in production!

### Step 5: Start Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
Server is running on Port 5000
```

### Step 6: Install Frontend Dependencies

```bash
cd client
npm install
```

### Step 7: Start Frontend

```bash
cd client
npm run dev
```

Server will run on: `http://localhost:3000`

---

## Login Flow

### 1. Access Login Page
Navigate to: `http://localhost:3000/login`

### 2. Enter Credentials
- Email: `admin@jinarth.com` (or `admin2@jinarth.com`)
- Password: `admin123`

### 3. Successful Login
- Token stored in localStorage
- Redirected to dashboard: `/dashboard`
- User info displayed in sidebar

### 4. Protected Access
- All dashboard routes are protected
- Non-admin users cannot access dashboard
- Unauthorized access redirects to login

### 5. Logout
Click on admin name in sidebar footer → Click "Log out"
- Clears token from localStorage
- Redirects to login page

---

## API Endpoints

### Authentication Routes
Base URL: `http://localhost:5000/api/auth`

#### 1. Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@jinarth.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "...",
    "name": "Admin One",
    "email": "admin@jinarth.com",
    "role": "Admin",
    "status": "Active"
  }
}
```

#### 2. Register (Testing Only)
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "New Admin",
  "email": "newadmin@jinarth.com",
  "password": "password123",
  "role": "Admin"
}
```

#### 3. Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "user": { ... }
}
```

#### 4. Logout
```
POST /api/auth/logout
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## File Structure

### Backend
```
backend/
├── src/
│   ├── models/
│   │   └── User/
│   │       └── index.ts          # User schema & model
│   ├── controllers/
│   │   └── auth.controller.ts    # Login/Register logic
│   ├── middlewares/
│   │   └── auth.middleware.ts    # JWT verification
│   ├── routes/
│   │   └── auth.routes.ts        # Auth endpoints
│   ├── scripts/
│   │   └── seed.ts               # Create test admins
│   └── index.ts                  # Server setup
├── .env                          # Environment variables
├── .env.example                  # Example env file
└── package.json
```

### Frontend
```
client/
├── app/
│   ├── login/
│   │   └── page.tsx              # Login page
│   ├── dashboard/
│   │   └── layout.tsx            # Protected layout
│   ├── layout.tsx                # Root layout with AuthProvider
│   └── providers/
│       └── auth-provider.tsx     # Auth context
├── components/
│   ├── nav-user.tsx              # Logout button
│   └── app-sidebar.tsx           # Sidebar with auth
└── package.json
```

---

## Security Features

✓ **Password Hashing**: bcryptjs with salt (10 rounds)  
✓ **JWT Tokens**: Signed with secret key, 7-day expiration  
✓ **Protected Routes**: Client-side route protection  
✓ **Middleware Auth**: Server-side JWT verification  
✓ **CORS**: Configured for secure cross-origin requests  
✓ **Role-Based Access**: Only admins can access dashboard  

---

## Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution**:
- Ensure MongoDB is running locally: `mongod`
- Or verify MongoDB Atlas connection string in `.env`

### Issue: "Invalid token" error
**Solution**:
- Token expired (check JWT_EXPIRE in .env)
- Token was tampered with
- JWT_SECRET in .env doesn't match during creation
- Clear localStorage and login again

### Issue: "Access denied. Required role: Admin"
**Solution**:
- User account doesn't have Admin role
- Create user with `"role": "Admin"` via seed script or register

### Issue: Backend/Frontend not communicating
**Solution**:
- Check CORS_ORIGIN in backend .env matches frontend URL (http://localhost:3000)
- Ensure both servers are running on correct ports
- Check browser console for CORS errors

### Issue: Login page shows blank/loading forever
**Solution**:
- Check browser console for errors
- Verify AuthProvider is wrapping the app in layout.tsx
- Ensure localStorage is not blocked

---

## Testing

### Manual Testing Endpoint (REST)

Use Postman or curl to test login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@jinarth.com",
    "password": "admin123"
  }'
```

### Test Dashboard Access

1. Open `http://localhost:3000/login`
2. Log in with credentials
3. Should redirect to `/dashboard`
4. Click admin name in sidebar → Log out
5. Should redirect back to `/login`

---

## Production Checklist

- [ ] Change `JWT_SECRET` to strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Update `CORS_ORIGIN` to production domain
- [ ] Use MongoDB Atlas instead of local MongoDB
- [ ] Enable HTTPS for secure token transmission
- [ ] Remove seed script from production
- [ ] Implement email verification for new accounts
- [ ] Add password reset functionality
- [ ] Set up HTTPS certificates
- [ ] Enable rate limiting on login endpoint
- [ ] Add activity logging

---

## Next Steps

After authentication is working:

1. **Protect Other Routes**
   ```typescript
   // Add to other route layouts
   <ProtectedRoute>
     {children}
   </ProtectedRoute>
   ```

2. **Add More API Endpoints**
   - Use `authenticate` middleware on protected endpoints
   - Use `authorize` middleware for role-based endpoints

3. **Implement Admin Features**
   - User management (create/edit/delete users)
   - Role assignment
   - Activity logs

---

## Support

For issues or questions, check:
- Backend logs in terminal running `npm run dev`
- Browser console for frontend errors
- MongoDB connection logs

---

**Setup Date**: March 11, 2026  
**Version**: 1.0.0
