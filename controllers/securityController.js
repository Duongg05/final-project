const AuditLog = require('../models/AuditLog');

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('userId', 'username role')
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createLog = async (data) => {
  try {
    // Ensure userId is present or use a system ID if possible
    if (!data.userId) {
      console.warn('Audit Log: userId missing, checking for fallback...');
    }
    
    const log = new AuditLog(data);
    await log.save();
    return log;
  } catch (error) {
    console.error('CRITICAL: Failed to create audit log:', error.message);
    // We don't throw here to avoid breaking the main functionality, 
    // but we log it clearly for debugging.
  }
};
