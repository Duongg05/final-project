import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Clock, Calendar, CheckCircle2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAttendance, checkIn as apiCheckIn, checkOut as apiCheckOut } from '../services/attendanceService';
import type { AttendanceData } from '../services/attendanceService';
import { useToast } from '../context/ToastContext';

const Attendance: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [history, setHistory] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayRecord, setTodayRecord] = useState<AttendanceData | null>(null);

  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await getAttendance(user.id);
      setHistory(data);
      const today = data.find((r: AttendanceData) => r.date === todayDate);
      setTodayRecord(today || null);
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
    } catch (error) {
      showToast('Error checking in', 'error');
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
    } catch (error) {
      showToast('Error checking out', 'error');
    }
  };

  return (
    <Layout title="Attendance Tracking">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Check-In Card */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Daily Log</h2>
            <p className="text-gray-500 text-sm mb-6">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <div className="w-full space-y-4">
              {!todayRecord ? (
                <button 
                  onClick={handleCheckIn}
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95"
                >
                  CHECK IN NOW
                </button>
              ) : !todayRecord.checkOut ? (
                <button 
                  onClick={handleCheckOut}
                  className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition active:scale-95"
                >
                  CHECK OUT NOW
                </button>
              ) : (
                <div className="p-4 bg-green-50 text-green-700 rounded-xl font-bold border border-green-100 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  SHIFT COMPLETED
                </div>
              )}
            </div>

            <div className="mt-8 grid grid-cols-2 w-full gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-400 font-bold uppercase mb-1">Check In</div>
                <div className="font-bold text-gray-700">{todayRecord?.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-400 font-bold uppercase mb-1">Check Out</div>
                <div className="font-bold text-gray-700">{todayRecord?.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</div>
              </div>
            </div>
          </div>

          {/* History List */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Recent History
              </h3>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400"><ChevronLeft className="w-4 h-4" /></button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[400px]">
              {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                      <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Check In</th>
                      <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Check Out</th>
                      <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.map(row => (
                      <tr key={row._id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 text-sm font-bold text-gray-700">{row.date}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{row.checkIn ? new Date(row.checkIn).toLocaleTimeString() : '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{row.checkOut ? new Date(row.checkOut).toLocaleTimeString() : '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            row.status === 'Present' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {history.length === 0 && (
                      <tr><td colSpan={4} className="px-6 py-20 text-center text-gray-400">No attendance records found.</td></tr>
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
