// const Admin = require('../models/Admin');
// const Student = require('../models/Student');
// const Teacher = require('../models/Teacher');
// const Account = require('../models/Account');
// const { sendSuccess, sendError, sendNotFound } = require('../utils/response');

// /**
//  * Get admin profile controller
//  * @param {Object} req - Express request object
//  * @param {Object} res - Express response object
//  */
// const getProfile = async (req, res) => {
//   try {
//     const admin = await Admin.findById(req.admin._id).select('-__v');
    
//     if (!admin) {
//       return sendNotFound(res, 'Admin not found');
//     }

//     sendSuccess(res, 200, 'Profile retrieved successfully', {
//       admin: {
//         id: admin._id,
//         name: admin.name,
//         email: admin.email,
//         adminId: admin.adminId,
//         employeeId: admin.employeeId,
//         role: admin.role,
//         permissions: admin.permissions,
//         department: admin.department,
//         designation: admin.designation,
//         phone: admin.phone,
//         address: admin.address,
//         dateOfBirth: admin.dateOfBirth,
//         gender: admin.gender,
//         bloodGroup: admin.bloodGroup,
//         joiningDate: admin.joiningDate,
//         salary: admin.salary,
//         workHours: admin.workHours,
//         lastLogin: admin.lastLogin,
//         isActive: admin.isActive,
//         createdAt: admin.createdAt,
//         updatedAt: admin.updatedAt
//       }
//     });

//   } catch (error) {
//     console.error('Get admin profile error:', error);
//     sendError(res, 500, 'Server error while fetching profile');
//   }
// };

// /**
//  * Get admin dashboard controller
//  * @param {Object} req - Express request object
//  * @param {Object} res - Express response object
//  */
// const getDashboard = async (req, res) => {
//   try {
//     const admin = await Admin.findById(req.admin._id).select('-__v');
    
//     if (!admin) {
//       return sendNotFound(res, 'Admin not found');
//     }

//     // Get system statistics
//     const totalStudents = await Student.countDocuments({ isActive: true });
//     const totalTeachers = await Teacher.countDocuments({ isActive: true });
//     const totalAdmins = await Admin.countDocuments({ isActive: true });
//     const totalAccounts = await Account.countDocuments({ isActive: true });

//     // Dashboard data structure
//     const dashboardData = {
//       admin: {
//         id: admin._id,
//         name: admin.name,
//         email: admin.email,
//         adminId: admin.adminId,
//         role: admin.role,
//         permissions: admin.permissions,
//         department: admin.department,
//         designation: admin.designation
//       },
//       stats: {
//         totalStudents,
//         totalTeachers,
//         totalAdmins,
//         totalAccounts,
//         activeUsers: totalStudents + totalTeachers + totalAdmins
//       },
//       recentActivity: [
//         // Example recent activity - customize based on your needs
//         {
//           type: 'user_registration',
//           title: 'New student registered',
//           date: new Date(),
//           status: 'completed'
//         }
//       ]
//     };

//     sendSuccess(res, 200, 'Dashboard data retrieved successfully', dashboardData);

//   } catch (error) {
//     console.error('Admin dashboard error:', error);
//     sendError(res, 500, 'Server error while fetching dashboard data');
//   }
// };

// /**
//  * Get all students (Admin only)
//  * @param {Object} req - Express request object
//  * @param {Object} res - Express response object
//  */
// const getAllStudents = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, department, year } = req.query;
    
//     // Build filter
//     const filter = {};
//     if (department) filter.department = department;
//     if (year) filter.year = year;
//     filter.isActive = true;

//     const students = await Student.find(filter)
//       .select('-__v')
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .sort({ createdAt: -1 });

//     const total = await Student.countDocuments(filter);

//     sendSuccess(res, 200, 'Students retrieved successfully', {
//       students,
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(total / limit),
//         totalStudents: total,
//         hasNext: page < Math.ceil(total / limit),
//         hasPrev: page > 1
//       }
//     });

//   } catch (error) {
//     console.error('Get all students error:', error);
//     sendError(res, 500, 'Server error while fetching students');
//   }
// };

// /**
//  * Get all teachers (Admin only)
//  * @param {Object} req - Express request object
//  * @param {Object} res - Express response object
//  */
// const getAllTeachers = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, department, designation } = req.query;
    
//     // Build filter
//     const filter = {};
//     if (department) filter.department = department;
//     if (designation) filter.designation = designation;
//     filter.isActive = true;

//     const teachers = await Teacher.find(filter)
//       .select('-__v')
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .sort({ createdAt: -1 });

//     const total = await Teacher.countDocuments(filter);

//     sendSuccess(res, 200, 'Teachers retrieved successfully', {
//       teachers,
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(total / limit),
//         totalTeachers: total,
//         hasNext: page < Math.ceil(total / limit),
//         hasPrev: page > 1
//       }
//     });

//   } catch (error) {
//     console.error('Get all teachers error:', error);
//     sendError(res, 500, 'Server error while fetching teachers');
//   }
// };

// /**
//  * Get all accounts (Admin only)
//  * @param {Object} req - Express request object
//  * @param {Object} res - Express response object
//  */
// const getAllAccounts = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, accountType, accountStatus } = req.query;
    
//     // Build filter
//     const filter = {};
//     if (accountType) filter.accountType = accountType;
//     if (accountStatus) filter.accountStatus = accountStatus;
//     filter.isActive = true;

//     const accounts = await Account.find(filter)
//       .populate('accountHolderId', 'name email')
//       .select('-__v')
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .sort({ createdAt: -1 });

//     const total = await Account.countDocuments(filter);

//     sendSuccess(res, 200, 'Accounts retrieved successfully', {
//       accounts,
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(total / limit),
//         totalAccounts: total,
//         hasNext: page < Math.ceil(total / limit),
//         hasPrev: page > 1
//       }
//     });

//   } catch (error) {
//     console.error('Get all accounts error:', error);
//     sendError(res, 500, 'Server error while fetching accounts');
//   }
// };

// module.exports = {
//   getProfile,
//   getDashboard,
//   getAllStudents,
//   getAllTeachers,
//   getAllAccounts
// };


const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Account = require('../models/Account');
const { sendSuccess, sendError, sendNotFound } = require('../utils/response');

/**
 * Get admin profile controller
 */
const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-__v');
    if (!admin) return sendNotFound(res, 'Admin not found');

    sendSuccess(res, 200, 'Profile retrieved successfully', {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        adminId: admin.adminId,
        employeeId: admin.employeeId,
        role: admin.role,
        permissions: admin.permissions,
        department: admin.department,
        designation: admin.designation,
        phone: admin.phone,
        address: admin.address,
        dateOfBirth: admin.dateOfBirth,
        gender: admin.gender,
        bloodGroup: admin.bloodGroup,
        joiningDate: admin.joiningDate,
        salary: admin.salary,
        workHours: admin.workHours,
        lastLogin: admin.lastLogin,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      }
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    sendError(res, 500, 'Server error while fetching profile');
  }
};

/**
 * Get admin dashboard controller
 */
const getDashboard = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-__v');
    if (!admin) return sendNotFound(res, 'Admin not found');

    const totalStudents = await Student.countDocuments({ isActive: true });
    const totalTeachers = await Teacher.countDocuments({ isActive: true });
    const totalAdmins = await Admin.countDocuments({ isActive: true });
    const totalAccounts = await Account.countDocuments({ isActive: true });

    const dashboardData = {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        adminId: admin.adminId,
        role: admin.role,
        permissions: admin.permissions,
        department: admin.department,
        designation: admin.designation
      },
      stats: {
        totalStudents,
        totalTeachers,
        totalAdmins,
        totalAccounts,
        activeUsers: totalStudents + totalTeachers + totalAdmins
      },
      recentActivity: [
        {
          type: 'user_registration',
          title: 'New student registered',
          date: new Date(),
          status: 'completed'
        }
      ]
    };

    sendSuccess(res, 200, 'Dashboard data retrieved successfully', dashboardData);
  } catch (error) {
    console.error('Admin dashboard error:', error);
    sendError(res, 500, 'Server error while fetching dashboard data');
  }
};

/**
 * Get all students (Admin only)
 */
const getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, year } = req.query;

    const filter = {};
    if (department) filter.department = department;
    if (year) filter.year = year;
    filter.isActive = true;

    const students = await Student.find(filter)
      .select('-__v')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Student.countDocuments(filter);

    sendSuccess(res, 200, 'Students retrieved successfully', {
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
    console.error('Get all students error:', error);
    sendError(res, 500, 'Server error while fetching students');
  }
};

/**
 * Get all teachers (Admin only)
 */
const getAllTeachers = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, designation } = req.query;

    const filter = {};
    if (department) filter.department = department;
    if (designation) filter.designation = designation;
    filter.isActive = true;

    const teachers = await Teacher.find(filter)
      .select('-__v')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Teacher.countDocuments(filter);

    sendSuccess(res, 200, 'Teachers retrieved successfully', {
      teachers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTeachers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all teachers error:', error);
    sendError(res, 500, 'Server error while fetching teachers');
  }
};

/**
 * Get all accounts (Admin only)
 */
const getAllAccounts = async (req, res) => {
  try {
    const { page = 1, limit = 10, accountType, accountStatus } = req.query;

    const filter = {};
    if (accountType) filter.accountType = accountType;
    if (accountStatus) filter.accountStatus = accountStatus;
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

// Gate management functions moved to dedicated gateController.js
// Use /api/gate/* endpoints for gate-related operations

module.exports = {
  getProfile,
  getDashboard,
  getAllStudents,
  getAllTeachers,
  getAllAccounts
};
