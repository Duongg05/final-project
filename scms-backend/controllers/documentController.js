const Document = require('../models/Document');
const security = require('./securityController');

exports.createDocument = async (req, res) => {
  try {
    const documentData = req.body;
    if (req.file) {
      documentData.fileUrl = req.file.path.replace(/\\/g, '/');
      documentData.name = req.file.originalname; // Default name to the original file name
    }
    
    // Explicitly set who uploaded this document
    documentData.uploadedBy = req.user?.id || documentData.uploadedBy;

    const doc = new Document(documentData);
    const saved = await doc.save();

    await security.createLog({
      userId: req.user?.id,
      action: 'UPLOAD_DOC',
      resource: 'Document',
      details: `Uploaded document: ${saved.name}`,
      timestamp: new Date()
    });
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    let query = {};
    if (req.query.projectId) query.projectId = req.query.projectId;
    
    // Enforce Document Permissions
    const userRole = req.user?.role;
    if (!['Admin', 'Project Manager', 'HR Manager'].includes(userRole)) {
      query.$or = [
        { classification: { $in: ['PUBLIC', 'INTERNAL'] } },
        { classification: 'CONFIDENTIAL', uploadedBy: req.user?.id }
      ];
    }

    const docs = await Document.find(query)
      .populate('projectId', 'name projectId')
      .populate('uploadedBy', 'username');
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id);
    if (doc) {
      await security.createLog({
        userId: req.user?.id,
        action: 'DELETE_DOC',
        resource: 'Document',
        details: `Deleted document: ${doc.name}`,
        timestamp: new Date()
      });
    }
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
