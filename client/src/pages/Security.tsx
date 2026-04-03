import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  ShieldAlert, Activity, Lock, 
  Terminal, User, Search
} from 'lucide-react';
import { getAuditLogs } from '../services/securityService';
import type { AuditLogData } from '../services/securityService';

const getActionStyles = (action: string) => {
  const upperAction = action.toUpperCase();
  if (upperAction.includes('DELETE') || upperAction.includes('ALERT') || upperAction.includes('FAIL') || upperAction.includes('UNAUTHORIZED') || upperAction.includes('LOCK')) 
    return 'text-rose-600 bg-rose-50 border-rose-100';
  if (upperAction.includes('CREATE') || upperAction.includes('SUCCESS') || upperAction.includes('CHECKIN') || upperAction.includes('LOGIN')) 
    return 'text-emerald-600 bg-emerald-50 border-emerald-100';
  if (upperAction.includes('UPDATE') || upperAction.includes('CHECKOUT') || upperAction.includes('EDIT')) 
    return 'text-amber-600 bg-amber-50 border-amber-100';
  return 'text-brand-brown/40 bg-brand-cream/50 border-brand-brown/5';
};

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

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.userId?.username && l.userId.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.resource && l.resource.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout title="Security Terminal">
      <div className="space-y-[2.5rem] animate-in fade-in duration-1000">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <h1 className="text-[2.2rem] font-[900] text-brand-brown tracking-[-0.04em] leading-none">Security Protocol Log</h1>
            <p className="text-brand-brown/40 text-[0.8rem] font-[700] mt-3 uppercase tracking-widest">Global Audit Trail & Threat Mitigation Registry</p>
          </div>
          <div className="flex items-center gap-4 px-6 py-3 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[0.65rem] font-black text-emerald-600 uppercase tracking-[0.2em]">System Integrity: Optimal</span>
          </div>
        </div>

        {/* Status Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1.5rem]">
          <div className="bg-white p-8 rounded-[2.5rem] border border-brand-brown/5 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all duration-700">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all duration-500 shadow-sm">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[0.6rem] font-black text-brand-brown/20 uppercase tracking-[0.2em] mb-1">Defense Array</div>
              <div className="text-[1.3rem] font-[900] text-brand-brown leading-tight">Active Firewall</div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-[2.5rem] border border-brand-brown/5 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all duration-700">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-sm">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[0.6rem] font-black text-brand-brown/20 uppercase tracking-[0.2em] mb-1">Registry Flow</div>
              <div className="text-[1.3rem] font-[900] text-brand-brown leading-tight">{logs.length} Vectors</div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-brand-brown/5 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all duration-700">
            <div className="w-16 h-16 bg-brand-cream rounded-2xl flex items-center justify-center text-brand-brown group-hover:bg-brand-brown group-hover:text-white transition-all duration-500 shadow-sm">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[0.6rem] font-black text-brand-brown/20 uppercase tracking-[0.2em] mb-1">Authorization</div>
              <div className="text-[1.3rem] font-[900] text-brand-brown leading-tight">Tier 0 Access</div>
            </div>
          </div>
        </div>

        {/* Audit Log Table Container */}
        <div className="bg-white rounded-[3rem] border border-brand-brown/5 shadow-sm overflow-hidden min-h-[500px]">
          <div className="p-8 border-b border-brand-brown/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-brand-cream/10">
            <h3 className="text-[1.1rem] font-[900] text-brand-brown flex items-center gap-4 tracking-[-0.02em]">
              <div className="p-2 bg-brand-brown text-white rounded-lg shadow-lg">
                <Terminal className="w-5 h-5" />
              </div>
              Traceability Interface
            </h3>
            <div className="relative w-full md:w-[20rem] group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-brown/20 group-focus-within:text-brand-brown transition-colors" />
              <input 
                type="text" 
                placeholder="Locate sequence node..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/5 rounded-full text-[0.85rem] font-bold text-brand-brown placeholder:text-brand-brown/20 focus:ring-4 focus:ring-brand-brown/5 outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-cream/20">
                  <th className="px-10 py-6 text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em]">Origin Agent</th>
                  <th className="px-10 py-6 text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em]">Action Vector</th>
                  <th className="px-10 py-6 text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em]">Target Resource</th>
                  <th className="px-10 py-6 text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em]">Protocol Metadata</th>
                  <th className="px-10 py-6 text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em]">Temporal Stamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-brown/5">
                {loading ? (
                  <tr><td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-brown"></div>
                        <p className="text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-widest animate-pulse">Decrypting Security Logs...</p>
                     </div>
                  </td></tr>
                ) : filteredLogs.map(log => (
                  <tr key={log._id} className="hover:bg-brand-cream/10 transition-colors group">
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-4">
                        <div className="w-[2.8rem] h-[2.8rem] rounded-2xl bg-brand-cream flex items-center justify-center text-brand-brown/30 group-hover:bg-brand-brown group-hover:text-white transition-all duration-500 shadow-sm border border-brand-brown/5">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-[0.95rem] font-[800] text-brand-brown tracking-tight">{log.userId?.username || 'System Node'}</div>
                            <div className="text-[0.55rem] font-black text-brand-brown/20 uppercase tracking-widest">UA::{log.userId?._id?.substring(0,8) || 'KERNEL'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <span className={`px-4 py-1.5 rounded-full text-[0.6rem] font-black uppercase tracking-widest border shadow-sm ${getActionStyles(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-10 py-7">
                        <div className="text-[0.8rem] font-black text-brand-brown uppercase tracking-tight overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
                            {log.resource}
                        </div>
                    </td>
                    <td className="px-10 py-7">
                        <div className="text-[0.8rem] font-[600] text-brand-brown/40 italic truncate max-w-[250px] leading-relaxed">
                            {log.details || 'No additional entropy detected.'}
                        </div>
                    </td>
                    <td className="px-10 py-7 whitespace-nowrap">
                        <div className="flex flex-col">
                            <span className="text-[0.8rem] font-black text-brand-brown tracking-tight">{new Date(log.timestamp).toLocaleDateString()}</span>
                            <span className="text-[0.6rem] font-mono font-black text-brand-brown/20 uppercase tracking-widest">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                    </td>
                  </tr>
                ))}
                {!loading && filteredLogs.length === 0 && (
                  <tr><td colSpan={5} className="px-10 py-32 text-center text-brand-brown/20 italic font-[800] uppercase tracking-widest text-[0.9rem]">No anomalies detected in this sector range.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer Metadata */}
          <div className="p-8 bg-brand-cream/5 border-t border-brand-brown/5 text-center">
             <p className="text-[0.6rem] font-black text-brand-brown/30 uppercase tracking-[0.3em]">End of Audit Transmission - Encryption Active</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Security;
