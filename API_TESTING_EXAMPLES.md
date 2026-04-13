# 🧪 API TESTING GUIDE - Thunder Client / Postman Collection

**Ready-to-use examples for testing CTU Activity Backend**

---

## 📋 TABLE OF CONTENTS

1. [Auth Endpoints](#auth-endpoints)
2. [Activities Endpoints](#activities-endpoints)
3. [Registrations Endpoints](#registrations-endpoints)
4. [QR Check-In](#qr-check-in)
5. [Calendar Endpoints](#calendar-endpoints)
6. [User Criteria](#user-criteria)

---

## 🔐 Auth Endpoints

### 1. Register New User
**Type:** `POST`  
**URL:** `http://localhost:3000/auth/register`

```json
{
  "email": "student@ctu.edu.vn",
  "password": "SecurePass123!",
  "fullName": "Nguyễn Văn A",
  "studentCode": "SV20210001",
  "unitId": 1
}
```

**Expected Response (201):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@ctu.edu.vn",
    "fullName": "Nguyễn Văn A",
    "status": "ACTIVE",
    "role": "STUDENT"
  }
}
```

---

### 2. Login
**Type:** `POST`  
**URL:** `http://localhost:3000/auth/login`

```json
{
  "email": "student@ctu.edu.vn",
  "password": "SecurePass123!"
}
```

**Expected Response (200):**
```json
{
  "message": "Login successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@ctu.edu.vn",
    "fullName": "Nguyễn Văn A"
  }
}
```

**Note:** `refresh_token` is set as HTTP-only cookie automatically

---

### 3. Get Current User Profile
**Type:** `GET`  
**URL:** `http://localhost:3000/auth/account`  
**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response (200):**
```json
{
  "message": "User account information",
  "user": {
    "sub": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@ctu.edu.vn",
    "fullName": "Nguyễn Văn A",
    "studentCode": "SV20210001",
    "role": "STUDENT",
    "iss": "ctu-activity-backend"
  }
}
```

---

### 4. Refresh Access Token
**Type:** `POST`  
**URL:** `http://localhost:3000/auth/refresh-token`  
**Headers:**
```
Cookie: refresh_token=YOUR_REFRESH_TOKEN
```

**Expected Response (200):**
```json
{
  "message": "Refresh token successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 5. Logout
**Type:** `POST`  
**URL:** `http://localhost:3000/auth/logout`  
**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

## 📚 Activities Endpoints

### 1. List All Activities
**Type:** `GET`  
**URL:** `http://localhost:3000/activities`  
**Query Parameters:**
```
?search=cleanup
&categoryId=1
&unitId=1
&status=APPROVED
&page=1
&limit=10
```

**Expected Response (200):**
```json
{
  "message": "Activities retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Beach Cleanup Event",
      "description": "Join us for cleaning the beach",
      "startTime": "2026-04-15T08:00:00Z",
      "endTime": "2026-04-15T12:00:00Z",
      "location": "Nha Trang Beach",
      "maxParticipants": 50,
      "requiresProof": true,
      "pointsValue": 5,
      "criteriaGroupId": 1
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

---

### 2. Get Activity Details
**Type:** `GET`  
**URL:** `http://localhost:3000/activities/:id`  
**Path:** `http://localhost:3000/activities/1`

**Expected Response (200):**
```json
{
  "message": "Activity details",
  "activity": {
    "id": 1,
    "title": "Beach Cleanup Event",
    "description": "Join us for cleaning the beach",
    "category": {
      "id": 1,
      "name": "Tình nguyện viên"
    },
    "organizer": {
      "id": "user-id",
      "fullName": "Nguyễn Văn B"
    },
    "startTime": "2026-04-15T08:00:00Z",
    "endTime": "2026-04-15T12:00:00Z",
    "location": "Nha Trang Beach",
    "registrationCount": 45,
    "maxParticipants": 50,
    "status": "APPROVED"
  }
}
```

---

### 3. Create New Activity (Admin/LCH only)
**Type:** `POST`  
**URL:** `http://localhost:3000/activities`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

```json
{
  "title": "Environmental Cleanup",
  "description": "Clean local park",
  "categoryId": 1,
  "unitId": 1,
  "location": "Tao Đàn Park",
  "startTime": "2026-04-20T07:00:00Z",
  "endTime": "2026-04-20T11:00:00Z",
  "maxParticipants": 100,
  "criteriaGroupId": 1,
  "requiresProof": true,
  "pointsValue": 5,
  "criteriaIds": [1, 2],
  "tagIds": [1]
}
```

**Expected Response (201):**
```json
{
  "message": "Activity created successfully",
  "activity": {
    "id": 2,
    "title": "Environmental Cleanup",
    "createdAt": "2026-04-07T10:00:00Z"
  }
}
```

---

## 👥 Registrations Endpoints

### 1. Register for Activity
**Type:** `POST`  
**URL:** `http://localhost:3000/registrations`  
**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

```json
{
  "activityId": 1,
  "skipConflictCheck": false
}
```

**Expected Response (201):**
```json
{
  "message": "Successfully registered for activity",
  "registration": {
    "id": "reg-123",
    "userId": "user-id",
    "activityId": 1,
    "proofStatus": "PENDING",
    "registeredAt": "2026-04-07T10:00:00Z"
  }
}
```

**Possible Errors:**
- 409 if already registered (UNIQUE constraint)
- 409 if calendar conflict (unless skipConflictCheck=true)

---

### 2. Get User Registrations
**Type:** `GET`  
**URL:** `http://localhost:3000/registrations/user/:userId`  
**Path:** `http://localhost:3000/registrations/user/550e8400-e29b-41d4-a716-446655440000`  
**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response (200):**
```json
{
  "message": "User registered activities retrieved successfully",
  "data": [
    {
      "id": "reg-123",
      "activity": {
        "id": 1,
        "title": "Beach Cleanup",
        "startTime": "2026-04-15T08:00:00Z"
      },
      "proofStatus": "PENDING",
      "registeredAt": "2026-04-07T10:00:00Z"
    }
  ],
  "count": 1
}
```

---

### 3. Cancel Registration
**Type:** `DELETE`  
**URL:** `http://localhost:3000/registrations/:id`  
**Path:** `http://localhost:3000/registrations/reg-123`  
**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response (200):**
```json
{
  "message": "Registration cancelled successfully",
  "registration": {
    "id": "reg-123",
    "deleted": true,
    "deletedAt": "2026-04-07T10:30:00Z"
  }
}
```

---

## 🔲 QR Check-In Endpoints

### 1. Check In via QR Code
**Type:** `POST`  
**URL:** `http://localhost:3000/qr/:activityId/check-in?data=BASE64_PAYLOAD`  
**Path:** `http://localhost:3000/qr/1/check-in?data=MTo...encoded...`  
**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Check-in successful",
  "registration": {
    "id": "reg-123",
    "activity": {
      "id": 1,
      "title": "Beach Cleanup"
    },
    "proofStatus": "VERIFIED",
    "qrSignature": "sig-xyz",
    "checkedInAt": "2026-04-15T08:05:00Z"
  }
}
```

**Possible Errors:**
- 400 if QR expired
- 400 if QR signature invalid (tampered)
- 400 if outside ±15 min window

---

### 2. Validate QR Code (Test)
**Type:** `POST`  
**URL:** `http://localhost:3000/qr/validate?data=BASE64_PAYLOAD`  
**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response (200):**
```json
{
  "valid": true,
  "activityId": 1,
  "expirationTime": "2026-04-15T13:00:00Z"
}
```

---

## 📅 Calendar Endpoints

### 1. Get Month Calendar
**Type:** `GET`  
**URL:** `http://localhost:3000/calendar?year=2026&month=4`  
**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response (200):**
```json
{
  "message": "User calendar for April 2026",
  "data": [
    {
      "id": 1,
      "activity": {
        "id": 1,
        "title": "Beach Cleanup",
        "location": "Nha Trang"
      },
      "startTime": "2026-04-15T08:00:00Z",
      "endTime": "2026-04-15T12:00:00Z"
    }
  ],
  "total": 1
}
```

---

### 2. Get Activities for Specific Date
**Type:** `GET`  
**URL:** `http://localhost:3000/calendar/date?date=2026-04-15`  
**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response (200):**
```json
{
  "message": "Activities for 2026-04-15",
  "date": "2026-04-15",
  "data": [
    {
      "id": 1,
      "activity": {
        "title": "Beach Cleanup",
        "startTime": "2026-04-15T08:00:00Z",
        "endTime": "2026-04-15T12:00:00Z"
      }
    }
  ]
}
```

---

### 3. Check for Calendar Conflicts
**Type:** `POST`  
**URL:** `http://localhost:3000/calendar/check-conflict`  
**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

```json
{
  "startTime": "2026-04-15T08:00:00Z",
  "endTime": "2026-04-15T12:00:00Z"
}
```

**Expected Response (200):**
```json
{
  "hasConflict": true,
  "conflicts": [
    {
      "id": 1,
      "title": "Beach Cleanup",
      "startTime": "2026-04-15T09:00:00Z",
      "endTime": "2026-04-15T13:00:00Z",
      "location": "Nha Trang Beach"
    }
  ]
}
```

---

## 📊 User Criteria Endpoints

### 1. Get User Progress
**Type:** `GET`  
**URL:** `http://localhost:3000/user/criteria/progress`  
**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response (200):**
```json
{
  "message": "User criteria progress",
  "data": [
    {
      "id": 1,
      "criteriaGroup": {
        "id": 1,
        "name": "Volunteer 20 Hours",
        "requiredCount": 20
      },
      "progressCount": 5,
      "completionCount": 0,
      "autoCompleted": false,
      "userOverride": null,
      "finalCompleted": false
    }
  ]
}
```

---

### 2. Get Completed Criteria Count
**Type:** `GET`  
**URL:** `http://localhost:3000/user/criteria/completed`  
**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response (200):**
```json
{
  "message": "Completed criteria count",
  "completedCount": 2,
  "totalCriteria": 5
}
```

---

### 3. Set User Override
**Type:** `PATCH`  
**URL:** `http://localhost:3000/user/criteria/:groupId/override`  
**Path:** `http://localhost:3000/user/criteria/1/override`  
**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

```json
{
  "override": true
}
```

**Expected Response (200):**
```json
{
  "message": "User override set successfully",
  "userCriteria": {
    "id": 1,
    "userOverride": true,
    "finalCompleted": true,
    "userOverriddenAt": "2026-04-07T10:00:00Z"
  }
}
```

---

## 🧪 TESTING WORKFLOW

### Scenario: Complete Registration & Criteria Flow

```
1. Register → Get User ID
2. Login → Get JWT Token
3. Create Activity (admin) → Get Activity ID with criteriaGroupId=1
4. Register for Activity → Registration ID
5. Check Calendar → Should show activity
6. Check-In via QR → proofStatus changes to VERIFIED
7. Get User Criteria → progressCount=1, finalCompleted depends on requiredCount
8. Get Admin Report → User appears in top users
```

### Quick Copy-Paste Test

```bash
# 1. Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ctu.edu.vn","password":"Pass123!","fullName":"Test","unitId":1}'

# 2. Login  
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ctu.edu.vn","password":"Pass123!"}'

# 3. List Activities
curl -X GET http://localhost:3000/activities

# 4. Register for activity
curl -X POST http://localhost:3000/registrations \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"activityId":1}'
```

---

## ⚠️ IMPORTANT NOTES

1. **Replace placeholders:**
   - `YOUR_ACCESS_TOKEN` → Actual JWT from login
   - `:id` → Actual IDs from responses
   - `BASE64_PAYLOAD` → QR code data

2. **All timestamps:** ISO 8601 format

4. **Pagination:** Default page=1, limit=20

5. **Soft deletes:** Include `WHERE deletedAt IS NULL` automatically

---

**For more details, see [BACKEND_IMPLEMENTATION_SUMMARY.md](./BACKEND_IMPLEMENTATION_SUMMARY.md)**

