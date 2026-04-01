const SourceCode = require('../models/SourceCode');
const security = require('./securityController');

exports.createSourceCode = async (req, res) => {
  try {
    const sourceCodeData = req.body;
    if (req.file) {
      sourceCodeData.repoUrl = req.file.path.replace(/\\/g, '/');
      sourceCodeData.repoName = req.file.originalname;
    }

    const sourceCode = new SourceCode(sourceCodeData);
    const saved = await sourceCode.save();

    await security.createLog({
      userId: req.user?.id,
      action: 'CREATE_REPO',
      resource: 'SourceCode',
      details: `Added repository: ${saved.repoName}`,
      timestamp: new Date()
    });
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getSourceCodes = async (req, res) => {
  try {
    let query = {};
    if (req.query.projectId) query.projectId = req.query.projectId;
    const sourceCodes = await SourceCode.find(query).populate('projectId', 'name projectId');
    res.json(sourceCodes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSourceCode = async (req, res) => {
  try {
    const sourceCode = await SourceCode.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (sourceCode) {
      await security.createLog({
        userId: req.user?.id,
        action: 'UPDATE_REPO',
        resource: 'SourceCode',
        details: `Updated repository: ${sourceCode.repoName}`,
        timestamp: new Date()
      });
    }
    res.json(sourceCode);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteSourceCode = async (req, res) => {
  try {
    const repo = await SourceCode.findByIdAndDelete(req.params.id);
    if (repo) {
      await security.createLog({
        userId: req.user?.id,
        action: 'DELETE_REPO',
        resource: 'SourceCode',
        details: `Deleted repository: ${repo.repoName}`,
        timestamp: new Date()
      });
    }
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.downloadSourceCode = async (req, res) => {
  try {
    const repo = await SourceCode.findById(req.params.id);
    if (!repo) return res.status(404).json({ message: 'Repository not found' });
    res.json({ url: repo.repoUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
