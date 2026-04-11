import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, 
  Calendar, Target, Flag, Edit, Trash2, X, FolderKanban
} from 'lucide-react';
import { getProjects, createProject, updateProject, deleteProject } from '../services/projectService';
import { getUsers } from '../services/userService';
import type { ProjectData } from '../services/projectService';
import type { UserData } from '../services/userService';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'In Progress': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'Planning': return 'bg-amber-50 text-amber-600 border-amber-100';
    case 'Completed': return 'bg-brand-cream text-brand-brown border-brand-brown/10';
    case 'On Hold': return 'bg-rose-50 text-rose-600 border-rose-100';
    default: return 'bg-gray-50 text-gray-500 border-gray-100';
  }
};

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'Critical': return 'text-rose-600 bg-rose-50';
    case 'High': return 'text-orange-600 bg-orange-50';
    case 'Medium': return 'text-brand-brown bg-brand-cream';
    case 'Low': return 'text-brand-brown/40 bg-brand-cream/50';
    default: return 'text-gray-400 bg-gray-50';
  }
};

const getProjectAccentIcon = (index: number) => {
  const colors = ['bg-brand-brown', 'bg-brand-accent', 'bg-[#5D4037]', 'bg-[#4E342E]', 'bg-[#3E2723]'];
  return colors[index % colors.length];
};

const Projects: React.FC = () => {
  const { user } = useAuth(); // Added useAuth to check roles for actions
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [usersList, setUsersList] = useState<UserData[]>([]);
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
      const [data, users] = await Promise.all([getProjects(), getUsers()]);
      setProjects(data);
      setUsersList(users);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('Confirm permanent deletion of this project asset?')) {
      try {
        await deleteProject(id);
        showToast('Project asset purged', 'success');
        fetchProjects();
      } catch (error) {
        showToast('Error purging asset', 'error');
      }
    }
  };

  const handleOpenModal = (project?: ProjectData) => {
    if (project) {
      // Map populated team objects to their _id string for editing
      setCurrentProject({...project, team: project.team?.map((m: any) => m._id || m) || []});
    } else {
      setCurrentProject({
        projectId: `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
        name: '',
        description: '',
        status: 'Planning',
        progress: 0,
        priority: 'Medium',
        team: []
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
        showToast('Project parameters updated', 'success');
      } else {
        await createProject(currentProject as ProjectData);
        showToast('New project node initialized', 'success');
      }
      handleCloseModal();
      fetchProjects();
    } catch (error) {
      showToast('Error saving project node', 'error');
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
    <Layout title="Infrastructure Projects">
      <div className="space-y-[2.5rem] animate-in fade-in duration-1000">
        
        {/* Header - Corporate Persona */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <h1 className="text-[2.2rem] font-[900] text-brand-brown tracking-[-0.04em] leading-none">Products & Solutions</h1>
            <p className="text-brand-brown/40 text-[0.8rem] font-[700] mt-3 uppercase tracking-widest">Active Development Lifecycle Management</p>
          </div>
          {['Admin', 'Project Manager'].includes(user?.role || '') && (
            <button 
              onClick={() => handleOpenModal()} 
              className="flex items-center px-[2rem] py-[1rem] bg-brand-brown text-white rounded-full text-[0.8rem] font-black uppercase tracking-widest shadow-xl shadow-brand-brown/20 hover:scale-[1.05] transition-all active:scale-[0.95]">
              <Plus className="w-5 h-5 mr-3" />
              Initialize Project
            </button>
          )}
        </div>

        {/* Filter & Global Search */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-[2.5rem] border border-brand-brown/5 p-4 flex flex-col md:flex-row gap-6 items-center justify-between shadow-sm">
            <div className="relative w-full md:w-[25rem] group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-brand-brown/20 group-focus-within:text-brand-brown transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Locate project node..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-14 pr-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/5 rounded-full text-[0.9rem] font-bold text-brand-brown placeholder:text-brand-brown/20 focus:ring-4 focus:ring-brand-brown/5 focus:border-brand-brown/30 outline-none transition-all"
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar py-1">
              {['All', 'Planning', 'In Progress', 'Completed', 'On Hold'].map(status => (
                <button 
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`flex items-center px-6 py-2.5 rounded-full text-[0.7rem] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    filterStatus === status 
                      ? 'bg-brand-brown text-white shadow-lg shadow-brand-brown/20' 
                      : 'bg-brand-cream/50 text-brand-brown/40 hover:bg-brand-brown/5 border border-brand-brown/5'
                  }`}
                >
                  {status} <span className={`ml-2 opacity-40 font-bold ${filterStatus === status ? 'text-white' : ''}`}>({status === 'All' ? projects.length : countByStatus(status)})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-brown"></div>
            <p className="text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-widest animate-pulse">Scanning Infrastructure Nodes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[2rem]">
            {filteredProjects.map((project, idx) => (
              <div key={project._id || project.projectId} className="bg-white rounded-[2.5rem] border border-brand-brown/5 shadow-sm hover:shadow-[0_12px_48px_rgba(61,43,31,0.08)] transition-all duration-700 group flex flex-col relative overflow-hidden">
                {/* Decorative Accent */}
                <div className={`absolute top-0 right-0 w-32 h-32 ${getProjectAccentIcon(idx)} opacity-[0.03] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000`}></div>
                
                <div className="p-8 pb-0 flex-1 relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg ${getProjectAccentIcon(idx)} group-hover:rotate-12 transition-all duration-500`}>
                        <FolderKanban className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[0.6rem] font-black text-brand-brown/30 uppercase tracking-[0.2em]">{project.projectId}</span>
                      </div>
                    </div>
                    {['Admin', 'Project Manager'].includes(user?.role || '') && (
                      <div className="flex gap-2">
                        <button onClick={() => handleOpenModal(project)} className="w-8 h-8 flex items-center justify-center bg-brand-cream/50 text-brand-brown/30 hover:bg-brand-brown hover:text-white rounded-lg transition-all"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(project._id)} className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-300 hover:bg-rose-500 hover:text-white rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-[1.3rem] font-[800] text-brand-brown mb-3 tracking-[-0.02em] group-hover:translate-x-1 transition-transform duration-500">{project.name}</h3>
                  <p className="text-[0.85rem] font-[600] text-brand-brown/40 line-clamp-2 leading-relaxed mb-6 h-12">{project.description || 'System component under active configuration.'}</p>
                  
                  <div className="flex items-center gap-3 mb-8">
                    <span className={`px-4 py-1.5 text-[0.6rem] font-black uppercase tracking-widest rounded-full border ${getStatusStyles(project.status)}`}>{project.status}</span>
                    <span className={`flex items-center px-4 py-1.5 text-[0.6rem] font-black uppercase tracking-widest rounded-full ${getPriorityStyles(project.priority)}`}>
                        <Flag className="w-3 h-3 mr-2" />
                        {project.priority}
                    </span>
                  </div>
                </div>

                {/* Progress Bar Module */}
                <div className="px-8 py-6 bg-brand-cream/10 border-t border-brand-brown/5">
                   <div className="flex justify-between items-end text-[0.65rem] mb-3">
                    <span className="font-black text-brand-brown/30 uppercase tracking-widest flex items-center">
                        <Target className="w-3.5 h-3.5 mr-2" />
                        Saturation
                    </span>
                    <span className="font-[900] text-[1.1rem] text-brand-brown tracking-tighter leading-none">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-brand-cream rounded-full h-2 overflow-hidden shadow-inner">
                    <div className={`h-full ${getProjectAccentIcon(idx)} transition-all duration-1000 shadow-[0_0_12px_rgba(0,0,0,0.1)]`} style={{ width: `${project.progress}%` }}></div>
                   </div>
                </div>

                {/* Footer Metadata */}
                <div className="px-8 py-5 border-t border-brand-brown/5 flex items-center justify-between">
                  <div className="flex items-center text-[0.65rem] font-black text-brand-brown/40 uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5 mr-2" />
                    {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'TBD'}
                  </div>
                  <div className="flex -space-x-2">
                    {(project.team || []).slice(0, 3).map((m: any, i) => (
                      <div key={i} className="h-8 w-8 rounded-full bg-brand-cream border-2 border-white flex items-center justify-center font-black text-[0.65rem] text-brand-brown shadow-sm" title={m.username}>
                        {(m.username || '?').charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {(project.team?.length || 0) > 3 && (
                      <div className="h-8 w-8 rounded-full bg-brand-brown border-2 border-white flex items-center justify-center font-black text-[0.6rem] text-white shadow-sm">
                        +{(project.team?.length || 0) - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Configuration Modal */}
      {isModalOpen && currentProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-brand-brown/40 backdrop-blur-md" onClick={handleCloseModal}></div>
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden relative z-10 border border-brand-brown/5 animate-in zoom-in-95 duration-500 slide-in-from-bottom-8">
            <div className="px-10 py-8 border-b border-brand-brown/5 flex justify-between items-center bg-brand-cream/20">
              <div>
                <h3 className="text-[1.8rem] font-[900] text-brand-brown tracking-[-0.03em]">{currentProject._id ? 'Update Node' : 'Initialize Node'}</h3>
                <p className="text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-widest">Global infrastructure project specification</p>
              </div>
              <button onClick={handleCloseModal} className="w-12 h-12 rounded-full flex items-center justify-center text-brand-brown/20 hover:text-brand-brown hover:bg-brand-cream transition-all"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Asset Identifier</label>
                  <input type="text" required disabled={!!currentProject._id} placeholder="PRJ-XXXX" value={currentProject.projectId} onChange={e => setCurrentProject({...currentProject, projectId: e.target.value})} className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.9rem] font-bold focus:ring-4 focus:ring-brand-brown/5 outline-none transition-all disabled:opacity-50" />
                </div>
                <div className="space-y-3">
                  <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Asset Name</label>
                  <input type="text" required placeholder="System designation" value={currentProject.name} onChange={e => setCurrentProject({...currentProject, name: e.target.value})} className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.9rem] font-bold focus:ring-4 focus:ring-brand-brown/5 outline-none transition-all" />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Functional Description</label>
                <textarea rows={3} placeholder="Node scope and objectives..." value={currentProject.description} onChange={e => setCurrentProject({...currentProject, description: e.target.value})} className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.9rem] font-bold focus:ring-4 focus:ring-brand-brown/5 outline-none transition-all resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Current Phase</label>
                  <select value={currentProject.status} onChange={e => setCurrentProject({...currentProject, status: e.target.value as any})} className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.85rem] font-black uppercase tracking-widest focus:ring-4 focus:ring-brand-brown/5 outline-none appearance-none cursor-pointer">
                    <option>Planning</option><option>In Progress</option><option>Completed</option><option>On Hold</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Threat Level</label>
                  <select value={currentProject.priority} onChange={e => setCurrentProject({...currentProject, priority: e.target.value as any})} className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.85rem] font-black uppercase tracking-widest focus:ring-4 focus:ring-brand-brown/5 outline-none appearance-none cursor-pointer">
                    <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Saturation (%)</label>
                  <input type="number" min="0" max="100" value={currentProject.progress} onChange={e => setCurrentProject({...currentProject, progress: parseInt(e.target.value)})} className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.9rem] font-bold focus:ring-4 focus:ring-brand-brown/5 outline-none transition-all" />
                </div>
                <div className="space-y-3">
                  <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Target Deadline</label>
                  <input type="date" value={currentProject.dueDate ? new Date(currentProject.dueDate).toISOString().split('T')[0] : ''} onChange={e => setCurrentProject({...currentProject, dueDate: e.target.value})} className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.95rem] font-black focus:ring-4 focus:ring-brand-brown/5 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Team Assignments</label>
                <div className="bg-brand-cream/30 border border-brand-brown/10 rounded-2xl p-4 max-h-[150px] overflow-y-auto grid grid-cols-2 gap-3">
                  {usersList.map((usr: UserData) => {
                      const isSelected = (currentProject.team || []).some((m: any) => m === usr._id || (m && m._id === usr._id));
                      return (
                        <label key={usr._id} className="flex items-center gap-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={(e) => {
                              const newTeam = e.target.checked 
                                ? [...(currentProject.team || []), usr._id]
                                : (currentProject.team || []).filter((m: any) => (m._id || m) !== usr._id);
                              setCurrentProject({...currentProject, team: newTeam});
                            }}
                            className="w-4 h-4 text-brand-brown border-brand-brown/20 rounded focus:ring-brand-brown/20"
                          />
                          <span className="text-[0.8rem] font-bold text-brand-brown">{usr.username} <span className="text-brand-brown/40 text-[0.65rem] font-black uppercase tracking-widest leading-none ml-1">({usr.role})</span></span>
                        </label>
                      );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-5 pt-4">
                <button type="button" onClick={handleCloseModal} className="px-8 py-3 text-brand-brown/30 text-[0.7rem] font-black uppercase tracking-widest hover:text-brand-brown transition-colors">Abort</button>
                <button type="submit" className="px-10 py-4 bg-brand-brown text-white text-[0.8rem] font-black uppercase tracking-widest rounded-full shadow-2xl shadow-brand-brown/30 hover:scale-[1.05] active:scale-[0.95] transition-all">
                    {currentProject._id ? 'Publish Updates' : 'Authorize Initialization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Projects;
