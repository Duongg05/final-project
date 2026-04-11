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

export const createDocument = async (data: DocumentData | FormData) => {
  const isFormData = data instanceof FormData;
  
  // To upload files via Axios with a predefined application/json header, 
  // you must override Content-Type to undefined instead of manually setting multipart/form-data
  // so Axios boundary strings get properly inserted.
  let config = undefined;
  if (isFormData) {
    config = {
      headers: {
        'Content-Type': undefined as any
      }
    };
  }

  const response = await api.post('/documents', data, config);
  return response.data;
};

export const updateDocument = async (id: string, data: DocumentData | FormData) => {
  const isFormData = data instanceof FormData;
  let config = undefined;
  if (isFormData) {
    config = { headers: { 'Content-Type': undefined as any } };
  }
  const response = await api.put(`/documents/${id}`, data, config);
  return response.data;
};

export const deleteDocument = async (id: string) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};
