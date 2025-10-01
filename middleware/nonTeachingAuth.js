const NonTeachingStaff = require('../models/NonTeachingStaff');
const { verifyToken, extractToken } = require('../utils/jwt');
const { sendUnauthorized } = require('../utils/response');

/**
 * Authentication middleware for Non-Teaching Staff
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const nonTeachingAuth = async (req, res, next) => {
  try {
    const token = extractToken(req.header('Authorization'));
    
    if (!token) {
      return sendUnauthorized(res, 'No token provided, authorization denied');
    }

    const decoded = verifyToken(token);
    
    // Verify staff still exists and is active
    const staff = await NonTeachingStaff.findById(decoded.id).select('-__v');
    
    if (!staff) {
      return sendUnauthorized(res, 'Token is not valid, staff member not found');
    }

    if (!staff.isActive) {
      return sendUnauthorized(res, 'Account is deactivated');
    }

    // Check if account is locked
    if (staff.accountLocked && staff.accountLockedUntil > new Date()) {
      return sendUnauthorized(res, 'Account is temporarily locked due to multiple failed login attempts');
    }

    // Update last login
    staff.lastLogin = new Date();
    staff.loginAttempts = 0; // Reset login attempts on successful login
    await staff.save();

    req.staff = staff;
    next();
  } catch (error) {
    console.error('Non-teaching auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return sendUnauthorized(res, 'Invalid token');
    }
    
    if (error.name === 'TokenExpiredError') {
      return sendUnauthorized(res, 'Token expired');
    }
    
    sendUnauthorized(res, 'Server error in authentication');
  }
};

module.exports = nonTeachingAuth;
