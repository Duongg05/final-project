import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  FilePlus, FileText, Trash2, 
  ExternalLink, User
} from 'lucide-react';
import { getDocuments, createDocument, deleteDocument, downloadDocument } from '../services/documentService';
import type { DocumentData } from '../services/documentService';
import { getProjects } from '../services/projectService';
import type { ProjectData } from '../services/projectService';
import { useToast } from '../context/ToastContext';

const Documents: React.FC = () => {
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
      showToast('Document uploaded', 'success');
      setIsModalOpen(false);
      setNewDoc({ name: '', type: 'PDF', fileUrl: '', projectId: '', description: '' });
      fetchData();
    } catch (error) {
      showToast('Error adding document', 'error');
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('Delete this document?')) {
      try {
        await deleteDocument(id);
        showToast('Document deleted', 'success');
        fetchData();
      } catch (error) {
        showToast('Error deleting', 'error');
      }
    }
  };

  const handleDownload = async (doc: DocumentData) => {
    try {
      if (!doc._id) return;
      const res = await downloadDocument(doc._id);
      window.open(res.url, '_blank');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error downloading document', 'error');
    }
  };

  return (
    <Layout title="Documents">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Documents</h1>
            <p className="text-sm text-gray-500 mt-1">Centralized library for all project specifications and resources.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition shadow-sm"
          >
            <FilePlus className="w-5 h-5 mr-2" />
            Upload Document
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Document</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Uploaded By</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {docs.map(doc => (
                    <tr key={doc._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center text-yellow-600 mr-3">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{doc.name}</div>
                            <div className="text-xs text-gray-400">{doc.docId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {doc.projectId?.name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">
                          {doc.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="w-3 h-3 mr-1 text-gray-400" />
                          {doc.uploadedBy?.username || 'System'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleDownload(doc)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(doc._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {docs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                        No documents available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-yellow-50/50">
                <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Document Name</label>
                  <input
                    type="text"
                    required
                    value={newDoc.name}
                    onChange={e => setNewDoc({...newDoc, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="e.g., Software Architecture Specs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">File URL / Link</label>
                  <input
                    type="text"
                    required
                    value={newDoc.fileUrl}
                    onChange={e => setNewDoc({...newDoc, fileUrl: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="https://google.drive.com/link-to-file"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Project</label>
                    <select
                      value={newDoc.projectId}
                      onChange={e => setNewDoc({...newDoc, projectId: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="">Select Project</option>
                      {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                    <select
                      value={newDoc.type}
                      onChange={e => setNewDoc({...newDoc, type: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="PDF">PDF</option>
                      <option value="DOCX">Word Document</option>
                      <option value="EXCEL">Spreadsheet</option>
                      <option value="LINK">External Link</option>
                      <option value="IMAGE">Image</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newDoc.description}
                    onChange={e => setNewDoc({...newDoc, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 resize-none h-20"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-yellow-500 text-white font-semibold rounded-xl hover:bg-yellow-600 shadow-md transition">Upload</button>
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
