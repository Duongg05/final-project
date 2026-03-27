import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { User, Mail, Shield, Lock, Save, AlertCircle, LogOut } from 'lucide-react';
import api from '../services/api';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });



  const handleLogoutAll = async () => {
    try {
      await api.post('/auth/logout-all');
      window.location.href = '/login';
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to logout from all devices' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      const updateData: any = {
        username: formData.username,
        email: formData.email
      };
      
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
        updateData.currentPassword = formData.currentPassword;
      }

      await api.put(`/users/${user?.id}`, updateData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="My Profile">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
            <div className="absolute -bottom-12 left-12 w-24 h-24 rounded-3xl bg-white p-1.5 shadow-xl">
              <div className="w-full h-full rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-3xl">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
          <div className="pt-16 pb-8 px-12">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{user?.username}</h1>
                <p className="text-gray-500 font-medium flex items-center mt-1">
                  <Shield className="w-4 h-4 mr-2 text-indigo-500" />
                  {user?.role} Access
                </p>
              </div>
              <div className="px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100 uppercase tracking-widest">
                Account Active
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-gray-400" />
                Account Info
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-xl text-gray-400"><Mail className="w-4 h-4" /></div>
                  <div className="text-sm">
                    <p className="text-gray-400 font-bold text-[10px] uppercase">Email</p>
                    <p className="text-gray-900 font-medium">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-xl text-gray-400"><User className="w-4 h-4" /></div>
                  <div className="text-sm">
                    <p className="text-gray-400 font-bold text-[10px] uppercase">User ID</p>
                    <p className="text-gray-900 font-medium truncate max-w-[150px] font-mono text-xs">{user?.id}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-500" />
                Security Options
              </h3>
              
              <div className="space-y-4">
                <button 
                  type="button"
                  onClick={handleLogoutAll}
                  className="w-full flex justify-center items-center gap-2 px-4 py-2 border border-red-200 text-red-700 bg-red-50 rounded-xl hover:bg-red-100 font-bold text-sm transition mt-4"
                >
                  <LogOut className="w-4 h-4" /> Logout All Devices
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50">
                <h3 className="text-xl font-bold text-gray-900">Edit Settings</h3>
                <p className="text-sm text-gray-500">Update your account information and password.</p>
              </div>
              
              <div className="p-8 space-y-6">
                {message.text && (
                  <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    <AlertCircle className="w-4 h-4" />
                    {message.text}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Username</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input 
                        type="text" 
                        value={formData.username}
                        onChange={e => setFormData({...formData, username: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 space-y-4">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-400" />
                    Change Password
                  </h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase ml-1">Current Password</label>
                      <input 
                        type="password" 
                        placeholder="Required if changing password"
                        value={formData.currentPassword}
                        onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase ml-1">New Password</label>
                        <input 
                          type="password" 
                          placeholder="Leave blank to keep"
                          value={formData.newPassword}
                          onChange={e => setFormData({...formData, newPassword: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase ml-1">Confirm New Password</label>
                        <input 
                          type="password" 
                          value={formData.confirmPassword}
                          onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50 flex justify-end">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 transition-all disabled:opacity-50 active:scale-95"
                >
                  {loading ? 'Saving...' : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
