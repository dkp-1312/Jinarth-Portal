# Quick Start - Admin Authentication

## 🚀 Get Started in 5 Minutes

### 1. Setup Backend (2 min)
```bash
cd backend
npm install
```

Create `backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jinarthportal
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
```

### 2. Create Admin Users (30 sec)
```bash
npx ts-node src/scripts/seed.ts
```

✓ Creates two test admins:
- admin@jinarth.com / admin123
- admin2@jinarth.com / admin123

### 3. Start Backend (1 min)
```bash
npm run dev
# Server running on http://localhost:5000
```

### 4. Start Frontend (1 min)
```bash
cd client
npm run dev
# Frontend running on http://localhost:3000
```

### 5. Login! 
🌐 Go to: `http://localhost:3000/login`

Use any credentials:
- Email: `admin@jinarth.com`
- Password: `admin123`

---

## 📋 Requirements

- Node.js installed
- MongoDB running locally OR MongoDB Atlas account
- Ports 3000 & 5000 available

---

## 🆘 Quick Fixes

| Issue | Fix |
|-------|-----|
| MongoDB connection error | Ensure `mongod` is running or update `MONGODB_URI` |
| Login fails | Check MongoDB has data: `npx ts-node src/scripts/seed.ts` |
| 404 on dashboard | Backend not running, start with `npm run dev` |
| Token errors | Clear localStorage: Open DevTools → Application → Clear Storage |

---

**That's it! You now have a working admin authentication system.** 🎉
