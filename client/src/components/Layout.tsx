import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  LogOut, LayoutDashboard, Users, FolderKanban, CheckSquare, 
  Code, FileText, Clock, ShieldAlert, Settings
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
    { name: 'Projects', icon: FolderKanban, path: '/projects' },
    { name: 'HR Management', icon: Users, path: '/hr', allowedRoles: ['Admin', 'HR Manager'] },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { name: 'Source Code', icon: Code, path: '/source-code', allowedRoles: ['Admin', 'Project Manager', 'Developer'] },
    { name: 'Documents', icon: FileText, path: '/documents' },
    { name: 'Attendance', icon: Clock, path: '/attendance' },
    { name: 'Security', icon: ShieldAlert, path: '/security', allowedRoles: ['Admin'] },
  ];

  const filteredModules = modules.filter(m => 
    !m.allowedRoles || (user && m.allowedRoles.includes(user.role))
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans leading-relaxed tracking-tight selection:bg-indigo-600/10 selection:text-indigo-600">
      {/* Sidebar - SCMS Aesthetic */}
      <aside className="w-[18rem] bg-white flex flex-col shadow-[1px_0_32px_rgba(31,41,55,0.04)] z-30 transition-all duration-300 border-r border-slate-100">
        <div className="h-[9.5rem] flex items-center px-[2.5rem] border-b border-slate-50">
          <Link to="/dashboard" className="flex items-center gap-[1.2rem] group">
            <div className="w-[3.5rem] h-[3.5rem] bg-indigo-600 rounded-[1.2rem] flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-105 transition-all duration-500">
              <span className="text-[1.8rem] font-[900] transform -rotate-6">s</span>
            </div>
            <div>
              <h1 className="text-[1.8rem] font-[950] text-[#1e1b4b] tracking-[-0.04em] leading-none mb-1">SCMS</h1>
              <div className="text-[0.65rem] text-slate-400 font-extrabold uppercase tracking-[0.2em] leading-tight">
                <p>Systems</p>
                <p>Management</p>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-[2.5rem] no-scrollbar px-4">
          <ul className="space-y-[0.4rem]">
            {filteredModules.map((m) => {
              const isActive = location.pathname === m.path;
              return (
                <li key={m.name}>
                  <Link 
                    to={m.path} 
                    className={`flex items-center px-[1.5rem] py-[1.1rem] text-[0.95rem] font-[700] transition-all duration-500 group relative rounded-2xl ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100/50' 
                        : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
                    }`}
                  >
                    <m.icon className={`w-[1.4rem] h-[1.4rem] mr-[1.2rem] transition-all duration-500 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                    <span className="tracking-tight">{m.name}</span>
                    {isActive && (
                      <div className="absolute right-[1rem] w-[0.4rem] h-[0.4rem] bg-indigo-600 rounded-full"></div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

          {/* Bottom Settings Link */}
          <div className="p-8">
            <Link 
              to="/profile"
              className="w-full flex items-center justify-center gap-4 px-6 py-5 bg-slate-50 text-slate-400 rounded-[2rem] border border-slate-100 hover:bg-slate-100 hover:text-slate-600 font-black text-[0.75rem] uppercase tracking-widest transition-all shadow-sm active:scale-95"
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
          </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header - Glassmorphic */}
        <header className="h-[7.5rem] bg-white/70 backdrop-blur-3xl border-b border-slate-100 flex items-center justify-between px-[3.5rem] sticky top-0 z-20">
          <div className="flex items-center gap-[1.5rem]">
            <div className="w-[0.35rem] h-[2rem] bg-indigo-600 rounded-full shadow-[0_0_12px_rgba(79,70,229,0.3)]"></div>
            <h2 className="text-[1.85rem] font-[800] text-slate-800 tracking-[-0.05em] leading-tight">{title}</h2>
          </div>
          
          <div className="flex items-center gap-[2.5rem]">
            <div className="flex items-center gap-[1.2rem] bg-white px-[1rem] py-[0.6rem] rounded-full border border-slate-100 shadow-sm">
                <div className="w-[2.2rem] h-[2.2rem] rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-[0.85rem] shadow-md shadow-indigo-200">
                  {(user?.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <div className="text-[0.9rem] font-[850] text-slate-800 tracking-tight leading-none">{user?.username}</div>
                  <div className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mt-1">{user?.role}</div>
                </div>
                <button
                    onClick={logout}
                    className="p-[0.5rem] text-slate-300 hover:text-rose-500 transition-colors ml-2"
                    title="Terminate Session"
                >
                    <LogOut className="w-[1.3rem] h-[1.3rem]" />
                </button>
            </div>
          </div>
        </header>

        {/* Page Container */}
        <div className="px-[3.5rem] py-[1.5rem] flex-1 overflow-y-auto no-scrollbar">
          <div className="max-w-[75rem] mx-auto animate-in fade-in zoom-in-95 duration-1000 slide-in-from-top-4 pb-20">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
