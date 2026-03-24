const mongoose = require('mongoose');
const AuditLog = require('./models/AuditLog');
const Project = require('./models/Project');

async function checkDb() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/scms');
    const projects = await Project.find();
    console.log('PROJECTS:', projects.length);
    projects.forEach(p => console.log(`- ${p.name} (${p._id})`));

    const logs = await AuditLog.find().populate('userId', 'username');
    console.log('AUDIT_LOGS:', logs.length);
    logs.forEach(l => console.log(`- ${l.action} on ${l.resource} by ${l.userId?.username || 'Unknown'}`));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDb();
