const mongoose = require('mongoose');

const sourceCodeSchema = new mongoose.Schema({
  repoName: { type: String, required: true },
  repoUrl: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  description: { type: String },
  branch: { type: String, default: 'main' },
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('SourceCode', sourceCodeSchema);
