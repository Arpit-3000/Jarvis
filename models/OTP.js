const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\d+@iiitu\.ac\.in$/, 'Email must be in format: rollnumber@iiitu.ac.in']
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    trim: true
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration time is required'],
    default: Date.now,
    expires: 600 // 10 minutes in seconds
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3 // Maximum 3 attempts
  }
}, {
  timestamps: true
});

// Index for faster email searches
otpSchema.index({ email: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);
