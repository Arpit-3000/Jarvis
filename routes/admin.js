const express = require('express');
const { 
  getProfile, 
  getDashboard, 
  getAllStudents, 
  getAllTeachers, 
  getAllAccounts 
} = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// @route   GET /api/admin/profile
// @desc    Get admin profile (read-only)
// @access  Private (Admin)
router.get('/profile', adminAuth, getProfile);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin)
router.get('/dashboard', adminAuth, getDashboard);

// @route   GET /api/admin/students
// @desc    Get all students (Admin only)
// @access  Private (Admin)
router.get('/students', adminAuth, getAllStudents);

// @route   GET /api/admin/teachers
// @desc    Get all teachers (Admin only)
// @access  Private (Admin)
router.get('/teachers', adminAuth, getAllTeachers);

// @route   GET /api/admin/accounts
// @desc    Get all accounts (Admin only)
// @access  Private (Admin)
router.get('/accounts', adminAuth, getAllAccounts);

module.exports = router;
