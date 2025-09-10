const Admin = require('../models/Admin');
const { verifyToken, extractToken } = require('../utils/jwt');
const { sendUnauthorized } = require('../utils/response');

/**
 * Admin authentication middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const adminAuth = async (req, res, next) => {
  try {
    const token = extractToken(req.header('Authorization'));
    
    if (!token) {
      return sendUnauthorized(res, 'No token provided, authorization denied');
    }

    const decoded = verifyToken(token);
    
    // Verify admin still exists and is active
    const admin = await Admin.findOne({ 
      email: decoded.email,
      isActive: true 
    }).select('-__v');
    
    if (!admin) {
      return sendUnauthorized(res, 'Token is not valid, admin not found');
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return sendUnauthorized(res, 'Invalid token');
    }
    
    if (error.name === 'TokenExpiredError') {
      return sendUnauthorized(res, 'Token expired');
    }
    
    sendUnauthorized(res, 'Server error in authentication');
  }
};

module.exports = adminAuth;
