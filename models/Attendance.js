const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  checkIn: { type: Date },
  checkOut: { type: Date },
  status: { 
    type: String, 
    enum: ['Present', 'Absent', 'Late', 'Half Day'], 
    default: 'Present' 
  },
  note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
