import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  LogOut, LayoutDashboard, Users, FolderKanban, CheckSquare, 
  Code, FileText, Clock, ShieldAlert
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const modules = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'HR Management', icon: Users, path: '/hr' },
    { name: 'Projects', icon: FolderKanban, path: '/projects' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { name: 'Source Code', icon: Code, path: '/source-code' },
    { name: 'Documents', icon: FileText, path: '/documents' },
    { name: 'Attendance', icon: Clock, path: '/attendance' },
    { name: 'Security', icon: ShieldAlert, path: '/security' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm z-10">
        <div className="h-16 flex items-center justify-center border-b border-gray-100">
          <Link to="/dashboard" className="text-2xl font-black text-indigo-600 tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-lg">S</span>
            </span>
            SCMS
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-1 px-4">
            {modules.map((m) => {
              const isActive = location.pathname === m.path;
              return (
                <li key={m.name}>
                  <Link 
                    to={m.path} 
                    className={`flex items-center px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 group'
                    }`}
                  >
                    <m.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    {m.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-0 relative shrink-0">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-800 tracking-tight">{title}</h2>
          </div>
          <div className="flex items-center space-x-5">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 leading-none">{user?.username || 'Admin'}</p>
                <p className="text-xs text-gray-500 mt-1">{user?.role || 'Administrator'}</p>
              </div>
              <Link to="/profile" className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md hover:scale-105 transition-transform">
                {(user?.username || 'A').charAt(0).toUpperCase()}
              </Link>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <button
              onClick={logout}
              className="flex items-center text-gray-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
