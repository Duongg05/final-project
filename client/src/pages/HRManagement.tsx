import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  LogOut, LayoutDashboard, Users, FolderKanban, CheckSquare, 
  Code, FileText, Clock, ShieldAlert, Plus, Search, Filter, 
  Edit2, Trash2, Mail, Briefcase, X
} from 'lucide-react';

interface Employee {
  _id: string;
  username: string;
  email: string;
  role: string;
  departmentId?: string;
  status: string;
}

const HRManagement: React.FC = () => {
  const { user, logout } = useAuth();
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

  const modules = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'HR Management', icon: Users, path: '/hr', active: true },
    { name: 'Projects', icon: FolderKanban, path: '/projects' },
    { name: 'Tasks', icon: CheckSquare, path: '#' },
    { name: 'Source Code', icon: Code, path: '#' },
    { name: 'Documents', icon: FileText, path: '#' },
    { name: 'Attendance', icon: Clock, path: '#' },
    { name: 'Security', icon: ShieldAlert, path: '#' },
  ];

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users?search=${searchTerm}`);
      setEmployees(res.data);
    } catch (error) {
      console.error('Failed to fetch employees', error);
      alert('Error fetching employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEmployees();
    }, 500); // 500ms debounce
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchEmployees();
      } catch (error) {
        console.error('Failed to delete', error);
        alert('Could not delete employee. Make sure you have Admin/HR rights.');
      }
    }
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData({ username: '', email: '', password: '', role: 'Developer', status: 'Active' });
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({ 
      username: emp.username, 
      email: emp.email, 
      password: '', // blank unless they want to change it
      role: emp.role || 'Developer', 
      status: emp.status || 'Active' 
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        // Edit mode
        const dataToUpdate: any = { ...formData };
        if (!dataToUpdate.password) {
          delete dataToUpdate.password;
        }
        await api.put(`/users/${editingEmployee._id}`, dataToUpdate);
      } else {
        // Add mode
        await api.post('/users', formData);
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving user');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm z-10">
        <div className="h-16 flex items-center justify-center border-b border-gray-100">
          <Link to="/dashboard" className="text-2xl font-black text-indigo-600 tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-lg">S</span>
            </span>
            SCMS
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-1 px-4">
            {modules.map((m) => (
              <li key={m.name}>
                <Link 
                  to={m.path} 
                  className={`flex items-center px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    m.active 
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 group'
                  }`}
                >
                  <m.icon className={`w-5 h-5 mr-3 transition-colors ${m.active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  {m.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-0 relative shrink-0">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-800 tracking-tight">Human Resources</h2>
          </div>
          <div className="flex items-center space-x-5">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 leading-none">{user?.username || 'Admin'}</p>
                <p className="text-xs text-gray-500 mt-1">{user?.role || 'Administrator'}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                {(user?.username || 'A').charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <button
              onClick={logout}
              className="flex items-center text-gray-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50/50">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Page Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Employees Directory</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your team members and their account permissions here.</p>
              </div>
              {['Admin', 'HR Manager'].includes(user?.role || '') && (
                <button 
                  onClick={openAddModal}
                  className="flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium tracking-wide shadow-sm hover:bg-indigo-700 hover:shadow transition-all active:scale-95">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Employee
                </button>
              )}
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search employees by name, role, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                />
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button className="flex items-center px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <Filter className="w-4 h-4 mr-2 text-gray-500" />
                  Filters
                </button>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Info</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                       <tr>
                         <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                         </td>
                       </tr>
                    ) : employees.length === 0 ? (
                       <tr>
                         <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-medium">
                           No employees found.
                         </td>
                       </tr>
                    ) : employees.map((person) => {
                      const colors = [
                        'bg-blue-100 text-blue-800', 'bg-purple-100 text-purple-800', 
                        'bg-green-100 text-green-800', 'bg-red-100 text-red-800', 'bg-yellow-100 text-yellow-800'
                      ];
                      
                      const cIndex = (person.username.charCodeAt(0) + (person.username.charCodeAt(person.username.length-1) || 0)) % colors.length;
                      const color = colors[cIndex];

                      return (
                      <tr key={person._id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-11 w-11 rounded-full flex items-center justify-center font-bold shadow-sm ${color}`}>
                              {(person.username || 'A').substring(0,2).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">{person.username}</div>
                              <div className="text-sm text-gray-500">EMP-{person._id.substring(person._id.length - 4).toUpperCase()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {person.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center text-sm font-medium text-gray-900 border-b border-transparent">
                              {person.role}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Briefcase className="w-4 h-4 mr-1 text-gray-400" />
                              {'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                            person.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 
                            person.status === 'Inactive' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {person.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {['Admin', 'HR Manager'].includes(user?.role || '') && (
                            <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEditModal(person)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit Record">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(person._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Record">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setIsModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xl leading-6 font-semibold text-gray-900">
                    {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input 
                      type="text" 
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {editingEmployee ? 'Password (leave blank to keep current)' : 'Password'}
                    </label>
                    <input 
                      type="password" 
                      required={!editingEmployee}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <select 
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option>Admin</option>
                        <option>HR Manager</option>
                        <option>Project Manager</option>
                        <option>Developer</option>
                        <option>Tester</option>
                        <option>Viewer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select 
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-5 mt-5 border-t border-gray-100 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                    >
                      {editingEmployee ? 'Save Changes' : 'Add Employee'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRManagement;
