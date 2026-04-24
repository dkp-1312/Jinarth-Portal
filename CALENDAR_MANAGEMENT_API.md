# Calendar Management System - Complete API Documentation

## Overview
Complete Calendar Management system with Event and Holiday management APIs. This includes create, read, update, delete operations for both events and holidays, with authentication and statistics.

---

## Backend Implementation

### 1. **Event Management APIs**

#### Create Event
```
POST /api/calendar/events
Headers: Authorization: Bearer {token}
Auth Required: Admin
Body:
{
  "title": "Team Meeting",
  "date": "2026-04-15",
  "time": "10:30",
  "description": "Quarterly planning meeting",
  "eventType": "Meeting",
  "location": "Conference Room A",
  "organizer": "Admin",
  "attendees": ["user1@example.com", "user2@example.com"]
}

Response:
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "_id": "...",
    "title": "Team Meeting",
    "date": "2026-04-15T00:00:00.000Z",
    "time": "10:30",
    "description": "Quarterly planning meeting",
    "eventType": "Meeting",
    "location": "Conference Room A",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### Get All Events
```
GET /api/calendar/events?eventType=Meeting&startDate=2026-04-01&endDate=2026-04-30
Returns: Array of events sorted by date
```

#### Get Upcoming Events
```
GET /api/calendar/events/upcoming?days=30
Returns: Events within next 30 days (configurable)
```

#### Get Event by ID
```
GET /api/calendar/events/:id
Returns: Single event details
```

#### Update Event
```
PUT /api/calendar/events/:id
Headers: Authorization: Bearer {token}
Auth Required: Admin
Body: Partial event data to update
```

#### Delete Event
```
DELETE /api/calendar/events/:id
Headers: Authorization: Bearer {token}
Auth Required: Admin
```

---

### 2. **Holiday Management APIs**

#### Create Holiday
```
POST /api/calendar/holidays
Headers: Authorization: Bearer {token}
Auth Required: Admin
Body:
{
  "name": "Independence Day",
  "date": "2026-08-15",
  "country": "India",
  "type": "National",
  "description": "National Independence Day",
  "isOptional": false
}

Response:
{
  "success": true,
  "message": "Holiday created successfully",
  "data": {
    "_id": "...",
    "name": "Independence Day",
    "date": "2026-08-15T00:00:00.000Z",
    "country": "India",
    "type": "National",
    "isOptional": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### Get All Holidays
```
GET /api/calendar/holidays?country=India&type=National&year=2026
Returns: Array of holidays filtered by criteria, sorted by date
```

#### Get Upcoming Holidays
```
GET /api/calendar/holidays/upcoming?country=India&days=365
Returns: Holidays within specified period for a country
```

#### Get Holiday by ID
```
GET /api/calendar/holidays/:id
Returns: Single holiday details
```

#### Update Holiday
```
PUT /api/calendar/holidays/:id
Headers: Authorization: Bearer {token}
Auth Required: Admin
Body: Partial holiday data to update
```

#### Delete Holiday
```
DELETE /api/calendar/holidays/:id
Headers: Authorization: Bearer {token}
Auth Required: Admin
```

---

### 3. **Calendar Statistics API**

#### Get Calendar Stats
```
GET /api/calendar/stats
Auth Required: No

Response:
{
  "success": true,
  "data": {
    "events": {
      "total": 15,
      "upcoming": 8,
      "past": 7
    },
    "holidays": {
      "total": 24,
      "upcoming": 12
    }
  }
}
```

---

## Frontend Implementation

### 1. **Events Page** (`/calendar/events`)
- **Features:**
  - Display all events in a table
  - Add new events with form validation
  - Delete events with confirmation
  - Real-time error handling
  - Auth token required
  - Loading states

### 2. **Holidays Page** (`/calendar/holidays`)
- **Features:**
  - Display upcoming and past holidays
  - Add new holidays with type and country
  - Delete holidays
  - Color-coded display (upcoming vs past)
  - Real-time error handling
  - Auth token required

---

## Data Models

### Event Schema
```typescript
{
  title: string (required, 3-100 chars)
  date: Date (required)
  time: string (required, HH:MM format)
  description: string (required, 10-500 chars)
  eventType: 'Meeting' | 'Conference' | 'Training' | 'Workshop' | 'Seminar' | 'Holiday' | 'Other'
  location?: string
  organizer?: string
  attendees?: string[]
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Holiday Schema
```typescript
{
  name: string (required, 3-100 chars)
  date: Date (required, unique)
  country: string (required)
  type: 'National' | 'Regional' | 'Religious' | 'Corporate' | 'Other' (default: National)
  description?: string
  isOptional?: boolean (default: false)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

---

## API Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/calendar/events` | Admin | Create event |
| GET | `/api/calendar/events` | No | Get all events |
| GET | `/api/calendar/events/upcoming` | No | Get upcoming events |
| GET | `/api/calendar/events/:id` | No | Get event by ID |
| PUT | `/api/calendar/events/:id` | Admin | Update event |
| DELETE | `/api/calendar/events/:id` | Admin | Delete event |
| POST | `/api/calendar/holidays` | Admin | Create holiday |
| GET | `/api/calendar/holidays` | No | Get all holidays |
| GET | `/api/calendar/holidays/upcoming` | No | Get upcoming holidays |
| GET | `/api/calendar/holidays/:id` | No | Get holiday by ID |
| PUT | `/api/calendar/holidays/:id` | Admin | Update holiday |
| DELETE | `/api/calendar/holidays/:id` | Admin | Delete holiday |
| GET | `/api/calendar/stats` | No | Get calendar statistics |

---

## Testing Guide

### 1. **Test Event Creation**
```bash
# Login as admin first: admin@jinarth.com / admin123
# Go to: http://localhost:3000/calendar/events
# Click "Add Event"
# Fill in form:
#   - Title: "Team Standup"
#   - Date: 2026-04-20
#   - Time: 09:00
#   - Type: Meeting
#   - Location: Zoom
#   - Description: "Daily team standup meeting"
# Click "Add Event"
```

### 2. **Test Holiday Creation**
```bash
# Go to: http://localhost:3000/calendar/holidays
# Click "Add Holiday"
# Fill in form:
#   - Name: "Holi Festival"
#   - Date: 2026-03-29
#   - Country: India
#   - Type: Religious
#   - Description: "Festival of Colors"
# Click "Add Holiday"
```

### 3. **Test Event Deletion**
```bash
# In Events page, click trash icon next to any event
# Confirm deletion
# Event should disappear from list
```

### 4. **Test Holiday Deletion**
```bash
# In Holidays page, click trash icon next to any holiday
# Holiday should disappear from list
```

### 5. **Verify Statistics**
```bash
# Check /api/calendar/stats endpoint
# Should show counts of upcoming/past events and holidays
```

---

## Error Handling

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Missing auth token | Login first |
| 400 Bad Request | Invalid time format | Use HH:MM format |
| 400 Duplicate | Holiday on same date | Change date |
| 404 Not Found | Event/Holiday doesn't exist | Verify ID |
| 500 Server Error | Backend issue | Check server logs |

---

## Important Notes

1. **Authentication:** All POST/PUT/DELETE operations require Admin auth token
2. **Time Format:** Events require time in HH:MM format (24-hour)
3. **Date Validation:** Dates must be valid dates
4. **Unique Holidays:** Cannot have two holidays on the same date
5. **Sorting:** Events sorted by date ascending, holidays by date ascending
6. **Filtering:** Holidays can be filtered by country, type, and year

---

## Routes Files Location

- **Backend Routes:** `backend/src/routes/calendarRoutes.ts`
- **Backend Controller:** `backend/src/controllers/calendar.controller.ts`
- **Event Model:** `backend/src/models/Event/index.ts`
- **Holiday Model:** `backend/src/models/Holiday/index.ts`
- **Frontend Events:** `client/app/calendar/events/page.tsx`
- **Frontend Holidays:** `client/app/calendar/holidays/page.tsx`

---

**Status:** ✅ Complete and Ready for Testing
**Created:** March 17, 2026
