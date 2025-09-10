const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  // Account Identification
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    unique: true,
    trim: true
  },
  accountHolderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Account holder ID is required'],
    refPath: 'accountHolderType'
  },
  accountHolderType: {
    type: String,
    required: [true, 'Account holder type is required'],
    enum: ['Student', 'Teacher', 'Admin']
  },
  
  // Account Information
  accountType: {
    type: String,
    required: [true, 'Account type is required'],
    enum: ['Savings', 'Current', 'Fixed Deposit', 'Recurring Deposit']
  },
  bankName: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true
  },
  branchName: {
    type: String,
    required: [true, 'Branch name is required'],
    trim: true
  },
  ifscCode: {
    type: String,
    required: [true, 'IFSC code is required'],
    trim: true,
    match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code']
  },
  
  // Financial Information
  currentBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  minimumBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  interestRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Account Status
  accountStatus: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended', 'Closed'],
    default: 'Active'
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  
  // Transaction Limits
  dailyTransactionLimit: {
    type: Number,
    default: 100000,
    min: 0
  },
  monthlyTransactionLimit: {
    type: Number,
    default: 1000000,
    min: 0
  },
  
  // Account Opening Information
  openingDate: {
    type: Date,
    required: [true, 'Opening date is required']
  },
  closingDate: {
    type: Date
  },
  maturityDate: {
    type: Date
  },
  
  // KYC Information
  kycStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  },
  kycDocuments: [{
    documentType: {
      type: String,
      enum: ['PAN', 'Aadhaar', 'Passport', 'Driving License', 'Voter ID']
    },
    documentNumber: String,
    documentPath: String,
    uploadedDate: Date,
    verifiedDate: Date
  }],
  
  // Contact Information
  contactInfo: {
    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: {
        type: String,
        default: 'India'
      }
    }
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
accountSchema.index({ accountNumber: 1 });
accountSchema.index({ accountHolderId: 1, accountHolderType: 1 });
accountSchema.index({ accountStatus: 1 });
accountSchema.index({ bankName: 1 });

module.exports = mongoose.model('Account', accountSchema);
