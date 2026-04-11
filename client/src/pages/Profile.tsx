import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Mail, Shield, Lock, Save, AlertCircle, LogOut } from 'lucide-react';
import api from '../services/api';

const Profile: React.FC = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleLogoutAll = async () => {
    try {
      await api.post('/auth/logout-all');
      window.location.href = '/login';
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to terminate all sessions' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation check removed due to missing Confirm Password UI field

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      let payload: any;
      let config = {};

      if (avatarFile) {
        payload = new FormData();
        payload.append('username', formData.username);
        payload.append('email', formData.email);
        payload.append('firstName', formData.firstName);
        payload.append('lastName', formData.lastName);
        if (formData.newPassword) {
          payload.append('password', formData.newPassword);
          payload.append('currentPassword', formData.currentPassword);
        }
        payload.append('avatar', avatarFile);
        config = { headers: { 'Content-Type': 'multipart/form-data' } };
      } else {
        payload = {
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName
        };
        
        if (formData.newPassword) {
          payload.password = formData.newPassword;
          payload.currentPassword = formData.currentPassword;
        }
      }

      const response = await api.put(`/users/${user?.id}`, payload, config);
      login(response.data); // Force global context refresh with updated avatar metadata
      setMessage({ type: 'success', text: 'System identity updated successfully' });
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
      setAvatarFile(null);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Identity update failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Account Settings">
      <div className="max-w-5xl mx-auto space-y-[2.5rem] animate-in fade-in duration-1000">
        
        {/* Profile Information Card */}
        <div className="bg-white rounded-[3rem] border border-brand-brown/5 shadow-sm overflow-hidden">
          <div className="p-12 border-b border-brand-brown/5 bg-brand-cream/10">
            <h3 className="text-[1.3rem] font-[900] text-brand-brown tracking-tight mb-1">Profile Information</h3>
            <p className="text-[0.75rem] font-[700] text-brand-brown/40 uppercase tracking-widest leading-none">Update your personal identity details</p>
          </div>

          <div className="p-12 space-y-12">
            {message.text && (
              <div className={`p-5 rounded-2xl text-[0.75rem] font-black uppercase tracking-widest flex items-center gap-4 border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {message.text}
              </div>
            )}

            {/* Photo Section */}
            <div className="flex items-center gap-10">
              <div className="w-32 h-32 rounded-[2.5rem] bg-brand-brown overflow-hidden flex items-center justify-center text-white font-black text-4xl shadow-2xl border-4 border-white ring-1 ring-brand-brown/5 transform hover:scale-105 transition-transform duration-500">
                {previewUrl || user?.avatar ? (
                   <img src={previewUrl || `http://localhost:5000/${user?.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  (formData.firstName?.charAt(0) || user?.username?.charAt(0) || 'U').toUpperCase()
                )}
              </div>
              <div>
                <label className="cursor-pointer flex items-center gap-3 px-6 py-3 bg-brand-cream text-brand-brown text-[0.75rem] font-black uppercase tracking-widest rounded-xl hover:bg-white border border-brand-brown/10 transition-all shadow-sm active:scale-95 mb-3">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAvatarFile(e.target.files[0]);
                        setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                  />
                  <Save className="w-4 h-4 opacity-50" />
                  Upload New Photo
                </label>
                <p className="text-[0.65rem] font-bold text-brand-brown/30 italic">JPG or PNG. Max size 5MB.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10 pt-10 border-t border-brand-brown/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em] ml-1">First Name</label>
                  <input 
                    type="text" 
                    placeholder="Trang"
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-8 py-4 bg-brand-cream/30 border border-brand-brown/10 rounded-2xl outline-none focus:ring-4 focus:ring-brand-brown/5 transition-all font-bold text-brand-brown text-[0.9rem]" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em] ml-1">Last Name</label>
                  <input 
                    type="text" 
                    placeholder="Nguyen"
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-8 py-4 bg-brand-cream/30 border border-brand-brown/10 rounded-2xl outline-none focus:ring-4 focus:ring-brand-brown/5 transition-all font-bold text-brand-brown text-[0.9rem]" 
                  />
                </div>
              </div>

              <div className="space-y-3 max-w-md">
                <label className="text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em] ml-1">Email Cluster Address</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-brown/10 group-focus-within:text-brand-brown transition-colors" />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-14 pr-6 py-4 bg-brand-cream/30 border border-brand-brown/10 rounded-2xl outline-none focus:ring-4 focus:ring-brand-brown/5 transition-all font-bold text-brand-brown text-[0.9rem]" 
                  />
                </div>
              </div>

              <div className="pt-10 border-t border-brand-brown/5 space-y-8">
                <h4 className="text-[0.7rem] font-black text-brand-brown/20 uppercase tracking-[0.3em] flex items-center gap-4">
                  <div className="p-1.5 bg-brand-cream rounded-lg"><Lock className="w-4 h-4" /></div>
                  Security Layer Activation
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-3">
                      <label className="text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em] ml-1">Current Key</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        value={formData.currentPassword}
                        onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                        className="w-full px-8 py-4 bg-brand-cream/30 border border-brand-brown/10 rounded-2xl outline-none focus:ring-4 focus:ring-brand-brown/5 transition-all font-bold text-brand-brown text-[0.9rem]" 
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em] ml-1">New Sequence</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        value={formData.newPassword}
                        onChange={e => setFormData({...formData, newPassword: e.target.value})}
                        className="w-full px-8 py-4 bg-brand-cream/30 border border-brand-brown/10 rounded-2xl outline-none focus:ring-4 focus:ring-brand-brown/5 transition-all font-bold text-brand-brown text-[0.9rem]" 
                      />
                   </div>
                </div>
              </div>

              <div className="flex justify-end pt-5">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex items-center gap-4 px-[3rem] py-5 bg-brand-brown text-white text-[0.8rem] font-black uppercase tracking-widest rounded-full shadow-2xl shadow-brand-brown/30 hover:scale-[1.05] active:scale-[0.95] transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center gap-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Syncing...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Commit Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Global Control Card */}
        <div className="bg-white rounded-[2.5rem] border border-brand-brown/5 p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 text-center md:text-left">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shadow-sm"><Shield className="w-8 h-8" /></div>
            <div>
              <h4 className="text-[1rem] font-[800] text-brand-brown tracking-tight">Active Infrastructure Security</h4>
              <p className="text-[0.7rem] font-bold text-brand-brown/30 uppercase tracking-widest mt-1">Kill all active node sessions globally</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleLogoutAll}
            className="px-10 py-5 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white font-black text-[0.75rem] uppercase tracking-widest transition-all border border-rose-100 shadow-sm hover:shadow-xl active:scale-95"
          >
            <LogOut className="w-5 h-5 mr-3 inline-block" /> Force Global Logout
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
