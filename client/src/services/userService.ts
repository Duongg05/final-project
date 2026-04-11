import api from './api';

export interface UserData {
  _id?: string;
  username: string;
  email: string;
  role: string;
}

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};
