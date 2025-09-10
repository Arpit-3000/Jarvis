const express = require('express');
const { 
  getAccountDetails, 
  getAccountsByHolder, 
  getAccountBalance, 
  getAllAccounts, 
  getAccountStatistics 
} = require('../controllers/accountController');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// @route   GET /api/account/:accountId
// @desc    Get account details
// @access  Private (Admin)
router.get('/:accountId', adminAuth, getAccountDetails);

// @route   GET /api/account/balance/:accountId
// @desc    Get account balance
// @access  Private (Admin)
router.get('/balance/:accountId', adminAuth, getAccountBalance);

// @route   GET /api/account/holder/:holderId/:holderType
// @desc    Get accounts by holder ID and type
// @access  Private (Admin)
router.get('/holder/:holderId/:holderType', adminAuth, getAccountsByHolder);

// @route   GET /api/account/all
// @desc    Get all accounts (Admin only)
// @access  Private (Admin)
router.get('/all', adminAuth, getAllAccounts);

// @route   GET /api/account/statistics
// @desc    Get account statistics (Admin only)
// @access  Private (Admin)
router.get('/statistics', adminAuth, getAccountStatistics);

module.exports = router;
