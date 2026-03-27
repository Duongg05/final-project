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
import { useToast } from '../context/ToastContext';

const SourceCode: React.FC = () => {
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
      showToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSourceCode(newRepo as SourceCodeData);
      showToast('Repository added successfully', 'success');
      setIsModalOpen(false);
      setNewRepo({ repoName: '', repoUrl: '', branch: 'main', description: '', projectId: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding repository:', error);
      showToast('Error adding repository', 'error');
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('Delete this repository link?')) {
      try {
        await deleteSourceCode(id);
        showToast('Repository deleted successfully', 'success');
        fetchData();
      } catch (error) {
        console.error('Error deleting repository:', error);
        showToast('Error deleting repository', 'error');
      }
    }
  };

  return (
    <Layout title="Source Code">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Repositories</h1>
            <p className="text-sm text-gray-500 mt-1">Manage project source code and repository links.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Repository
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {repos.map(repo => (
              <div key={repo._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50/30">
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <Github className="w-6 h-6 text-gray-700" />
                    </div>
                    <button onClick={() => handleDelete(repo._id)} className="text-gray-400 hover:text-red-600 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 truncate">{repo.repoName}</h3>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <FolderKanban className="w-3 h-3 mr-1" />
                    {repo.projectId?.name || 'Unassigned'}
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-600 line-clamp-2 h-10 mb-4">
                    {repo.description || 'No description provided.'}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-5">
                    <div className="flex items-center">
                      <GitBranch className="w-4 h-4 mr-1 text-gray-400" />
                      {repo.branch}
                    </div>
                    {repo.tags && repo.tags.length > 0 && (
                      <div className="flex items-center uppercase tracking-wider">
                        <Tag className="w-4 h-4 mr-1 text-gray-400" />
                        {repo.tags[0]}
                      </div>
                    )}
                  </div>
                  <a 
                    href={repo.repoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition"
                  >
                    View Repository
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Add Repository</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Repo Name</label>
                  <input
                    type="text"
                    required
                    value={newRepo.repoName}
                    onChange={e => setNewRepo({...newRepo, repoName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="e.g., scms-core-backend"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Repo URL</label>
                  <input
                    type="url"
                    required
                    value={newRepo.repoUrl}
                    onChange={e => setNewRepo({...newRepo, repoUrl: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="https://github.com/user/repo"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Project</label>
                    <select
                      required
                      value={newRepo.projectId as string}
                      onChange={e => setNewRepo({...newRepo, projectId: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      <option value="">Select Project</option>
                      {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Default Branch</label>
                    <input
                      type="text"
                      value={newRepo.branch}
                      onChange={e => setNewRepo({...newRepo, branch: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newRepo.description}
                    onChange={e => setNewRepo({...newRepo, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-gray-900 resize-none h-20"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-black shadow-md transition">Add Link</button>
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
