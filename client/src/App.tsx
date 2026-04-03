import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
// import Register from './pages/Register';

import Dashboard from './pages/Dashboard';
import HRManagement from './pages/HRManagement';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import SourceCode from './pages/SourceCode';
import Documents from './pages/Documents';
import Attendance from './pages/Attendance';
import Security from './pages/Security';
import Profile from './pages/Profile';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/login" element={<Login />} />
            {/* <Route path="/register" element={<Register />} /> */}

            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/hr" element={
              <ProtectedRoute allowedRoles={['Admin', 'HR Manager']}>
                <HRManagement />
              </ProtectedRoute>
            } />

            <Route path="/projects" element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            } />

            <Route path="/tasks" element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            } />

            <Route path="/source-code" element={
              <ProtectedRoute allowedRoles={['Admin', 'Project Manager', 'Developer']}>
                <SourceCode />
              </ProtectedRoute>
            } />

            <Route path="/documents" element={
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            } />

            <Route path="/attendance" element={
              <ProtectedRoute>
                <Attendance />
              </ProtectedRoute>
            } />

            <Route path="/security" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Security />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
