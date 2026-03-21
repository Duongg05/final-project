import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { LogOut, LayoutDashboard, Users, FolderKanban, CheckSquare, Code, FileText, Clock, ShieldAlert } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const modules = [
    { name: 'HR Management', icon: Users, color: 'bg-blue-500', path: '/hr' },
    { name: 'Projects', icon: FolderKanban, color: 'bg-indigo-500', path: '/projects' },
    { name: 'Tasks', icon: CheckSquare, color: 'bg-green-500', path: '#' },
    { name: 'Source Code', icon: Code, color: 'bg-gray-800', path: '#' },
    { name: 'Documents', icon: FileText, color: 'bg-yellow-500', path: '#' },
    { name: 'Attendance', icon: Clock, color: 'bg-purple-500', path: '#' },
    { name: 'Security', icon: ShieldAlert, color: 'bg-red-500', path: '#' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <h1 className="text-2xl font-bold text-indigo-600">SCMS</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            <li>
              <Link to="/dashboard" className="flex items-center px-3 py-2 text-gray-900 bg-gray-100 rounded-md font-medium">
                <LayoutDashboard className="w-5 h-5 mr-3 text-indigo-500" />
                Dashboard
              </Link>
            </li>
            {modules.map((m) => (
              <li key={m.name}>
                <Link to={m.path} className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md font-medium transition-colors">
                  <m.icon className="w-5 h-5 mr-3 text-gray-400" />
                  {m.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <h2 className="text-xl font-semibold text-gray-800">Welcome, {user?.username}</h2>
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
              {user?.role}
            </span>
            <button
              onClick={logout}
              className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 ml:grid-cols-3 xl:grid-cols-4 gap-6">
            {modules.map((m) => (
              <Link to={m.path} key={m.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center hover:shadow-md transition-shadow cursor-pointer block">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white ${m.color} mb-4`}>
                  <m.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{m.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Manage module</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
