const AuditLog = require('../models/AuditLog');

const auditMiddleware = (actionName) => {
  return async (req, res, next) => {
    // Intercept response finish to ensure we log successful/failed requests correctly
    res.on('finish', async () => {
      try {
        if (!req.user || !req.user.id) return; // Only log authenticated user actions

        // Determine status based on HTTP status code
        let status = 'success';
        if (res.statusCode >= 400 && res.statusCode < 500) {
          status = res.statusCode === 403 || res.statusCode === 401 ? 'blocked' : 'failed';
        } else if (res.statusCode >= 500) {
          status = 'failed';
        }

        // Extract resource identifier from params if exists (e.g. download file ID)
        let resource = req.originalUrl;
        if (req.params && req.params.id) {
          resource = `${req.baseUrl}/${req.params.id}`;
        }

        await AuditLog.create({
          userId: req.user.id,
          action: actionName || req.method + '_API',
          resource: resource,
          ipAddress: req.ip || req.connection.remoteAddress,
          status: status,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('AuditLog Middleware Error:', error.message);
      }
    });

    next();
  };
};

module.exports = { auditMiddleware };
