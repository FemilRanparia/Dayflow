const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  leaveType: { type: String, enum: ['paid', 'sick', 'unpaid'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminComment: String,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);