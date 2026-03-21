import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  LogOut, LayoutDashboard, Users, FolderKanban, CheckSquare, 
  Code, FileText, Clock, ShieldAlert, Plus, Search, Filter, 
  Calendar, Target, Flag, Edit, Trash2, X
} from 'lucide-react';
import { getProjects, createProject, updateProject, deleteProject } from '../services/projectService';
import type { ProjectData } from '../services/projectService';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Planning': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'Completed': return 'bg-green-50 text-green-700 border-green-200';
    case 'On Hold': return 'bg-gray-50 text-gray-700 border-gray-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Critical': return 'text-red-600 bg-red-50';
    case 'High': return 'text-orange-600 bg-orange-50';
    case 'Medium': return 'text-blue-600 bg-blue-50';
    case 'Low': return 'text-gray-600 bg-gray-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

const getProjectColor = (index: number) => {
  const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-green-500', 'bg-red-500', 'bg-blue-500', 'bg-yellow-500'];
  return colors[index % colors.length];
};

const Projects: React.FC = () => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<ProjectData> | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteProject(id);
        fetchProjects();
      } catch (error) {
        console.error('Failed to delete project', error);
        alert('Error deleting project');
      }
    }
  };

  const handleOpenModal = (project?: ProjectData) => {
    if (project) {
      setCurrentProject(project);
    } else {
      setCurrentProject({
        projectId: `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
        name: '',
        description: '',
        status: 'Planning',
        progress: 0,
        priority: 'Medium'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProject(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;
    
    try {
      if (currentProject._id) {
        await updateProject(currentProject._id, currentProject);
      } else {
        await createProject(currentProject as ProjectData);
      }
      handleCloseModal();
      fetchProjects();
    } catch (error) {
      console.error('Failed to save project', error);
      alert('Error saving project. Please check if backend server is running and synchronized.');
    }
  };

  const modules = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'HR Management', icon: Users, path: '/hr' },
    { name: 'Projects', icon: FolderKanban, path: '/projects', active: true },
    { name: 'Tasks', icon: CheckSquare, path: '#' },
    { name: 'Source Code', icon: Code, path: '#' },
    { name: 'Documents', icon: FileText, path: '#' },
    { name: 'Attendance', icon: Clock, path: '#' },
    { name: 'Security', icon: ShieldAlert, path: '#' },
  ];

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          p.projectId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || p.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const countByStatus = (status: string) => projects.filter(p => p.status === status).length;

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
            <h2 className="text-xl font-semibold text-gray-800 tracking-tight">Project Management</h2>
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
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Page Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Projects Overview</h1>
                <p className="text-sm text-gray-500 mt-1">Track, manage, and monitor company-wide software projects.</p>
              </div>
              <button 
                onClick={() => handleOpenModal()} 
                className="flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium tracking-wide shadow-sm hover:bg-indigo-700 hover:shadow transition-all active:scale-95"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Project
              </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search projects by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                />
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                {['All', 'Planning', 'In Progress', 'Completed', 'On Hold'].map(status => (
                  <button 
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`flex items-center px-4 py-2 border rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                      filterStatus === status 
                        ? 'border-indigo-200 bg-indigo-50 text-indigo-700' 
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {status} ({status === 'All' ? projects.length : countByStatus(status)})
                  </button>
                ))}
                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 shadow-sm transition-all whitespace-nowrap">
                  <Filter className="w-4 h-4 mr-2 text-gray-500" />
                  Filters
                </button>
              </div>
            </div>

            {/* Projects Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProjects.map((project, idx) => (
                  <div key={project._id || project.projectId} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col">
                    {/* Card Header */}
                    <div className="p-6 pb-4 border-b border-gray-100 flex-1 relative">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${getProjectColor(idx)} shadow-sm transform group-hover:scale-110 transition-transform`}>
                            <FolderKanban className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{project.projectId}</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleOpenModal(project)}
                            className="text-gray-400 hover:text-indigo-600 transition-colors p-1"
                            title="Edit Project"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(project._id)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            title="Delete Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors" title={project.name}>
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 h-10 mb-4" title={project.description}>
                        {project.description || 'No description provided.'}
                      </p>

                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                        <span className={`flex items-center px-2.5 py-1 text-xs font-semibold rounded-md ${getPriorityColor(project.priority)}`}>
                          <Flag className="w-3 h-3 mr-1" />
                          {project.priority}
                        </span>
                      </div>
                    </div>

                    {/* Card Body - Progress */}
                    <div className="px-6 py-4 bg-gray-50/50">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700 flex items-center">
                          <Target className="w-4 h-4 mr-1.5 text-gray-400" />
                          Progress
                        </span>
                        <span className="font-bold text-indigo-600">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ${project.progress === 100 ? 'bg-green-500' : 'bg-indigo-600'}`} 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500 font-medium">
                        <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                        {project.dueDate ? new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Date Set'}
                      </div>
                      
                      {/* Team Avatars mock display for now until backend assigns names */}
                      <div className="flex -space-x-2 overflow-hidden">
                        {(project.team || []).slice(0, 3).map((member: any, idx: number) => (
                          <div 
                            key={idx} 
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 shadow-sm"
                            title={member.username || member.email || 'Member'}
                          >
                            {(member.username || member.email || '?').charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {(project.team?.length || 0) > 3 && (
                          <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200 shadow-sm">
                            +{(project.team?.length || 0) - 3}
                          </div>
                        )}
                        {(!project.team || project.team.length === 0) && (
                          <div className="text-xs text-gray-400 font-medium">No team</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredProjects.length === 0 && (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-300">
                    <FolderKanban className="w-16 h-16 text-gray-200 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-1">No projects found</h3>
                    <p className="text-gray-500 text-sm mb-6">Create a new project or adjust your filters.</p>
                    <button 
                      onClick={() => handleOpenModal()} 
                      className="flex items-center px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Project Modal */}
      {isModalOpen && currentProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm overflow-y-auto px-4 py-10">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden flex flex-col max-h-full animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white shrink-0">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-indigo-600" />
                {currentProject._id ? 'Edit Project' : 'Create New Project'}
              </h3>
              <button 
                onClick={handleCloseModal} 
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-gray-50/30">
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project ID</label>
                    <input 
                      type="text" 
                      required 
                      disabled={!!currentProject._id} // ID usually shouldn't change
                      value={currentProject.projectId}
                      onChange={e => setCurrentProject({...currentProject, projectId: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:text-gray-500"
                      placeholder="e.g., PRJ-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Name</label>
                    <input 
                      type="text" 
                      required 
                      value={currentProject.name}
                      onChange={e => setCurrentProject({...currentProject, name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Enter project name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                  <textarea 
                    rows={3}
                    value={currentProject.description}
                    onChange={e => setCurrentProject({...currentProject, description: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    placeholder="Briefly describe the project goals..."
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                    <select 
                      value={currentProject.status}
                      onChange={e => setCurrentProject({...currentProject, status: e.target.value as any})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                      <option value="Planning">Planning</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
                    <select 
                      value={currentProject.priority}
                      onChange={e => setCurrentProject({...currentProject, priority: e.target.value as any})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="block text-sm font-semibold text-gray-700">Progress</label>
                      <span className="text-sm font-bold text-indigo-600">{currentProject.progress}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={currentProject.progress}
                      onChange={e => setCurrentProject({...currentProject, progress: parseInt(e.target.value)})}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Due Date</label>
                    <input 
                      type="date" 
                      value={currentProject.dueDate ? new Date(currentProject.dueDate).toISOString().split('T')[0] : ''}
                      onChange={e => setCurrentProject({...currentProject, dueDate: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-white shrink-0 gap-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 text-white bg-indigo-600 shadow-md shadow-indigo-200 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 font-semibold transition-all active:scale-95"
                >
                  {currentProject._id ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
