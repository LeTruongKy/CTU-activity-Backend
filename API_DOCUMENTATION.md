# CTU Activity Backend - API Documentation
## SV5T Criteria System & User Activity Tracking

**API Base URL:** `http://localhost:8080`  
**Version:** 1.0.0  
**Last Updated:** February 2026

---

## Table of Contents
1. [Authentication](#authentication)
2. [Database Schema Changes](#database-schema-changes)
3. [User Management Endpoints](#user-management-endpoints)
4. [SV5T Progress Endpoints](#sv5t-progress-endpoints)
5. [Admin Endpoints](#admin-endpoints)
6. [Registration Verification](#registration-verification)
7. [SV5T Calculation Rules](#sv5t-calculation-rules)
8. [Response Formats](#response-formats)

---

## Authentication

All protected endpoints require JWT bearer token authentication.

**Header:**
```
Authorization: Bearer {jwt_token}
```

---

## Database Schema Changes

### Entity Updates

#### 1. **User Entity** (`src/modules/users/entities/user.entity.ts`)

**New Fields Added:**
```typescript
@Column({ type: 'float', nullable: true, default: 0.0 })
gpa: number | null;                    // Grade Point Average (0-4.0)

@Column({ type: 'float', nullable: true, default: 0.0 })
drl: number | null;                    // Đạo đức rèn luyện (Ethics Score: 0-100)

@Column({ type: 'integer', nullable: true, default: 0 })
creditCount: number | null;            // Total credit hours completed

@Column({ type: 'boolean', nullable: true, default: false })
isDisabled: boolean | null;            // Disability support flag

@Column({ type: 'boolean', nullable: false, default: false })
sv5tEligible: boolean;                 // SV5T eligibility status
```

**Relations:**
- Many OneToMany with `Registration`
- Many OneToMany with `UserRole`
- Optional OneToMany with `UserInterest` (for category preferences)

#### 2. **CriteriaGroup Entity** (`src/modules/criteria_groups/entities/criteria_group.entity.ts`)

**New Field Added:**
```typescript
@Column({ type: 'integer', nullable: true, default: 1 })
requiredCount: number | null;          // Number of criteria needed from this group
```

**Purpose:** Tracks how many criteria from a group must be met for completion.

#### 3. **Criterion Entity** (`src/modules/criteria/entities/criterion.entity.ts`)

**New Field Added:**
```typescript
@Column({ type: 'varchar', length: 50, nullable: true, unique: true })
code: string | null;                   // Criteria code (e.g., 1.1, 1.2, 2.1, etc.)
```

**Purpose:** Unique identifier for criteria following SV5T numbering scheme.

#### 4. **Registration Entity** - ENHANCED (No Changes, but verification flow updated)

**Relevant Fields:**
```typescript
@Column({ enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' })
proofStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';

@Column({ type: 'timestamp', nullable: true })
verifiedAt: Date | null;

@Column({ type: 'uuid', nullable: true })
verifiedBy: string | null;
```

**Purpose:** Tracks proof verification for activity participation. Only VERIFIED registrations count toward SV5T progress.

---

## User Management Endpoints

### 1. Get User Profile

**Endpoint:** `GET /users/me/profile`  
**Authentication:** Required (JWT)  
**Description:** Retrieve current user's profile information

**Response (200 OK):**
```json
{
  "message": "User account information",
  "user": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@ctu.edu.vn",
    "fullName": "Nguyễn Văn A",
    "studentCode": "B2012345",
    "major": "Computer Science",
    "unitId": 1,
    "unitName": "Faculty of Information Technology",
    "avatarUrl": "https://...",
    "status": "ACTIVE",
    "createdAt": "2026-02-27T10:00:00Z"
  }
}
```

---

### 2. Update User Profile

**Endpoint:** `PATCH /users/me/profile`  
**Authentication:** Required (JWT)  
**Description:** Update user's basic profile information

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn A",
  "major": "Computer Science",
  "avatarUrl": "https://example.com/avatar.jpg",
  "unitId": 1
}
```

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@ctu.edu.vn",
    "fullName": "Nguyễn Văn A",
    "major": "Computer Science",
    "avatarUrl": "https://example.com/avatar.jpg",
    "updatedAt": "2026-02-27T11:00:00Z"
  }
}
```

---

### 3. Get User Activities

**Endpoint:** `GET /users/me/activities`  
**Authentication:** Required (JWT)  
**Description:** Retrieve all activities the user has participated in (registered, checked-in, or verified)

**Query Parameters:**
- `status` (optional): Filter by status - `REGISTERED`, `CHECKED_IN`, or `VERIFIED`

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "User activities retrieved successfully",
  "data": [
    {
      "registrationId": "650e8400-e29b-41d4-a716-446655440001",
      "activityId": 1,
      "activityTitle": "Environmental Cleanup",
      "activityDescription": "Join us in cleaning up the campus",
      "category": "Volunteering",
      "unit": "Faculty of IT",
      "startTime": "2026-03-01T08:00:00Z",
      "endTime": "2026-03-01T11:00:00Z",
      "registrationStatus": "CHECKED_IN",
      "proofStatus": "VERIFIED",
      "rating": 5,
      "verifiedAt": "2026-02-28T15:00:00Z"
    }
  ]
}
```

---

### 4. Update User Interests (Categories)

**Endpoint:** `POST /users/me/interests`  
**Authentication:** Required (JWT)  
**Description:** Update user's preferred activity categories

**Request Body:**
```json
{
  "categoryIds": [1, 3, 5]
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "User interests updated successfully",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "categoryIds": [1, 3, 5]
  }
}
```

**Error Response (400):**
```json
{
  "statusCode": 400,
  "message": "categoryIds must be an array of numbers"
}
```

---

### 5. Update User SV5T Fields (Admin)

**Endpoint:** `PATCH /users/:id/sv5t`  
**Authentication:** Required (JWT - Admin only)  
**Description:** Update user's academic metrics for SV5T calculation

**Request Body:**
```json
{
  "gpa": 3.5,
  "drl": 85,
  "creditCount": 45,
  "isDisabled": false
}
```

**Path Parameters:**
- `id`: User ID (UUID)

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "SV5T fields updated successfully",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "gpa": 3.5,
    "drl": 85,
    "creditCount": 45,
    "isDisabled": false,
    "sv5tEligible": false
  }
}
```

---

## SV5T Progress Endpoints

### 1. Get SV5T Progress

**Endpoint:** `GET /users/me/sv5t-progress`  
**Authentication:** Required (JWT)  
**Description:** Calculate comprehensive SV5T progress for the current user based on 5 standards

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "SV5T progress calculated successfully",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "studentCode": "B2012345",
    "fullName": "Nguyễn Văn A",
    "overallProgress": 78,
    "sv5tEligible": false,
    "criteriaGroups": [
      {
        "groupId": 1,
        "groupName": "Đạo đức tốt (Ethics)",
        "progress": 85,
        "completed": true,
        "criteria": [
          {
            "criteriaId": 1,
            "code": "1.1",
            "name": "DRL Score >= 80",
            "status": "MET",
            "description": "Ethics score requirement",
            "verifiedActivityCount": 3,
            "requiredActivityCount": 3
          },
          {
            "criteriaId": 2,
            "code": "1.2",
            "name": "Ethical Conduct Activities",
            "status": "MET",
            "description": "Participation in ethical activities",
            "verifiedActivityCount": 5,
            "requiredActivityCount": 3
          }
        ]
      },
      {
        "groupId": 2,
        "groupName": "Học tập tốt (Academic)",
        "progress": 50,
        "completed": false,
        "criteria": [
          {
            "criteriaId": 3,
            "code": "2.1",
            "name": "GPA >= 3.0",
            "status": "NOT_MET",
            "description": "Academic achievement"
          }
        ]
      },
      {
        "groupId": 3,
        "groupName": "Thể lực tốt (Physical Fitness)",
        "progress": 100,
        "completed": true,
        "criteria": [
          {
            "criteriaId": 4,
            "code": "3.1",
            "name": "Physical Education Pass",
            "status": "MET",
            "description": "PE course completion or fitness activities"
          }
        ]
      },
      {
        "groupId": 4,
        "groupName": "Tình nguyện tốt (Volunteering)",
        "progress": 60,
        "completed": false,
        "criteria": [
          {
            "criteriaId": 5,
            "code": "4.1",
            "name": "Volunteering Activities",
            "status": "IN_PROGRESS",
            "description": "Community service participation",
            "verifiedActivityCount": 2,
            "requiredActivityCount": 3
          }
        ]
      },
      {
        "groupId": 5,
        "groupName": "Hội nhập tốt (Social Integration)",
        "progress": 100,
        "completed": true,
        "criteria": [
          {
            "criteriaId": 6,
            "code": "5.1",
            "name": "Foreign Language & IT Skills",
            "status": "MET",
            "description": "Integration skills development"
          }
        ]
      }
    ],
    "lastActivityVerification": "2026-02-25T14:00:00Z",
    "generatedAt": "2026-02-27T12:00:00Z"
  }
}
```

---

## Admin Endpoints

### 1. Create Unit (Department/Club)

**Endpoint:** `POST /admin/units`  
**Authentication:** Required (JWT - Admin only)  
**Description:** Create a new organizing unit

**Request Body:**
```json
{
  "name": "Faculty of Information Technology",
  "description": "Information Technology Department",
  "type": "Faculty",
  "parentId": null
}
```

**Response (201 CREATED):**
```json
{
  "statusCode": 201,
  "message": "Unit created successfully",
  "data": {
    "unit_id": 1,
    "name": "Faculty of Information Technology",
    "description": "Information Technology Department",
    "type": "Faculty",
    "parentId": null,
    "createdAt": "2026-02-27T12:00:00Z"
  }
}
```

---

### 2. Get All Units

**Endpoint:** `GET /admin/units`  
**Authentication:** Required (JWT - Admin only)  
**Description:** Retrieve all organizing units

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Units retrieved successfully",
  "data": [
    {
      "unit_id": 1,
      "name": "Faculty of Information Technology",
      "description": "Information Technology Department",
      "type": "Faculty",
      "parentId": null,
      "createdAt": "2026-02-27T12:00:00Z"
    },
    {
      "unit_id": 2,
      "name": "Computer Science Club",
      "description": "Student programming club",
      "type": "Club",
      "parentId": 1,
      "createdAt": "2026-02-27T12:05:00Z"
    }
  ]
}
```

---

### 3. Batch Create Users

**Endpoint:** `POST /admin/users/batch`  
**Authentication:** Required (JWT - Admin only)  
**Description:** Create multiple users at once (useful for importing student lists)

**Request Body:**
```json
{
  "users": [
    {
      "email": "student1@ctu.edu.vn",
      "studentCode": "B2012345",
      "fullName": "Nguyễn Văn A",
      "unitId": 1,
      "major": "Computer Science"
    },
    {
      "email": "student2@ctu.edu.vn",
      "studentCode": "B2012346",
      "fullName": "Trần Thị B",
      "unitId": 1,
      "major": "Software Engineering"
    }
  ]
}
```

**Response (201 CREATED):**
```json
{
  "statusCode": 201,
  "message": "2 users created successfully",
  "data": [
    {
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "student1@ctu.edu.vn",
      "studentCode": "B2012345",
      "fullName": "Nguyễn Văn A",
      "status": "ACTIVE"
    },
    {
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "email": "student2@ctu.edu.vn",
      "studentCode": "B2012346",
      "fullName": "Trần Thị B",
      "status": "ACTIVE"
    }
  ]
}
```

---

## Registration Verification

### 1. Get Pending Verifications

**Endpoint:** `GET /admin/registrations/pending`  
**Authentication:** Required (JWT - Admin only)  
**Description:** Get all registrations waiting for proof verification

**Query Parameters:**
- `limit` (optional, default: 50): Number of records to return

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Pending registrations retrieved",
  "data": [
    {
      "registration_id": "650e8400-e29b-41d4-a716-446655440001",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "user_name": "Nguyễn Văn A",
      "activity_id": 1,
      "activity_title": "Environmental Cleanup",
      "proofUrl": "https://example.com/proof.jpg",
      "proofStatus": "PENDING",
      "submittedAt": "2026-02-27T10:00:00Z"
    }
  ]
}
```

---

### 2. Verify Registration Proof

**Endpoint:** `PATCH /admin/registrations/:id/verify`  
**Authentication:** Required (JWT - Admin only)  
**Description:** Approve or reject user's activity proof submission

**Path Parameters:**
- `id`: Registration ID (UUID)

**Request Body:**
```json
{
  "action": "VERIFIED",
  "rating": 5,
  "feedback": "Great participation and contribution to the environmental cleanup event."
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Registration verified successfully",
  "data": {
    "registration_id": "650e8400-e29b-41d4-a716-446655440001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "activity_id": 1,
    "status": "CHECKED_IN",
    "proofStatus": "VERIFIED",
    "rating": 5,
    "verifiedAt": "2026-02-27T15:00:00Z"
  }
}
```

**Reject Example:**
```json
{
  "action": "REJECTED",
  "feedback": "Proof does not clearly show participation in this activity."
}
```

---

## SV5T Calculation Rules

The "Sinh viên 5 tốt" (Five Outstanding Characteristics) system evaluates students across 5 standards:

### 1. **Đạo đức tốt (Ethics)**
- **Criteria:** DRL (Đạo đức rèn luyện) >= 80 AND >= 3 verified ethical activities
- **Status:** MET if both conditions satisfied
- **Status:** IN_PROGRESS if one condition is met
- **Status:** NOT_MET if none are met

### 2. **Học tập tốt (Academic Excellence)**
- **Criteria:** GPA >= 3.0 AND Credit hours >= 12
- **Status:** MET if both conditions satisfied
- **Status:** IN_PROGRESS if one condition is met
- **Status:** NOT_MET if none are met
- **Note:** No activity participation required; purely academic metrics

### 3. **Thể lực tốt (Physical Fitness)**
- **Criteria:** Pass Physical Education course OR >= 1 verified fitness activity
- **Status:** MET if either condition is satisfied
- **Status:** IN_PROGRESS if trying to complete
- **Status:** NOT_MET if none are met

### 4. **Tình nguyện tốt (Volunteering)**
- **Criteria:** >= 3 verified volunteering activities OR blood donation
- **Status:** MET if criteria satisfied
- **Status:** IN_PROGRESS if 1-2 activities completed
- **Status:** NOT_MET if no activities

### 5. **Hội nhập tốt (Social Integration)**
- **Criteria:** 2 out of 3 required:
  1. Foreign Language proficiency
  2. IT Skills (programming, software)
  3. >= 1 community integration activity
- **Status:** MET if 2+ criteria satisfied
- **Status:** IN_PROGRESS if 1 criterion satisfied
- **Status:** NOT_MET if none are met

### Overall SV5T Eligibility
- **SV5T Eligible:** ALL 5 groups must have `completed: true`
- **Overall Progress:** Average percentage across all 5 groups
- **Last Updated:** Timestamp when verification was last processed

---

## Response Formats

### Success Response Format
```json
{
  "statusCode": 200,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "BadRequestException"
}
```

### Status Codes
- **200 OK:** Successful GET/PATCH request
- **201 CREATED:** Successful POST request (resource created)
- **400 BAD_REQUEST:** Invalid request data
- **401 UNAUTHORIZED:** Missing or invalid JWT token
- **403 FORBIDDEN:** Insufficient permissions (not admin)
- **404 NOT_FOUND:** Resource not found
- **500 INTERNAL_SERVER_ERROR:** Server error

---

## Migration Notes

### Database Changes Required

1. **Add SV5T columns to User table:**
```sql
ALTER TABLE users ADD COLUMN gpa FLOAT DEFAULT 0.0 NULL;
ALTER TABLE users ADD COLUMN drl FLOAT DEFAULT 0.0 NULL;
ALTER TABLE users ADD COLUMN creditCount INT DEFAULT 0 NULL;
ALTER TABLE users ADD COLUMN isDisabled BOOLEAN DEFAULT FALSE NULL;
ALTER TABLE users ADD COLUMN sv5tEligible BOOLEAN DEFAULT FALSE NOT NULL;
```

2. **Add code column to Criterion table:**
```sql
ALTER TABLE criteria ADD COLUMN code VARCHAR(50) UNIQUE NULL;
```

3. **Add requiredCount to CriteriaGroup table:**
```sql
ALTER TABLE criteria_groups ADD COLUMN requiredCount INT DEFAULT 1 NULL;
```

4. **Create index for faster queries:**
```sql
CREATE INDEX idx_registration_userId_proofStatus ON registrations(userId, proofStatus);
CREATE INDEX idx_registration_verifiedAt ON registrations(verifiedAt);
```

---

## Error Handling

### Common Errors

**Missing JWT Token:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized - No token provided"
}
```

**Invalid Category IDs:**
```json
{
  "statusCode": 400,
  "message": "categoryIds must be an array of numbers"
}
```

**User Not Found:**
```json
{
  "statusCode": 404,
  "message": "User not found: 550e8400-e29b-41d4-a716-446655440000"
}
```

**Invalid GPA Range:**
```json
{
  "statusCode": 400,
  "message": "GPA must be between 0 and 4"
}
```

---

## Testing Guide

### 1. Test Getting SV5T Progress
```bash
curl -X GET http://localhost:8080/users/me/sv5t-progress \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

### 2. Test Updating User SV5T Fields
```bash
curl -X PATCH http://localhost:8080/users/{USER_ID}/sv5t \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "gpa": 3.5,
    "drl": 85,
    "creditCount": 45
  }'
```

### 3. Test Verifying Registration
```bash
curl -X PATCH http://localhost:8080/admin/registrations/{REG_ID}/verify \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "VERIFIED",
    "rating": 5,
    "feedback": "Great participation"
  }'
```

---

## Future Enhancements

1. **Automated SV5T Recalculation:** Trigger recalculation when activities are verified
2. **SV5T Badges:** Issue digital badges when criteria are met
3. **Progress Notifications:** Notify users when they're close to meeting criteria
4. **Export Functionality:** Allow admins to export SV5T reports
5. **Historical Tracking:** Maintain history of SV5T progress changes
6. **Disability Accommodations:** Implement alternative criteria for disabled students
7. **Foreign Language Verification:** Integration with language testing systems
8. **IT Skills Portfolio:** Link to student GitHub/coding profiles

---

**End of API Documentation**
