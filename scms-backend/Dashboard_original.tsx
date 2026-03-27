import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Users, FolderKanban, CheckSquare, Code, 
  FileText, Clock, ShieldAlert, Activity, 
  Server, Cpu, Database, HardDrive, AlertTriangle, CheckCircle2
} from 'lucide-react';
import Layout from '../components/Layout';
import { getDashboardStats } from '../services/dashboardService';
import type { DashboardStats } from '../services/dashboardService';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { name: 'Personnel', value: stats?.counts.users || 0, limit: 50, icon: Users, color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-800', requiredRoles: ['Admin', 'HR Manager'], path: '/hr' },
    { name: 'Active Repositories', value: stats?.counts.projects || 0, limit: 20, icon: FolderKanban, color: 'text-indigo-400', bg: 'bg-indigo-900/20', border: 'border-indigo-800', path: '/projects' },
    { name: 'Task Operations', value: stats?.counts.tasks || 0, limit: 100, icon: CheckSquare, color: 'text-emerald-400', bg: 'bg-emerald-900/20', border: 'border-emerald-800', path: '/tasks' },
    { name: 'Active Threats', value: stats?.counts.securityAlerts || 0, limit: 'Critical', icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-900/20', border: 'border-rose-800', requiredRoles: ['Admin'], path: '/security' },
  ].filter(card => !card.requiredRoles || card.requiredRoles.includes(user?.role || ''));

  if (loading) {
    return (
      <Layout title="System Telemetry">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
        </div>
      </Layout>
    );
  }

  // Calculate generic security score
  const securityScore = Math.max(0, 100 - (stats?.counts.securityAlerts || 0) * 15);
  const isHealthy = securityScore > 80;

  return (
    <Layout title={`System Telemetry: ${user?.username}`}>
      <div className="space-y-6 animate-in fade-in duration-500">
        
        {/* Top Header Module */}
        <div className="bg-slate-900 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10">
            <h1 className="text-2xl font-mono font-bold text-white mb-2 flex items-center gap-3">
              <Server className="w-6 h-6 text-indigo-400" />
              SCMS Core Terminal
            </h1>
            <p className="text-slate-400 font-mono text-sm max-w-xl">
              Node <span className="text-indigo-400">alpha-01</span> ΓÇó Latency <span className="text-emerald-400">12ms</span> ΓÇó Uptime <span className="text-slate-300">99.98%</span>
            </p>
          </div>
          
          <div className="relative z-10 mt-6 md:mt-0 flex items-center gap-6 bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 shadow-inner">
            <div>
              <div className="text-xs font-mono text-slate-500 mb-1 uppercase tracking-wider">Security Posture</div>
              <div className="flex items-center gap-3">
                {isHealthy ? <CheckCircle2 className="w-8 h-8 text-emerald-500" /> : <AlertTriangle className="w-8 h-8 text-rose-500" />}
                <span className={`text-4xl font-mono font-bold ${isHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {securityScore}
                </span>
                <span className="text-slate-500 font-mono text-sm">/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Link key={stat.name} to={stat.path} className={`group bg-slate-900 p-5 rounded-2xl border ${stat.border} hover:border-slate-500 transition-all overflow-hidden relative shadow-lg`}>
              <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700`}></div>
              
              <div className="relative z-10 flex justify-between items-start mb-6">
                <div className={`p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest text-right">
                  {stat.name}
                </div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-mono font-bold text-white leading-none">{stat.value}</span>
                  {typeof stat.limit === 'number' && (
                     <span className="text-slate-500 font-mono text-sm mb-1">/ {stat.limit}</span>
                  )}
                </div>
                
                {typeof stat.limit === 'number' && (
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
                    <div className={`h-1.5 rounded-full bg-current ${stat.color}`} style={{ width: `${Math.min(100, (stat.value / stat.limit) * 100)}%` }}></div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Incident Log */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 font-mono">
                <Activity className="w-5 h-5 text-indigo-500" />
                Raw Event Stream
              </h3>
              <Link to="/security" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 font-mono uppercase tracking-wider bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors">Full Trace</Link>
            </div>
            
            <div className="flex-1 bg-slate-50">
              <div className="divide-y divide-slate-100">
                {stats?.recentActivity?.map((log) => {
                  const date = log.time || log.timestamp;
                  const isAlert = log.action?.includes('FAILED') || log.action?.includes('UNAUTHORIZED') || log.type;
                  
                  return (
                    <div key={log._id} className="p-4 hover:bg-white transition flex items-center gap-4 bg-white/50 group">
                      <div className={`w-1.5 h-10 rounded-full ${isAlert ? 'bg-rose-500' : 'bg-indigo-400'}`}></div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1.5">
                          <p className="text-sm font-bold text-slate-900 font-mono truncate mr-4">
                            {log.details || log.message}
                          </p>
                          <span className="text-[10px] font-mono font-bold text-slate-400 whitespace-nowrap bg-slate-100 px-2 py-0.5 rounded border border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                            {date ? new Date(date).toLocaleTimeString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${isAlert ? 'bg-rose-50 text-rose-600 border-rose-100' : 'text-indigo-600 bg-indigo-50 border-indigo-100'}`}>
                            {log.action?.split('_')[0] || log.type?.split('_')[0] || 'SYSTEM'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                            <Users className="w-3 h-3" /> {log.userId?.username || 'Anonymous'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                  <div className="py-24 text-center text-slate-400 font-mono text-sm flex flex-col items-center gap-3">
                    <Activity className="w-8 h-8 text-slate-300" />
                    No telemetry stream available.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Diagnostics */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 text-slate-800 opacity-20">
                <Database className="w-64 h-64" />
              </div>
              
              <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2 font-mono">
                <Cpu className="w-5 h-5 text-blue-400" />
                Hardware Diagnostics
              </h3>
              
              <div className="space-y-5 relative z-10">
                <div>
                  <div className="flex justify-between text-xs font-mono font-bold text-slate-400 mb-2">
                    <span>CPU Threading</span>
                    <span className="text-emerald-400">24%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '24%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs font-mono font-bold text-slate-400 mb-2">
                    <span>Memory Allocation</span>
                    <span className="text-indigo-400">4.2 / 16 GB</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs font-mono font-bold text-slate-400 mb-2">
                    <span>Cluster Storage</span>
                    <span className="text-blue-400">89%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: '89%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 font-mono">
                <HardDrive className="w-5 h-5 text-indigo-500" />
                Quick Operations
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/attendance" className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition flex flex-col items-center justify-center text-center gap-2 group">
                  <Clock className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
                  <span className="text-xs font-bold text-slate-600 font-mono">Clock In</span>
                </Link>
                <Link to="/documents" className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-yellow-50 hover:border-yellow-200 transition flex flex-col items-center justify-center text-center gap-2 group">
                  <FileText className="w-5 h-5 text-slate-400 group-hover:text-yellow-600 transition-colors" />
                  <span className="text-xs font-bold text-slate-600 font-mono">Docs</span>
                </Link>
                <Link to="/source-code" className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-800 hover:border-slate-800 transition flex flex-col items-center justify-center text-center gap-2 group">
                  <Code className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-white font-mono transition-colors">Code</span>
                </Link>
                <Link to="/tasks" className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition flex flex-col items-center justify-center text-center gap-2 group">
                  <CheckSquare className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  <span className="text-xs font-bold text-slate-600 font-mono">Tasks</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
