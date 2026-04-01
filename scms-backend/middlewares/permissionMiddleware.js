const AuditLog = require('../models/AuditLog');

const checkPermission = (allowedDepartments) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.user.role === 'Admin') {
      return next(); // Admins bypass department checks
    }

    if (!allowedDepartments.includes(req.user.department)) {
      // Log anomaly
      await AuditLog.create({
        userId: req.user.id,
        action: 'ACCESS_DENIED_ATTEMPT',
        resource: req.originalUrl,
        ipAddress: req.ip || req.connection.remoteAddress,
        status: 'blocked',
        timestamp: new Date()
      });

      return res.status(403).json({ message: 'Access denied: Your department does not have permission' });
    }

    next();
  };
};

module.exports = { checkPermission };
