import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Clock, Calendar, CheckCircle2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getAttendance, checkIn as apiCheckIn, checkOut as apiCheckOut } from '../services/attendanceService';
import type { AttendanceData } from '../services/attendanceService';
import { useToast } from '../context/ToastContext';

const Attendance: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [history, setHistory] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayRecord, setTodayRecord] = useState<AttendanceData | null>(null);
  const isAdminOrManager = ['Admin', 'HR Manager', 'Project Manager'].includes(user?.role || '');
  const isAdminOrHR = ['Admin', 'HR Manager'].includes(user?.role || '');

  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchHistory();
    fetchTodayStatus();
  }, [user]);

  const fetchTodayStatus = async () => {
    try {
      const res = await api.get('/attendance/today');
      setTodayRecord(res.data);
    } catch (error) {
      console.error('Failed to fetch today status', error);
    }
  };

  const fetchHistory = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      // If admin/manager, fetch all. Otherwise fetch only own.
      const isAdminOrManager = ['Admin', 'HR Manager', 'Project Manager'].includes(user.role);
      const data = await getAttendance(isAdminOrManager ? undefined : user.id);
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch attendance', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await apiCheckIn({
        userId: user?.id,
        date: todayDate,
        checkIn: new Date().toISOString(),
        note: 'Online check-in'
      });
      showToast('Check-in successful', 'success');
      fetchHistory();
      fetchTodayStatus();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error checking in';
      showToast(msg, 'error');
    }
  };

  const handleCheckOut = async () => {
    try {
      await apiCheckOut({
        userId: user?.id,
        date: todayDate,
        checkOut: new Date().toISOString()
      });
      showToast('Check-out successful', 'success');
      fetchHistory();
      fetchTodayStatus();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error checking out';
      showToast(msg, 'error');
    }
  };

  return (
    <Layout title="Attendance Tracking">
      <div className="space-y-[2.5rem] animate-in fade-in duration-1000">
        <div className={`grid grid-cols-1 ${isAdminOrHR ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-[2rem]`}>
          
          {/* Check-In Card - Corporate Persona */}
          {!isAdminOrHR && (
            <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-brand-brown/5 shadow-sm p-10 flex flex-col items-center text-center group">
              <div className="w-[4.5rem] h-[4.5rem] bg-brand-cream rounded-full flex items-center justify-center text-brand-brown mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Clock className="w-8 h-8" />
              </div>
              <h2 className="text-[1.8rem] font-[800] text-brand-brown mb-1 tracking-tight">Shift Protocol</h2>
              <p className="text-brand-brown/30 text-[0.7rem] font-[800] uppercase tracking-[0.2em] mb-10">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              
              <div className="w-full space-y-4">
                {!todayRecord ? (
                  <button 
                    onClick={handleCheckIn}
                    className="w-full py-[1.2rem] bg-brand-brown text-white rounded-[1.5rem] text-[0.8rem] font-black uppercase tracking-widest shadow-xl shadow-brand-brown/20 hover:scale-[1.02] transition-all active:scale-[0.98]"
                  >
                    Initialize Shift
                  </button>
                ) : !todayRecord.checkOut ? (
                  <button 
                    onClick={handleCheckOut}
                    className="w-full py-[1.2rem] bg-brand-accent text-white rounded-[1.5rem] text-[0.8rem] font-black uppercase tracking-widest shadow-xl shadow-brand-accent/20 hover:scale-[1.02] transition-all active:scale-[0.98]"
                  >
                    Terminate Shift
                  </button>
                ) : (
                  <div className="py-[1.2rem] bg-brand-cream text-brand-brown rounded-[1.5rem] text-[0.8rem] font-black uppercase tracking-widest border border-brand-brown/5 flex items-center justify-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-accent" />
                    Protocol Completed
                  </div>
                )}
              </div>

              <div className="mt-12 grid grid-cols-2 w-full gap-4">
                <div className="p-5 bg-brand-cream/50 rounded-2xl border border-brand-brown/5">
                  <div className="text-[0.6rem] text-brand-brown/30 font-black uppercase tracking-widest mb-1">Check In</div>
                  <div className="text-[1.2rem] font-[800] text-brand-brown">{todayRecord?.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</div>
                </div>
                <div className="p-5 bg-brand-cream/50 rounded-2xl border border-brand-brown/5">
                  <div className="text-[0.6rem] text-brand-brown/30 font-black uppercase tracking-widest mb-1">Check Out</div>
                  <div className="text-[1.2rem] font-[800] text-brand-brown">{todayRecord?.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</div>
                </div>
              </div>
            </div>
          )}

          {/* History List - Telemetry Style */}
          <div className={`${isAdminOrHR ? 'lg:col-span-1' : 'lg:col-span-2'} bg-white rounded-[2.5rem] border border-brand-brown/5 shadow-sm overflow-hidden flex flex-col`}>
            <div className="p-8 border-b border-brand-brown/5 flex justify-between items-center bg-brand-cream/10">
              <h3 className="text-[1.2rem] font-[800] text-brand-brown flex items-center gap-3">
                <Calendar className="w-6 h-6 text-brand-accent" />
                Historical Logs
              </h3>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-brand-cream rounded-full transition text-brand-brown/30"><ChevronLeft className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-brand-cream rounded-full transition text-brand-brown/30"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[500px] no-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-brown"></div>
                  <p className="text-[0.6rem] font-black text-brand-brown/30 uppercase tracking-widest">Retrieving Packets...</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-brand-cream/30 sticky top-0 z-10">
                    <tr>
                      {isAdminOrManager && <th className="px-8 py-5 text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em]">Asset</th>}
                      <th className="px-8 py-5 text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em]">Timestamp</th>
                      <th className="px-8 py-5 text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em]">Inbound</th>
                      <th className="px-8 py-5 text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em]">Outbound</th>
                      <th className="px-8 py-5 text-[0.65rem] font-black text-brand-brown/30 uppercase tracking-[0.2em]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-brown/5">
                    {history.map(row => (
                      <tr key={row._id} className="hover:bg-brand-cream/20 transition-colors group">
                        {isAdminOrManager && (
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-brand-cream flex items-center justify-center text-[0.7rem] font-black text-brand-brown shadow-sm border border-brand-brown/5 group-hover:bg-brand-brown group-hover:text-white transition-all">
                                {((row.userId as any)?.username || 'U').substring(0, 2).toUpperCase()}
                              </div>
                              <span className="text-[0.9rem] font-[700] text-brand-brown">{(row.userId as any)?.username}</span>
                            </div>
                          </td>
                        )}
                        <td className="px-8 py-6 text-[0.9rem] font-[800] text-brand-brown/60">{row.date}</td>
                        <td className="px-8 py-6 text-[0.85rem] font-[600] text-brand-brown/40">{row.checkIn ? new Date(row.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</td>
                        <td className="px-8 py-6 text-[0.85rem] font-[600] text-brand-brown/40">{row.checkOut ? new Date(row.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[0.6rem] font-black uppercase tracking-widest border ${
                            row.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            row.status === 'Late' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {history.length === 0 && (
                      <tr><td colSpan={isAdminOrManager ? 5 : 4} className="px-8 py-32 text-center text-brand-brown/20 italic font-black text-[0.8rem] uppercase tracking-widest">No telemetry records discovered.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Attendance;
