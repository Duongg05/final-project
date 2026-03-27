require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

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
app.use(helmet({
  contentSecurityPolicy: false, // For serving local React app
  hsts: false, // Disable HSTS for localhost to prevent HTTPS redirects
  crossOriginResourcePolicy: false, // Allow serving static assets
  crossOriginOpenerPolicy: false
}));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Let's keep it generous for global, e.g., 1000 req / 15m
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

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
    
    // Seed Root Admin from environment variables
    const User = require('./models/User');
    const bcrypt = require('bcrypt');
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || '123456';
    
    const adminExists = await User.findOne({ role: 'Admin', email: adminEmail });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      await User.create({
        username: 'Admin Root',
        email: adminEmail,
        password: hashedPassword,
        role: 'Admin',
        status: 'Active'
      });
      console.log(`Root Admin account seeded: ${adminEmail}`);
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SCMS Server v2.2 - Running on port ${PORT}`);
});
