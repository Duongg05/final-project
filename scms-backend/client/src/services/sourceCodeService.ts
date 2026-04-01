import api from './api';

export interface SourceCodeData {
  _id?: string;
  repoName: string;
  repoUrl: string;
  projectId: string | any;
  description: string;
  branch: string;
  tags?: string[];
}

export const getSourceCodes = async (projectId?: string) => {
  const response = await api.get('/source-code', { params: { projectId } });
  return response.data;
};

export const createSourceCode = async (data: SourceCodeData) => {
  const response = await api.post('/source-code', data);
  return response.data;
};

export const deleteSourceCode = async (id: string) => {
  const response = await api.delete(`/source-code/${id}`);
  return response.data;
};

export const downloadSourceCode = async (id: string) => {
  const response = await api.get(`/source-code/${id}/download`);
  return response.data;
};
