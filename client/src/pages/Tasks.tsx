import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Plus, Search, Edit, Trash2, FolderKanban, Calendar, User
} from 'lucide-react';
import { getTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import type { TaskData } from '../services/taskService';
import { getProjects } from '../services/projectService';
import type { ProjectData } from '../services/projectService';
import { getUsers } from '../services/userService';
import type { UserData } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'Completed': return 'bg-brand-cream text-brand-brown border-brand-brown/10';
    case 'In Progress': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'Testing': return 'bg-amber-50 text-amber-600 border-amber-100';
    case 'Todo': return 'bg-brand-brown/5 text-brand-brown/40 border-brand-brown/5';
    default: return 'bg-gray-50 text-gray-400 border-gray-100';
  }
};

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'Critical': return 'text-rose-600 bg-rose-50';
    case 'High': return 'text-orange-600 bg-orange-50';
    case 'Medium': return 'text-brand-brown bg-brand-cream';
    case 'Low': return 'text-brand-brown/30 bg-brand-cream/50';
    default: return 'text-gray-400 bg-gray-50';
  }
};

const Tasks: React.FC = () => {
  const { user } = useAuth(); // Added useAuth
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<TaskData> | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksData, projectsData, usersData] = await Promise.all([
        getTasks(),
        getProjects(),
        getUsers()
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
      setUsersList(usersData);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('Delete this task node from history?')) {
      try {
        await deleteTask(id);
        showToast('Task node purged', 'success');
        fetchData();
      } catch (error) {
        showToast('Error purging task', 'error');
      }
    }
  };

  const handleOpenModal = (task?: TaskData) => {
    if (task) {
      setCurrentTask(task);
    } else {
      setCurrentTask({
        taskId: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
        title: '',
        description: '',
        status: 'Todo',
        priority: 'Medium',
        projectId: projects.length > 0 ? projects[0]._id : '',
        assigneeId: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTask) return;
    try {
      if (currentTask._id) {
        await updateTask(currentTask._id, currentTask);
        showToast('Task parameters updated', 'success');
      } else {
        await createTask(currentTask as TaskData);
        showToast('New task node initialized', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      showToast('Error saving task node', 'error');
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.taskId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout title="Task Operational Center">
      <div className="space-y-[2.5rem] animate-in fade-in duration-1000">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <h1 className="text-[2.2rem] font-[900] text-brand-brown tracking-[-0.04em] leading-none">Operational Tasks</h1>
            <p className="text-brand-brown/40 text-[0.8rem] font-[700] mt-3 uppercase tracking-widest">Development Unit Assignment & Traceability</p>
          </div>
          {['Admin', 'Project Manager'].includes(user?.role || '') && (
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center px-[2rem] py-[1rem] bg-brand-brown text-white rounded-full text-[0.8rem] font-black uppercase tracking-widest shadow-xl shadow-brand-brown/20 hover:scale-[1.05] transition-all active:scale-[0.95]"
            >
              <Plus className="w-5 h-5 mr-3" />
              Initialize Task
            </button>
          )}
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-[2.5rem] border border-brand-brown/5 p-4 flex flex-col lg:flex-row gap-6 items-center justify-between shadow-sm">
          <div className="relative w-full lg:w-[25rem] group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-brown/20 group-focus-within:text-brand-brown transition-colors" />
            <input
              type="text"
              placeholder="Search by task identity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/5 rounded-full text-[0.9rem] font-bold text-brand-brown placeholder:text-brand-brown/20 focus:ring-4 focus:ring-brand-brown/5 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto py-1">
            {['All', 'Todo', 'In Progress', 'Testing', 'Completed'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-2.5 rounded-full text-[0.7rem] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filterStatus === status 
                    ? 'bg-brand-brown text-white shadow-lg shadow-brand-brown/20' 
                    : 'bg-brand-cream/50 text-brand-brown/40 hover:bg-brand-brown/5 border border-brand-brown/5'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-brown"></div>
            <p className="text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-widest animate-pulse">Syncing Task Telemetry...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <div key={task._id} className="bg-white rounded-[2rem] border border-brand-brown/5 shadow-sm hover:shadow-[0_8px_32px_rgba(61,43,31,0.06)] transition-all duration-500 p-8 flex flex-col lg:flex-row lg:items-center gap-6 group">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[0.6rem] font-black text-brand-brown/30 uppercase tracking-[0.2em]">ID::{task.taskId}</span>
                    <span className={`px-4 py-1 rounded-full text-[0.6rem] font-black uppercase tracking-widest ${getPriorityStyles(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <h3 className="text-[1.2rem] font-[800] text-brand-brown mb-2 tracking-tight group-hover:translate-x-1 transition-transform duration-500">{task.title}</h3>
                  <div className="flex flex-wrap items-center gap-6 text-[0.75rem] font-[700] text-brand-brown/40">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-brand-cream rounded-lg text-brand-brown/30 group-hover:bg-brand-brown group-hover:text-white transition-colors duration-500">
                            <FolderKanban className="w-3.5 h-3.5" />
                        </div>
                        <span className="uppercase tracking-widest">{task.projectId?.name || 'Unassigned Cluster'}</span>
                    </div>
                    {task.assigneeId && (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-cream flex items-center justify-center border border-brand-brown/5">
                            <User className="w-3 h-3 text-brand-brown/30 font-black" />
                        </div>
                        <span className="font-bold">{task.assigneeId.username}</span>
                      </div>
                    )}
                    {task.dueDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-brand-accent/40" />
                        <span className="font-bold tracking-tight">{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between lg:justify-end gap-6 shrink-0">
                  <span className={`px-6 py-2 rounded-full text-[0.65rem] font-black uppercase tracking-widest border ${getStatusStyles(task.status)} shadow-sm`}>
                    {task.status}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(task)} className="p-3 bg-brand-cream/50 text-brand-brown/20 hover:bg-brand-brown hover:text-white rounded-xl transition-all duration-300 shadow-sm">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(task._id)} className="p-3 bg-rose-50 text-rose-300 hover:bg-rose-500 hover:text-white rounded-xl transition-all duration-300 shadow-sm">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredTasks.length === 0 && (
              <div className="text-center py-32 bg-white rounded-[2.5rem] border border-dashed border-brand-brown/10 text-brand-brown/20 italic font-[800] uppercase tracking-widest text-[0.9rem]">
                No operational tasks detected in the current sector.
              </div>
            )}
          </div>
        )}

        {/* Task Configuration Modal */}
        {isModalOpen && currentTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-brand-brown/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden relative z-10 border border-brand-brown/5 animate-in zoom-in-95 duration-500 slide-in-from-bottom-8">
              <div className="px-10 py-8 border-b border-brand-brown/5 flex justify-between items-center bg-brand-cream/20">
                <div>
                  <h2 className="text-[1.8rem] font-[900] text-brand-brown tracking-[-0.03em]">{currentTask._id ? 'Update Node' : 'Initialize Task'}</h2>
                  <p className="text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-widest">Global operational task definition</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-full flex items-center justify-center text-brand-brown/20 hover:text-brand-brown hover:bg-brand-cream transition-all font-black">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="space-y-3">
                  <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Task Designation</label>
                  <input
                    type="text"
                    required
                    value={currentTask.title}
                    onChange={e => setCurrentTask({...currentTask, title: e.target.value})}
                    className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.9rem] font-bold focus:ring-4 focus:ring-brand-brown/5 outline-none transition-all"
                    placeholder="Enter task definition..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Parent Infrastructure</label>
                    <select
                      required
                      value={typeof currentTask.projectId === 'string' ? currentTask.projectId : currentTask.projectId?._id}
                      onChange={e => setCurrentTask({...currentTask, projectId: e.target.value})}
                      className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.85rem] font-black uppercase tracking-widest focus:ring-4 focus:ring-brand-brown/5 outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Select Target Cluster</option>
                      {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Primary Operative</label>
                    <select
                      value={typeof currentTask.assigneeId === 'string' ? currentTask.assigneeId : (currentTask.assigneeId as any)?._id || ''}
                      onChange={e => setCurrentTask({...currentTask, assigneeId: e.target.value})}
                      className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.85rem] font-black uppercase tracking-widest focus:ring-4 focus:ring-brand-brown/5 outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Unassigned</option>
                      {usersList.map((u: UserData) => <option key={u._id} value={u._id}>{u.username} ({u.role})</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Deployment Status</label>
                    <select
                      value={currentTask.status}
                      onChange={e => setCurrentTask({...currentTask, status: e.target.value as any})}
                      className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.85rem] font-black uppercase tracking-widest focus:ring-4 focus:ring-brand-brown/5 outline-none appearance-none cursor-pointer"
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Testing">Testing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Priority Tier</label>
                    <select
                      value={currentTask.priority}
                      onChange={e => setCurrentTask({...currentTask, priority: e.target.value as any})}
                      className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.85rem] font-black uppercase tracking-widest focus:ring-4 focus:ring-brand-brown/5 outline-none appearance-none cursor-pointer"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={currentTask.dueDate ? new Date(currentTask.dueDate).toISOString().split('T')[0] : ''}
                    onChange={e => setCurrentTask({...currentTask, dueDate: e.target.value})}
                    className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.95rem] font-black focus:ring-4 focus:ring-brand-brown/5 outline-none transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-brown/30 ml-1">Operational Details</label>
                  <textarea
                    rows={3}
                    value={currentTask.description}
                    onChange={e => setCurrentTask({...currentTask, description: e.target.value})}
                    className="w-full px-6 py-[1rem] bg-brand-cream/30 border border-brand-brown/10 rounded-2xl text-brand-brown text-[0.9rem] font-bold focus:ring-4 focus:ring-brand-brown/5 outline-none h-24 resize-none transition-all"
                    placeholder="Provide node specific parameters..."
                  />
                </div>
                <div className="flex justify-end gap-5 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 text-brand-brown/30 text-[0.7rem] font-black uppercase tracking-widest hover:text-brand-brown transition-colors">Abort</button>
                  <button type="submit" className="px-10 py-4 bg-brand-brown text-white text-[0.8rem] font-black uppercase tracking-widest rounded-full shadow-2xl shadow-brand-brown/30 hover:scale-[1.05] active:scale-[0.95] transition-all">
                    {currentTask._id ? 'Publish Node' : 'Initialize Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Tasks;
