import api from './api';

export interface AuditLogData {
  _id: string;
  userId: any;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export const getAuditLogs = async () => {
  const response = await api.get('/security/audit-logs');
  return response.data;
};
