// const Student = require('../models/Student');
// const Teacher = require('../models/Teacher');
// const Admin = require('../models/Admin');
// const OTP = require('../models/OTP');
// const { generateToken, verifyToken, extractToken } = require('../utils/jwt');
// const { sendSuccess, sendError, sendUnauthorized } = require('../utils/response');
// const { sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');
// const { generateOTP, getOTPExpirationTime, isOTPExpired } = require('../utils/otpGenerator');

// /**
//  * Send OTP to user email (Student, Teacher, or Admin)
//  * @param {Object} req - Express request object
//  * @param {Object} res - Express response object
//  */
// const sendOTP = async (req, res) => {
//   try {
//     const { email } = req.body;

//     // Check if user exists in any collection
//     let user = await Student.findOne({ 
//       email: email.toLowerCase(),
//       isActive: true 
//     }).select('-__v');

//     let userType = 'Student';
    
//     if (!user) {
//       user = await Teacher.findOne({ 
//         email: email.toLowerCase(),
//         isActive: true 
//       }).select('-__v');
//       userType = 'Teacher';
//     }

//     if (!user) {
//       user = await Admin.findOne({ 
//         email: email.toLowerCase(),
//         isActive: true 
//       }).select('-__v');
//       userType = 'Admin';
//     }

//     if (!user) {
//       return sendUnauthorized(res, 'Invalid credentials. User not found or account deactivated.');
//     }

//     // Generate OTP
//     const otpCode = generateOTP();
//     const expirationTime = getOTPExpirationTime();

//     // Delete any existing OTPs for this email
//     await OTP.deleteMany({ email: email.toLowerCase() });

//     // Save new OTP
//     const otp = new OTP({
//       email: email.toLowerCase(),
//       otp: otpCode,
//       expiresAt: expirationTime
//     });

//     await otp.save();

//     // Send OTP email
//     const emailSent = await sendOTPEmail(email, otpCode, user.name);

//     if (!emailSent) {
//       return sendError(res, 500, 'Failed to send OTP email. Please try again.');
//     }

//     sendSuccess(res, 200, 'OTP sent successfully to your email', {
//       email: email,
//       userType: userType,
//       expiresIn: '10 minutes'
//     });

//   } catch (error) {
//     console.error('Send OTP error:', error);
//     sendError(res, 500, 'Server error while sending OTP');
//   }
// };

// /**
//  * Verify OTP and generate JWT token
//  * @param {Object} req - Express request object
//  * @param {Object} res - Express response object
//  */
// const verifyOTP = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     // Find the OTP record
//     const otpRecord = await OTP.findOne({ 
//       email: email.toLowerCase(),
//       isUsed: false 
//     });

//     if (!otpRecord) {
//       return sendUnauthorized(res, 'Invalid or expired OTP. Please request a new OTP.');
//     }

//     // Check if OTP is expired
//     if (isOTPExpired(otpRecord.expiresAt)) {
//       await OTP.deleteOne({ _id: otpRecord._id });
//       return sendUnauthorized(res, 'OTP has expired. Please request a new OTP.');
//     }

//     // Check if maximum attempts exceeded
//     if (otpRecord.attempts >= 3) {
//       await OTP.deleteOne({ _id: otpRecord._id });
//       return sendUnauthorized(res, 'Maximum OTP attempts exceeded. Please request a new OTP.');
//     }

//     // Verify OTP
//     if (otpRecord.otp !== otp) {
//       // Increment attempts
//       otpRecord.attempts += 1;
//       await otpRecord.save();
      
//       return sendUnauthorized(res, `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining.`);
//     }

//     // Get user details from appropriate collection
//     let user = await Student.findOne({ 
//       email: email.toLowerCase(),
//       isActive: true 
//     }).select('-__v');

//     let userType = 'Student';
    
//     if (!user) {
//       user = await Teacher.findOne({ 
//         email: email.toLowerCase(),
//         isActive: true 
//       }).select('-__v');
//       userType = 'Teacher';
//     }

//     if (!user) {
//       user = await Admin.findOne({ 
//         email: email.toLowerCase(),
//         isActive: true 
//       }).select('-__v');
//       userType = 'Admin';
//     }

//     if (!user) {
//       return sendUnauthorized(res, 'User not found or account deactivated.');
//     }

//     // Mark OTP as used
//     otpRecord.isUsed = true;
//     await otpRecord.save();

//     // Create JWT payload
//     const payload = {
//       id: user._id,
//       email: user.email,
//       name: user.name,
//       userType: userType
//     };

//     // Add specific ID based on user type
//     if (userType === 'Student') {
//       payload.studentId = user.studentId;
//     } else if (userType === 'Teacher') {
//       payload.teacherId = user.teacherId;
//     } else if (userType === 'Admin') {
//       payload.adminId = user.adminId;
//     }

//     // Generate JWT token
//     const token = generateToken(payload);

//     // Send welcome email (optional, don't wait for it)
//     sendWelcomeEmail(email, user.name).catch(err => 
//       console.error('Welcome email failed:', err)
//     );

//     // Determine role for frontend routing
//     let role = userType.toLowerCase(); // student, teacher, admin
    
//     // For admins, use their specific role (Super Admin, Admin, etc.)
//     if (userType === 'Admin') {
//       role = user.role.toLowerCase().replace(' ', '_'); // super_admin, admin, moderator, staff
//     }

//     // Return success response with token and user info
//     sendSuccess(res, 200, 'OTP verified successfully', {
//       token,
//       email: user.email,
//       role: role,
//       userType: userType,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         ...(userType === 'Student' && {
//           studentId: user.studentId,
//           rollNumber: user.rollNumber,
//           department: user.department,
//           branch: user.branch,
//           course: user.course,
//           year: user.year,
//           currentSemester: user.currentSemester,
//           phone: user.phone
//         }),
//         ...(userType === 'Teacher' && {
//           teacherId: user.teacherId,
//           employeeId: user.employeeId,
//           department: user.department,
//           designation: user.designation,
//           phone: user.phone
//         }),
//         ...(userType === 'Admin' && {
//           adminId: user.adminId,
//           employeeId: user.employeeId,
//           role: user.role,
//           department: user.department,
//           designation: user.designation,
//           phone: user.phone
//         })
//       }
//     });

//   } catch (error) {
//     console.error('Verify OTP error:', error);
//     sendError(res, 500, 'Server error while verifying OTP');
//   }
// };

// /**
//  * Verify JWT token controller
//  * @param {Object} req - Express request object
//  * @param {Object} res - Express response object
//  */
// const verifyTokenController = async (req, res) => {
//   try {
//     const token = extractToken(req.header('Authorization'));
    
//     if (!token) {
//       return sendUnauthorized(res, 'No token provided');
//     }

//     const decoded = verifyToken(token);
//     const student = await Student.findById(decoded.id).select('-__v');

//     if (!student || !student.isActive) {
//       return sendUnauthorized(res, 'Invalid token or student not found');
//     }

//     sendSuccess(res, 200, 'Token is valid', {
//       student: {
//         id: student._id,
//         name: student.name,
//         email: student.email,
//         studentId: student.studentId,
//         rollNumber: student.rollNumber,
//         department: student.department,
//         branch: student.branch,
//         course: student.course,
//         year: student.year,
//         currentSemester: student.currentSemester,
//         phone: student.phone
//       }
//     });

//   } catch (error) {
//     console.error('Token verification error:', error);
    
//     if (error.name === 'JsonWebTokenError') {
//       return sendUnauthorized(res, 'Invalid token');
//     }
    
//     if (error.name === 'TokenExpiredError') {
//       return sendUnauthorized(res, 'Token expired');
//     }
    
//     sendError(res, 500, 'Server error during token verification');
//   }
// };

// module.exports = {
//   sendOTP,
//   verifyOTP,
//   verifyToken: verifyTokenController
// };

// // const Student = require('../models/Student');
// // const Teacher = require('../models/Teacher');
// // const Admin = require('../models/Admin');
// // const OTP = require('../models/OTP');
// // const { generateToken, verifyToken, extractToken } = require('../utils/jwt');
// // const { sendSuccess, sendError, sendUnauthorized } = require('../utils/response');
// // const { sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');
// // const { generateOTP, getOTPExpirationTime, isOTPExpired } = require('../utils/otpGenerator');

// // /**
// //  * Send OTP to user email (Student, Teacher, or Admin)
// //  */
// // const sendOTP = async (req, res) => {
// //   try {
// //     const { email, teacherId } = req.body;

// //     // Validate required fields
// //     if (!email) {
// //       return sendError(res, 400, "Email is required");
// //     }

// //     let user = null;
// //     let userType = null;

// //     // ---------- TEACHER LOGIN FLOW ----------
// //     if (teacherId) {
// //       user = await Teacher.findOne({
// //         teacherId,
// //         email: email.toLowerCase(),
// //         isActive: true
// //       }).select('-__v');

// //       if (!user) {
// //         return sendUnauthorized(res, "Invalid Teacher ID or Email mismatch.");
// //       }

// //       userType = "Teacher";
// //     } else {
// //       // ---------- STUDENT LOGIN FLOW ----------
// //       user = await Student.findOne({
// //         email: email.toLowerCase(),
// //         isActive: true
// //       }).select('-__v');

// //       if (user) {
// //         userType = "Student";
// //       }

// //       // ---------- ADMIN LOGIN FLOW ----------
// //       if (!user) {
// //         user = await Admin.findOne({
// //           email: email.toLowerCase(),
// //           isActive: true
// //         }).select('-__v');

// //         if (user) {
// //           userType = "Admin";
// //         }
// //       }
// //     }

// //     if (!user) {
// //       return sendUnauthorized(res, "Invalid credentials. User not found or account deactivated.");
// //     }

// //     // Generate OTP
// //     const otpCode = generateOTP();
// //     const expirationTime = getOTPExpirationTime();

// //     // Remove old OTPs for this email
// //     await OTP.deleteMany({ email: email.toLowerCase() });

// //     // Save new OTP
// //     const otp = new OTP({
// //       email: email.toLowerCase(),
// //       otp: otpCode,
// //       expiresAt: expirationTime
// //     });
// //     await otp.save();

// //     // Send OTP Email
// //     const emailSent = await sendOTPEmail(email, otpCode, user.name);
// //     if (!emailSent) {
// //       return sendError(res, 500, "Failed to send OTP email. Please try again.");
// //     }

// //     sendSuccess(res, 200, "OTP sent successfully to your email", {
// //       email,
// //       userType,
// //       expiresIn: "10 minutes"
// //     });
// //   } catch (error) {
// //     console.error("Send OTP error:", error);
// //     sendError(res, 500, "Server error while sending OTP");
// //   }
// // };

// // /**
// //  * Verify OTP and generate JWT token
// //  */
// // const verifyOTP = async (req, res) => {
// //   try {
// //     const { email, otp } = req.body;

// //     if (!email || !otp) {
// //       return sendError(res, 400, "Email and OTP are required");
// //     }

// //     // Find OTP record
// //     const otpRecord = await OTP.findOne({ email: email.toLowerCase(), isUsed: false });

// //     if (!otpRecord) {
// //       return sendUnauthorized(res, "Invalid or expired OTP. Please request a new OTP.");
// //     }

// //     // Check expiration
// //     if (isOTPExpired(otpRecord.expiresAt)) {
// //       await OTP.deleteOne({ _id: otpRecord._id });
// //       return sendUnauthorized(res, "OTP has expired. Please request a new OTP.");
// //     }

// //     // Check attempts
// //     if (otpRecord.attempts >= 3) {
// //       await OTP.deleteOne({ _id: otpRecord._id });
// //       return sendUnauthorized(res, "Maximum OTP attempts exceeded. Please request a new OTP.");
// //     }

// //     // Verify OTP
// //     if (otpRecord.otp !== otp) {
// //       otpRecord.attempts += 1;
// //       await otpRecord.save();
// //       return sendUnauthorized(res, `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining.`);
// //     }

// //     // Determine user type
// //     let user = await Student.findOne({ email: email.toLowerCase(), isActive: true }).select('-__v');
// //     let userType = "Student";

// //     if (!user) {
// //       user = await Teacher.findOne({ email: email.toLowerCase(), isActive: true }).select('-__v');
// //       if (user) userType = "Teacher";
// //     }

// //     if (!user) {
// //       user = await Admin.findOne({ email: email.toLowerCase(), isActive: true }).select('-__v');
// //       if (user) userType = "Admin";
// //     }

// //     if (!user) {
// //       return sendUnauthorized(res, "User not found or account deactivated.");
// //     }

// //     // Mark OTP as used
// //     otpRecord.isUsed = true;
// //     await otpRecord.save();

// //     // Prepare JWT payload
// //     const payload = {
// //       id: user._id,
// //       email: user.email,
// //       name: user.name,
// //       userType
// //     };

// //     if (userType === "Student") payload.studentId = user.studentId;
// //     if (userType === "Teacher") payload.teacherId = user.teacherId;
// //     if (userType === "Admin") payload.adminId = user.adminId;

// //     // Generate JWT
// //     const token = generateToken(payload);

// //     // Send welcome email (non-blocking)
// //     sendWelcomeEmail(email, user.name).catch(err =>
// //       console.error("Welcome email failed:", err)
// //     );

// //     // Role for frontend routing
// //     let role = userType.toLowerCase();
// //     if (userType === "Admin") {
// //       role = user.role.toLowerCase().replace(" ", "_");
// //     }

// //     // Success response
// //     sendSuccess(res, 200, "OTP verified successfully", {
// //       token,
// //       email: user.email,
// //       role,
// //       userType,
// //       user: {
// //         id: user._id,
// //         name: user.name,
// //         email: user.email,
// //         ...(userType === "Student" && {
// //           studentId: user.studentId,
// //           rollNumber: user.rollNumber,
// //           department: user.department,
// //           branch: user.branch,
// //           course: user.course,
// //           year: user.year,
// //           currentSemester: user.currentSemester,
// //           phone: user.phone
// //         }),
// //         ...(userType === "Teacher" && {
// //           teacherId: user.teacherId,
// //           employeeId: user.employeeId,
// //           department: user.department,
// //           designation: user.designation,
// //           phone: user.phone
// //         }),
// //         ...(userType === "Admin" && {
// //           adminId: user.adminId,
// //           employeeId: user.employeeId,
// //           role: user.role,
// //           department: user.department,
// //           designation: user.designation,
// //           phone: user.phone
// //         })
// //       }
// //     });
// //   } catch (error) {
// //     console.error("Verify OTP error:", error);
// //     sendError(res, 500, "Server error while verifying OTP");
// //   }
// // };

// // /**
// //  * Verify JWT token controller
// //  */
// // const verifyTokenController = async (req, res) => {
// //   try {
// //     const token = extractToken(req.header("Authorization"));

// //     if (!token) {
// //       return sendUnauthorized(res, "No token provided");
// //     }

// //     const decoded = verifyToken(token);
// //     const student = await Student.findById(decoded.id).select("-__v");

// //     if (!student || !student.isActive) {
// //       return sendUnauthorized(res, "Invalid token or student not found");
// //     }

// //     sendSuccess(res, 200, "Token is valid", { student });
// //   } catch (error) {
// //     console.error("Token verification error:", error);

// //     if (error.name === "JsonWebTokenError") {
// //       return sendUnauthorized(res, "Invalid token");
// //     }

// //     if (error.name === "TokenExpiredError") {
// //       return sendUnauthorized(res, "Token expired");
// //     }

// //     sendError(res, 500, "Server error during token verification");
// //   }
// // };

// // module.exports = {
// //   sendOTP,
// //   verifyOTP,
// //   verifyToken: verifyTokenController
// // };



// // const Student = require('../models/Student');
// // const Teacher = require('../models/Teacher');
// // const Admin = require('../models/Admin');
// // const OTP = require('../models/OTP');
// // const { generateToken, verifyToken, extractToken } = require('../utils/jwt');
// // const { sendSuccess, sendError, sendUnauthorized } = require('../utils/response');
// // const { sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');
// // const { generateOTP, getOTPExpirationTime, isOTPExpired } = require('../utils/otpGenerator');

// // /**
// //  * Send OTP based on role
// //  */
// // const sendOTP = async (req, res) => {
// //   try {
// //     const { email, role, teacherId, adminId } = req.body;

// //     if(!role) return sendError(res, 400, 'Role is required');

// //     let user;
    
// //     switch(role.toLowerCase()){
// //       case 'student':
// //         user = await Student.findOne({ email: email.toLowerCase(), isActive: true });
// //         break;
// //       case 'teacher':
// //         if(!teacherId) return sendError(res, 400, 'Teacher ID is required');
// //         user = await Teacher.findOne({ email: email.toLowerCase(), teacherId, isActive: true });
// //         break;
// //       case 'admin':
// //         if(!adminId) return sendError(res, 400, 'Admin ID is required');
// //         user = await Admin.findOne({ email: email.toLowerCase(), adminId, isActive: true });
// //         break;
// //       default:
// //         return sendError(res, 400, 'Invalid role');
// //     }

// //     if(!user) return sendUnauthorized(res, 'User not found or inactive');

// //     // Generate OTP
// //     const otpCode = generateOTP();
// //     const expirationTime = getOTPExpirationTime();

// //     // Delete existing OTPs for this email + role
// //     await OTP.deleteMany({ email: email.toLowerCase(), role: role.toLowerCase() });

// //     // Save new OTP
// //     const otp = new OTP({
// //       email: email.toLowerCase(),
// //       role: role.toLowerCase(),
// //       otp: otpCode,
// //       expiresAt: expirationTime
// //     });

// //     await otp.save();

// //     // Send OTP email
// //     const emailSent = await sendOTPEmail(email, otpCode, user.name);
// //     if(!emailSent) return sendError(res, 500, 'Failed to send OTP email');

// //     sendSuccess(res, 200, 'OTP sent successfully', {
// //       email: email,
// //       role: role.toLowerCase(),
// //       expiresIn: '10 minutes'
// //     });

// //   } catch (error) {
// //     console.error('Send OTP error:', error);
// //     sendError(res, 500, 'Server error while sending OTP');
// //   }
// // };

// // /**
// //  * Verify OTP and generate JWT
// //  */
// // const verifyOTP = async (req, res) => {
// //   try {
// //     const { email, otp, role, teacherId, adminId } = req.body;

// //     if(!role) return sendError(res, 400, 'Role is required');

// //     // Find OTP record
// //     const otpRecord = await OTP.findOne({ email: email.toLowerCase(), role: role.toLowerCase(), isUsed: false });
// //     if(!otpRecord) return sendUnauthorized(res, 'Invalid or expired OTP');

// //     if(isOTPExpired(otpRecord.expiresAt)){
// //       await OTP.deleteOne({ _id: otpRecord._id });
// //       return sendUnauthorized(res, 'OTP expired. Please request a new OTP');
// //     }

// //     if(otpRecord.attempts >= 3){
// //       await OTP.deleteOne({ _id: otpRecord._id });
// //       return sendUnauthorized(res, 'Maximum OTP attempts exceeded');
// //     }

// //     if(otpRecord.otp !== otp){
// //       otpRecord.attempts += 1;
// //       await otpRecord.save();
// //       return sendUnauthorized(res, `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining.`);
// //     }

// //     // Get user from proper collection
// //     let user;
// //     switch(role.toLowerCase()){
// //       case 'student':
// //         user = await Student.findOne({ email: email.toLowerCase(), isActive: true });
// //         break;
// //       case 'teacher':
// //         user = await Teacher.findOne({ email: email.toLowerCase(), teacherId, isActive: true });
// //         break;
// //       case 'admin':
// //         user = await Admin.findOne({ email: email.toLowerCase(), adminId, isActive: true });
// //         break;
// //     }

// //     if(!user) return sendUnauthorized(res, 'User not found or inactive');

// //     // Mark OTP as used
// //     otpRecord.isUsed = true;
// //     await otpRecord.save();

// //     // Prepare JWT payload
// //     const payload = {
// //       id: user._id,
// //       email: user.email,
// //       name: user.name,
// //       userType: role.toLowerCase()
// //     };

// //     if(role.toLowerCase() === 'student') payload.studentId = user.studentId;
// //     if(role.toLowerCase() === 'teacher') payload.teacherId = user.teacherId;
// //     if(role.toLowerCase() === 'admin') payload.adminId = user.adminId;

// //     const token = generateToken(payload);

// //     // Fire welcome email (optional)
// //     sendWelcomeEmail(email, user.name).catch(err => console.error('Welcome email failed:', err));

// //     sendSuccess(res, 200, 'OTP verified successfully', {
// //       token,
// //       email: user.email,
// //       role: role.toLowerCase(),
// //       user: {
// //         id: user._id,
// //         name: user.name,
// //         email: user.email,
// //         ...(role.toLowerCase() === 'student' && { studentId: user.studentId }),
// //         ...(role.toLowerCase() === 'teacher' && { teacherId: user.teacherId }),
// //         ...(role.toLowerCase() === 'admin' && { adminId: user.adminId, subRole: user.role })
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Verify OTP error:', error);
// //     sendError(res, 500, 'Server error while verifying OTP');
// //   }
// // };

// // /**
// //  * Verify JWT token for all roles
// //  */
// // const verifyTokenController = async (req, res) => {
// //   try {
// //     const token = extractToken(req.header('Authorization'));
// //     if(!token) return sendUnauthorized(res, 'No token provided');

// //     const decoded = verifyToken(token);

// //     let user;
// //     switch(decoded.userType){
// //       case 'student':
// //         user = await Student.findById(decoded.id).select('-__v');
// //         break;
// //       case 'teacher':
// //         user = await Teacher.findById(decoded.id).select('-__v');
// //         break;
// //       case 'admin':
// //         user = await Admin.findById(decoded.id).select('-__v');
// //         break;
// //       default:
// //         return sendUnauthorized(res, 'Invalid token');
// //     }

// //     if(!user || !user.isActive) return sendUnauthorized(res, 'Invalid token or user inactive');

// //     sendSuccess(res, 200, 'Token is valid', {
// //       user: {
// //         id: user._id,
// //         name: user.name,
// //         email: user.email,
// //         ...(decoded.userType === 'student' && { studentId: user.studentId }),
// //         ...(decoded.userType === 'teacher' && { teacherId: user.teacherId }),
// //         ...(decoded.userType === 'admin' && { adminId: user.adminId, subRole: user.role })
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Token verification error:', error);
// //     if(error.name === 'JsonWebTokenError') return sendUnauthorized(res, 'Invalid token');
// //     if(error.name === 'TokenExpiredError') return sendUnauthorized(res, 'Token expired');
// //     sendError(res, 500, 'Server error during token verification');
// //   }
// // };

// // module.exports = {
// //   sendOTP,
// //   verifyOTP,
// //   verifyToken: verifyTokenController
// // };


const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');
const NonTeachingStaff = require('../models/NonTeachingStaff');
const OTP = require('../models/OTP');
const { generateToken, verifyToken, extractToken } = require('../utils/jwt');
const { sendSuccess, sendError, sendUnauthorized } = require('../utils/response');
const { sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');
const { generateOTP, getOTPExpirationTime, isOTPExpired } = require('../utils/otpGenerator');

/**
 * Send OTP to user email (Student, Teacher, or Admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendOTP = async (req, res) => {
  try {
    const { email, role, teacherId } = req.body;
    const normalizedRole = role?.toLowerCase();

    if (!email || !normalizedRole) {
      return sendError(res, 400, 'Email and role are required');
    }

    let user = null;

    // Role based validation
    if (normalizedRole === 'student') {
      user = await Student.findOne({ email: email.toLowerCase(), isActive: true }).select('-__v');
      if (!user) {
        return sendUnauthorized(res, 'Invalid credentials. Student not found or account deactivated.');
      }
    } 
    else if (normalizedRole === 'teacher') {
      if (!teacherId) {
        return sendError(res, 400, 'Teacher ID is required for teacher login');
      }
      user = await Teacher.findOne({ teacherId, email: email.toLowerCase(), isActive: true });
      if (!user) {
        return sendUnauthorized(res, 'Invalid Teacher ID or Email mismatch.');
      }
    } 
    else if (normalizedRole === 'admin') {
      user = await Admin.findOne({ email: email.toLowerCase(), isActive: true }).select('-__v');
      if (!user) {
        return sendUnauthorized(res, 'Invalid credentials. Admin not found or account deactivated.');
      }
    } 
    else if (normalizedRole === 'nonteaching' || normalizedRole === 'non_teaching') {
      if (!teacherId) {
        return sendError(res, 400, 'Staff ID is required for non-teaching staff login');
      }
      user = await NonTeachingStaff.findOne({ staffId: teacherId, email: email.toLowerCase(), isActive: true });
      if (!user) {
        return sendUnauthorized(res, 'Invalid Staff ID or Email mismatch.');
      }
    } 
    else {
      return sendError(res, 400, 'Invalid role specified');
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expirationTime = getOTPExpirationTime();

    // Remove old OTPs
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Save new OTP
    const otp = new OTP({
      email: email.toLowerCase(),
      otp: otpCode,
      expiresAt: expirationTime
    });
    await otp.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otpCode, user.name);

    if (!emailSent) {
      return sendError(res, 500, 'Failed to send OTP email. Please try again.');
    }

    // Success response
    sendSuccess(res, 200, 'OTP sent successfully', {
      email: email,
      role: normalizedRole,
      expiresIn: '10 minutes'
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    sendError(res, 500, 'Server error while sending OTP');
  }
};

/**
 * Verify OTP and generate JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyOTP = async (req, res) => {
  try {
    const { email, otp, role: requestRole } = req.body;

    // Find the OTP record
    const otpRecord = await OTP.findOne({ 
      email: email.toLowerCase(),
      isUsed: false 
    });

    if (!otpRecord) {
      return sendUnauthorized(res, 'Invalid or expired OTP. Please request a new OTP.');
    }

    // Check if OTP is expired
    if (isOTPExpired(otpRecord.expiresAt)) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return sendUnauthorized(res, 'OTP has expired. Please request a new OTP.');
    }

    // Check if maximum attempts exceeded
    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return sendUnauthorized(res, 'Maximum OTP attempts exceeded. Please request a new OTP.');
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();
      
      return sendUnauthorized(res, `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining.`);
    }

    // Get user details from appropriate collection based on role
    let user = null;
    let userType = null;

    const normalizedRole = requestRole?.toLowerCase();

    if (normalizedRole === 'student') {
      user = await Student.findOne({ 
        email: email.toLowerCase(),
        isActive: true 
      }).select('-__v');
      userType = 'Student';
    } 
    else if (normalizedRole === 'teacher') {
      user = await Teacher.findOne({ 
        email: email.toLowerCase(),
        isActive: true 
      }).select('-__v');
      userType = 'Teacher';
    } 
    else if (normalizedRole === 'admin') {
      user = await Admin.findOne({ 
        email: email.toLowerCase(),
        isActive: true 
      }).select('-__v');
      userType = 'Admin';
    } 
    else if (normalizedRole === 'nonteaching' || normalizedRole === 'non_teaching') {
      user = await NonTeachingStaff.findOne({ 
        email: email.toLowerCase(),
        isActive: true 
      }).select('-__v');
      userType = 'NonTeachingStaff';
    } 
    else {
      // Fallback: try all collections if no role specified
      user = await Student.findOne({ 
        email: email.toLowerCase(),
        isActive: true 
      }).select('-__v');
      userType = 'Student';
      
      if (!user) {
        user = await Teacher.findOne({ 
          email: email.toLowerCase(),
          isActive: true 
        }).select('-__v');
        userType = 'Teacher';
      }

      if (!user) {
        user = await Admin.findOne({ 
          email: email.toLowerCase(),
          isActive: true 
        }).select('-__v');
        userType = 'Admin';
      }

      if (!user) {
        user = await NonTeachingStaff.findOne({ 
          email: email.toLowerCase(),
          isActive: true 
        }).select('-__v');
        userType = 'NonTeachingStaff';
      }
    }

    if (!user) {
      return sendUnauthorized(res, 'User not found or account deactivated.');
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Create JWT payload
    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      userType: userType
    };

    // Add specific ID based on user type
    if (userType === 'Student') {
      payload.studentId = user.studentId;
    } else if (userType === 'Teacher') {
      payload.teacherId = user.teacherId;
    } else if (userType === 'Admin') {
      payload.adminId = user.adminId;
    } else if (userType === 'NonTeachingStaff') {
      payload.staffId = user.staffId;
    }

    // Generate JWT token
    const token = generateToken(payload);

    // Send welcome email (optional, don't wait for it)
    sendWelcomeEmail(email, user.name).catch(err => 
      console.error('Welcome email failed:', err)
    );

    // Determine role for frontend routing
    let frontendRole = userType.toLowerCase(); // student, teacher, admin, nonteachingstaff
    
    // For admins, use their specific role (Super Admin, Admin, etc.)
    if (userType === 'Admin') {
      frontendRole = user.role.toLowerCase().replace(' ', '_'); // super_admin, admin, moderator, staff
    }
    
    // For non-teaching staff, use their role
    if (userType === 'NonTeachingStaff') {
      frontendRole = user.role.toLowerCase().replace(' ', '_'); // hostel_warden, security_head, etc.
    }

    // Return success response with token and user info
    sendSuccess(res, 200, 'OTP verified successfully', {
      token,
      email: user.email,
      role: frontendRole,
      userType: userType,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        ...(userType === 'Student' && {
          studentId: user.studentId,
          rollNumber: user.rollNumber,
          department: user.department,
          branch: user.branch,
          course: user.course,
          year: user.year,
          currentSemester: user.currentSemester,
          phone: user.phone
        }),
        ...(userType === 'Teacher' && {
          teacherId: user.teacherId,
          employeeId: user.employeeId,
          department: user.department,
          designation: user.designation,
          phone: user.phone
        }),
        ...(userType === 'Admin' && {
          adminId: user.adminId,
          employeeId: user.employeeId,
          role: user.role,
          department: user.department,
          designation: user.designation,
          phone: user.phone
        }),
        ...(userType === 'NonTeachingStaff' && {
          staffId: user.staffId,
          role: user.role,
          department: user.department,
          designation: user.designation,
          phone: user.phone,
          permissions: user.permissions
        })
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    sendError(res, 500, 'Server error while verifying OTP');
  }
};

/**
 * Verify JWT token controller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyTokenController = async (req, res) => {
  try {
    const token = extractToken(req.header('Authorization'));
    
    if (!token) {
      return sendUnauthorized(res, 'No token provided');
    }

    const decoded = verifyToken(token);
    const student = await Student.findById(decoded.id).select('-__v');

    if (!student || !student.isActive) {
      return sendUnauthorized(res, 'Invalid token or student not found');
    }

    sendSuccess(res, 200, 'Token is valid', {
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        rollNumber: student.rollNumber,
        department: student.department,
        branch: student.branch,
        course: student.course,
        year: student.year,
        currentSemester: student.currentSemester,
        phone: student.phone
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return sendUnauthorized(res, 'Invalid token');
    }
    
    if (error.name === 'TokenExpiredError') {
      return sendUnauthorized(res, 'Token expired');
    }
    
    sendError(res, 500, 'Server error during token verification');
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  verifyToken: verifyTokenController
};
