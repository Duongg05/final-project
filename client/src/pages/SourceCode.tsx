import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Plus, Github, ExternalLink, Trash2, 
  GitBranch, Tag, FolderKanban
} from 'lucide-react';
import { getSourceCodes, createSourceCode, deleteSourceCode } from '../services/sourceCodeService';
import type { SourceCodeData } from '../services/sourceCodeService';
import { getProjects } from '../services/projectService';
import type { ProjectData } from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const SourceCode: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [repos, setRepos] = useState<SourceCodeData[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRepo, setNewRepo] = useState<Partial<SourceCodeData>>({
    repoName: '',
    repoUrl: '',
    branch: 'main',
    description: '',
    projectId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reposData, projectsData] = await Promise.all([
        getSourceCodes(),
        getProjects()
      ]);
      setRepos(reposData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to fetch data', error);
      showToast('Telemetry sync failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSourceCode(newRepo as SourceCodeData);
      showToast('Repository node initialized', 'success');
      setIsModalOpen(false);
      setNewRepo({ repoName: '', repoUrl: '', branch: 'main', description: '', projectId: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding repository:', error);
      showToast('Initialization error', 'error');
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('Purge this repository sequence from the registry?')) {
      try {
        await deleteSourceCode(id);
        showToast('Sequence purged', 'success');
        fetchData();
      } catch (error) {
        console.error('Error deleting repository:', error);
        showToast('Purge failed', 'error');
      }
    }
  };

  return (
    <Layout title="Repository Control">
      <div className="space-y-[2.5rem] animate-in fade-in duration-1000">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <h1 className="text-[2.2rem] font-[900] text-brand-brown tracking-[-0.04em] leading-none">Code Infrastructure</h1>
            <p className="text-brand-brown/40 text-[0.8rem] font-[700] mt-3 uppercase tracking-widest">Version Control Clusters & Distributed Sources</p>
          </div>
          {['Admin', 'Project Manager', 'Developer'].includes(user?.role || '') && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-[2rem] py-[1rem] bg-brand-brown text-white rounded-full text-[0.8rem] font-black uppercase tracking-widest shadow-xl shadow-brand-brown/20 hover:scale-[1.05] transition-all active:scale-[0.95]"
            >
              <Plus className="w-5 h-5 mr-3" />
              Initialize Repo
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-brown"></div>
            <p className="text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-widest animate-pulse">Mapping Code Vectors...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {repos.map(repo => (
              <div key={repo._id} className="bg-white rounded-[2.5rem] border border-brand-brown/5 shadow-sm hover:shadow-[0_20px_50px_rgba(61,43,31,0.08)] transition-all duration-700 overflow-hidden group">
                <div className="p-8 border-b border-brand-brown/5 bg-brand-cream/10 flex justify-between items-start">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-white rounded-2xl border border-brand-brown/5 shadow-sm text-brand-brown group-hover:bg-brand-brown group-hover:text-white transition-all duration-500">
                      <Github className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-[1.1rem] font-[800] text-brand-brown tracking-tight truncate max-w-[150px]">{repo.repoName}</h3>
                        <div className="flex items-center text-[0.6rem] font-black text-brand-brown/30 uppercase tracking-widest mt-1">
                            <FolderKanban className="w-3 h-3 mr-2" />
                            {repo.projectId?.name || 'Unassigned Cluster'}
                        </div>
                    </div>
                  </div>
                  {['Admin', 'Project Manager'].includes(user?.role || '') && (
                    <button onClick={() => handleDelete(repo._id)} className="p-2 text-brand-brown/10 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="p-8">
                  <p className="text-[0.85rem] font-[600] text-brand-brown/50 line-clamp-2 h-12 mb-6 leading-relaxed">
                    {repo.description || 'No operational abstract provided for this node.'}
                  </p>
                  <div className="flex items-center gap-6 text-[0.7rem] font-black text-brand-brown/30 uppercase tracking-[0.2em] mb-8">
                    <div className="flex items-center">
                      <GitBranch className="w-4 h-4 mr-2 text-brand-brown/20" />
                      {repo.branch}
                    </div>
                    {repo.tags && repo.tags.length > 0 && (
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 mr-2 text-brand-brown/20" />
                        {repo.tags[0]}
                      </div>
                    )}
                  </div>
                  <a 
                    href={repo.repoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full px-6 py-4 bg-brand-cream/30 border border-brand-brown/5 rounded-full text-[0.7rem] font-black text-brand-brown uppercase tracking-widest hover:bg-brand-brown hover:text-white transition-all shadow-sm"
                  >
                    Establish Uplink
                    <ExternalLink className="w-4 h-4 ml-3" />
                  </a>
                </div>
              </div>
            ))}
            {repos.length === 0 && (
              <div className="col-span-full text-center py-32 bg-white rounded-[3rem] border border-dashed border-brand-brown/10 text-brand-brown/20 font-[800] uppercase tracking-widest text-[0.9rem] italic">
                No code infrastructure mapped in this sector.
              </div>
            )}
          </div>
        )}

        {/* Add Repository Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-brand-brown/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden relative z-10 border border-brand-brown/5 animate-in zoom-in-95 duration-500 slide-in-from-bottom-8">
              <div className="px-10 py-8 border-b border-brand-brown/5 flex justify-between items-center bg-brand-cream/20">
                <div>
                    <h2 className="text-[1.8rem] font-[900] text-brand-brown tracking-[-0.03em]">Initialize Node</h2>
                    <p className="text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-widest">Global code repository definition</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-full flex items-center justify-center text-brand-brown/20 hover:text-brand-brown hover:bg-brand-cream transition-all font-black">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="space-y-3">
                  <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Sequence Designation</label>
                  <input
                    type="text"
                    required
                    value={newRepo.repoName}
                    onChange={e => setNewRepo({...newRepo, repoName: e.target.value})}
                    className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.9rem] font-bold focus:ring-4 focus:ring-brand-brown/5 outline-none transition-all"
                    placeholder="e.g., core-infrastructure-backend"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Source DNA (URL)</label>
                  <input
                    type="url"
                    required
                    value={newRepo.repoUrl}
                    onChange={e => setNewRepo({...newRepo, repoUrl: e.target.value})}
                    className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.9rem] font-bold focus:ring-4 focus:ring-brand-brown/5 outline-none transition-all"
                    placeholder="https://github.com/org/repo-sequence"
                  />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Target Cluster</label>
                    <select
                      required
                      value={newRepo.projectId as string}
                      onChange={e => setNewRepo({...newRepo, projectId: e.target.value})}
                      className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.85rem] font-black uppercase tracking-widest focus:ring-4 focus:ring-brand-brown/5 outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Select Project</option>
                      {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Primary Branch</label>
                    <input
                      type="text"
                      value={newRepo.branch}
                      onChange={e => setNewRepo({...newRepo, branch: e.target.value})}
                      className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.9rem] font-bold focus:ring-4 focus:ring-brand-brown/5 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Operational Abstract</label>
                  <textarea
                    rows={2}
                    value={newRepo.description}
                    onChange={e => setNewRepo({...newRepo, description: e.target.value})}
                    className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.9rem] font-bold focus:ring-4 focus:ring-brand-brown/5 outline-none h-24 resize-none transition-all"
                  />
                </div>
                <div className="flex justify-end gap-5 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 text-brand-brown/30 text-[0.7rem] font-black uppercase tracking-widest hover:text-brand-brown transition-colors">Abort</button>
                  <button type="submit" className="px-10 py-4 bg-brand-brown text-white text-[0.8rem] font-black uppercase tracking-widest rounded-full shadow-2xl shadow-brand-brown/30 hover:scale-[1.05] active:scale-[0.95] transition-all">
                    Link sequence
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SourceCode;
