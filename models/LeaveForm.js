const mongoose = require('mongoose');

const leaveFormSchema = new mongoose.Schema({
  // Student Information (fetched from Student collection)
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required'],
    trim: true
  },
  studentPhone: {
    type: String,
    required: [true, 'Student phone is required'],
    trim: true
  },
  
  // Leave Details
  hostelName: {
    type: String,
    required: [true, 'Hostel name is required'],
    trim: true
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  exitDate: {
    type: Date,
    required: [true, 'Exit date is required']
  },
  entryDate: {
    type: Date,
    required: [true, 'Entry date is required']
  },
  exitTime: {
    type: String,
    required: [true, 'Exit time is required'],
    trim: true
  },
  entryTime: {
    type: String,
    required: [true, 'Entry time is required'],
    trim: true
  },
  reason: {
    type: String,
    required: [true, 'Reason for leave is required'],
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  
  // Status and Approval
  status: {
    type: String,
    enum: ['pending', 'verified_by_attendant', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  
  // Attendant Verification
  verifiedByAttendant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NonTeachingStaff',
    default: null
  },
  verifiedAtAttendant: {
    type: Date,
    default: null
  },
  attendantRemarks: {
    type: String,
    trim: true,
    maxlength: [200, 'Attendant remarks cannot exceed 200 characters']
  },
  
  // Final Approval (by Hostel Warden)
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NonTeachingStaff',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Rejection reason cannot exceed 200 characters']
  },
  
  // Additional Information
  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number']
    },
    relation: {
      type: String,
      trim: true
    }
  },
  
  // System Fields
  isActive: {
    type: Boolean,
    default: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
leaveFormSchema.index({ studentId: 1 });
leaveFormSchema.index({ status: 1 });
leaveFormSchema.index({ submittedAt: -1 });
leaveFormSchema.index({ rollNumber: 1 });

// Virtual for leave duration in days
leaveFormSchema.virtual('leaveDuration').get(function() {
  if (this.exitDate && this.entryDate) {
    const diffTime = Math.abs(this.entryDate - this.exitDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Ensure virtual fields are serialized
leaveFormSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('LeaveForm', leaveFormSchema);
