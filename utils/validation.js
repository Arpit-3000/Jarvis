const { body, validationResult } = require('express-validator');

/**
 * Handle validation errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Student OTP request validation rules
 */
const validateOTPRequest = [
  body('email')
    .matches(/^\d+@iiitu\.ac\.in$/)
    .withMessage('Email must be in format: rollnumber@iiitu.ac.in'),
  handleValidationErrors
];

/**
 * Student OTP verification validation rules
 */
const validateOTPVerification = [
  body('email')
    .matches(/^\d+@iiitu\.ac\.in$/)
    .withMessage('Email must be in format: rollnumber@iiitu.ac.in'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number'),
  handleValidationErrors
];


module.exports = {
  handleValidationErrors,
  validateOTPRequest,
  validateOTPVerification
};
