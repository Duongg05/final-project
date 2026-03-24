require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const sourceCodeRoutes = require('./routes/sourceCodeRoutes');
const documentRoutes = require('./routes/documentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const securityController = require('./controllers/securityController');
const dashboardController = require('./controllers/dashboardController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// DIAGNOSTIC ROUTES FIRST
console.log('--- Registering Top-Level Debug Routes ---');
app.get('/api/security/audit-logs', (req, res) => {
  console.log('CRITICAL DEBUG: Hit /api/security/audit-logs');
  return securityController.getAuditLogs(req, res);
});

app.get('/api/dashboard/stats', (req, res) => {
  console.log('CRITICAL DEBUG: Hit /api/dashboard/stats');
  return dashboardController.getStats(req, res);
});

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/scms')
  .then(async () => {
    console.log('MongoDB connected successfully');
    
    // Create default admin user
    const User = require('./models/User');
    const bcrypt = require('bcrypt');
    const adminEmail = 'admin@gmail.com';
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123456', salt);
      await User.create({
        username: 'admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'Admin'
      });
      console.log('Default admin account created: admin@gmail.com / 123456');
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/source-code', sourceCodeRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/attendance', attendanceRoutes);

// Serve Static Frontend (when built)
const buildPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(buildPath));

// Fallback for React Router
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`SCMS Server v2.2 - Running on port ${PORT}`);
});
