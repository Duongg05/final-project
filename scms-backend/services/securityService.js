const SecurityLog = require('../models/SecurityLog');
const Alert = require('../models/Alert');
const User = require('../models/User');

class SecurityService {
  async logSecurityEvent({ userId = null, action, ip = 'Unknown', details = '', riskLevel = 'Low' }) {
    try {
      const log = new SecurityLog({
        userId,
        action,
        ip,
        details,
        riskLevel
      });
      await log.save();
      console.log(`[Security] ${action} - Risk: ${riskLevel} - ${details}`);
    } catch (err) {
      console.error('Failed to log security event:', err);
    }
  }

  async triggerAlert({ type, message, userId = null }) {
    try {
      const alert = new Alert({
        type,
        message,
        userId
      });
      await alert.save();
      console.error(`[ALERT] ${type}: ${message}`);
    } catch (err) {
      console.error('Failed to trigger alert:', err);
    }
  }

  // Insider Threat Checks
  async checkAbnormalTime(userId, ip, action) {
    const currentHour = new Date().getHours();
    // Assuming normal working hours are 8 AM to 6 PM
    if (currentHour < 8 || currentHour >= 18) {
      await this.logSecurityEvent({
        userId,
        action: 'ABNORMAL_CHECKIN',
        ip,
        details: `Action performed outside working hours: ${currentHour}:00`,
        riskLevel: 'Medium'
      });
      await this.triggerAlert({
        type: 'ABNORMAL_CHECKIN',
        message: `User performed action ${action} at abnormal time (${currentHour}:00)`,
        userId
      });
      return true;
    }
    return false;
  }
}

module.exports = new SecurityService();
