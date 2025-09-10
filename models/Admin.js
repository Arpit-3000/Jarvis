const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\d+@iiitu\.ac\.in$/, 'Email must be in format: rollnumber@iiitu.ac.in']
  },
  adminId: {
    type: String,
    required: [true, 'Admin ID is required'],
    unique: true,
    trim: true
  },
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true
  },
  
  // Role and Permissions
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['Super Admin', 'Admin', 'Moderator', 'Staff']
  },
  permissions: {
    studentManagement: {
      type: Boolean,
      default: false
    },
    teacherManagement: {
      type: Boolean,
      default: false
    },
    adminManagement: {
      type: Boolean,
      default: false
    },
    accountManagement: {
      type: Boolean,
      default: false
    },
    systemSettings: {
      type: Boolean,
      default: false
    },
    reports: {
      type: Boolean,
      default: false
    }
  },
  
  // Department Information
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    trim: true
  },
  
  // Contact Information
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
    },
    country: {
      type: String,
      default: 'India',
      trim: true
    }
  },
  
  // Personal Information
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  
  // Employment Information
  joiningDate: {
    type: Date,
    required: [true, 'Joining date is required']
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: 0
  },
  workHours: {
    type: Number,
    default: 8,
    min: 1,
    max: 12
  },
  
  // Security Information
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  accountLocked: {
    type: Boolean,
    default: false
  },
  accountLockedUntil: {
    type: Date
  },
  
  // System Fields
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster searches
adminSchema.index({ email: 1 });
adminSchema.index({ adminId: 1 });
adminSchema.index({ employeeId: 1 });
adminSchema.index({ role: 1 });

module.exports = mongoose.model('Admin', adminSchema);
