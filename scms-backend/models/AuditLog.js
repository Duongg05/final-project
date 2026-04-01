const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., LOGIN, DOWNLOAD_FILE, DELETE_USER, ACCESS_DENIED
  resource: { type: String }, // e.g., source_code_v1.zip, employee_data
  ipAddress: { type: String },
  status: { type: String, enum: ['success', 'failed', 'blocked'], default: 'success' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
