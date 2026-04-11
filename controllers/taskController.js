const Task = require('../models/Task');
const security = require('./securityController');
const securityService = require('../services/securityService');

// Create new task
exports.createTask = async (req, res) => {
  try {
    const task = new Task(req.body);
    const savedTask = await task.save();

    await security.createLog({
      userId: req.user?.id,
      action: 'CREATE_TASK',
      resource: 'Task',
      details: `Created task: ${savedTask.title}`,
      timestamp: new Date()
    });
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all tasks with filter
exports.getTasks = async (req, res) => {
  try {
    let query = {};
    if (req.query.projectId) query.projectId = req.query.projectId;
    if (req.query.status && req.query.status !== 'All') query.status = req.query.status;
    if (req.query.assigneeId) query.assigneeId = req.query.assigneeId;

    // Role-based visibility logic: 
    // If not Admin or PM, user can only see their assigned tasks
    if (req.user && !['Admin', 'Project Manager'].includes(req.user.role)) {
      query.assigneeId = req.user.id;
    }

    const tasks = await Task.find(query)
      .populate('projectId', 'name projectId')
      .populate('assigneeId', 'username email role');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    // Only Admin and Project Manager can assign/reassign tasks
    const authorizedToAssign = ['Admin', 'Project Manager'].includes(req.user?.role);
    if (!authorizedToAssign) {
      delete req.body.assigneeId;
    }

    const taskToUpdate = await Task.findById(req.params.id);
    if (!taskToUpdate) return res.status(404).json({ message: 'Task not found' });

    // Insider Threat: Check if Developer is trying to edit someone else's task
    if (req.user?.role === 'Developer' && taskToUpdate.assigneeId.toString() !== req.user?.id) {
      await securityService.logSecurityEvent({
        userId: req.user.id,
        action: 'UNAUTHORIZED_ACCESS',
        ip: req.ip || req.connection.remoteAddress,
        details: `Developer attempted to modify task assigned to another user. TaskID: ${req.params.id}`,
        riskLevel: 'High'
      });
      await securityService.triggerAlert({
        type: 'UNAUTHORIZED_ACCESS',
        message: `User ${req.user.id} tried to modify an unassigned task`,
        userId: req.user.id
      });
      return res.status(403).json({ message: 'Access denied: You can only edit your own tasks' });
    }

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    await security.createLog({
      userId: req.user?.id,
      action: 'UPDATE_TASK',
      resource: 'Task',
      details: `Updated task: ${task.title}`,
      timestamp: new Date()
    });
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await security.createLog({
      userId: req.user?.id,
      action: 'DELETE_TASK',
      resource: 'Task',
      details: `Deleted task: ${task.title}`,
      timestamp: new Date()
    });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
