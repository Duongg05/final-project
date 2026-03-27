import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  ShieldAlert, Activity, Lock, 
  Terminal, User, Search
} from 'lucide-react';
import { getAuditLogs } from '../services/securityService';
import type { AuditLogData } from '../services/securityService';

const Security: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs();
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    const upperAction = action.toUpperCase();
    if (upperAction.includes('DELETE') || upperAction.includes('ALERT') || upperAction.includes('FAIL') || upperAction.includes('UNAUTHORIZED')) return 'text-red-600 bg-red-50 border-red-200';
    if (upperAction.includes('CREATE') || upperAction.includes('SUCCESS') || upperAction.includes('CHECKIN')) return 'text-green-600 bg-green-50 border-green-200';
    if (upperAction.includes('UPDATE') || upperAction.includes('CHECKOUT')) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Security & Audit Logs">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase">System Status</div>
              <div className="text-xl font-bold text-gray-900 leading-tight">Secure</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase">Recent Events</div>
              <div className="text-xl font-bold text-gray-900 leading-tight">{logs.length} logged</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase">Access Level</div>
              <div className="text-xl font-bold text-gray-900 leading-tight">Admin Only</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-gray-400" />
              Audit Trait
            </h3>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input 
                type="text" 
                placeholder="Search logs..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Resource</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Details</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 inline-block"></div></td></tr>
                ) : filteredLogs.map(log => (
                  <tr key={log._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-gray-700">{log.userId?.username || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{log.resource}</td>
                    <td className="px-6 py-4 text-sm text-gray-400 truncate max-w-[200px]">{log.details}</td>
                    <td className="px-6 py-4 text-[11px] font-mono text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {!loading && filteredLogs.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">No security logs found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Security;
