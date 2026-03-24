import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, 
  Calendar, Target, Flag, Edit, Trash2, X, FolderKanban
} from 'lucide-react';
import { getProjects, createProject, updateProject, deleteProject } from '../services/projectService';
import type { ProjectData } from '../services/projectService';
import Layout from '../components/Layout';
import { useToast } from '../context/ToastContext';

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
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
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
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        showToast('Project deleted', 'success');
        fetchProjects();
      } catch (error) {
        showToast('Error deleting project', 'error');
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
        showToast('Project updated', 'success');
      } else {
        await createProject(currentProject as ProjectData);
        showToast('Project created', 'success');
      }
      handleCloseModal();
      fetchProjects();
    } catch (error) {
      showToast('Error saving project.', 'error');
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.projectId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const countByStatus = (status: string) => projects.filter(p => p.status === status).length;

  return (
    <Layout title="Project Management">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects Overview</h1>
            <p className="text-sm text-gray-500 mt-1">Track and manage company-wide software projects.</p>
          </div>
          <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition">
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none sm:text-sm"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto hide-scrollbar">
            {['All', 'Planning', 'In Progress', 'Completed', 'On Hold'].map(status => (
              <button 
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex items-center px-4 py-2 border rounded-lg text-sm font-semibold whitespace-nowrap ${
                  filterStatus === status ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                }`}
              >
                {status} ({status === 'All' ? projects.length : countByStatus(status)})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project, idx) => (
              <div key={project._id || project.projectId} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all group flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${getProjectColor(idx)} group-hover:scale-110 transition`}>
                        <FolderKanban className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{project.projectId}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenModal(project)} className="text-gray-400 hover:text-indigo-600 p-1"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(project._id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 truncate group-hover:text-indigo-600 transition">{project.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 h-10 mb-4">{project.description || 'No description provided.'}</p>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${getStatusColor(project.status)}`}>{project.status}</span>
                    <span className={`flex items-center px-2 py-0.5 text-[10px] font-bold rounded uppercase ${getPriorityColor(project.priority)}`}><Flag className="w-3 h-3 mr-1" />{project.priority}</span>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 mt-auto">
                   <div className="flex justify-between text-xs mb-2">
                    <span className="font-bold text-gray-500 uppercase flex items-center"><Target className="w-3.5 h-3.5 mr-1" />Progress</span>
                    <span className="font-black text-indigo-600">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full bg-indigo-600 transition-all duration-1000`} style={{ width: `${project.progress}%` }}></div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center font-bold"><Calendar className="w-3.5 h-3.5 mr-1" />{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No Date'}</div>
                  <div className="flex -space-x-2">
                    {(project.team || []).slice(0, 3).map((m: any, i) => (
                      <div key={i} className="h-7 w-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center font-bold text-gray-600">{(m.username || '?').charAt(0).toUpperCase()}</div>
                    ))}
                    {(project.team?.length || 0) > 3 && <div className="h-7 w-7 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center font-bold text-indigo-600">+{(project.team?.length || 0) - 3}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && currentProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">{currentProject._id ? 'Edit Project' : 'New Project'}</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project ID</label>
                  <input type="text" required disabled={!!currentProject._id} value={currentProject.projectId} onChange={e => setCurrentProject({...currentProject, projectId: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" required value={currentProject.name} onChange={e => setCurrentProject({...currentProject, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={currentProject.description} onChange={e => setCurrentProject({...currentProject, description: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={currentProject.status} onChange={e => setCurrentProject({...currentProject, status: e.target.value as any})} className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500">
                    <option>Planning</option><option>In Progress</option><option>Completed</option><option>On Hold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={currentProject.priority} onChange={e => setCurrentProject({...currentProject, priority: e.target.value as any})} className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500">
                    <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                  <input type="number" min="0" max="100" value={currentProject.progress} onChange={e => setCurrentProject({...currentProject, progress: parseInt(e.target.value)})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input type="date" value={currentProject.dueDate ? new Date(currentProject.dueDate).toISOString().split('T')[0] : ''} onChange={e => setCurrentProject({...currentProject, dueDate: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md transition">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Projects;
