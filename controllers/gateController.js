const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const GateLog = require('../models/GateLog');
const Student = require('../models/Student');
const { sendSuccess, sendError, sendUnauthorized } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const QR_EXPIRE_MINUTES = parseInt(process.env.QR_EXPIRE_MINUTES || '10', 10); // 5-10 minutes as requested

/**
 * Generate QR Pass for Gate Entry/Exit
 * Student generates a QR code with destination
 * Only allows QR generation when student is IN (going out)
 */
exports.generatePass = async (req, res) => {
  try {
    const { destination } = req.body;
    const student = req.student; // From auth middleware

    // Validate destination only for exit (not required for entry)
    if (student.currentStatus === 'in' && (!destination || destination.trim().length === 0)) {
      return sendError(res, 400, 'Destination is required for exit');
    }

    // Check if student has any pending pass
    const existingPending = await GateLog.findOne({ 
      studentId: student._id, 
      status: 'pending' 
    });

    if (existingPending) {
      return sendError(res, 400, 'You already have an active gate pass. Please use that or wait until it expires.');
    }

    // Determine action based on current status
    const action = student.currentStatus === 'in' ? 'exit' : 'enter';

    // Generate JWT token with student details
    const expiresInSec = QR_EXPIRE_MINUTES * 60;
    const payload = {
      studentId: student._id.toString(),
      name: student.name,
      rollNumber: student.rollNumber,
      studentId: student.studentId,
      phone: student.phone,
      department: student.department,
      year: student.year,
      action: action,
      destination: destination ? destination.trim() : 'Campus Entry',
      issuedAt: Date.now()
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: expiresInSec });
    const expiresAt = new Date(Date.now() + expiresInSec * 1000);

    // Create gate log entry
    const gateLog = await GateLog.create({
      studentId: student._id,
      studentSnapshot: {
        name: student.name,
        rollNumber: student.rollNumber,
        studentId: student.studentId,
        phone: student.phone,
        department: student.department,
        year: student.year
      },
      destination: destination ? destination.trim() : 'Campus Entry',
      action: action,
      status: 'pending',
      qrToken: token,
      issuedAt: new Date(),
      expiresAt: expiresAt
    });

    // Generate QR code with better scanning compatibility
    const qrCodeDataUrl = await QRCode.toDataURL(token, {
      width: 400,
      margin: 4,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M',
      type: 'image/png'
    });

    sendSuccess(res, 200, `QR code generated successfully for ${action}`, {
      gateLogId: gateLog._id,
      qrCode: qrCodeDataUrl,
      token: token, // Include token for testing
      action: action,
      destination: destination.trim(),
      expiresAt: expiresAt,
      validFor: `${QR_EXPIRE_MINUTES} minutes`,
      studentInfo: {
        name: student.name,
        rollNumber: student.rollNumber,
        currentStatus: student.currentStatus
      },
      message: `QR code valid for ${QR_EXPIRE_MINUTES} minutes. Show this to the guard for ${action === 'exit' ? 'exiting' : 'entering'} campus.`
    });

  } catch (error) {
    console.error('Generate pass error:', error);
    sendError(res, 500, 'Server error while generating gate pass');
  }
};

/**
 * Scan QR Pass (Guard Function)
 * Guard scans the QR code and processes the gate pass
 * Implements Cases A, B, and C as per new requirements
 */
exports.scanPass = async (req, res) => {
  try {
    const { token, remarks } = req.body;
    const guard = req.staff; // From nonTeachingAuth middleware

    if (!token) {
      return sendError(res, 400, 'QR token is required');
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return sendError(res, 400, '❌ QR Expired.');
      }
      return sendError(res, 400, '❌ Invalid QR.');
    }

    // Find the gate log
    const gateLog = await GateLog.findOne({ qrToken: token });
    if (!gateLog) {
      return sendError(res, 404, '❌ Invalid QR.');
    }

    // Check if already processed
    if (gateLog.status === 'processed') {
      return sendError(res, 400, 'This gate pass has already been used');
    }

    // Check if expired
    if (gateLog.expiresAt < new Date()) {
      gateLog.status = 'expired';
      await gateLog.save();
      return sendError(res, 400, '❌ QR Expired.');
    }

    // Get student details
    const student = await Student.findById(gateLog.studentId);
    if (!student) {
      return sendError(res, 404, '❌ Invalid QR.');
    }

    const currentTime = new Date();
    const timeString = currentTime.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Case A: Student is currently IN and QR is for EXIT
    if (student.currentStatus === 'in' && gateLog.action === 'exit') {
      // Update the gate log with current time and mark as processed
      gateLog.status = 'processed';
      gateLog.scannedBy = guard._id;
      gateLog.scannedAt = currentTime;
      if (remarks) {
        gateLog.remarks = remarks.trim();
      }
      await gateLog.save();

      // Update student status to OUT
      student.currentStatus = 'out';
      student.lastGateLog = gateLog._id;
      await student.save();

      return sendSuccess(res, 200, `✅ ${student.name} went out at ${timeString} for ${gateLog.destination}.`, {
        case: 'A',
        action: 'exit',
        student: {
          id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          studentId: student.studentId,
          department: student.department,
          year: student.year,
          phone: student.phone,
          currentStatus: student.currentStatus
        },
        gateLog: {
          id: gateLog._id,
          action: gateLog.action,
          destination: gateLog.destination,
          processedAt: gateLog.scannedAt,
          processedBy: guard.name,
          remarks: gateLog.remarks
        }
      });
    }

    // Case B: Student is currently OUT and QR is for ENTER
    if (student.currentStatus === 'out' && gateLog.action === 'enter') {
      // Update the gate log with current time and mark as processed
      gateLog.status = 'processed';
      gateLog.scannedBy = guard._id;
      gateLog.scannedAt = currentTime;
      if (remarks) {
        gateLog.remarks = remarks.trim();
      }
      await gateLog.save();

      // Update student status to IN
      student.currentStatus = 'in';
      student.lastGateLog = gateLog._id;
      await student.save();

      return sendSuccess(res, 200, `✅ ${student.name} entered at ${timeString} from ${gateLog.destination}.`, {
        case: 'B',
        action: 'enter',
        student: {
          id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          studentId: student.studentId,
          department: student.department,
          year: student.year,
          phone: student.phone,
          currentStatus: student.currentStatus
        },
        gateLog: {
          id: gateLog._id,
          action: gateLog.action,
          destination: gateLog.destination,
          processedAt: gateLog.scannedAt,
          processedBy: guard.name,
          remarks: gateLog.remarks
        }
      });
    }

    // Case C: Status mismatch - QR action doesn't match student status
    if ((student.currentStatus === 'in' && gateLog.action === 'enter') || 
        (student.currentStatus === 'out' && gateLog.action === 'exit')) {
      return sendError(res, 400, `❌ Status mismatch. Student is ${student.currentStatus} but QR is for ${gateLog.action}.`);
    }

    // This should not happen based on our logic, but just in case
    return sendError(res, 400, '❌ Invalid QR.');

  } catch (error) {
    console.error('Scan pass error:', error);
    sendError(res, 500, 'Server error while processing gate pass');
  }
};

/**
 * Get Active Students (Guard Function)
 * View all students currently on campus
 */
exports.getActiveStudents = async (req, res) => {
  try {
    const { page = 1, limit = 50, department, year } = req.query;

    // Build filter
    const filter = { currentStatus: 'in' };
    if (department) filter.department = department;
    if (year) filter.year = year;

    const students = await Student.find(filter)
      .select('name rollNumber studentId department year phone currentStatus lastGateLog')
      .populate('lastGateLog', 'action destination issuedAt')
      .sort({ lastGateLog: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Student.countDocuments(filter);

    sendSuccess(res, 200, 'Active students retrieved successfully', {
      students,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalStudents: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get active students error:', error);
    sendError(res, 500, 'Server error while fetching active students');
  }
};

/**
 * Get Gate Logs (Admin Function)
 * View all gate logs with filtering options
 */
exports.getGateLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      studentId, 
      action, 
      status, 
      startDate, 
      endDate,
      department,
      year
    } = req.query;

    // Build filter
    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (action) filter.action = action;
    if (status) filter.status = status;
    if (department) filter['studentSnapshot.department'] = department;
    if (year) filter['studentSnapshot.year'] = year;
    
    if (startDate || endDate) {
      filter.issuedAt = {};
      if (startDate) filter.issuedAt.$gte = new Date(startDate);
      if (endDate) filter.issuedAt.$lte = new Date(endDate);
    }

    const logs = await GateLog.find(filter)
      .populate('studentId', 'name rollNumber studentId department year')
      .populate('scannedBy', 'name staffId role')
      .sort({ issuedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await GateLog.countDocuments(filter);

    sendSuccess(res, 200, 'Gate logs retrieved successfully', {
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalLogs: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get gate logs error:', error);
    sendError(res, 500, 'Server error while fetching gate logs');
  }
};

/**
 * Get Student's Gate History (Student Function)
 * View student's own gate logs
 */
exports.getMyGateLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action, status } = req.query;
    const studentId = req.student._id;

    // Build filter
    const filter = { studentId };
    if (action) filter.action = action;
    if (status) filter.status = status;

    const logs = await GateLog.find(filter)
      .populate('scannedBy', 'name staffId role')
      .sort({ issuedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await GateLog.countDocuments(filter);

    sendSuccess(res, 200, 'Gate logs retrieved successfully', {
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalLogs: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get my gate logs error:', error);
    sendError(res, 500, 'Server error while fetching gate logs');
  }
};

/**
 * Get Current Gate Status (Student Function)
 * Get student's current campus status
 */
exports.getCurrentStatus = async (req, res) => {
  try {
    const student = req.student;

    // Get latest gate log
    const latestLog = await GateLog.findOne({ studentId: student._id })
      .populate('scannedBy', 'name staffId role')
      .sort({ issuedAt: -1 });

    sendSuccess(res, 200, 'Current status retrieved successfully', {
      currentStatus: student.currentStatus,
      lastGateLog: latestLog ? {
        id: latestLog._id,
        action: latestLog.action,
        destination: latestLog.destination,
        status: latestLog.status,
        issuedAt: latestLog.issuedAt,
        processedAt: latestLog.scannedAt,
        processedBy: latestLog.scannedBy
      } : null
    });

  } catch (error) {
    console.error('Get current status error:', error);
    sendError(res, 500, 'Server error while fetching current status');
  }
};

/**
 * Manual Gate Override (Admin Function)
 * Admin can manually mark student in/out
 */
exports.manualOverride = async (req, res) => {
  try {
    const { studentId, action, destination, remarks } = req.body;
    const admin = req.admin;

    if (!studentId || !action || !['exit', 'enter'].includes(action)) {
      return sendError(res, 400, 'Student ID and valid action (exit/enter) are required');
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return sendError(res, 404, 'Student not found');
    }

    // Create manual gate log
    const gateLog = await GateLog.create({
      studentId: student._id,
      studentSnapshot: {
        name: student.name,
        rollNumber: student.rollNumber,
        studentId: student.studentId,
        phone: student.phone,
        department: student.department,
        year: student.year
      },
      destination: destination || 'Manual Override',
      action: action,
      status: 'processed',
      qrToken: 'MANUAL_OVERRIDE_' + Date.now(),
      issuedAt: new Date(),
      expiresAt: new Date(),
      scannedBy: admin._id,
      scannedAt: new Date(),
      remarks: remarks || 'Manual override by admin'
    });

    // Update student status
    student.currentStatus = action === 'exit' ? 'out' : 'in';
    student.lastGateLog = gateLog._id;
    await student.save();

    sendSuccess(res, 200, 'Manual gate override successful', {
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        currentStatus: student.currentStatus
      },
      gateLog: {
        id: gateLog._id,
        action: gateLog.action,
        destination: gateLog.destination,
        processedBy: admin.name,
        remarks: gateLog.remarks
      }
    });

  } catch (error) {
    console.error('Manual override error:', error);
    sendError(res, 500, 'Server error while processing manual override');
  }
};