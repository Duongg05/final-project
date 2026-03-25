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

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

const { authMiddleware, roleMiddleware } = require('./middlewares/authMiddleware');

// DIAGNOSTIC ROUTES FIRST
console.log('--- Registering Top-Level Debug Routes ---');
app.get('/api/security/audit-logs', authMiddleware, roleMiddleware(['Admin']), (req, res) => {
  console.log('CRITICAL DEBUG: Hit /api/security/audit-logs');
  return securityController.getAuditLogs(req, res);
});

app.get('/api/dashboard/stats', authMiddleware, (req, res) => {
  console.log('CRITICAL DEBUG: Hit /api/dashboard/stats');
  return dashboardController.getStats(req, res);
});

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/scms')
  .then(async () => {
    console.log('MongoDB connected successfully');
    
    // Seed 5 standard test accounts
    const User = require('./models/User');
    const bcrypt = require('bcrypt');
    
    const standardUsers = [
      { username: 'admin', email: 'admin@gmail.com', role: 'Admin' },
      { username: 'hr', email: 'hr@gmail.com', role: 'HR Manager' },
      { username: 'pm', email: 'pm@gmail.com', role: 'Project Manager' },
      { username: 'dev', email: 'dev@gmail.com', role: 'Developer' },
      { username: 'tester', email: 'tester@gmail.com', role: 'Tester' }
    ];

    for (const u of standardUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);
        await User.create({
          username: u.username,
          email: u.email,
          password: hashedPassword,
          role: u.role
        });
        console.log(`Default ${u.role} account created: ${u.email} / 123456`);
      }
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
  const fs = require('fs');
  const indexFile = path.join(buildPath, 'index.html');
  
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.status(404).json({ 
      message: 'Frontend build not found. Please run "npm run build" in the client directory.',
      backendStatus: 'Running'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`SCMS Server v2.2 - Running on port ${PORT}`);
});
