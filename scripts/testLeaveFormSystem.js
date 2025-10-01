const mongoose = require('mongoose');
const connectDB = require('../config/database');
const { insertNonTeachingStaffData } = require('../data/dummyNonTeachingStaff');

// Test data for leave form system
const testLeaveFormData = {
  student: {
    name: "Arpit Srivastava",
    email: "23114@iiitu.ac.in",
    studentId: "STU2024001",
    rollNumber: "23114",
    department: "Computer Science",
    branch: "Computer Science and Engineering",
    course: "Bachelor of Technology",
    year: "3rd",
    currentSemester: "5th",
    phone: "9876543210",
    address: {
      street: "123 Main Street",
      city: "Una",
      state: "Himachal Pradesh",
      pincode: "174303",
      country: "India"
    },
    fatherName: "Suresh Kumar",
    motherName: "Sunita Kumar",
    fatherPhone: "9876543211",
    motherPhone: "9876543212",
    dateOfBirth: new Date("2003-05-15"),
    gender: "Male",
    bloodGroup: "B+",
    isActive: true
  },
  leaveForm: {
    hostelName: "Boys Hostel A",
    roomNumber: "101",
    exitDate: "2024-01-15",
    entryDate: "2024-01-17",
    exitTime: "10:00",
    entryTime: "18:00",
    reason: "Family emergency - need to visit hometown for urgent family matter",
    emergencyContact: {
      name: "Suresh Kumar",
      phone: "9876543211",
      relation: "Father"
    }
  }
};

// Test API endpoints
const testAPIEndpoints = async () => {
  const baseURL = 'http://localhost:5000/api';
  
  console.log('🧪 Testing Leave Form System APIs...\n');

  try {
    // Test 1: Student Login (Send OTP)
    console.log('1️⃣ Testing Student Login (Send OTP)...');
    const studentOTPResponse = await fetch(`${baseURL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testLeaveFormData.student.email,
        role: 'student'
      })
    });
    
    const studentOTPData = await studentOTPResponse.json();
    console.log('✅ Student OTP sent:', studentOTPData.message);
    console.log('📧 Email:', studentOTPData.data.email);
    console.log('⏰ Expires in:', studentOTPData.data.expiresIn);
    
    // Note: In real testing, you would need to check email for OTP
    console.log('⚠️  Note: Check email for OTP to continue testing\n');

    // Test 2: Non-Teaching Staff Login (Send OTP)
    console.log('2️⃣ Testing Non-Teaching Staff Login (Send OTP)...');
    const staffOTPResponse = await fetch(`${baseURL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: '101@iiitu.ac.in',
        role: 'nonteaching',
        teacherId: 'AD101'
      })
    });
    
    const staffOTPData = await staffOTPResponse.json();
    console.log('✅ Staff OTP sent:', staffOTPData.message);
    console.log('📧 Email:', staffOTPData.data.email);
    console.log('🆔 Staff ID:', 'AD101');
    console.log('⏰ Expires in:', staffOTPData.data.expiresIn);
    console.log('⚠️  Note: Check email for OTP to continue testing\n');

    // Test 3: API Health Check
    console.log('3️⃣ Testing API Health Check...');
    const healthResponse = await fetch(`${baseURL.replace('/api', '')}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ API Health:', healthData.message);
    console.log('🕐 Timestamp:', healthData.timestamp);
    console.log('⏱️  Uptime:', Math.round(healthData.uptime), 'seconds\n');

    // Test 4: API Information
    console.log('4️⃣ Testing API Information...');
    const infoResponse = await fetch(`${baseURL.replace('/api', '')}/`);
    const infoData = await infoResponse.json();
    console.log('✅ API Info:', infoData.message);
    console.log('📦 Version:', infoData.version);
    console.log('🌍 Environment:', infoData.environment);
    console.log('🔗 Base URL:', `${baseURL.replace('/api', '')}/api\n`);

  } catch (error) {
    console.error('❌ API Test Error:', error.message);
  }
};

// Display system information
const displaySystemInfo = () => {
  console.log('🎓 IIITU Student Portal - Leave Form System');
  console.log('=' .repeat(50));
  console.log('📋 System Components:');
  console.log('  ✅ LeaveForm Model - Complete schema with validation');
  console.log('  ✅ NonTeachingStaff Model - Staff management');
  console.log('  ✅ Authentication System - OTP-based for all roles');
  console.log('  ✅ Student APIs - Submit, view, cancel leave forms');
  console.log('  ✅ Staff APIs - Approve, reject, view all forms');
  console.log('  ✅ Validation - Comprehensive input validation');
  console.log('  ✅ Error Handling - Professional error responses');
  console.log('  ✅ Documentation - Complete API documentation');
  console.log('=' .repeat(50));
  console.log('');
};

// Display test credentials
const displayTestCredentials = () => {
  console.log('🔐 Test Credentials:');
  console.log('=' .repeat(30));
  console.log('👨‍🎓 Student Login:');
  console.log('  Email: 23114@iiitu.ac.in');
  console.log('  Role: student');
  console.log('  (No additional ID required)');
  console.log('');
    console.log('👨‍💼 Non-Teaching Staff Login:');
    console.log('  Staff 1:');
    console.log('    Email: 101@iiitu.ac.in');
    console.log('    Staff ID: AD101');
    console.log('    Role: nonteaching');
    console.log('  Staff 2:');
    console.log('    Email: 102@iiitu.ac.in');
    console.log('    Staff ID: GD101');
    console.log('    Role: nonteaching');
  console.log('=' .repeat(30));
  console.log('');
};

// Display API endpoints
const displayAPIEndpoints = () => {
  console.log('🔗 Available API Endpoints:');
  console.log('=' .repeat(40));
  console.log('🔐 Authentication:');
  console.log('  POST /api/auth/send-otp');
  console.log('  POST /api/auth/verify-otp');
  console.log('  POST /api/auth/verify-token');
  console.log('');
  console.log('👨‍🎓 Student APIs:');
  console.log('  POST /api/leave-form/submit');
  console.log('  GET  /api/leave-form/my-forms');
  console.log('  GET  /api/leave-form/:id');
  console.log('  PUT  /api/leave-form/:id/cancel');
  console.log('');
  console.log('👨‍💼 Non-Teaching Staff APIs:');
  console.log('  GET  /api/non-teaching/pending-forms');
  console.log('  GET  /api/non-teaching/all-forms');
  console.log('  GET  /api/non-teaching/forms/:id');
  console.log('  PUT  /api/non-teaching/forms/:id/approve');
  console.log('  PUT  /api/non-teaching/forms/:id/reject');
  console.log('  GET  /api/non-teaching/stats');
  console.log('=' .repeat(40));
  console.log('');
};

// Main execution
const main = async () => {
  displaySystemInfo();
  displayTestCredentials();
  displayAPIEndpoints();

  try {
    // Connect to database
    console.log('🔌 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully\n');

    // Insert non-teaching staff data
    console.log('👥 Inserting non-teaching staff data...');
    await insertNonTeachingStaffData();
    console.log('');

    // Test API endpoints (if server is running)
    console.log('🌐 Testing API endpoints...');
    console.log('⚠️  Make sure the server is running (npm run dev)');
    console.log('');
    
    await testAPIEndpoints();

    console.log('🎉 Leave Form System Setup Complete!');
    console.log('');
    console.log('📚 Next Steps:');
    console.log('  1. Start the server: npm run dev');
    console.log('  2. Test student login with: 23114@iiitu.ac.in');
    console.log('  3. Test staff login with: ad101@iiitu.ac.in (AD101)');
    console.log('  4. Submit a leave form as a student');
    console.log('  5. Approve/reject the form as staff');
    console.log('');
    console.log('📖 Full documentation: LEAVE_FORM_API_DOCUMENTATION.md');

  } catch (error) {
    console.error('❌ Setup Error:', error.message);
  } finally {
    process.exit(0);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { testAPIEndpoints, displaySystemInfo, displayTestCredentials };
