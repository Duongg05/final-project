const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['Planning', 'In Progress', 'Completed', 'On Hold'], 
    default: 'Planning' 
  },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  dueDate: { type: Date },
  priority: { 
    type: String, 
    enum: ['Critical', 'High', 'Medium', 'Low'], 
    default: 'Medium' 
  },
  team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
