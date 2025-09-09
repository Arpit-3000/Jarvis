const Student = require('../models/Student');
const { verifyToken, extractToken } = require('../utils/jwt');
const { sendUnauthorized } = require('../utils/response');

/**
 * Authentication middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const auth = async (req, res, next) => {
  try {
    const token = extractToken(req.header('Authorization'));
    
    if (!token) {
      return sendUnauthorized(res, 'No token provided, authorization denied');
    }

    const decoded = verifyToken(token);
    
    // Verify student still exists and is active
    const student = await Student.findById(decoded.id).select('-__v');
    
    if (!student) {
      return sendUnauthorized(res, 'Token is not valid, student not found');
    }

    if (!student.isActive) {
      return sendUnauthorized(res, 'Account is deactivated');
    }

    req.student = student;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return sendUnauthorized(res, 'Invalid token');
    }
    
    if (error.name === 'TokenExpiredError') {
      return sendUnauthorized(res, 'Token expired');
    }
    
    sendUnauthorized(res, 'Server error in authentication');
  }
};

module.exports = auth;