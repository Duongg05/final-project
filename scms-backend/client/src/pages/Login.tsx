import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Lock, User, AlertCircle, Mail, KeyRound, ShieldAlert } from 'lucide-react';

const Login: React.FC = () => {
  const [loginMode, setLoginMode] = useState<'employee' | 'admin'>('employee');
  const [step, setStep] = useState<1 | 2>(1); // For employee OTP steps

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      login(response.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/request-otp', { email });
      setMessage(response.data.message || 'OTP sent successfully');
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      login(response.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
      if (err.response?.data?.message?.includes('Too many') || err.response?.data?.message?.includes('expired')) {
        setStep(1);
        setOtp('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="flex justify-center space-x-4 mb-6">
          <button 
            type="button"
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${loginMode === 'employee' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => { setLoginMode('employee'); setError(''); setMessage(''); }}
          >
            Employee Login
          </button>
          <button 
            type="button"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${loginMode === 'admin' ? 'bg-red-100 text-red-700' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => { setLoginMode('admin'); setError(''); setMessage(''); }}
          >
            <ShieldAlert className="w-4 h-4" /> Admin
          </button>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {loginMode === 'admin' ? 'Admin Portal' : 'SCMS Login'}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {loginMode === 'admin' ? 'Secure access for administrators' : 'Enter your credentials to access your account'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-lg flex items-center text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="bg-green-50 p-4 rounded-lg flex items-center text-green-700 text-sm">
            <span>{message}</span>
          </div>
        )}

        {loginMode === 'admin' ? (
          <form className="space-y-4" onSubmit={handleAdminSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Username or Email</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                  placeholder="Admin Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Authenticating...' : 'Secure Sign In'}
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={step === 1 ? handleRequestOtp : handleVerifyOtp}>
            {step === 1 ? (
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Email</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">6-Digit OTP Code</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border px-3 tracking-widest text-center text-lg font-mono font-bold"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Please wait...' : step === 1 ? 'Send OTP' : 'Verify & Sign In'}
            </button>

            {step === 2 && (
               <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(''); setMessage(''); setError(''); }}
                  className="w-full text-sm font-medium text-indigo-600 hover:text-indigo-500 text-center block"
               >
                 Change Email / Resend Code
               </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
