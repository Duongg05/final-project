import api from './api';

export interface DashboardStats {
  counts: {
    users: number;
    projects: number;
    tasks: number;
    securityAlerts: number;
    documents: number;
  };
  recentActivity: any[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};
