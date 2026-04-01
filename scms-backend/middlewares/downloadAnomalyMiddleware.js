const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

const downloadAnomalyMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) return next();

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const downloadCount = await AuditLog.countDocuments({
      userId: req.user.id,
      action: 'DOWNLOAD_SUCCESS',
      timestamp: { $gte: fiveMinutesAgo }
    });

    if (downloadCount >= 5) {
      // Lock the account
      await User.findByIdAndUpdate(req.user.id, { status: 'Locked' });
      
      // Log the anomaly
      await AuditLog.create({
        userId: req.user.id,
        action: 'ANOMALY_DETECTED',
        resource: req.originalUrl,
        ipAddress: req.ip || req.connection.remoteAddress,
        status: 'blocked',
        timestamp: new Date()
      });

      return res.status(403).json({ 
        message: 'Security Alert: Your account has been locked due to excessive download attempts.' 
      });
    }

    // Bind a hook to log DOWNLOAD_SUCCESS after successful response
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        await AuditLog.create({
          userId: req.user.id,
          action: 'DOWNLOAD_SUCCESS',
          resource: req.originalUrl,
          ipAddress: req.ip || req.connection.remoteAddress,
          status: 'success',
          timestamp: new Date()
        });
      }
    });

    next();
  } catch (error) {
    console.error('Download Anomaly Logic Error:', error);
    next(error);
  }
};

module.exports = { downloadAnomalyMiddleware };
