import api from './api';

export interface AuditLogData {
  _id: string;
  userId: { _id: string, username: string, role?: string } | any;
  action: string;
  status: string;
  message: string;
  timestamp: string;
}

export interface SecurityDashboardData {
  metrics: {
    activeThreats: number;
    securityPosture: number;
  };
  logs: AuditLogData[];
}

export const getAuditLogs = async (): Promise<SecurityDashboardData> => {
  const response = await api.get('/security/audit-logs');
  return response.data;
};
