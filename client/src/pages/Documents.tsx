import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  FilePlus, FileText, Trash2, 
  ExternalLink, User
} from 'lucide-react';
import { getDocuments, createDocument, deleteDocument } from '../services/documentService';
import type { DocumentData } from '../services/documentService';
import { getProjects } from '../services/projectService';
import type { ProjectData } from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Documents: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [docs, setDocs] = useState<DocumentData[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDoc, setNewDoc] = useState<Partial<DocumentData>>({
    name: '',
    type: 'PDF',
    fileUrl: '',
    projectId: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [docsData, projectsData] = await Promise.all([
        getDocuments(),
        getProjects()
      ]);
      setDocs(docsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docToCreate = {
        ...newDoc,
        docId: `DOC-${Math.floor(1000 + Math.random() * 9000)}`
      };
      await createDocument(docToCreate as DocumentData);
      showToast('Document node archived', 'success');
      setIsModalOpen(false);
      setNewDoc({ name: '', type: 'PDF', fileUrl: '', projectId: '', description: '' });
      fetchData();
    } catch (error) {
      showToast('Error archiving node', 'error');
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('Purge this document asset from the registry?')) {
      try {
        await deleteDocument(id);
        showToast('Asset purged', 'success');
        fetchData();
      } catch (error) {
        showToast('Error purging asset', 'error');
      }
    }
  };

  return (
    <Layout title="Knowledge Assets">
      <div className="space-y-[2.5rem] animate-in fade-in duration-1000">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <h1 className="text-[2.2rem] font-[900] text-brand-brown tracking-[-0.04em] leading-none">Engineering Repository</h1>
            <p className="text-brand-brown/40 text-[0.8rem] font-[700] mt-3 uppercase tracking-widest">Global Resource Architecture & Documentation</p>
          </div>
          {['Admin', 'Project Manager', 'HR Manager'].includes(user?.role || '') && (
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center px-[2rem] py-[1rem] bg-brand-brown text-white rounded-full text-[0.8rem] font-black uppercase tracking-widest shadow-xl shadow-brand-brown/20 hover:scale-[1.05] transition-all active:scale-[0.95]"
            >
                <FilePlus className="w-5 h-5 mr-3" />
                Archive Resource
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-brown"></div>
            <p className="text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-widest animate-pulse">Syncing Library Metadata...</p>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] border border-brand-brown/5 shadow-sm overflow-hidden min-h-[500px]">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-cream/30">
                    <th className="px-10 py-6 text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em]">Asset Identity</th>
                    <th className="px-10 py-6 text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em]">Parent Cluster</th>
                    <th className="px-10 py-6 text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em]">Specification</th>
                    <th className="px-10 py-6 text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em]">Origin Agent</th>
                    <th className="px-10 py-6 text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em] text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-brown/5">
                  {docs.map(doc => (
                    <tr key={doc._id} className="hover:bg-brand-cream/10 transition-colors group">
                      <td className="px-10 py-7">
                        <div className="flex items-center">
                          <div className="w-[3rem] h-[3rem] bg-brand-cream rounded-2xl flex items-center justify-center text-brand-brown/40 group-hover:bg-brand-brown group-hover:text-white transition-all duration-500 shadow-sm border border-brand-brown/5">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="ml-5">
                            <div className="text-[1rem] font-[800] text-brand-brown tracking-tight">{doc.name}</div>
                            <div className="text-[0.6rem] font-black text-brand-brown/20 uppercase tracking-widest">{doc.docId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        <div className="text-[0.8rem] font-black text-brand-brown/60 uppercase tracking-widest">
                            {doc.projectId?.name || 'Isolated Cluster'}
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        <span className="px-4 py-1 bg-brand-brown/5 text-brand-brown/40 rounded-full text-[0.6rem] font-black uppercase tracking-widest border border-brand-brown/5">
                          {doc.type}
                        </span>
                      </td>
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-brand-cream flex items-center justify-center border border-brand-brown/5">
                              <User className="w-3 h-3 text-brand-brown/30" />
                          </div>
                          <span className="text-[0.8rem] font-bold text-brand-brown/50">{doc.uploadedBy?.username || 'Kernel'}</span>
                        </div>
                      </td>
                      <td className="px-10 py-7 text-right">
                        <div className="flex justify-end gap-3">
                          <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-[0.7rem] bg-brand-cream/50 text-brand-brown/40 hover:bg-brand-brown hover:text-white rounded-xl transition-all duration-300 shadow-sm">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          {['Admin', 'Project Manager'].includes(user?.role || '') && (
                            <button onClick={() => handleDelete(doc._id)} className="p-[0.7rem] bg-rose-50 text-rose-300 hover:bg-rose-500 hover:text-white rounded-xl transition-all duration-300 shadow-sm">
                                <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {docs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-10 py-32 text-center text-brand-brown/20 italic font-[800] uppercase tracking-widest text-[0.9rem]">
                        No asset fragments found in the knowledge base.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Footer Metadata */}
            <div className="p-8 bg-brand-cream/5 border-t border-brand-brown/5 text-center">
                <p className="text-[0.6rem] font-black text-brand-brown/30 uppercase tracking-[0.3em]">Knowledge Synchronization: Active</p>
            </div>
          </div>
        )}

        {/* Upload Terminal Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-brand-brown/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden relative z-10 border border-brand-brown/5 animate-in zoom-in-95 duration-500 slide-in-from-bottom-8">
              <div className="px-10 py-8 border-b border-brand-brown/5 flex justify-between items-center bg-brand-cream/20">
                <div>
                    <h2 className="text-[1.8rem] font-[900] text-brand-brown tracking-[-0.03em]">Archive Terminal</h2>
                    <p className="text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-widest">Global knowledge asset preservation protocol</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-full flex items-center justify-center text-brand-brown/20 hover:text-brand-brown hover:bg-brand-cream transition-all font-black">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="space-y-3">
                  <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Asset Designation</label>
                  <input
                    type="text"
                    required
                    value={newDoc.name}
                    onChange={e => setNewDoc({...newDoc, name: e.target.value})}
                    className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.9rem] font-bold focus:ring-4 focus:ring-brand-brown/5 outline-none transition-all"
                    placeholder="Engineering specification name..."
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Digital Vector (URL)</label>
                  <input
                    type="text"
                    required
                    value={newDoc.fileUrl}
                    onChange={e => setNewDoc({...newDoc, fileUrl: e.target.value})}
                    className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.9rem] font-bold focus:ring-4 focus:ring-brand-brown/5 outline-none transition-all"
                    placeholder="https://assets.corp.iheal.com/v/XXXXX"
                  />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Target Cluster</label>
                    <select
                      value={newDoc.projectId}
                      onChange={e => setNewDoc({...newDoc, projectId: e.target.value})}
                      className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.85rem] font-black uppercase tracking-widest focus:ring-4 focus:ring-brand-brown/5 outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Select Project</option>
                      {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Asset Class</label>
                    <select
                      value={newDoc.type}
                      onChange={e => setNewDoc({...newDoc, type: e.target.value})}
                      className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.85rem] font-black uppercase tracking-widest focus:ring-4 focus:ring-brand-brown/5 outline-none appearance-none cursor-pointer"
                    >
                      <option value="PDF">PDF</option>
                      <option value="DOCX">Word Document</option>
                      <option value="EXCEL">Spreadsheet</option>
                      <option value="LINK">External Link</option>
                      <option value="IMAGE">Image</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Functional Abstract</label>
                  <textarea
                    rows={2}
                    value={newDoc.description}
                    onChange={e => setNewDoc({...newDoc, description: e.target.value})}
                    className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.9rem] font-bold focus:ring-4 focus:ring-brand-brown/5 outline-none h-24 resize-none transition-all"
                  />
                </div>
                <div className="flex justify-end gap-5 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 text-brand-brown/30 text-[0.7rem] font-black uppercase tracking-widest hover:text-brand-brown transition-colors">Abort</button>
                  <button type="submit" className="px-10 py-4 bg-brand-brown text-white text-[0.8rem] font-black uppercase tracking-widest rounded-full shadow-2xl shadow-brand-brown/30 hover:scale-[1.05] active:scale-[0.95] transition-all">
                    Execute Archive
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

export default Documents;
