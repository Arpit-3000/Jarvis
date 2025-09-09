const Student = require('../models/Student');
const OTP = require('../models/OTP');
const { generateToken, verifyToken, extractToken } = require('../utils/jwt');
const { sendSuccess, sendError, sendUnauthorized } = require('../utils/response');
const { sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');
const { generateOTP, getOTPExpirationTime, isOTPExpired } = require('../utils/otpGenerator');

/**
 * Send OTP to student email
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if student exists and is active
    const student = await Student.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    }).select('-__v');

    if (!student) {
      return sendUnauthorized(res, 'Invalid credentials. Student not found or account deactivated.');
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
    const emailSent = await sendOTPEmail(email, otpCode, student.name);

    if (!emailSent) {
      return sendError(res, 500, 'Failed to send OTP email. Please try again.');
    }

    sendSuccess(res, 200, 'OTP sent successfully to your email', {
      email: email,
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

    // Get student details
    const student = await Student.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    }).select('-__v');

    if (!student) {
      return sendUnauthorized(res, 'Student not found or account deactivated.');
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Create JWT payload
    const payload = {
      id: student._id,
      email: student.email,
      studentId: student.studentId,
      name: student.name
    };

    // Generate JWT token
    const token = generateToken(payload);

    // Send welcome email (optional, don't wait for it)
    sendWelcomeEmail(email, student.name).catch(err => 
      console.error('Welcome email failed:', err)
    );

    // Return success response with token and student info
    sendSuccess(res, 200, 'OTP verified successfully', {
      token,
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
