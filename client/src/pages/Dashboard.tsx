import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Activity, Users, FolderKanban, CheckSquare, ShieldAlert, ArrowUpRight
} from 'lucide-react';

import Layout from '../components/Layout';
import { getDashboardStats } from '../services/dashboardService';
import type { DashboardStats } from '../services/dashboardService';

const Dashboard: React.FC = () => {
  const { } = useAuth();
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
    { name: 'Total Personnel', value: stats?.counts.users || 0, change: 'Total members in system', icon: Users, path: '/hr' },
    { name: 'Active Projects', value: stats?.counts.projects || 0, change: 'Currently in progress', icon: FolderKanban, path: '/projects' },
    { name: 'Task Nodes', value: stats?.counts.tasks || 0, change: 'Units across clusters', icon: CheckSquare, path: '/tasks' },
    { name: 'Security Alerts', value: stats?.counts.securityAlerts || 0, change: 'Requires review', icon: ShieldAlert, path: '/security' },
  ];

  if (loading) {
    return (
      <Layout title="Dashboard Overview">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-brown"></div>
          <p className="text-[0.7rem] font-black text-brand-brown/40 uppercase tracking-widest animate-pulse">Establishing Connection...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard Overview">
      <div className="space-y-[3.5rem] animate-in fade-in duration-1000">
        
        {/* Statistics Grid - iHeal Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1.5rem]">
          {statCards.map((stat) => (
            <Link key={stat.name} to={stat.path} className="bg-white p-[2.2rem] rounded-[2rem] border border-brand-brown/5 hover:shadow-[0_12px_48px_rgba(61,43,31,0.08)] transition-all duration-700 group relative">
              <div className="flex justify-between items-start mb-[1.8rem]">
                <div className="text-[0.8rem] font-[800] text-brand-brown/40 uppercase tracking-[0.1em]">{stat.name}</div>
                <div className="p-[0.6rem] bg-brand-cream rounded-full text-brand-brown/50 group-hover:bg-brand-brown group-hover:text-white transition-all duration-500 shadow-sm">
                  <stat.icon className="w-[1.2rem] h-[1.2rem]" />
                </div>
              </div>
              
              <div className="space-y-[0.4rem]">
                <div className="text-[2rem] font-[800] text-brand-brown leading-none tracking-tight">{stat.value}</div>
                <div className={`text-[0.7rem] font-[600] flex items-center gap-[0.3rem] ${stat.change.includes('Requires') ? 'text-rose-500' : 'text-brand-accent'}`}>
                  {stat.change.includes('%') && <ArrowUpRight className="w-[0.8rem] h-[0.8rem]" />}
                  {stat.change}
                </div>
              </div>
            </Link>
          ))}
        </div>


        {/* Global System Telemetry Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[2.5rem]">
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-brand-brown/5 shadow-sm p-[2.5rem]">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-[1.1rem] font-[800] text-brand-brown flex items-center gap-[0.8rem]">
                        <Activity className="w-[1.2rem] h-[1.2rem] text-rose-500" />
                        Infrastructure Live Feed
                    </h3>
                    <Link to="/security" className="text-[0.7rem] font-[800] text-brand-brown/40 uppercase tracking-widest hover:text-brand-brown transition-colors">View All Trace</Link>
                </div>
                
                <div className="space-y-[1.2rem]">
                    {stats?.recentActivity?.slice(0, 5).map((log, i) => (
                        <div key={i} className="flex items-center gap-[1.5rem] p-[1.2rem] rounded-[1.5rem] hover:bg-brand-cream transition-colors group">
                            <div className="w-[2.5rem] h-[2.5rem] bg-brand-cream rounded-full flex items-center justify-center group-hover:bg-brand-brown group-hover:text-white transition-all text-brand-brown/30">
                                <Activity className="w-[1rem] h-[1rem]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[0.85rem] font-[700] text-brand-brown mb-1">{log.details || log.message}</p>
                                <p className="text-[0.65rem] font-bold text-brand-brown/30 uppercase tracking-widest italic">{new Date(log.timestamp).toLocaleTimeString()}</p>
                            </div>
                            <div className="text-[0.7rem] font-black text-brand-brown/40">TRACE::{i}</div>
                        </div>
                    ))}
                    {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                        <div className="py-20 text-center text-brand-brown/20 italic font-bold">No system telemetry packets found...</div>
                    )}
                </div>
            </div>

            <div className="space-y-[2.5rem]">
                <div className="bg-brand-brown rounded-[2.5rem] p-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10">
                        <Users className="w-[2rem] h-[2rem] text-white/40 mb-6" />
                        <h4 className="text-[1.1rem] font-[800] text-white tracking-[-0.02em] mb-2 text-center">Team Saturation</h4>
                        <div className="flex justify-center items-end gap-2 mb-8">
                            <span className="text-[3.5rem] font-[900] leading-none text-white tracking-[-0.05em]">{stats?.counts.users || 0}</span>
                            <span className="text-[0.8rem] font-bold text-white/40 mb-2 uppercase tracking-widest">Active Units</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-white transition-all duration-1000" style={{ width: `${Math.min(100, (stats?.counts.users || 0) * 2)}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
