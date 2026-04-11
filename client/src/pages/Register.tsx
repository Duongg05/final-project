import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Lock, User, Mail, AlertCircle, Briefcase, ArrowRight } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Developer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please verify node parameters.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-brand-cream py-12 px-6">
      {/* Warm Earthy Background Effects */}
      <div className="absolute top-0 -left-20 w-[40rem] h-[40rem] bg-brand-brown/5 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-[40rem] h-[40rem] bg-brand-accent/5 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="max-w-lg w-full relative z-10">
        {/* Branding */}
        <div className="text-center mb-10 flex flex-col items-center">
            <div className="w-[4.5rem] h-[4.5rem] bg-[#3D2B1F] rounded-full flex items-center justify-center shadow-xl mb-6">
              <svg viewBox="0 0 24 24" className="w-[2.2rem] h-[2.2rem] text-white fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3L14 10L21 12L14 14L12 21L10 14L3 12L10 10L12 3Z" fill="white" />
                <path d="M18 4V8M16 6H20" stroke="white" strokeWidth="2.5" />
                <circle cx="10" cy="18" r="1.5" fill="white" stroke="none" />
              </svg>
            </div>
            <h1 className="text-[2.8rem] font-[900] text-[#3D2B1F] tracking-[-0.05em] leading-none mb-2">iHeal</h1>
            <p className="text-[#3D2B1F]/30 text-[0.7rem] font-[800] uppercase tracking-[0.2em]">Secured Infrastructure Node</p>
        </div>

        <div className="bg-white rounded-[3rem] border border-brand-brown/5 shadow-2xl p-12">
          {error && (
            <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl flex items-center text-rose-600 text-[0.8rem] font-bold mb-8">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Designation</label>
                    <div className="relative group">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-brown/10 group-focus-within:text-brand-brown transition-colors" />
                        <input
                            type="text"
                            name="username"
                            required
                            className="w-full bg-brand-cream/30 border border-brand-brown/10 rounded-2xl pl-12 pr-4 py-4 text-brand-brown text-[0.9rem] font-bold focus:outline-none focus:ring-4 focus:ring-brand-brown/5 transition-all"
                            placeholder="johndoe"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Vector Address</label>
                    <div className="relative group">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-brown/10 group-focus-within:text-brand-brown transition-colors" />
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full bg-brand-cream/30 border border-brand-brown/10 rounded-2xl pl-12 pr-4 py-4 text-brand-brown text-[0.9rem] font-bold focus:outline-none focus:ring-4 focus:ring-brand-brown/5 transition-all"
                            placeholder="john@iheal.corp"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
              <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Authority Clearance</label>
              <div className="relative group">
                <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-brown/10 group-focus-within:text-brand-brown transition-colors" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-brand-cream/30 border border-brand-brown/10 rounded-2xl pl-12 pr-4 py-4 text-brand-brown text-[0.8rem] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-brand-brown/5 appearance-none cursor-pointer"
                >
                  <option value="Project Manager">Project Management</option>
                  <option value="Developer">Engineering Unit</option>
                  <option value="Tester">Quality Assurance</option>
                  <option value="Viewer">Observer Status</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Secure Signature</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-brown/10 group-focus-within:text-brand-brown transition-colors" />
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full bg-brand-cream/30 border border-brand-brown/10 rounded-2xl pl-12 pr-4 py-4 text-brand-brown text-[0.9rem] font-bold focus:outline-none focus:ring-4 focus:ring-brand-brown/5 transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-brand-brown text-white text-[0.8rem] font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-brand-brown/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Initializing Interface...' : (
                <>
                  Process Enrollment
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center pt-8 border-t border-brand-brown/5">
            <span className="text-brand-brown/30 text-[0.7rem] font-[800] uppercase tracking-widest">Linked Identity? </span>
            <Link to="/login" className="text-[0.7rem] font-black uppercase tracking-widest text-brand-brown hover:opacity-70 transition-opacity">
              Navigate back to console
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
