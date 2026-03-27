import api from './api';

export interface AttendanceData {
  _id?: string;
  userId: string | any;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day';
  note?: string;
}

export const getAttendance = async (userId?: string, date?: string) => {
  const response = await api.get('/attendance', { params: { userId, date } });
  return response.data;
};

export const checkIn = async (data: any) => {
  const response = await api.post('/attendance/checkin', data);
  return response.data;
};

export const checkOut = async (data: any) => {
  const response = await api.post('/attendance/checkout', data);
  return response.data;
};
