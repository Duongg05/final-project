const AuditLog = require('../models/AuditLog');
const SecurityLog = require('../models/SecurityLog');
const Alert = require('../models/Alert');

exports.getAuditLogs = async (req, res) => {
  try {
    const [auditLogs, securityLogs, alerts] = await Promise.all([
      AuditLog.find().populate('userId', 'username role').sort({ timestamp: -1 }).limit(100).lean(),
      SecurityLog.find().populate('userId', 'username role').sort({ time: -1 }).limit(100).lean(),
      Alert.find().populate('userId', 'username role').sort({ timestamp: -1 }).limit(100).lean()
    ]);

    const unifiedLogs = [
      ...auditLogs.map(log => ({
        _id: log._id,
        userId: log.userId,
        action: log.action,
        resource: log.resource,
        details: log.details,
        timestamp: log.timestamp
      })),
      ...securityLogs.map(log => ({
        _id: log._id,
        userId: log.userId,
        action: log.action,
        resource: 'Security Core',
        details: log.details,
        timestamp: log.time
      })),
      ...alerts.map(log => ({
        _id: log._id,
        userId: log.userId,
        action: `ALERT: ${log.type}`,
        resource: 'Threat Detection',
        details: log.message,
        timestamp: log.timestamp
      }))
    ];

    unifiedLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json(unifiedLogs.slice(0, 100));
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
