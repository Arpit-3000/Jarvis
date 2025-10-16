const mongoose = require('mongoose');

const GateLogSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentSnapshot: {
    name: { type: String, required: true },
    rollNumber: { type: String, required: true },
    studentId: { type: String, required: true },
    phone: { type: String, required: true },
    department: { type: String, required: true },
    year: { type: String, required: true }
  },
  destination: { type: String, required: true },
  action: { type: String, enum: ['exit', 'enter'], required: true }, // exit = going out, enter = coming in
  status: { type: String, enum: ['pending', 'processed', 'expired'], default: 'pending' },
  qrToken: { type: String, required: true },
  issuedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'NonTeachingStaff' }, // guard
  scannedAt: { type: Date },
  remarks: { type: String, maxlength: 200 }, // Optional remarks from guard
  // Return tracking fields (for when student comes back IN)
  returnTime: { type: Date }, // When student returned
  returnScannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'NonTeachingStaff' }, // Guard who processed return
  returnRemarks: { type: String, maxlength: 200 } // Optional remarks for return
}, { timestamps: true });

// Index for faster queries
GateLogSchema.index({ studentId: 1 });
GateLogSchema.index({ qrToken: 1 });
GateLogSchema.index({ status: 1 });
GateLogSchema.index({ issuedAt: -1 });

module.exports = mongoose.model('GateLog', GateLogSchema);
