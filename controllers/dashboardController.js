const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const AuditLog = require('../models/AuditLog');
const Document = require('../models/Document');

exports.getStats = async (req, res) => {
  try {
    const [userCount, projectCount, taskCount, logCount, documentCount] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Task.countDocuments(),
      AuditLog.countDocuments(),
      Document.countDocuments()
    ]);

    // Get recent activity (last 5 logs)
    const recentActivity = await AuditLog.find()
      .populate('userId', 'username role')
      .sort({ timestamp: -1 })
      .limit(5);

    res.json({
      counts: {
        users: userCount,
        projects: projectCount,
        tasks: taskCount,
        logs: logCount,
        documents: documentCount
      },
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};
