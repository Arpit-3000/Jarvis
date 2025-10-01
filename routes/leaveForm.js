const express = require('express');
const { 
  submitLeaveForm, 
  getMyLeaveForms, 
  getLeaveFormById, 
  deleteLeaveForm,
  cancelLeaveForm 
} = require('../controllers/leaveFormController');
const { validateLeaveFormSubmission } = require('../utils/validation');
const auth = require('../middleware/auth');

const router = express.Router();

// All student routes are protected
router.use(auth);

// @route   POST /api/leave-form/submit
// @desc    Submit leave form (Student only)
// @access  Private
router.post('/submit', validateLeaveFormSubmission, submitLeaveForm);

// @route   GET /api/leave-form/my-forms
// @desc    Get student's leave forms
// @access  Private
router.get('/my-forms', getMyLeaveForms);

// @route   GET /api/leave-form/:id
// @desc    Get specific leave form by ID
// @access  Private
router.get('/:id', getLeaveFormById);

// @route   DELETE /api/leave-form/:id
// @desc    Delete pending leave form (Student only)
// @access  Private
router.delete('/:id', deleteLeaveForm);

// @route   PUT /api/leave-form/:id/cancel
// @desc    Cancel pending leave form
// @access  Private
router.put('/:id/cancel', cancelLeaveForm);

module.exports = router;
