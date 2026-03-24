import api from './api';

export interface DocumentData {
  _id?: string;
  docId: string;
  name: string;
  type: string;
  fileUrl: string;
  projectId?: string | any;
  uploadedBy?: string | any;
  description?: string;
}

export const getDocuments = async (projectId?: string) => {
  const response = await api.get('/documents', { params: { projectId } });
  return response.data;
};

export const createDocument = async (data: DocumentData) => {
  const response = await api.post('/documents', data);
  return response.data;
};

export const deleteDocument = async (id: string) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};
