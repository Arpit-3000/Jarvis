const express = require('express');
const router = express.Router();
const gateController = require('../controllers/gateController');
const auth = require('../middleware/auth'); // student auth
const nonTeachingAuth = require('../middleware/nonTeachingAuth'); // guard auth
const adminAuth = require('../middleware/adminAuth'); // admin auth

// ==================== STUDENT ROUTES ====================
// All student routes are protected by auth middleware

// @route   POST /api/gate/generate
// @desc    Generate QR pass for gate entry/exit
// @access  Private (Student)
router.post('/generate', auth, gateController.generatePass);

// @route   GET /api/gate/my-logs
// @desc    Get student's own gate logs
// @access  Private (Student)
router.get('/my-logs', auth, gateController.getMyGateLogs);

// @route   GET /api/gate/status
// @desc    Get current gate status
// @access  Private (Student)
router.get('/status', auth, gateController.getCurrentStatus);

// ==================== GUARD ROUTES ====================
// All guard routes are protected by nonTeachingAuth middleware

// @route   POST /api/gate/scan
// @desc    Scan QR pass (Guard function)
// @access  Private (Non-Teaching Staff)
router.post('/scan', nonTeachingAuth, gateController.scanPass);

// @route   GET /api/gate/active
// @desc    Get all students currently on campus
// @access  Private (Non-Teaching Staff)
router.get('/active', nonTeachingAuth, gateController.getActiveStudents);

// ==================== ADMIN ROUTES ====================
// All admin routes are protected by adminAuth middleware

// @route   GET /api/gate/logs
// @desc    Get all gate logs with filtering
// @access  Private (Admin)
router.get('/logs', adminAuth, gateController.getGateLogs);

// @route   POST /api/gate/manual-override
// @desc    Manual gate override for admin
// @access  Private (Admin)
router.post('/manual-override', adminAuth, gateController.manualOverride);

module.exports = router;