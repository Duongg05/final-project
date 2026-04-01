const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: false, // OTP users won't have a password
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ['Admin', 'HR Manager', 'Project Manager', 'Developer', 'Tester', 'Viewer', 'Employee'], // Also added Employee just in case
    default: 'Developer',
  },
  department: {
    type: String,
    enum: ['HR', 'DEV', 'SALES', 'NONE'],
    default: 'NONE'
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Locked'],
    default: 'Active',
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lockoutUntil: {
    type: Date,
    default: null,
  },
  sessionTokens: [{
    type: String,
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
