const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  docId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  classification: { type: String, enum: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL'], default: 'INTERNAL' },
  type: { type: String }, // e.g., PDF, DOCX, URL
  fileUrl: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
