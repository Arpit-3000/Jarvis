const Account = require('../models/Account');
const { sendSuccess, sendError, sendNotFound } = require('../utils/response');

/**
 * Get account details controller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAccountDetails = async (req, res) => {
  try {
    const account = await Account.findById(req.params.accountId)
      .populate('accountHolderId', 'name email')
      .select('-__v');
    
    if (!account) {
      return sendNotFound(res, 'Account not found');
    }

    sendSuccess(res, 200, 'Account details retrieved successfully', {
      account: {
        id: account._id,
        accountNumber: account.accountNumber,
        accountHolderId: account.accountHolderId,
        accountHolderType: account.accountHolderType,
        accountType: account.accountType,
        bankName: account.bankName,
        branchName: account.branchName,
        ifscCode: account.ifscCode,
        currentBalance: account.currentBalance,
        minimumBalance: account.minimumBalance,
        interestRate: account.interestRate,
        accountStatus: account.accountStatus,
        isPrimary: account.isPrimary,
        dailyTransactionLimit: account.dailyTransactionLimit,
        monthlyTransactionLimit: account.monthlyTransactionLimit,
        openingDate: account.openingDate,
        closingDate: account.closingDate,
        maturityDate: account.maturityDate,
        kycStatus: account.kycStatus,
        kycDocuments: account.kycDocuments,
        contactInfo: account.contactInfo,
        isActive: account.isActive,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt
      }
    });

  } catch (error) {
    console.error('Get account details error:', error);
    sendError(res, 500, 'Server error while fetching account details');
  }
};

/**
 * Get accounts by holder ID controller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAccountsByHolder = async (req, res) => {
  try {
    const { holderId, holderType } = req.params;
    
    const accounts = await Account.find({
      accountHolderId: holderId,
      accountHolderType: holderType,
      isActive: true
    }).select('-__v');

    sendSuccess(res, 200, 'Accounts retrieved successfully', {
      accounts,
      totalAccounts: accounts.length
    });

  } catch (error) {
    console.error('Get accounts by holder error:', error);
    sendError(res, 500, 'Server error while fetching accounts');
  }
};

/**
 * Get account balance controller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAccountBalance = async (req, res) => {
  try {
    const account = await Account.findById(req.params.accountId)
      .select('accountNumber currentBalance accountStatus');
    
    if (!account) {
      return sendNotFound(res, 'Account not found');
    }

    if (account.accountStatus !== 'Active') {
      return sendError(res, 400, 'Account is not active');
    }

    sendSuccess(res, 200, 'Account balance retrieved successfully', {
      accountNumber: account.accountNumber,
      currentBalance: account.currentBalance,
      accountStatus: account.accountStatus
    });

  } catch (error) {
    console.error('Get account balance error:', error);
    sendError(res, 500, 'Server error while fetching account balance');
  }
};

/**
 * Get all accounts (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllAccounts = async (req, res) => {
  try {
    const { page = 1, limit = 10, accountType, accountStatus, bankName } = req.query;
    
    // Build filter
    const filter = {};
    if (accountType) filter.accountType = accountType;
    if (accountStatus) filter.accountStatus = accountStatus;
    if (bankName) filter.bankName = new RegExp(bankName, 'i');
    filter.isActive = true;

    const accounts = await Account.find(filter)
      .populate('accountHolderId', 'name email')
      .select('-__v')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Account.countDocuments(filter);

    sendSuccess(res, 200, 'Accounts retrieved successfully', {
      accounts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalAccounts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get all accounts error:', error);
    sendError(res, 500, 'Server error while fetching accounts');
  }
};

/**
 * Get account statistics (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAccountStatistics = async (req, res) => {
  try {
    const totalAccounts = await Account.countDocuments({ isActive: true });
    const activeAccounts = await Account.countDocuments({ 
      isActive: true, 
      accountStatus: 'Active' 
    });
    const totalBalance = await Account.aggregate([
      { $match: { isActive: true, accountStatus: 'Active' } },
      { $group: { _id: null, total: { $sum: '$currentBalance' } } }
    ]);

    const accountsByType = await Account.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$accountType', count: { $sum: 1 } } }
    ]);

    const accountsByStatus = await Account.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$accountStatus', count: { $sum: 1 } } }
    ]);

    sendSuccess(res, 200, 'Account statistics retrieved successfully', {
      statistics: {
        totalAccounts,
        activeAccounts,
        totalBalance: totalBalance[0]?.total || 0,
        accountsByType,
        accountsByStatus
      }
    });

  } catch (error) {
    console.error('Get account statistics error:', error);
    sendError(res, 500, 'Server error while fetching account statistics');
  }
};

module.exports = {
  getAccountDetails,
  getAccountsByHolder,
  getAccountBalance,
  getAllAccounts,
  getAccountStatistics
};
