// const Student = require('../models/Student');
// const { sendSuccess, sendError, sendNotFound } = require('../utils/response');

// /**
//  * Get student profile controller
//  * @param {Object} req - Express request object
//  * @param {Object} res - Express response object
//  */
// const getProfile = async (req, res) => {
//   try {
//     const student = await Student.findById(req.student._id).select('-__v');
    
//     if (!student) {
//       return sendNotFound(res, 'Student not found');
//     }

//     sendSuccess(res, 200, 'Profile retrieved successfully', {
//       student: {
//         id: student._id,
//         name: student.name,
//         email: student.email,
//         studentId: student.studentId,
//         rollNumber: student.rollNumber,
//         department: student.department,
//         branch: student.branch,
//         course: student.course,
//         year: student.year,
//         currentSemester: student.currentSemester,
//         phone: student.phone,
//         address: student.address,
//         fatherName: student.fatherName,
//         motherName: student.motherName,
//         fatherPhone: student.fatherPhone,
//         motherPhone: student.motherPhone,
//         dateOfBirth: student.dateOfBirth,
//         gender: student.gender,
//         bloodGroup: student.bloodGroup,
//         isActive: student.isActive,
//         createdAt: student.createdAt,
//         updatedAt: student.updatedAt
//       }
//     });

//   } catch (error) {
//     console.error('Get profile error:', error);
//     sendError(res, 500, 'Server error while fetching profile');
//   }
// };


// /**
//  * Get student dashboard controller
//  * @param {Object} req - Express request object
//  * @param {Object} res - Express response object
//  */
// const getDashboard = async (req, res) => {
//   try {
//     const student = await Student.findById(req.student._id).select('-__v');
    
//     if (!student) {
//       return sendNotFound(res, 'Student not found');
//     }

//     // Dashboard data structure
//     const dashboardData = {
//       student: {
//         id: student._id,
//         name: student.name,
//         email: student.email,
//         studentId: student.studentId,
//         rollNumber: student.rollNumber,
//         department: student.department,
//         branch: student.branch,
//         course: student.course,
//         year: student.year,
//         currentSemester: student.currentSemester,
//         phone: student.phone
//       },
//       stats: {
//         // Example stats - customize based on your needs
//         totalCourses: 0,
//         completedAssignments: 0,
//         pendingAssignments: 0,
//         upcomingExams: 0
//       },
//       recentActivity: [
//         // Example recent activity - customize based on your needs
//         {
//           type: 'assignment',
//           title: 'Math Assignment 1',
//           date: new Date(),
//           status: 'completed'
//         }
//       ]
//     };

//     sendSuccess(res, 200, 'Dashboard data retrieved successfully', dashboardData);

//   } catch (error) {
//     console.error('Dashboard error:', error);
//     sendError(res, 500, 'Server error while fetching dashboard data');
//   }
// };

// module.exports = {
//   getProfile,
//   getDashboard
// };

// controllers/studentController.js



const Student = require('../models/Student');
const { sendSuccess, sendError, sendNotFound } = require('../utils/response');

/**
 * Get student profile controller
 */
const getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.student._id).select('-__v');
    if (!student) return sendNotFound(res, 'Student not found');

    sendSuccess(res, 200, 'Profile retrieved successfully', {
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        rollNumber: student.rollNumber,
        department: student.department,
        branch: student.branch,
        course: student.course,
        year: student.year,
        currentSemester: student.currentSemester,
        phone: student.phone,
        address: student.address,
        fatherName: student.fatherName,
        motherName: student.motherName,
        fatherPhone: student.fatherPhone,
        motherPhone: student.motherPhone,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        bloodGroup: student.bloodGroup,
        isActive: student.isActive,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    sendError(res, 500, 'Server error while fetching profile');
  }
};

/**
 * Get student dashboard controller
 */
const getDashboard = async (req, res) => {
  try {
    const student = await Student.findById(req.student._id).select('-__v');
    if (!student) return sendNotFound(res, 'Student not found');

    const dashboardData = {
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        rollNumber: student.rollNumber,
        department: student.department,
        branch: student.branch,
        course: student.course,
        year: student.year,
        currentSemester: student.currentSemester,
        phone: student.phone
      },
      stats: {
        totalCourses: 0,
        completedAssignments: 0,
        pendingAssignments: 0,
        upcomingExams: 0
      },
      recentActivity: [
        {
          type: 'assignment',
          title: 'Math Assignment 1',
          date: new Date(),
          status: 'completed'
        }
      ]
    };

    sendSuccess(res, 200, 'Dashboard data retrieved successfully', dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    sendError(res, 500, 'Server error while fetching dashboard data');
  }
};

// Gate functions moved to dedicated gateController.js
// Use /api/gate/* endpoints for gate-related operations

module.exports = {
  getProfile,
  getDashboard
};
