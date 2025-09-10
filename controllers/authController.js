const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');
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
    const { email } = req.body;

    // Check if user exists in any collection
    let user = await Student.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    }).select('-__v');

    let userType = 'Student';
    
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
      return sendUnauthorized(res, 'Invalid credentials. User not found or account deactivated.');
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expirationTime = getOTPExpirationTime();

    // Delete any existing OTPs for this email
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

    sendSuccess(res, 200, 'OTP sent successfully to your email', {
      email: email,
      userType: userType,
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
    const { email, otp } = req.body;

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

    // Get user details from appropriate collection
    let user = await Student.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    }).select('-__v');

    let userType = 'Student';
    
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
    }

    // Generate JWT token
    const token = generateToken(payload);

    // Send welcome email (optional, don't wait for it)
    sendWelcomeEmail(email, user.name).catch(err => 
      console.error('Welcome email failed:', err)
    );

    // Determine role for frontend routing
    let role = userType.toLowerCase(); // student, teacher, admin
    
    // For admins, use their specific role (Super Admin, Admin, etc.)
    if (userType === 'Admin') {
      role = user.role.toLowerCase().replace(' ', '_'); // super_admin, admin, moderator, staff
    }

    // Return success response with token and user info
    sendSuccess(res, 200, 'OTP verified successfully', {
      token,
      email: user.email,
      role: role,
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
