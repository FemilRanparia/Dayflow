const mongoose = require('mongoose');

const employeeProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fullName: { type: String, required: true },
  phone: String,
  address: String,
  profilePicture: String,
  department: String,
  designation: String,
  employmentType: { type: String, enum: ['full-time', 'part-time', 'intern'], default: 'full-time' },
  joiningDate: Date,
  dateOfBirth: String,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  salary: { type: Number, default: 0 },
  bankAccountNumber: String,
  bankIFSC: String,
  panNumber: String,
  aadhaarNumber: String,
  emergencyContact: String,
  emergencyContactNumber: String,
}, { timestamps: true });

module.exports = mongoose.model('EmployeeProfile', employeeProfileSchema);