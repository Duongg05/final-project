import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Users, FolderKanban, CheckSquare, Code, 
  FileText, Clock, ShieldAlert, TrendingUp, 
  ArrowRight, Activity, Calendar
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
    { name: 'Total Employees', value: stats?.counts.users || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', path: '/hr' },
    { name: 'Active Projects', value: stats?.counts.projects || 0, icon: FolderKanban, color: 'text-indigo-600', bg: 'bg-indigo-50', path: '/projects' },
    { name: 'Pending Tasks', value: stats?.counts.tasks || 0, icon: CheckSquare, color: 'text-green-600', bg: 'bg-green-50', path: '/tasks' },
    { name: 'Security Logs', value: stats?.counts.logs || 0, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50', path: '/security' },
  ];

  const quickLinks = [
    { name: 'Attendance', icon: Clock, color: 'bg-purple-500', path: '/attendance' },
    { name: 'Documents', icon: FileText, color: 'bg-yellow-500', path: '/documents' },
    { name: 'Source Code', icon: Code, color: 'bg-gray-800', path: '/source-code' },
  ];

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Hello, ${user?.username} 👋`}>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Welcome Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl font-black mb-2 tracking-tight">Software Company Management System</h1>
            <p className="text-indigo-100 font-medium text-lg leading-relaxed">
              Manage your team, track project progress, and maintain security logs all in one place.
            </p>
            <div className="mt-6 flex gap-4">
              <Link to="/projects" className="px-6 py-2.5 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition active:scale-95 shadow-lg shadow-black/10">
                View Projects
              </Link>
              <Link to="/attendance" className="px-6 py-2.5 bg-indigo-500/30 backdrop-blur-md text-white border border-indigo-400/30 rounded-xl font-bold hover:bg-indigo-500/40 transition">
                Log Attendance
              </Link>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-20%] right-[10%] w-48 h-48 bg-purple-500/20 rounded-full blur-2xl"></div>
          <TrendingUp className="absolute top-1/2 right-12 -translate-y-1/2 w-32 h-32 text-white/10" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Link key={stat.name} to={stat.path} className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="p-1 bg-gray-50 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.name}</div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-6 h-6 text-indigo-500" />
                Recent System Activity
              </h3>
              <Link to="/security" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All</Link>
            </div>
            <div className="flex-1">
              <div className="divide-y divide-gray-50">
                {stats?.recentActivity.map((log) => (
                  <div key={log._id} className="p-4 hover:bg-gray-50/50 transition flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 font-bold uppercase text-xs">
                      {log.action?.split('_')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{log.details}</p>
                      <p className="text-xs text-gray-400 mt-0.5 font-medium flex items-center gap-2">
                        <Users className="w-3 h-3" /> {log.userId?.username || 'System'} • {new Date(log.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                      {log.resource}
                    </div>
                  </div>
                ))}
                {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                  <div className="py-20 text-center text-gray-400 font-medium">No recent activity detected.</div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links & Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-500" />
                Quick Shortcuts
              </h3>
              <div className="space-y-3">
                {quickLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    to={link.path}
                    className="flex items-center p-3 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${link.color} shadow-lg shadow-gray-100 group-hover:scale-110 transition-transform`}>
                      <link.icon className="w-5 h-5" />
                    </div>
                    <span className="ml-4 font-bold text-gray-700">{link.name}</span>
                    <ArrowRight className="ml-auto w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100 relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="font-black text-indigo-900 mb-2">Need help?</h4>
                <p className="text-sm text-indigo-700 font-medium mb-4">Check our documentation for system guides and best practices.</p>
                <Link to="/documents" className="inline-flex items-center text-sm font-black text-indigo-600 hover:text-indigo-800">
                  Documentation Hub <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
              <FileText className="absolute -bottom-4 -right-4 w-24 h-24 text-indigo-200/50 group-hover:rotate-12 transition-transform duration-500" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
