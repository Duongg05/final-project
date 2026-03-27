const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const AuditLog = require('../models/AuditLog');
const Document = require('../models/Document');
const SecurityLog = require('../models/SecurityLog');
const Alert = require('../models/Alert');

exports.getStats = async (req, res) => {
  try {
    const [userCount, projectCount, taskCount, documentCount, securityAlerts] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Task.countDocuments(),
      Document.countDocuments(),
      Alert.countDocuments({ status: 'Unresolved' })
    ]);

    // Get recent security activity
    const recentActivity = await SecurityLog.find()
      .populate('userId', 'username role')
      .sort({ time: -1 })
      .limit(5);

    res.json({
      counts: {
        users: userCount,
        projects: projectCount,
        tasks: taskCount,
        documents: documentCount,
        securityAlerts
      },
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};
