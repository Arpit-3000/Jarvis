const Teacher = require('../models/Teacher');
const { verifyToken, extractToken } = require('../utils/jwt');
const { sendUnauthorized } = require('../utils/response');

/**
 * Teacher authentication middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const teacherAuth = async (req, res, next) => {
  try {
    const token = extractToken(req.header('Authorization'));
    
    if (!token) {
      return sendUnauthorized(res, 'No token provided, authorization denied');
    }

    const decoded = verifyToken(token);
    
    // Verify teacher still exists and is active
    const teacher = await Teacher.findOne({ 
      email: decoded.email,
      isActive: true 
    }).select('-__v');
    
    if (!teacher) {
      return sendUnauthorized(res, 'Token is not valid, teacher not found');
    }

    req.teacher = teacher;
    next();
  } catch (error) {
    console.error('Teacher auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return sendUnauthorized(res, 'Invalid token');
    }
    
    if (error.name === 'TokenExpiredError') {
      return sendUnauthorized(res, 'Token expired');
    }
    
    sendUnauthorized(res, 'Server error in authentication');
  }
};

module.exports = teacherAuth;
