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

    // --- AFTER-HOURS ACCESS DETECTION ---
    // Skip for Admin/HR Manager and skip auth routes (login/logout) to avoid log spam
    const isPrivilegedRole = ['Admin', 'HR Manager'].includes(decoded.user.role);
    const isAuthRoute = req.originalUrl.includes('/api/auth/');
    
    if (!isPrivilegedRole && !isAuthRoute) {
      try {
        const Attendance = require('../models/Attendance');
        const securityService = require('../services/securityService');
        
        // Use local Vietnam timezone (UTC+7) for date
        const nowVN = new Date(Date.now() + 7 * 60 * 60 * 1000);
        const today = nowVN.toISOString().split('T')[0]; // YYYY-MM-DD in UTC+7
        
        const todayRecord = await Attendance.findOne({
          userId: decoded.user.id,
          date: today,
          checkOut: { $ne: null }
        });

        console.log(`[AfterHours Check] User: ${decoded.user.username}, Date: ${today}, HasRecord: ${!!todayRecord}, CheckOut: ${todayRecord?.checkOut}`);

        if (todayRecord) {
          const checkOutTime = new Date(todayRecord.checkOut).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
          await securityService.logSecurityEvent({
            userId: decoded.user.id,
            action: 'AFTER_HOURS_ACCESS',
            ip: req.ip || req.connection?.remoteAddress || 'Unknown',
            details: `${decoded.user.username} (${decoded.user.role}) truy cập hệ thống sau khi đã checkout lúc ${checkOutTime}. Trang: ${req.originalUrl}`,
            riskLevel: 'Medium'
          });
          await securityService.triggerAlert({
            type: 'AFTER_HOURS_ACCESS',
            message: `${decoded.user.username} đã checkout lúc ${checkOutTime} nhưng vẫn đang truy cập hệ thống`,
            userId: decoded.user.id
          });
        }
      } catch (attendanceErr) {
        console.error('After-hours check error:', attendanceErr.message);
      }
    }
    // --- END AFTER-HOURS DETECTION ---

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
