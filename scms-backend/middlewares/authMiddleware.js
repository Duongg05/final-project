const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Check session validity
    const user = await User.findById(decoded.user.id);
    if (!user || (decoded.jti && !user.sessionTokens.includes(decoded.jti))) {
      return res.status(401).json({ message: 'Session expired or revoked' });
    }

    req.user = decoded.user;
    req.user.jti = decoded.jti; // needed for single logout
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const roleMiddleware = (roles) => {
  return async (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const securityService = require('../services/securityService');
      const userId = req.user ? req.user.id : null;
      
      await securityService.logSecurityEvent({
        userId,
        action: 'UNAUTHORIZED_ACCESS',
        ip: req.ip || req.connection.remoteAddress,
        details: `Role ${req.user ? req.user.role : 'None'} attempted to access ${req.originalUrl}`,
        riskLevel: 'High'
      });
      
      await securityService.triggerAlert({
        type: 'UNAUTHORIZED_ACCESS',
        message: `Unauthorized access attempt mapped to ${req.originalUrl} by Role: ${req.user ? req.user.role : 'Unknown'}`,
        userId
      });

      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

module.exports = { authMiddleware, roleMiddleware };
