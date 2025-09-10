const Teacher = require('../models/Teacher');
const { sendSuccess, sendError, sendNotFound } = require('../utils/response');

/**
 * Get teacher profile controller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.teacher._id).select('-__v');
    
    if (!teacher) {
      return sendNotFound(res, 'Teacher not found');
    }

    sendSuccess(res, 200, 'Profile retrieved successfully', {
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        teacherId: teacher.teacherId,
        employeeId: teacher.employeeId,
        department: teacher.department,
        designation: teacher.designation,
        qualification: teacher.qualification,
        specialization: teacher.specialization,
        experience: teacher.experience,
        phone: teacher.phone,
        address: teacher.address,
        dateOfBirth: teacher.dateOfBirth,
        gender: teacher.gender,
        bloodGroup: teacher.bloodGroup,
        joiningDate: teacher.joiningDate,
        salary: teacher.salary,
        workHours: teacher.workHours,
        isActive: teacher.isActive,
        createdAt: teacher.createdAt,
        updatedAt: teacher.updatedAt
      }
    });

  } catch (error) {
    console.error('Get teacher profile error:', error);
    sendError(res, 500, 'Server error while fetching profile');
  }
};

/**
 * Get teacher dashboard controller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDashboard = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.teacher._id).select('-__v');
    
    if (!teacher) {
      return sendNotFound(res, 'Teacher not found');
    }

    // Dashboard data structure
    const dashboardData = {
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        teacherId: teacher.teacherId,
        department: teacher.department,
        designation: teacher.designation,
        specialization: teacher.specialization,
        experience: teacher.experience
      },
      stats: {
        // Example stats - customize based on your needs
        totalStudents: 0,
        totalCourses: 0,
        completedClasses: 0,
        pendingClasses: 0
      },
      recentActivity: [
        // Example recent activity - customize based on your needs
        {
          type: 'class',
          title: 'Data Structures Lecture',
          date: new Date(),
          status: 'completed'
        }
      ]
    };

    sendSuccess(res, 200, 'Dashboard data retrieved successfully', dashboardData);

  } catch (error) {
    console.error('Teacher dashboard error:', error);
    sendError(res, 500, 'Server error while fetching dashboard data');
  }
};

/**
 * Get all teachers (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllTeachers = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, designation } = req.query;
    
    // Build filter
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

module.exports = {
  getProfile,
  getDashboard,
  getAllTeachers
};
