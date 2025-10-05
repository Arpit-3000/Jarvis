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
 * OTP verification validation rules (for all roles)
 */
const validateOTPVerification = [
  body('email')
    .matches(/^\d+@iiitu\.ac\.in$/)
    .withMessage('Email must be in format: rollnumber@iiitu.ac.in'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number'),
  body('role')
    .optional()
    .isIn(['student', 'teacher', 'admin', 'nonteaching', 'non_teaching', 
           'hostel_warden', 'attendant', 'security_guard', 'maintenance', 
           'cleaning', 'security_head', 'caretaker', 'administrative_staff', 
           'clerk', 'receptionist', 'maintenance_staff', 'cleaner', 'other'])
    .withMessage('Role must be a valid role'),
  handleValidationErrors
];

/**
 * Leave form submission validation rules
 */
const validateLeaveFormSubmission = [
  body('hostelName')
    .notEmpty()
    .withMessage('Hostel name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Hostel name must be between 2 and 50 characters'),
  
  body('roomNumber')
    .notEmpty()
    .withMessage('Room number is required')
    .isLength({ min: 1, max: 20 })
    .withMessage('Room number must be between 1 and 20 characters'),
  
  body('exitDate')
    .isISO8601()
    .withMessage('Exit date must be a valid date')
    .custom((value) => {
      const exitDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (exitDate < today) {
        throw new Error('Exit date cannot be in the past');
      }
      return true;
    }),
  
  body('entryDate')
    .isISO8601()
    .withMessage('Entry date must be a valid date')
    .custom((value, { req }) => {
      const entryDate = new Date(value);
      const exitDate = new Date(req.body.exitDate);
      if (entryDate <= exitDate) {
        throw new Error('Entry date must be after exit date');
      }
      return true;
    }),
  
  body('exitTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Exit time must be in HH:MM format'),
  
  body('entryTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Entry time must be in HH:MM format'),
  
  body('reason')
    .notEmpty()
    .withMessage('Reason for leave is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  
  body('emergencyContact.name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Emergency contact name must be between 2 and 50 characters'),
  
  body('emergencyContact.phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Emergency contact phone must be a valid 10-digit number'),
  
  body('emergencyContact.relation')
    .optional()
    .isLength({ min: 2, max: 30 })
    .withMessage('Emergency contact relation must be between 2 and 30 characters'),
  
  handleValidationErrors
];

/**
 * Leave form rejection validation rules
 */
const validateLeaveFormRejection = [
  body('rejectionReason')
    .notEmpty()
    .withMessage('Rejection reason is required')
    .isLength({ min: 10, max: 200 })
    .withMessage('Rejection reason must be between 10 and 200 characters'),
  
  handleValidationErrors
];

/**
 * Attendant verification validation rules
 */
const validateAttendantVerification = [
  body('remarks')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Attendant remarks cannot exceed 200 characters'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateOTPRequest,
  validateOTPVerification,
  validateLeaveFormSubmission,
  validateLeaveFormRejection,
  validateAttendantVerification
};
