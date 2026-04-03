import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Plus, Search, Filter, 
  Edit2, Trash2, Mail, Briefcase, X, Eye, EyeOff
} from 'lucide-react';
import Layout from '../components/Layout';
import { useToast } from '../context/ToastContext';

interface Employee {
  _id: string;
  username: string;
  email: string;
  role: string;
  departmentId?: string;
  status: string;
}

const HRManagement: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Developer',
    status: 'Active'
  });
  const [showPassword, setShowPassword] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users?search=${searchTerm}`);
      setEmployees(res.data);
    } catch (error) {
      console.error('Failed to fetch employees', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEmployees();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/users/${id}`);
        showToast('Employee deleted successfully', 'success');
        fetchEmployees();
      } catch (error) {
        showToast('Could not delete employee.', 'error');
      }
    }
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData({ username: '', email: '', password: '', role: 'Developer', status: 'Active' });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({ 
      username: emp.username, 
      email: emp.email, 
      password: '', 
      role: emp.role || 'Developer', 
      status: emp.status || 'Active' 
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        const dataToUpdate: any = { ...formData };
        if (!dataToUpdate.password) delete dataToUpdate.password;
        await api.put(`/users/${editingEmployee._id}`, dataToUpdate);
        showToast('Employee updated successfully', 'success');
      } else {
        await api.post('/users', formData);
        showToast('Employee created successfully', 'success');
      }
      setShowPassword(false);
      setIsModalOpen(false);
      fetchEmployees();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error saving user', 'error');
    }
  };

  return (
    <Layout title="Human Resources">
      <div className="space-y-[2.5rem] animate-in fade-in duration-1000">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <h1 className="text-[2.2rem] font-[900] text-brand-brown tracking-[-0.04em] leading-none">Personnel Directory</h1>
            <p className="text-brand-brown/40 text-[0.8rem] font-[700] mt-3 uppercase tracking-widest">Global Workforce Registry & Access Control</p>
          </div>
          {['Admin', 'HR Manager'].includes(user?.role || '') && (
            <button 
              onClick={openAddModal}
              className="flex items-center px-[2rem] py-[1rem] bg-brand-brown text-white rounded-full text-[0.8rem] font-black uppercase tracking-widest shadow-xl shadow-brand-brown/20 hover:scale-[1.05] transition-all active:scale-[0.95]">
              <Plus className="w-5 h-5 mr-3" />
              Onboard Personnel
            </button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-[2.5rem] border border-brand-brown/5 p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          <div className="relative w-full md:w-[25rem] group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-brand-brown/20 group-focus-within:text-brand-brown transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by identity or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-14 pr-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/5 rounded-full text-[0.9rem] font-bold text-brand-brown placeholder:text-brand-brown/20 focus:ring-4 focus:ring-brand-brown/5 focus:border-brand-brown/30 outline-none transition-all"
            />
          </div>
          <button className="flex items-center px-8 py-[1rem] bg-brand-cream text-brand-brown text-[0.75rem] font-black uppercase tracking-widest rounded-full hover:bg-white border border-brand-brown/5 transition-all">
            <Filter className="w-4 h-4 mr-3 text-brand-brown/40" />
            Segment Filters
          </button>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-[3rem] border border-brand-brown/5 shadow-sm overflow-hidden min-h-[400px]">
          <div className="overflow-x-auto no-scrollbar">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-brand-cream/30">
                  <th className="px-10 py-6 text-left text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em]">Identity Node</th>
                  <th className="px-10 py-6 text-left text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em]">Communications</th>
                  <th className="px-10 py-6 text-left text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em]">Privilege Level</th>
                  <th className="px-10 py-6 text-left text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em]">Node Status</th>
                  <th className="px-10 py-6 text-right text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em]">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-brown/5">
                {loading ? (
                   <tr><td colSpan={5} className="px-10 py-32 text-center">
                     <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-brown"></div>
                        <p className="text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-widest animate-pulse">Syncing Personnel Data...</p>
                     </div>
                   </td></tr>
                ) : employees.length === 0 ? (
                   <tr><td colSpan={5} className="px-10 py-32 text-center text-brand-brown/20 italic font-[800] uppercase tracking-widest text-[0.9rem]">No organic units found in this sector.</td></tr>
                ) : employees.map((person) => (
                  <tr key={person._id} className="hover:bg-brand-cream/10 transition-colors group">
                    <td className="px-10 py-7 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-[3.2rem] w-[3.2rem] rounded-2xl bg-brand-cream flex items-center justify-center font-black text-[0.8rem] text-brand-brown shadow-sm border border-brand-brown/5 group-hover:bg-brand-brown group-hover:text-white transition-all duration-500">
                          {(person.username || 'A').substring(0,2).toUpperCase()}
                        </div>
                        <div className="ml-5">
                            <div className="text-[1rem] font-[800] text-brand-brown tracking-tight">{person.username}</div>
                            <div className="text-[0.6rem] font-[800] text-brand-brown/30 uppercase tracking-widest">ID::{person._id.substring(0,8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7 whitespace-nowrap">
                      <div className="flex items-center text-[0.85rem] font-[700] text-brand-brown/60">
                        <Mail className="w-4 h-4 mr-3 text-brand-brown/20" />
                        {person.email}
                      </div>
                    </td>
                    <td className="px-10 py-7 whitespace-nowrap">
                      <div className="flex items-center text-[0.85rem] font-[800] text-brand-brown uppercase tracking-tight">
                        <Briefcase className="w-4 h-4 mr-3 text-brand-brown/20" />
                        {person.role}
                      </div>
                    </td>
                    <td className="px-10 py-7 whitespace-nowrap">
                      <span className={`px-4 py-1.5 text-[0.6rem] font-black uppercase tracking-widest rounded-full border ${person.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-brand-cream text-brand-brown/40 border-brand-brown/5'}`}>
                        {person.status}
                      </span>
                    </td>
                    <td className="px-10 py-7 whitespace-nowrap text-right">
                      {['Admin', 'HR Manager'].includes(user?.role || '') && (
                        <div className="flex justify-end gap-3">
                          <button onClick={() => openEditModal(person)} className="p-[0.7rem] bg-brand-cream/50 text-brand-brown/40 hover:bg-brand-brown hover:text-white rounded-xl transition-all duration-300 shadow-sm">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(person._id)} className="p-[0.7rem] bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all duration-300 shadow-sm">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-brand-brown/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden relative z-10 border border-brand-brown/5 animate-in zoom-in-95 duration-500 slide-in-from-bottom-8">
            <div className="px-10 py-8 border-b border-brand-brown/5 flex justify-between items-center bg-brand-cream/20">
              <div>
                <h3 className="text-[1.8rem] font-[900] text-brand-brown tracking-[-0.03em]">{editingEmployee ? 'Modification Terminal' : 'Onboarding Terminal'}</h3>
                <p className="text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-widest">Organic unit definition protocol</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-full flex items-center justify-center text-brand-brown/20 hover:text-brand-brown hover:bg-brand-cream transition-all"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSave} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Organic Identity</label>
                    <input type="text" required placeholder="User identifier" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.9rem] font-bold focus:ring-4 focus:ring-brand-brown/5 focus:border-brand-brown/30 outline-none transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Port Address</label>
                    <input type="email" required placeholder="name@iheal.corp" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.9rem] font-bold focus:ring-4 focus:ring-brand-brown/5 focus:border-brand-brown/30 outline-none transition-all" />
                  </div>
              </div>

              <div className="space-y-3">
                <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">{editingEmployee ? 'Secure Hash (Null to retain)' : 'Secure Hash'}</label>
                <div className="relative group">
                    <input 
                        type={showPassword ? 'text' : 'password'} 
                        required={!editingEmployee} 
                        placeholder="••••••••" 
                        autoComplete="new-password"
                        value={formData.password} 
                        onChange={e => setFormData({...formData, password: e.target.value})} 
                        className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.9rem] font-bold focus:ring-4 focus:ring-brand-brown/5 focus:border-brand-brown/30 outline-none transition-all" 
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-brand-brown/20 hover:text-brand-brown transition-colors focus:outline-none"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Access Tier</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.9rem] font-black uppercase tracking-widest focus:ring-4 focus:ring-brand-brown/5 outline-none appearance-none cursor-pointer">
                    {['Admin', 'HR Manager', 'Project Manager', 'Developer', 'Tester', 'Viewer'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Lifecycle Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.9rem] font-black uppercase tracking-widest focus:ring-4 focus:ring-brand-brown/5 outline-none appearance-none cursor-pointer">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-5 pt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 text-brand-brown/30 text-[0.7rem] font-black uppercase tracking-widest hover:text-brand-brown transition-colors">Abort Protocol</button>
                <button type="submit" className="px-10 py-4 bg-brand-brown text-white text-[0.8rem] font-black uppercase tracking-widest rounded-full shadow-2xl shadow-brand-brown/30 hover:scale-[1.05] active:scale-[0.95] transition-all">
                    {editingEmployee ? 'Confirm Modification' : 'Execute Onboarding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default HRManagement;
