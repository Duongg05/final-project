const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false
  },
  type: {
    type: String,
    required: true,
    enum: ['MULTIPLE_FAILED_LOGIN', 'UNAUTHORIZED_ACCESS', 'EXCESSIVE_DOWNLOADS', 'ABNORMAL_CHECKIN', 'DATA_ACCESS_SPIKE']
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Unresolved', 'Resolved', 'Dismissed'],
    default: 'Unresolved'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Alert', alertSchema);
