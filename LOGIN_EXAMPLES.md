# Login Flow Examples

## 🎯 **How the Login System Works**

The system now properly handles role-based authentication where each role requires specific identifiers:

### **1. Student Login**
```json
// Send OTP
POST /api/auth/send-otp
{
  "email": "23114@iiitu.ac.in",
  "role": "student"
}

// Verify OTP
POST /api/auth/verify-otp
{
  "email": "23114@iiitu.ac.in",
  "otp": "123456",
  "role": "student"
}
```
**Result:** Gets student data from Student model

---

### **2. Teacher Login**
```json
// Send OTP
POST /api/auth/send-otp
{
  "email": "201@iiitu.ac.in",
  "role": "teacher",
  "teacherId": "TCH001"
}

// Verify OTP
POST /api/auth/verify-otp
{
  "email": "201@iiitu.ac.in",
  "otp": "123456",
  "role": "teacher"
}
```
**Result:** Gets teacher data from Teacher model

---

### **3. Non-Teaching Staff Login**
```json
// Send OTP
POST /api/auth/send-otp
{
  "email": "101@iiitu.ac.in",
  "role": "nonteaching",
  "teacherId": "AD101"
}

// Verify OTP
POST /api/auth/verify-otp
{
  "email": "101@iiitu.ac.in",
  "otp": "123456",
  "role": "non_teaching"
}
```
**Result:** Gets staff data from NonTeachingStaff model

---

### **4. Admin Login**
```json
// Send OTP
POST /api/auth/send-otp
{
  "email": "001@iiitu.ac.in",
  "role": "admin"
}

// Verify OTP
POST /api/auth/verify-otp
{
  "email": "001@iiitu.ac.in",
  "otp": "123456",
  "role": "admin"
}
```
**Result:** Gets admin data from Admin model

---

## 🔧 **Key Points**

1. **Email Format:** All emails must follow `rollnumber@iiitu.ac.in` format
2. **Role Parameter:** Must be included in both send-otp and verify-otp requests
3. **ID Requirements:**
   - **Student:** No additional ID needed
   - **Teacher:** Requires `teacherId` in send-otp
   - **Non-Teaching Staff:** Requires `teacherId` (staffId) in send-otp
   - **Admin:** No additional ID needed

4. **Role Values:**
   - `"student"` - for students
   - `"teacher"` - for teachers
   - `"admin"` - for admins
   - `"nonteaching"` or `"non_teaching"` - for non-teaching staff

## 🎯 **Your Specific Use Case**

For non-teaching staff login:

```json
// Step 1: Send OTP
POST /api/auth/send-otp
{
  "email": "101@iiitu.ac.in",
  "role": "nonteaching",
  "teacherId": "AD101"
}

// Step 2: Verify OTP (check email for OTP)
POST /api/auth/verify-otp
{
  "email": "101@iiitu.ac.in",
  "otp": "321812",
  "role": "non_teaching"
}
```

**Response will contain:**
- JWT token
- Non-teaching staff data from NonTeachingStaff model
- Proper role and permissions
- Access to staff APIs

## 🚀 **Available Staff APIs After Login**

```bash
# View pending leave forms
GET /api/non-teaching/pending-forms
Authorization: Bearer <token>

# View all leave forms
GET /api/non-teaching/all-forms
Authorization: Bearer <token>

# Approve leave form
PUT /api/non-teaching/forms/:id/approve
Authorization: Bearer <token>

# Reject leave form
PUT /api/non-teaching/forms/:id/reject
Authorization: Bearer <token>
```

The system now correctly routes users to their respective models based on the role parameter! 🎉
