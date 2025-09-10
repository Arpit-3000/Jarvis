const express = require('express');
const { getProfile, getDashboard, getAllTeachers } = require('../controllers/teacherController');
const teacherAuth = require('../middleware/teacherAuth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// @route   GET /api/teacher/profile
// @desc    Get teacher profile (read-only)
// @access  Private (Teacher)
router.get('/profile', teacherAuth, getProfile);

// @route   GET /api/teacher/dashboard
// @desc    Get teacher dashboard data
// @access  Private (Teacher)
router.get('/dashboard', teacherAuth, getDashboard);

// @route   GET /api/teacher/all
// @desc    Get all teachers (Admin only)
// @access  Private (Admin)
router.get('/all', adminAuth, getAllTeachers);

module.exports = router;
