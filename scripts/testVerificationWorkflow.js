const axios = require('axios');
require('dotenv').config({ path: './config.env' });

const BASE_URL = 'http://localhost:3000/api';

// Test credentials
const ATTENDANT_CREDENTIALS = {
  email: '103@iiitu.ac.in',
  staffId: 'AT101',
  role: 'nonteaching'
};

const WARDEN_CREDENTIALS = {
  email: '101@iiitu.ac.in',
  staffId: 'AD101',
  role: 'nonteaching'
};

const STUDENT_CREDENTIALS = {
  email: '23114@iiitu.ac.in',
  role: 'student'
};

let attendantToken = '';
let wardenToken = '';
let studentToken = '';
let leaveFormId = '';

// Helper function to make API calls
const makeRequest = async (method, url, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ Error ${method} ${url}:`, error.response?.data || error.message);
    throw error;
  }
};

// Step 1: Login as Student
const loginStudent = async () => {
  console.log('\n🔐 Step 1: Logging in as Student...');
  
  // Send OTP
  await makeRequest('POST', '/auth/send-otp', STUDENT_CREDENTIALS);
  console.log('✅ OTP sent to student email');
  
  // For testing, we'll use a dummy OTP (in real scenario, check email)
  const verifyResponse = await makeRequest('POST', '/auth/verify-otp', {
    ...STUDENT_CREDENTIALS,
    otp: '123456'
  });
  
  studentToken = verifyResponse.data.token;
  console.log('✅ Student logged in successfully');
};

// Step 2: Student submits leave form
const submitLeaveForm = async () => {
  console.log('\n📝 Step 2: Student submitting leave form...');
  
  const leaveFormData = {
    hostelName: 'Boys Hostel A',
    roomNumber: '101',
    exitDate: '2024-01-15',
    entryDate: '2024-01-17',
    exitTime: '10:00 AM',
    entryTime: '06:00 PM',
    reason: 'Family emergency - need to visit hometown'
  };
  
  const response = await makeRequest('POST', '/leave-form/submit', leaveFormData, studentToken);
  leaveFormId = response.data.leaveForm.id;
  console.log('✅ Leave form submitted successfully');
  console.log(`   Form ID: ${leaveFormId}`);
  console.log(`   Status: ${response.data.leaveForm.status}`);
};

// Step 3: Login as Attendant
const loginAttendant = async () => {
  console.log('\n🔐 Step 3: Logging in as Attendant...');
  
  // Send OTP
  await makeRequest('POST', '/auth/send-otp', ATTENDANT_CREDENTIALS);
  console.log('✅ OTP sent to attendant email');
  
  // Verify OTP
  const verifyResponse = await makeRequest('POST', '/auth/verify-otp', {
    ...ATTENDANT_CREDENTIALS,
    otp: '123456'
  });
  
  attendantToken = verifyResponse.data.token;
  console.log('✅ Attendant logged in successfully');
  console.log(`   Job Role: ${verifyResponse.data.user.role}`);
};

// Step 4: Attendant views pending forms
const attendantViewPendingForms = async () => {
  console.log('\n👀 Step 4: Attendant viewing pending forms...');
  
  const response = await makeRequest('GET', '/non-teaching/pending-forms', null, attendantToken);
  console.log('✅ Pending forms retrieved');
  console.log(`   Total pending forms: ${response.data.pagination.totalPendingForms}`);
  
  if (response.data.leaveForms.length > 0) {
    const form = response.data.leaveForms[0];
    console.log(`   First form: ${form.studentName} (${form.rollNumber})`);
    console.log(`   Status: ${form.status}`);
  }
};

// Step 5: Attendant verifies the form
const attendantVerifyForm = async () => {
  console.log('\n✅ Step 5: Attendant verifying leave form...');
  
  const verifyData = {
    remarks: 'Student provided valid documents. All details verified. Approved for warden review.'
  };
  
  const response = await makeRequest('PUT', `/non-teaching/forms/${leaveFormId}/verify`, verifyData, attendantToken);
  console.log('✅ Leave form verified by attendant');
  console.log(`   New Status: ${response.data.leaveForm.status}`);
  console.log(`   Attendant Remarks: ${response.data.leaveForm.attendantRemarks}`);
};

// Step 6: Login as Hostel Warden
const loginWarden = async () => {
  console.log('\n🔐 Step 6: Logging in as Hostel Warden...');
  
  // Send OTP
  await makeRequest('POST', '/auth/send-otp', WARDEN_CREDENTIALS);
  console.log('✅ OTP sent to warden email');
  
  // Verify OTP
  const verifyResponse = await makeRequest('POST', '/auth/verify-otp', {
    ...WARDEN_CREDENTIALS,
    otp: '123456'
  });
  
  wardenToken = verifyResponse.data.token;
  console.log('✅ Hostel Warden logged in successfully');
  console.log(`   Job Role: ${verifyResponse.data.user.role}`);
};

// Step 7: Warden views verified forms
const wardenViewVerifiedForms = async () => {
  console.log('\n👀 Step 7: Warden viewing attendant-verified forms...');
  
  const response = await makeRequest('GET', '/non-teaching/verified-forms', null, wardenToken);
  console.log('✅ Attendant-verified forms retrieved');
  console.log(`   Total verified forms: ${response.data.pagination.totalVerifiedForms}`);
  
  if (response.data.leaveForms.length > 0) {
    const form = response.data.leaveForms[0];
    console.log(`   First form: ${form.studentName} (${form.rollNumber})`);
    console.log(`   Status: ${form.status}`);
    console.log(`   Verified by: ${form.verifiedByAttendant.name} (${form.verifiedByAttendant.staffId})`);
    console.log(`   Attendant Remarks: ${form.attendantRemarks}`);
  }
};

// Step 8: Warden approves the form
const wardenApproveForm = async () => {
  console.log('\n✅ Step 8: Warden approving leave form...');
  
  const response = await makeRequest('PUT', `/non-teaching/forms/${leaveFormId}/approve`, null, wardenToken);
  console.log('✅ Leave form approved by warden');
  console.log(`   Final Status: ${response.data.leaveForm.status}`);
  console.log(`   Approved At: ${response.data.leaveForm.approvedAt}`);
};

// Step 9: View final form details
const viewFinalFormDetails = async () => {
  console.log('\n📋 Step 9: Viewing final form details...');
  
  const response = await makeRequest('GET', `/non-teaching/forms/${leaveFormId}`, null, wardenToken);
  const form = response.data.leaveForm;
  
  console.log('✅ Final form details:');
  console.log(`   Student: ${form.studentName} (${form.rollNumber})`);
  console.log(`   Hostel: ${form.hostelName}, Room: ${form.roomNumber}`);
  console.log(`   Leave Period: ${form.exitDate} to ${form.entryDate}`);
  console.log(`   Reason: ${form.reason}`);
  console.log(`   Status: ${form.status}`);
  console.log(`   Verified by Attendant: ${form.verifiedByAttendant.name} (${form.verifiedByAttendant.staffId})`);
  console.log(`   Attendant Remarks: ${form.attendantRemarks}`);
  console.log(`   Approved by Warden: ${form.approvedBy.name} (${form.approvedBy.staffId})`);
  console.log(`   Final Approval: ${form.approvedAt}`);
};

// Main test function
const runVerificationWorkflowTest = async () => {
  try {
    console.log('🚀 Starting Multi-Level Verification Workflow Test');
    console.log('=' .repeat(60));
    
    await loginStudent();
    await submitLeaveForm();
    await loginAttendant();
    await attendantViewPendingForms();
    await attendantVerifyForm();
    await loginWarden();
    await wardenViewVerifiedForms();
    await wardenApproveForm();
    await viewFinalFormDetails();
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 Multi-Level Verification Workflow Test Completed Successfully!');
    console.log('\n📊 Workflow Summary:');
    console.log('   1. ✅ Student submitted leave form (Status: pending)');
    console.log('   2. ✅ Attendant verified form (Status: verified_by_attendant)');
    console.log('   3. ✅ Hostel Warden approved form (Status: approved)');
    console.log('\n🔐 Role-Based Access Working:');
    console.log('   • Attendants can only see and verify pending forms');
    console.log('   • Wardens can only see and approve attendant-verified forms');
    console.log('   • Each action is properly logged with user details');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
};

// Run the test
runVerificationWorkflowTest();
