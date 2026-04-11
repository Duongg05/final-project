import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Lock, User, Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

type AuthMode = 'password' | 'otp';
type OtpStep = 1 | 2;

const Login: React.FC = () => {
  // --- Password login state ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // --- OTP login state ---
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState<OtpStep>(1);
  const [successMsg, setSuccessMsg] = useState('');

  // --- Shared state ---
  const [mode, setMode] = useState<AuthMode>('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const clearAll = () => {
    setError('');
    setSuccessMsg('');
  };

  // ── Password Login Flow ─────────────────────────────────────
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAll();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      
      if (response.data.requiresOtp) {
        setSuccessMsg(response.data.message);
        setEmail(response.data.user.email);
        setMode('otp');
        setOtpStep(2);
      } else {
        login(response.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Step 1: Request Security Code ───────────────────────
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAll();
    setLoading(true);
    try {
      const response = await api.post('/auth/request-otp', { email });
      setSuccessMsg(response.data.message || 'Security code has been dispatched.');
      setOtpStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to dispatch code. Please verify your email.');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Step 2: Verify Security Code ────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAll();
    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      login(response.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired security code.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: AuthMode) => {
    setMode(m);
    clearAll();
    setOtpStep(1);
    setOtp('');
    setEmail('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-brand-cream">
      {/* Warm Earthy Background Effects */}
      <div className="absolute top-0 -left-20 w-[40rem] h-[40rem] bg-brand-brown/5 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-[40rem] h-[40rem] bg-brand-accent/5 rounded-full blur-[120px] animate-pulse delay-700"></div>
      
      {/* Decorative Brand Circles */}
      <div className="absolute top-10 left-10 w-2 h-2 rounded-full bg-brand-brown/20"></div>
      <div className="absolute bottom-10 right-10 w-3 h-3 rounded-full bg-brand-brown/10"></div>

      <div className="max-w-md w-full relative z-10 px-6">
        {/* Branding SCMS Style */}
        <div className="text-center mb-10 flex flex-col items-center">
            <div className="w-[5.5rem] h-[5.5rem] bg-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-[0_12px_48px_rgba(79,70,229,0.25)] mb-8 transform group hover:scale-110 transition-all duration-700">
                <span className="text-[3rem] font-[900] text-white transform -rotate-6">s</span>
            </div>
            <h1 className="text-[3.5rem] font-[950] text-[#1e1b4b] tracking-[-0.05em] leading-none mb-4">SCMS</h1>
            <div className="text-slate-400 text-[0.85rem] font-extrabold tracking-[0.25em] uppercase leading-tight">
                <p>Systems</p>
                <p>Management</p>
            </div>
        </div>

        {/* Minimalist White Card */}
        <div className="bg-white rounded-[2.5rem] border border-brand-brown/5 shadow-[0_32px_64px_-12px_rgba(61,43,31,0.12)] p-10 transition-all duration-500">
          
          {/* Professional Tab Switcher */}
          <div className="flex bg-brand-cream p-1.5 rounded-2xl border border-brand-brown/5 mb-10">
            <button
              type="button"
              onClick={() => switchMode('password')}
              className={`flex-1 py-3 text-[0.7rem] font-[900] uppercase tracking-widest transition-all rounded-xl ${
                mode === 'password'
                  ? 'bg-brand-brown text-white shadow-xl shadow-brand-brown/20'
                  : 'text-brand-brown/40 hover:text-brand-brown'
              }`}
            >
              Access Key
            </button>
            <button
              type="button"
              onClick={() => switchMode('otp')}
              className={`flex-1 py-3 text-[0.7rem] font-[900] uppercase tracking-widest transition-all rounded-xl ${
                mode === 'otp'
                  ? 'bg-brand-brown text-white shadow-xl shadow-brand-brown/20'
                  : 'text-brand-brown/40 hover:text-brand-brown'
              }`}
            >
              One-Time Auth
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl flex items-center text-rose-500 text-[0.8rem] font-[700] mb-8 animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              {error}
            </div>
          )}
          {successMsg && (
            <div className="bg-brand-accent/5 border border-brand-accent/10 p-4 rounded-2xl flex items-center text-brand-accent text-[0.8rem] font-[700] mb-8 animate-in slide-in-from-top-2 duration-300">
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              {successMsg}
            </div>
          )}

          {/* ── Credential Authentication Flow ── */}
          {mode === 'password' && (
            <form className="space-y-8" onSubmit={handlePasswordLogin}>
              <div className="space-y-3">
                <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Identity Node</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-brown/20 group-focus-within:text-brand-brown transition-colors" />
                  <input
                    type="text"
                    required
                    className="w-full bg-brand-cream/50 border border-brand-brown/10 rounded-2xl pl-12 pr-4 py-[1.1rem] text-brand-brown text-[0.9rem] font-bold focus:outline-none focus:ring-4 focus:ring-brand-brown/5 focus:border-brand-brown/50 transition-all placeholder:text-brand-brown/20"
                    placeholder="Enter corporate ID..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Pass-Pattern Container</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-brown/20 group-focus-within:text-brand-brown transition-colors" />
                  <input
                    type="password"
                    required
                    className="w-full bg-brand-cream/50 border border-brand-brown/10 rounded-2xl pl-12 pr-4 py-[1.1rem] text-brand-brown text-[0.9rem] font-bold focus:outline-none focus:ring-4 focus:ring-brand-brown/5 focus:border-brand-brown/50 transition-all placeholder:text-brand-brown/20"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full py-[1.1rem] bg-brand-brown hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[0.8rem] font-black uppercase tracking-widest rounded-2xl transition-all shadow-2xl shadow-brand-brown/30 active:scale-[0.98]"
              >
                {loading ? 'Initializing Interface...' : 'Authorize Access'}
              </button>
            </form>
          )}

          {/* ── Verified Security Code Flow ── */}
          {mode === 'otp' && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              {/* Progress Tracker */}
              <div className="flex items-center justify-center gap-6 mb-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[0.7rem] font-black border-2 transition-all ${otpStep === 1 ? 'border-brand-brown bg-brand-brown text-white shadow-lg shadow-brand-brown/20' : 'border-brand-brown text-brand-brown'}`}>1</div>
                <div className={`h-1 w-10 rounded-full transition-all ${otpStep === 2 ? 'bg-brand-brown' : 'bg-brand-cream'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[0.7rem] font-black border-2 transition-all ${otpStep === 2 ? 'border-brand-brown bg-brand-brown text-white shadow-lg shadow-brand-brown/20' : 'border-brand-cream text-brand-brown/20'}`}>2</div>
              </div>

              {otpStep === 1 ? (
                <form className="space-y-8" onSubmit={handleRequestOtp}>
                  <div className="space-y-3">
                    <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Communications Port</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-brown/20 group-focus-within:text-brand-brown transition-colors" />
                      <input
                        type="email"
                        required
                        className="w-full bg-brand-cream/50 border border-brand-brown/10 rounded-2xl pl-12 pr-4 py-[1.1rem] text-brand-brown text-[0.9rem] font-bold focus:outline-none focus:ring-4 focus:ring-brand-brown/5 focus:border-brand-brown/50 transition-all placeholder:text-brand-brown/20"
                        placeholder="identity@iheal.corp"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-[1.1rem] bg-brand-brown text-white text-[0.8rem] font-black uppercase tracking-widest rounded-2xl transition-all shadow-2xl shadow-brand-brown/30 active:scale-[0.98]"
                  >
                    {loading ? 'Packet Transmitting...' : 'Dispatch Token'}
                  </button>
                </form>
              ) : (
                <form className="space-y-8" onSubmit={handleVerifyOtp}>
                  <div className="p-5 bg-brand-cream rounded-2xl text-center mb-8 border border-brand-brown/5">
                    <p className="text-[0.65rem] font-black text-brand-brown/30 mb-1 uppercase tracking-widest">Protocol Address</p>
                    <p className="text-[0.8rem] font-[800] text-brand-brown/60 tracking-tight">{email}</p>
                  </div>
                  
                  <div className="space-y-4 text-center">
                    <label className="text-[0.65rem] font-black uppercase tracking-[1em] text-brand-brown/20 ml-2">Verification</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      inputMode="numeric"
                      pattern="\d{6}"
                      className="w-full bg-brand-cream border-2 border-brand-brown/5 rounded-[1.5rem] py-5 text-center tracking-[0.8em] font-[900] text-[2rem] text-brand-brown focus:outline-none focus:border-brand-brown transition-all shadow-inner"
                      placeholder="••••••"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    />
                  </div>

                  <div className="space-y-3 pt-6">
                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="w-full py-[1.1rem] bg-brand-brown text-white text-[0.8rem] font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-brand-brown/30 active:scale-[0.98]"
                    >
                      {loading ? 'Verifying Node Link...' : 'Execute Verification'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setOtpStep(1); setOtp(''); clearAll(); }}
                      className="w-full py-2 text-[0.6rem] font-black uppercase tracking-widest text-brand-brown/30 hover:text-brand-brown transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-3 h-3" /> Re-specify Port Address
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer Technical Metadata */}
        <div className="mt-12 text-center text-[0.6rem] font-[800] text-brand-brown/20 uppercase tracking-[0.3em] space-y-2">
            <p>© 2026 iHeal Unified Infrastructure • Earth-Node Platform</p>
            <p>Access Level:: Authenticated Systems Personnel</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
