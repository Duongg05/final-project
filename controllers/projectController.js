const Project = require('../models/Project');
const security = require('./securityController');
const securityService = require('../services/securityService');

// Create new project
exports.createProject = async (req, res) => {
  try {
    const project = new Project(req.body);
    const savedProject = await project.save();

    await security.createLog({
      userId: req.user?.id,
      action: 'CREATE_PROJECT',
      resource: 'Project',
      details: `Created project: ${savedProject.name}`,
      timestamp: new Date()
    });
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all projects with search and filter
exports.getProjects = async (req, res) => {
  try {
    let query = {};
    
    // Status filter
    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }

    // Keyword search (ProjectID or Name)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { projectId: searchRegex },
        { description: searchRegex }
      ];
    }

    const projects = await Project.find(query).populate('team', 'username email role');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single project
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('team', 'username email role');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Privacy check: Non-Admin/PM must be part of team
    const isMember = project.team.some(member => member._id.toString() === req.user?.id);
    if (!['Admin', 'Project Manager'].includes(req.user?.role) && !isMember) {
       await securityService.logSecurityEvent({
         userId: req.user?.id,
         action: 'UNAUTHORIZED_ACCESS',
         ip: req.ip || req.connection.remoteAddress,
         details: `User attempted to view a project they are not a member of: ${project.name}`,
         riskLevel: 'High'
       });
       await securityService.triggerAlert({
         type: 'UNAUTHORIZED_ACCESS',
         message: `Insider threat: User attempting to view restricted project ${project.name}`,
         userId: req.user?.id
       });
       return res.status(403).json({ message: 'Access denied: You are not a member of this project' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    await security.createLog({
      userId: req.user?.id,
      action: 'UPDATE_PROJECT',
      resource: 'Project',
      details: `Updated project: ${project.name}`,
      timestamp: new Date()
    });
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Cascade delete related entities
    const Task = require('../models/Task');
    const Document = require('../models/Document');
    const SourceCode = require('../models/SourceCode');
    
    await Task.deleteMany({ projectId: project._id });
    await Document.deleteMany({ projectId: project._id });
    await SourceCode.deleteMany({ projectId: project._id });

    await security.createLog({
      userId: req.user?.id,
      action: 'DELETE_PROJECT',
      resource: 'Project',
      details: `Deleted project: ${project.name} along with its tasks, documents, and source codes`,
      timestamp: new Date()
    });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
