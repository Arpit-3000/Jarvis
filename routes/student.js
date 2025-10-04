// const express = require('express');
// const { getProfile, getDashboard } = require('../controllers/studentController');
// const auth = require('../middleware/auth');

// const router = express.Router();

// // All routes are protected
// router.use(auth);

// // @route   GET /api/student/profile
// // @desc    Get student profile (read-only)
// // @access  Private
// router.get('/profile', getProfile);

// // @route   GET /api/student/dashboard
// // @desc    Get student dashboard data
// // @access  Private
// router.get('/dashboard', getDashboard);

// module.exports = router;


const express = require('express');
const {
  getProfile,
  getDashboard
} = require('../controllers/studentController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(auth);

// @route   GET /api/student/profile
// @desc    Get student profile (read-only)
// @access  Private
router.get('/profile', getProfile);

// @route   GET /api/student/dashboard
// @desc    Get student dashboard data
// @access  Private
router.get('/dashboard', getDashboard);

// Note: Gate-related endpoints moved to /api/gate/*
// Use /api/gate/generate for QR pass generation
// Use /api/gate/status for current status
// Use /api/gate/my-logs for gate history

module.exports = router;
