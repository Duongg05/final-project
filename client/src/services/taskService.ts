import api from './api';

export interface TaskData {
  _id?: string;
  taskId: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Testing' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  projectId: string | any;
  assigneeId?: string | any;
  dueDate?: string;
}

export const getTasks = async (params?: any) => {
  const response = await api.get('/tasks', { params });
  return response.data;
};

export const createTask = async (data: TaskData) => {
  const response = await api.post('/tasks', data);
  return response.data;
};

export const updateTask = async (id: string, data: Partial<TaskData>) => {
  const response = await api.put(`/tasks/${id}`, data);
  return response.data;
};

export const deleteTask = async (id: string) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};
