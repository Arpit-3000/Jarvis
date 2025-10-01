const express = require('express');
const { 
  getAllPendingLeaveForms,
  getAttendantVerifiedLeaveForms,
  getAllLeaveForms,
  getLeaveFormDetails,
  verifyLeaveFormByAttendant,
  rejectLeaveFormByAttendant,
  approveLeaveForm,
  rejectLeaveForm,
  getNonTeachingStaffProfile,
  getLeaveFormStats
} = require('../controllers/leaveFormController');
const { validateLeaveFormRejection, validateAttendantVerification } = require('../utils/validation');
const nonTeachingAuth = require('../middleware/nonTeachingAuth');

const router = express.Router();

// All non-teaching staff routes are protected
router.use(nonTeachingAuth);

// @route   GET /api/non-teaching/pending-forms
// @desc    Get all pending leave forms (for Attendants)
// @access  Private (Non-Teaching Staff)
router.get('/pending-forms', getAllPendingLeaveForms);

// @route   GET /api/non-teaching/verified-forms
// @desc    Get all attendant-verified leave forms (for Hostel Wardens)
// @access  Private (Non-Teaching Staff)
router.get('/verified-forms', getAttendantVerifiedLeaveForms);

// @route   GET /api/non-teaching/all-forms
// @desc    Get all leave forms with filters
// @access  Private (Non-Teaching Staff)
router.get('/all-forms', getAllLeaveForms);

// @route   GET /api/non-teaching/forms/:id
// @desc    Get specific leave form details
// @access  Private (Non-Teaching Staff)
router.get('/forms/:id', getLeaveFormDetails);

// @route   PUT /api/non-teaching/forms/:id/verify
// @desc    Verify leave form by attendant
// @access  Private (Non-Teaching Staff - Attendants)
router.put('/forms/:id/verify', validateAttendantVerification, verifyLeaveFormByAttendant);

// @route   PUT /api/non-teaching/forms/:id/reject-attendant
// @desc    Reject leave form by attendant
// @access  Private (Non-Teaching Staff - Attendants)
router.put('/forms/:id/reject-attendant', validateLeaveFormRejection, rejectLeaveFormByAttendant);

// @route   PUT /api/non-teaching/forms/:id/approve
// @desc    Approve leave form (Hostel Wardens only)
// @access  Private (Non-Teaching Staff - Hostel Wardens)
router.put('/forms/:id/approve', approveLeaveForm);

// @route   PUT /api/non-teaching/forms/:id/reject
// @desc    Reject leave form
// @access  Private (Non-Teaching Staff)
router.put('/forms/:id/reject', validateLeaveFormRejection, rejectLeaveForm);

// @route   GET /api/non-teaching/profile
// @desc    Get non-teaching staff profile
// @access  Private (Non-Teaching Staff)
router.get('/profile', getNonTeachingStaffProfile);

// @route   GET /api/non-teaching/stats
// @desc    Get leave form statistics
// @access  Private (Non-Teaching Staff)
router.get('/stats', getLeaveFormStats);

module.exports = router;
