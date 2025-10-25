const express = require('express');
const { sendOTP, verifyOTP, verifyToken } = require('../controllers/authController');
const { validateOTPRequest, validateOTPVerification } = require('../utils/validation');

const router = express.Router();

// @route   POST /api/auth/send-otp
// @desc    Send OTP to student email
// @access  Public
router.post('/send-otp', validateOTPRequest, sendOTP);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and generate JWT token
// @access  Public
router.post('/verify-otp', validateOTPVerification, verifyOTP);

// @route   POST /api/auth/verify-token
// @desc    Verify JWT token
// @access  Public
router.post('/verify-token', verifyToken);

// @route   GET /api/auth/test-cors
// @desc    Test CORS configuration
// @access  Public
router.get('/test-cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working!',
    timestamp: new Date().toISOString()
  });
});

// @route   POST /api/auth/test-email
// @desc    Test email sending (for debugging)
// @access  Public
router.post('/test-email', async (req, res) => {
  try {
    const { sendOTPEmail } = require('../services/emailService');
    const { generateOTP } = require('../utils/otpGenerator');
    
    const testEmail = req.body.email || 'arpitcollege1205@gmail.com';
    const testOTP = generateOTP();
    
    console.log('Testing email to:', testEmail);
    const result = await sendOTPEmail(testEmail, testOTP, 'Test User');
    
    if (result) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
        email: testEmail,
        otp: testOTP
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email'
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Test email failed',
      error: error.message
    });
  }
});

module.exports = router;