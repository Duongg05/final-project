const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false // May be null if unknown/anonymous
  },
  action: { 
    type: String, 
    required: true,
    enum: ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'UNAUTHORIZED_ACCESS', 'CHECKIN', 'CHECKOUT', 'ABNORMAL_CHECKIN', 'DOUBLE_CHECKIN', 'DATA_ACCESS_SPIKE', 'AFTER_HOURS_ACCESS', 'ERROR']
  },
  ip: { 
    type: String 
  },
  details: {
    type: String
  },
  riskLevel: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Low'
  },
  time: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('SecurityLog', securityLogSchema);
