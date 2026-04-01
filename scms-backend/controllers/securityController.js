const AuditLog = require('../models/AuditLog');
const SecurityLog = require('../models/SecurityLog');
const Alert = require('../models/Alert');

exports.getAuditLogs = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const startOfDay = new Date(todayStr);

    const [auditLogs, securityLogs, alerts] = await Promise.all([
      AuditLog.find().populate('userId', 'username').sort({ timestamp: -1 }).limit(100).lean(),
      SecurityLog.find().populate('userId', 'username').sort({ time: -1 }).limit(10).lean(),
      Alert.find().populate('userId', 'username').sort({ timestamp: -1 }).limit(10).lean()
    ]);

    // Calculate Active Threats & Security Posture (Today only)
    let activeThreats = 0;
    let securityPosture = 100;

    auditLogs.forEach(log => {
      if (new Date(log.timestamp) >= startOfDay) {
        if (log.status === 'blocked' || log.status === 'failed') {
          activeThreats++;
        }
        if (log.action === 'ANOMALY_DETECTED') {
          securityPosture -= 10;
        } else if (log.action === 'ACCESS_DENIED_ATTEMPT') {
          securityPosture -= 5;
        }
      }
    });

    if (securityPosture < 0) securityPosture = 0; // Cap at 0

    const unifiedLogs = [
      ...auditLogs.map(log => {
        let text = `${log.action} on ${log.resource}`;
        if (log.action === 'DOWNLOAD_SUCCESS') text = `downloaded ${log.resource}`;
        return {
          _id: log._id,
          userId: log.userId,
          action: log.action,
          status: log.status,
          message: text,
          timestamp: log.timestamp
        };
      })
    ];

    res.json({
      metrics: {
        activeThreats,
        securityPosture
      },
      logs: unifiedLogs
    });
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
