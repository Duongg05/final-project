const Task = require('../models/Task');
const security = require('./securityController');

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
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });

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
