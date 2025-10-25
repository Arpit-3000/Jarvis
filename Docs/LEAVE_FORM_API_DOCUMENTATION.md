# Leave Form System API Documentation

## Overview
This document describes the complete API endpoints for the Leave Form Management System, including student submission and non-teaching staff approval functionality.

## Authentication Flow
Both students and non-teaching staff use the same OTP-based authentication system:

### 1. Send OTP
**Endpoint:** `POST /api/auth/send-otp`

**Request Body:**
```json
{
  "email": "23114@iiitu.ac.in",
  "role": "student" | "teacher" | "admin" | "nonteaching",
  "teacherId": "STAFF001" // Required for teacher and nonteaching roles
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "email": "23114@iiitu.ac.in",
    "role": "student",
    "expiresIn": "10 minutes"
  }
}
```

### 2. Verify OTP
**Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**
```json
{
  "email": "23114@iiitu.ac.in",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "token": "jwt_token_here",
    "email": "23114@iiitu.ac.in",
    "role": "student",
    "userType": "Student",
    "user": {
      "id": "user_id",
      "name": "Student Name",
      "email": "23114@iiitu.ac.in",
      "studentId": "STU001",
      "rollNumber": "23114",
      "department": "CSE",
      "phone": "9876543210"
    }
  }
}
```

---

## Student APIs

### 1. Submit Leave Form
**Endpoint:** `POST /api/leave-form/submit`  
**Authentication:** Required (Student)  
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "hostelName": "Boys Hostel A",
  "roomNumber": "101",
  "exitDate": "2024-01-15",
  "entryDate": "2024-01-17",
  "exitTime": "10:00",
  "entryTime": "18:00",
  "reason": "Family emergency - need to visit hometown",
  "emergencyContact": {
    "name": "John Doe",
    "phone": "9876543210",
    "relation": "Father"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leave form submitted successfully",
  "data": {
    "leaveForm": {
      "id": "form_id",
      "studentName": "Student Name",
      "rollNumber": "23114",
      "hostelName": "Boys Hostel A",
      "roomNumber": "101",
      "exitDate": "2024-01-15T00:00:00.000Z",
      "entryDate": "2024-01-17T00:00:00.000Z",
      "exitTime": "10:00",
      "entryTime": "18:00",
      "reason": "Family emergency - need to visit hometown",
      "status": "pending",
      "submittedAt": "2024-01-10T10:30:00.000Z",
      "leaveDuration": 2
    }
  }
}
```

### 2. Get My Leave Forms
**Endpoint:** `GET /api/leave-form/my-forms`  
**Authentication:** Required (Student)  
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (pending, approved, rejected, cancelled)

**Example:** `GET /api/leave-form/my-forms?page=1&limit=5&status=pending`

**Response:**
```json
{
  "success": true,
  "message": "Leave forms retrieved successfully",
  "data": {
    "leaveForms": [
      {
        "id": "form_id",
        "studentName": "Student Name",
        "rollNumber": "23114",
        "hostelName": "Boys Hostel A",
        "roomNumber": "101",
        "exitDate": "2024-01-15T00:00:00.000Z",
        "entryDate": "2024-01-17T00:00:00.000Z",
        "exitTime": "10:00",
        "entryTime": "18:00",
        "reason": "Family emergency",
        "status": "pending",
        "submittedAt": "2024-01-10T10:30:00.000Z",
        "leaveDuration": 2
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalLeaveForms": 25,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 3. Get Specific Leave Form
**Endpoint:** `GET /api/leave-form/:id`  
**Authentication:** Required (Student)  
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Leave form retrieved successfully",
  "data": {
    "leaveForm": {
      "id": "form_id",
      "studentName": "Student Name",
      "rollNumber": "23114",
      "studentPhone": "9876543210",
      "hostelName": "Boys Hostel A",
      "roomNumber": "101",
      "exitDate": "2024-01-15T00:00:00.000Z",
      "entryDate": "2024-01-17T00:00:00.000Z",
      "exitTime": "10:00",
      "entryTime": "18:00",
      "reason": "Family emergency",
      "status": "approved",
      "approvedBy": "staff_id",
      "approvedAt": "2024-01-11T14:30:00.000Z",
      "rejectionReason": null,
      "emergencyContact": {
        "name": "John Doe",
        "phone": "9876543210",
        "relation": "Father"
      },
      "submittedAt": "2024-01-10T10:30:00.000Z",
      "leaveDuration": 2
    }
  }
}
```

### 4. Cancel Leave Form
**Endpoint:** `PUT /api/leave-form/:id/cancel`  
**Authentication:** Required (Student)  
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Leave form cancelled successfully",
  "data": {
    "leaveForm": {
      "id": "form_id",
      "status": "cancelled"
    }
  }
}
```

---

## Non-Teaching Staff APIs

### 1. Get All Pending Leave Forms
**Endpoint:** `GET /api/non-teaching/pending-forms`  
**Authentication:** Required (Non-Teaching Staff)  
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `hostelName` (optional): Filter by hostel name
- `rollNumber` (optional): Filter by roll number

**Example:** `GET /api/non-teaching/pending-forms?page=1&limit=10&hostelName=Boys%20Hostel%20A`

**Response:**
```json
{
  "success": true,
  "message": "Pending leave forms retrieved successfully",
  "data": {
    "leaveForms": [
      {
        "id": "form_id",
        "studentId": {
          "id": "student_id",
          "name": "Student Name",
          "email": "23114@iiitu.ac.in",
          "rollNumber": "23114",
          "department": "CSE",
          "year": "2nd",
          "phone": "9876543210"
        },
        "studentName": "Student Name",
        "rollNumber": "23114",
        "hostelName": "Boys Hostel A",
        "roomNumber": "101",
        "exitDate": "2024-01-15T00:00:00.000Z",
        "entryDate": "2024-01-17T00:00:00.000Z",
        "exitTime": "10:00",
        "entryTime": "18:00",
        "reason": "Family emergency",
        "status": "pending",
        "submittedAt": "2024-01-10T10:30:00.000Z",
        "leaveDuration": 2
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalPendingForms": 47,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 2. Get All Leave Forms
**Endpoint:** `GET /api/non-teaching/all-forms`  
**Authentication:** Required (Non-Teaching Staff)  
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (pending, approved, rejected, cancelled)
- `hostelName` (optional): Filter by hostel name
- `rollNumber` (optional): Filter by roll number
- `dateFrom` (optional): Filter from date (YYYY-MM-DD)
- `dateTo` (optional): Filter to date (YYYY-MM-DD)

**Example:** `GET /api/non-teaching/all-forms?status=approved&dateFrom=2024-01-01&dateTo=2024-01-31`

**Response:**
```json
{
  "success": true,
  "message": "Leave forms retrieved successfully",
  "data": {
    "leaveForms": [
      {
        "id": "form_id",
        "studentId": {
          "id": "student_id",
          "name": "Student Name",
          "email": "23114@iiitu.ac.in",
          "rollNumber": "23114",
          "department": "CSE",
          "year": "2nd",
          "phone": "9876543210"
        },
        "approvedBy": {
          "id": "staff_id",
          "name": "Staff Name",
          "staffId": "STAFF001",
          "designation": "Hostel Warden"
        },
        "studentName": "Student Name",
        "rollNumber": "23114",
        "hostelName": "Boys Hostel A",
        "roomNumber": "101",
        "exitDate": "2024-01-15T00:00:00.000Z",
        "entryDate": "2024-01-17T00:00:00.000Z",
        "exitTime": "10:00",
        "entryTime": "18:00",
        "reason": "Family emergency",
        "status": "approved",
        "approvedAt": "2024-01-11T14:30:00.000Z",
        "submittedAt": "2024-01-10T10:30:00.000Z",
        "leaveDuration": 2
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalLeaveForms": 95,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 3. Get Leave Form Details
**Endpoint:** `GET /api/non-teaching/forms/:id`  
**Authentication:** Required (Non-Teaching Staff)  
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Leave form details retrieved successfully",
  "data": {
    "leaveForm": {
      "id": "form_id",
      "student": {
        "id": "student_id",
        "name": "Student Name",
        "email": "23114@iiitu.ac.in",
        "rollNumber": "23114",
        "department": "CSE",
        "year": "2nd",
        "phone": "9876543210",
        "address": {
          "street": "123 Main St",
          "city": "City",
          "state": "State",
          "pincode": "123456",
          "country": "India"
        }
      },
      "studentName": "Student Name",
      "rollNumber": "23114",
      "studentPhone": "9876543210",
      "hostelName": "Boys Hostel A",
      "roomNumber": "101",
      "exitDate": "2024-01-15T00:00:00.000Z",
      "entryDate": "2024-01-17T00:00:00.000Z",
      "exitTime": "10:00",
      "entryTime": "18:00",
      "reason": "Family emergency",
      "status": "pending",
      "approvedBy": null,
      "approvedAt": null,
      "rejectionReason": null,
      "emergencyContact": {
        "name": "John Doe",
        "phone": "9876543210",
        "relation": "Father"
      },
      "submittedAt": "2024-01-10T10:30:00.000Z",
      "leaveDuration": 2
    }
  }
}
```

### 4. Approve Leave Form
**Endpoint:** `PUT /api/non-teaching/forms/:id/approve`  
**Authentication:** Required (Non-Teaching Staff)  
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Leave form approved successfully",
  "data": {
    "leaveForm": {
      "id": "form_id",
      "status": "approved",
      "approvedBy": "staff_id",
      "approvedAt": "2024-01-11T14:30:00.000Z"
    }
  }
}
```

### 5. Reject Leave Form
**Endpoint:** `PUT /api/non-teaching/forms/:id/reject`  
**Authentication:** Required (Non-Teaching Staff)  
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "rejectionReason": "Insufficient documentation provided. Please provide proper medical certificate."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leave form rejected successfully",
  "data": {
    "leaveForm": {
      "id": "form_id",
      "status": "rejected",
      "approvedBy": "staff_id",
      "approvedAt": "2024-01-11T14:30:00.000Z",
      "rejectionReason": "Insufficient documentation provided. Please provide proper medical certificate."
    }
  }
}
```

### 6. Get Leave Form Statistics
**Endpoint:** `GET /api/non-teaching/stats`  
**Authentication:** Required (Non-Teaching Staff)  
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Leave form statistics retrieved successfully",
  "data": {
    "stats": {
      "totalPending": 15,
      "totalApproved": 120,
      "totalRejected": 8,
      "totalCancelled": 5,
      "totalForms": 148,
      "todaySubmissions": 3,
      "thisWeekSubmissions": 25
    }
  }
}
```

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "exitDate",
      "message": "Exit date cannot be in the past"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "No token provided, authorization denied"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Leave form not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Server error while submitting leave form"
}
```

---

## Data Models

### LeaveForm Schema
```javascript
{
  studentId: ObjectId (ref: Student),
  studentName: String,
  rollNumber: String,
  studentPhone: String,
  hostelName: String,
  roomNumber: String,
  exitDate: Date,
  entryDate: Date,
  exitTime: String,
  entryTime: String,
  reason: String,
  status: String (enum: ['pending', 'approved', 'rejected', 'cancelled']),
  approvedBy: ObjectId (ref: NonTeachingStaff),
  approvedAt: Date,
  rejectionReason: String,
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  isActive: Boolean,
  submittedAt: Date
}
```

### NonTeachingStaff Schema
```javascript
{
  name: String,
  email: String,
  staffId: String,
  designation: String,
  department: String,
  role: String (enum: ['Hostel Warden', 'Security Head', 'Administrative Staff', 'Caretaker', 'Other']),
  phone: String,
  address: Object,
  permissions: {
    canApproveLeave: Boolean,
    canRejectLeave: Boolean,
    canViewAllLeaves: Boolean,
    canViewStudentDetails: Boolean
  },
  isActive: Boolean
}
```

---

## Usage Examples

### Student Workflow
1. **Login:** Send OTP → Verify OTP → Get JWT token
2. **Submit Leave Form:** POST `/api/leave-form/submit` with form data
3. **Check Status:** GET `/api/leave-form/my-forms` to see all forms
4. **View Details:** GET `/api/leave-form/:id` for specific form
5. **Cancel if needed:** PUT `/api/leave-form/:id/cancel` (only for pending forms)

### Non-Teaching Staff Workflow
1. **Login:** Send OTP with staffId → Verify OTP → Get JWT token
2. **View Pending Forms:** GET `/api/non-teaching/pending-forms`
3. **Review Details:** GET `/api/non-teaching/forms/:id`
4. **Approve/Reject:** PUT `/api/non-teaching/forms/:id/approve` or `/reject`
5. **View Statistics:** GET `/api/non-teaching/stats`

---

## Notes
- All dates should be in ISO 8601 format (YYYY-MM-DD)
- All times should be in HH:MM format (24-hour)
- JWT tokens expire based on configuration (default: 24 hours)
- OTP expires in 10 minutes with maximum 3 attempts
- Students can only have one pending leave form at a time
- Non-teaching staff can view and manage all leave forms
- All API responses follow a consistent format with `success`, `message`, and `data` fields
