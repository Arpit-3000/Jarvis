const LeaveForm = require('../models/LeaveForm');
const Student = require('../models/Student');
const NonTeachingStaff = require('../models/NonTeachingStaff');
const { sendSuccess, sendError, sendNotFound, sendUnauthorized } = require('../utils/response');

/**
 * Submit leave form (Student only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const submitLeaveForm = async (req, res) => {
  try {
    const {
      hostelName,
      roomNumber,
      exitDate,
      entryDate,
      exitTime,
      entryTime,
      reason,
      emergencyContact
    } = req.body;

    // Get student details from authenticated user
    const student = req.student;

    // Validate dates
    const exitDateObj = new Date(exitDate);
    const entryDateObj = new Date(entryDate);
    const currentDate = new Date();

    if (exitDateObj < currentDate) {
      return sendError(res, 400, 'Exit date cannot be in the past');
    }

    if (entryDateObj <= exitDateObj) {
      return sendError(res, 400, 'Entry date must be after exit date');
    }

    // Check if student already has a pending leave form
    const existingLeave = await LeaveForm.findOne({
      studentId: student._id,
      status: 'pending'
    });

    if (existingLeave) {
      return sendError(res, 400, 'You already have a pending leave form. Please wait for approval or cancel the existing one.');
    }

    // Create leave form
    const leaveForm = new LeaveForm({
      studentId: student._id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      studentPhone: student.phone,
      hostelName,
      roomNumber,
      exitDate: exitDateObj,
      entryDate: entryDateObj,
      exitTime,
      entryTime,
      reason,
      emergencyContact: emergencyContact || {}
    });

    await leaveForm.save();

    sendSuccess(res, 201, 'Leave form submitted successfully', {
      leaveForm: {
        id: leaveForm._id,
        studentName: leaveForm.studentName,
        rollNumber: leaveForm.rollNumber,
        hostelName: leaveForm.hostelName,
        roomNumber: leaveForm.roomNumber,
        exitDate: leaveForm.exitDate,
        entryDate: leaveForm.entryDate,
        exitTime: leaveForm.exitTime,
        entryTime: leaveForm.entryTime,
        reason: leaveForm.reason,
        status: leaveForm.status,
        submittedAt: leaveForm.submittedAt,
        leaveDuration: leaveForm.leaveDuration
      }
    });

  } catch (error) {
    console.error('Submit leave form error:', error);
    sendError(res, 500, 'Server error while submitting leave form');
  }
};

/**
 * Get student's leave forms (Student only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMyLeaveForms = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const studentId = req.student._id;

    // Build filter
    const filter = { studentId };
    if (status) filter.status = status;

    const leaveForms = await LeaveForm.find(filter)
      .select('-__v')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await LeaveForm.countDocuments(filter);

    sendSuccess(res, 200, 'Leave forms retrieved successfully', {
      leaveForms,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalLeaveForms: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get my leave forms error:', error);
    sendError(res, 500, 'Server error while fetching leave forms');
  }
};

/**
 * Get specific leave form (Student only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getLeaveFormById = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.student._id;

    const leaveForm = await LeaveForm.findOne({
      _id: id,
      studentId: studentId
    }).select('-__v');

    if (!leaveForm) {
      return sendNotFound(res, 'Leave form not found');
    }

    sendSuccess(res, 200, 'Leave form retrieved successfully', {
      leaveForm: {
        id: leaveForm._id,
        studentName: leaveForm.studentName,
        rollNumber: leaveForm.rollNumber,
        studentPhone: leaveForm.studentPhone,
        hostelName: leaveForm.hostelName,
        roomNumber: leaveForm.roomNumber,
        exitDate: leaveForm.exitDate,
        entryDate: leaveForm.entryDate,
        exitTime: leaveForm.exitTime,
        entryTime: leaveForm.entryTime,
        reason: leaveForm.reason,
        status: leaveForm.status,
        approvedBy: leaveForm.approvedBy,
        approvedAt: leaveForm.approvedAt,
        rejectionReason: leaveForm.rejectionReason,
        emergencyContact: leaveForm.emergencyContact,
        submittedAt: leaveForm.submittedAt,
        leaveDuration: leaveForm.leaveDuration
      }
    });

  } catch (error) {
    console.error('Get leave form by ID error:', error);
    sendError(res, 500, 'Server error while fetching leave form');
  }
};

/**
 * Delete leave form (Student only - pending forms only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteLeaveForm = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.student._id;

    const leaveForm = await LeaveForm.findOne({
      _id: id,
      studentId: studentId
    });

    if (!leaveForm) {
      return sendNotFound(res, 'Leave form not found or you do not have permission to delete it');
    }

    if (leaveForm.status !== 'pending') {
      return sendError(res, 400, 'Only pending leave forms can be deleted');
    }

    await LeaveForm.findByIdAndDelete(id);

    sendSuccess(res, 200, 'Leave form deleted successfully', {
      deletedForm: {
        id: leaveForm._id,
        status: leaveForm.status,
        deletedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Delete leave form error:', error);
    sendError(res, 500, 'Server error while deleting leave form');
  }
};

/**
 * Cancel pending leave form (Student only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const cancelLeaveForm = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.student._id;

    const leaveForm = await LeaveForm.findOne({
      _id: id,
      studentId: studentId,
      status: 'pending'
    });

    if (!leaveForm) {
      return sendNotFound(res, 'Pending leave form not found');
    }

    leaveForm.status = 'cancelled';
    await leaveForm.save();

    sendSuccess(res, 200, 'Leave form cancelled successfully', {
      leaveForm: {
        id: leaveForm._id,
        status: leaveForm.status
      }
    });

  } catch (error) {
    console.error('Cancel leave form error:', error);
    sendError(res, 500, 'Server error while cancelling leave form');
  }
};

// ==================== NON-TEACHING STAFF ENDPOINTS ====================

/**
 * Get all pending leave forms (Non-Teaching Staff only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllPendingLeaveForms = async (req, res) => {
  try {
    const { page = 1, limit = 10, hostelName, rollNumber } = req.query;

    // Build filter
    const filter = { status: 'pending' };
    if (hostelName) filter.hostelName = new RegExp(hostelName, 'i');
    if (rollNumber) filter.rollNumber = new RegExp(rollNumber, 'i');

    const leaveForms = await LeaveForm.find(filter)
      .populate('studentId', 'name email rollNumber department year phone')
      .select('-__v')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await LeaveForm.countDocuments(filter);

    sendSuccess(res, 200, 'Pending leave forms retrieved successfully', {
      leaveForms,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPendingForms: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get all pending leave forms error:', error);
    sendError(res, 500, 'Server error while fetching pending leave forms');
  }
};

/**
 * Get all leave forms verified by attendants (Hostel Wardens only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAttendantVerifiedLeaveForms = async (req, res) => {
  try {
    const { page = 1, limit = 10, hostelName, rollNumber } = req.query;

    // Build filter - only forms verified by attendants
    const filter = { status: 'verified_by_attendant' };
    if (hostelName) filter.hostelName = new RegExp(hostelName, 'i');
    if (rollNumber) filter.rollNumber = new RegExp(rollNumber, 'i');

    const leaveForms = await LeaveForm.find(filter)
      .populate('studentId', 'name email rollNumber department year phone')
      .populate('verifiedByAttendant', 'name staffId role designation')
      .select('-__v')
      .sort({ verifiedAtAttendant: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await LeaveForm.countDocuments(filter);

    sendSuccess(res, 200, 'Attendant verified leave forms retrieved successfully', {
      leaveForms,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalVerifiedForms: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get attendant verified leave forms error:', error);
    sendError(res, 500, 'Server error while retrieving attendant verified leave forms');
  }
};

/**
 * Get all leave forms (Non-Teaching Staff only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllLeaveForms = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, hostelName, rollNumber, dateFrom, dateTo } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (hostelName) filter.hostelName = new RegExp(hostelName, 'i');
    if (rollNumber) filter.rollNumber = new RegExp(rollNumber, 'i');
    
    if (dateFrom || dateTo) {
      filter.submittedAt = {};
      if (dateFrom) filter.submittedAt.$gte = new Date(dateFrom);
      if (dateTo) filter.submittedAt.$lte = new Date(dateTo);
    }

    const leaveForms = await LeaveForm.find(filter)
      .populate('studentId', 'name email rollNumber department year phone')
      .populate('approvedBy', 'name staffId designation')
      .select('-__v')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await LeaveForm.countDocuments(filter);

    sendSuccess(res, 200, 'Leave forms retrieved successfully', {
      leaveForms,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalLeaveForms: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get all leave forms error:', error);
    sendError(res, 500, 'Server error while fetching leave forms');
  }
};

/**
 * Get specific leave form (Non-Teaching Staff only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getLeaveFormDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const leaveForm = await LeaveForm.findById(id)
      .populate('studentId', 'name email rollNumber department year phone address')
      .populate('approvedBy', 'name staffId designation department')
      .select('-__v');

    if (!leaveForm) {
      return sendNotFound(res, 'Leave form not found');
    }

    sendSuccess(res, 200, 'Leave form details retrieved successfully', {
      leaveForm: {
        id: leaveForm._id,
        student: leaveForm.studentId,
        studentName: leaveForm.studentName,
        rollNumber: leaveForm.rollNumber,
        studentPhone: leaveForm.studentPhone,
        hostelName: leaveForm.hostelName,
        roomNumber: leaveForm.roomNumber,
        exitDate: leaveForm.exitDate,
        entryDate: leaveForm.entryDate,
        exitTime: leaveForm.exitTime,
        entryTime: leaveForm.entryTime,
        reason: leaveForm.reason,
        status: leaveForm.status,
        approvedBy: leaveForm.approvedBy,
        approvedAt: leaveForm.approvedAt,
        rejectionReason: leaveForm.rejectionReason,
        emergencyContact: leaveForm.emergencyContact,
        submittedAt: leaveForm.submittedAt,
        leaveDuration: leaveForm.leaveDuration
      }
    });

  } catch (error) {
    console.error('Get leave form details error:', error);
    sendError(res, 500, 'Server error while fetching leave form details');
  }
};

/**
 * Verify leave form by attendant (Attendants only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyLeaveFormByAttendant = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const staffId = req.staff._id;

    const leaveForm = await LeaveForm.findById(id);

    if (!leaveForm) {
      return sendNotFound(res, 'Leave form not found');
    }

    if (leaveForm.status !== 'pending') {
      return sendError(res, 400, 'Only pending leave forms can be verified by attendant');
    }

    // Update leave form with attendant verification
    leaveForm.status = 'verified_by_attendant';
    leaveForm.verifiedByAttendant = staffId;
    leaveForm.verifiedAtAttendant = new Date();
    leaveForm.attendantRemarks = remarks || null;

    await leaveForm.save();

    sendSuccess(res, 200, 'Leave form verified by attendant successfully', {
      leaveForm: {
        id: leaveForm._id,
        status: leaveForm.status,
        verifiedByAttendant: leaveForm.verifiedByAttendant,
        verifiedAtAttendant: leaveForm.verifiedAtAttendant,
        attendantRemarks: leaveForm.attendantRemarks
      }
    });

  } catch (error) {
    console.error('Verify leave form by attendant error:', error);
    sendError(res, 500, 'Server error while verifying leave form');
  }
};

/**
 * Approve leave form (Hostel Wardens only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const approveLeaveForm = async (req, res) => {
  try {
    const { id } = req.params;
    const staffId = req.staff._id;

    const leaveForm = await LeaveForm.findById(id);

    if (!leaveForm) {
      return sendNotFound(res, 'Leave form not found');
    }

    if (leaveForm.status !== 'verified_by_attendant') {
      return sendError(res, 400, 'Only attendant-verified leave forms can be approved by hostel warden');
    }

    leaveForm.status = 'approved';
    leaveForm.approvedBy = staffId;
    leaveForm.approvedAt = new Date();
    leaveForm.rejectionReason = null;

    await leaveForm.save();

    sendSuccess(res, 200, 'Leave form approved successfully', {
      leaveForm: {
        id: leaveForm._id,
        status: leaveForm.status,
        approvedBy: leaveForm.approvedBy,
        approvedAt: leaveForm.approvedAt
      }
    });

  } catch (error) {
    console.error('Approve leave form error:', error);
    sendError(res, 500, 'Server error while approving leave form');
  }
};

/**
 * Reject leave form by attendant (Attendants only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const rejectLeaveFormByAttendant = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const staffId = req.staff._id;

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return sendError(res, 400, 'Rejection reason is required');
    }

    const leaveForm = await LeaveForm.findById(id);

    if (!leaveForm) {
      return sendNotFound(res, 'Leave form not found');
    }

    if (leaveForm.status !== 'pending') {
      return sendError(res, 400, 'Only pending leave forms can be rejected by attendant');
    }

    leaveForm.status = 'rejected';
    leaveForm.approvedBy = staffId; // Using approvedBy field for rejection
    leaveForm.approvedAt = new Date();
    leaveForm.rejectionReason = rejectionReason.trim();

    await leaveForm.save();

    sendSuccess(res, 200, 'Leave form rejected by attendant successfully', {
      leaveForm: {
        id: leaveForm._id,
        status: leaveForm.status,
        rejectedBy: leaveForm.approvedBy,
        rejectedAt: leaveForm.approvedAt,
        rejectionReason: leaveForm.rejectionReason
      }
    });

  } catch (error) {
    console.error('Reject leave form by attendant error:', error);
    sendError(res, 500, 'Server error while rejecting leave form');
  }
};

/**
 * Reject leave form (Non-Teaching Staff only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const rejectLeaveForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const staffId = req.staff._id;

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return sendError(res, 400, 'Rejection reason is required');
    }

    const leaveForm = await LeaveForm.findById(id);

    if (!leaveForm) {
      return sendNotFound(res, 'Leave form not found');
    }

    if (leaveForm.status !== 'pending' && leaveForm.status !== 'verified_by_attendant') {
      return sendError(res, 400, 'Only pending or attendant-verified leave forms can be rejected');
    }

    leaveForm.status = 'rejected';
    leaveForm.approvedBy = staffId;
    leaveForm.approvedAt = new Date();
    leaveForm.rejectionReason = rejectionReason.trim();

    await leaveForm.save();

    sendSuccess(res, 200, 'Leave form rejected successfully', {
      leaveForm: {
        id: leaveForm._id,
        status: leaveForm.status,
        approvedBy: leaveForm.approvedBy,
        approvedAt: leaveForm.approvedAt,
        rejectionReason: leaveForm.rejectionReason
      }
    });

  } catch (error) {
    console.error('Reject leave form error:', error);
    sendError(res, 500, 'Server error while rejecting leave form');
  }
};

/**
 * Get non-teaching staff profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getNonTeachingStaffProfile = async (req, res) => {
  try {
    const staff = req.staff;

    // Get additional stats for the staff member
    const totalFormsProcessed = await LeaveForm.countDocuments({
      $or: [
        { verifiedByAttendant: staff._id },
        { approvedBy: staff._id }
      ]
    });

    const pendingFormsCount = await LeaveForm.countDocuments({ status: 'pending' });
    const verifiedFormsCount = await LeaveForm.countDocuments({ status: 'verified_by_attendant' });
    const approvedFormsCount = await LeaveForm.countDocuments({ status: 'approved' });
    const rejectedFormsCount = await LeaveForm.countDocuments({ status: 'rejected' });

    sendSuccess(res, 200, 'Profile retrieved successfully', {
      profile: {
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        staffId: staff.staffId,
        designation: staff.designation,
        department: staff.department,
        role: staff.role,
        phone: staff.phone,
        address: staff.address,
        dateOfBirth: staff.dateOfBirth,
        gender: staff.gender,
        bloodGroup: staff.bloodGroup,
        joiningDate: staff.joiningDate,
        salary: staff.salary,
        workHours: staff.workHours,
        permissions: staff.permissions,
        isActive: staff.isActive,
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt
      },
      stats: {
        totalFormsProcessed,
        pendingFormsCount,
        verifiedFormsCount,
        approvedFormsCount,
        rejectedFormsCount
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    sendError(res, 500, 'Server error while retrieving profile');
  }
};

/**
 * Get leave form statistics (Non-Teaching Staff only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getLeaveFormStats = async (req, res) => {
  try {
    const totalPending = await LeaveForm.countDocuments({ status: 'pending' });
    const totalApproved = await LeaveForm.countDocuments({ status: 'approved' });
    const totalRejected = await LeaveForm.countDocuments({ status: 'rejected' });
    const totalCancelled = await LeaveForm.countDocuments({ status: 'cancelled' });

    // Get today's submissions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySubmissions = await LeaveForm.countDocuments({
      submittedAt: { $gte: today, $lt: tomorrow }
    });

    // Get this week's submissions
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const thisWeekSubmissions = await LeaveForm.countDocuments({
      submittedAt: { $gte: weekStart }
    });

    sendSuccess(res, 200, 'Leave form statistics retrieved successfully', {
      stats: {
        totalPending,
        totalApproved,
        totalRejected,
        totalCancelled,
        totalForms: totalPending + totalApproved + totalRejected + totalCancelled,
        todaySubmissions,
        thisWeekSubmissions
      }
    });

  } catch (error) {
    console.error('Get leave form stats error:', error);
    sendError(res, 500, 'Server error while fetching statistics');
  }
};

module.exports = {
  // Student endpoints
  submitLeaveForm,
  getMyLeaveForms,
  getLeaveFormById,
  deleteLeaveForm,
  cancelLeaveForm,
  
  // Non-Teaching Staff endpoints
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
};
