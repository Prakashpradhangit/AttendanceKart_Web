import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  LogIn, 
  Calendar as CalendarIcon, 
  Download,
  MoreVertical,
  Sun,
  Moon,
  Sunset,
  Coffee,
  Plane,
  Clock
} from 'lucide-react';

const EmployeeAttendance = () => {
  const months = [
    'January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026', 'June 2026',
    'July 2026', 'August 2026', 'September 2026', 'October 2026', 'November 2026', 'December 2026'
  ];
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentYear = 2026; // Keeping 2026 to match your existing logic

  const fetchMonthData = React.useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const monthStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;
      
      const [attRes, leaveRes] = await Promise.all([
        fetch(`/api/attendance/monthly?month=${monthStr}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/leaves/my`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (attRes.ok) {
        const data = await attRes.json();
        setAttendanceRecords(data);
      }
      if (leaveRes.ok) {
        const data = await leaveRes.json();
        // Filter leaves for this month
        setLeaveRecords(data.filter(leave => {
          const start = new Date(leave.fromDate);
          return start.getMonth() === currentMonthIndex && start.getFullYear() === currentYear;
        }));
      }
    } catch (err) {
      console.error('Failed to fetch attendance data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentMonthIndex]);

  React.useEffect(() => {
    fetchMonthData();
  }, [fetchMonthData]);

  const handlePreviousMonth = () => {
    setCurrentMonthIndex((prev) => (prev === 0 ? months.length - 1 : prev - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => (prev === months.length - 1 ? 0 : prev + 1));
  };

  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const startDay = (new Date(currentYear, currentMonthIndex, 1).getDay() + 6) % 7; 
  const prevMonthDays = new Date(currentYear, currentMonthIndex, 0).getDate();

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Attendance</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Track and manage your daily attendance records</p>
        </div>
        <div className="flex gap-4">
          <button className="hidden sm:flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:shadow-lg transition-all">
            <Download size={16} /> Export Data
          </button>
          <button className="p-3 text-gray-400 hover:text-gray-600 transition-all bg-white rounded-2xl border border-gray-50 shadow-sm hover:shadow-md">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side - Calendar & Activity */}
        <div className="lg:col-span-7 space-y-8">
          {/* Calendar Section */}
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-50">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-900">{months[currentMonthIndex]}</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePreviousMonth}
                  className="p-2 text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 rounded-xl hover:bg-white hover:shadow-sm"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="p-2 text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 rounded-xl hover:bg-white hover:shadow-sm"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-y-4 sm:gap-y-6 text-center">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <span key={day} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{day}</span>
              ))}
              
              {/* Previous Month Days (Grayed out) */}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`prev-${i}`} className="flex items-center justify-center">
                  <span className="text-gray-200 py-2 sm:py-3 text-xs sm:text-sm font-semibold opacity-30">
                    {prevMonthDays - startDay + i + 1}
                  </span>
                </div>
              ))}
              
              {/* Current Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                
                const isPresent = attendanceRecords.some(r => r.attendanceDate === dateStr);
                const isLeave = leaveRecords.some(l => {
                    const from = new Date(l.fromDate).toISOString().split('T')[0];
                    const to = new Date(l.toDate).toISOString().split('T')[0];
                    return dateStr >= from && dateStr <= to && l.status === 'APPROVED';
                });
                
                const dayOfWeek = (startDay + i) % 7;
                const isWeekend = dayOfWeek >= 5; // Saturday or Sunday
                
                const dateObj = new Date(dateStr);
                const today = new Date();
                today.setHours(0,0,0,0);
                const isPast = dateObj < today;
                
                const isAbsent = isPast && !isPresent && !isLeave && !isWeekend;
                
                let styles = 'text-gray-600 hover:bg-gray-50 cursor-pointer';
                if (isPresent) styles = 'border-2 border-[#22C55E] text-[#22C55E] bg-green-50/30';
                else if (isLeave || isWeekend) styles = 'border-2 border-blue-500 text-blue-500 bg-blue-50/30';
                else if (isAbsent) styles = 'border-2 border-[#EF4444] text-[#EF4444] bg-red-50/30';
                
                return (
                  <div key={day} className="flex items-center justify-center">
                    <span className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-xs sm:text-sm font-bold transition-all rounded-full ${styles}`}>
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Activity Section */}
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-50">
            <h3 className="text-lg font-bold text-gray-800 mb-6 tracking-tight">Today's Activity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 bg-gray-50/50 p-6 rounded-[24px] border border-gray-100 group transition-all">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-[#22C55E] shadow-inner group-hover:scale-105 transition-transform">
                  <LogIn size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Check-in</p>
                  <h3 className="text-xl font-bold text-gray-900">
                    {attendanceRecords.find(r => r.attendanceDate === new Date().toISOString().split('T')[0])?.checkInTime 
                      ? new Date(attendanceRecords.find(r => r.attendanceDate === new Date().toISOString().split('T')[0]).checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '---'}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-gray-50/50 p-6 rounded-[24px] border border-gray-100 group transition-all">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-[#EF4444] shadow-inner group-hover:scale-105 transition-transform">
                  <LogOut size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Check-out</p>
                  <h3 className="text-xl font-bold text-gray-900">
                    {attendanceRecords.find(r => r.attendanceDate === new Date().toISOString().split('T')[0])?.checkOutTime 
                      ? new Date(attendanceRecords.find(r => r.attendanceDate === new Date().toISOString().split('T')[0]).checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '---'}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - History */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-50 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-xl font-bold text-gray-800 tracking-tight">Recent History</h2>
               <button className="text-[11px] font-bold text-blue-600 hover:underline uppercase tracking-widest">View All</button>
            </div>

            <div className="space-y-4 flex-1">
              {attendanceRecords.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-[24px] border border-gray-50 group hover:border-blue-100 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm border border-gray-100">
                      <CalendarIcon size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{new Date(item.attendanceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      <p className="text-[10px] font-semibold text-gray-400 mt-0.5">
                        {item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'} - {item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-green-50 text-green-600`}>
                    Present
                  </span>
                </div>
              ))}
              {attendanceRecords.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">No records found for this month</div>
              )}
            </div>

            <button className="w-full bg-[#2563EB] text-white py-4 rounded-[20px] font-bold flex items-center justify-center gap-3 shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all transform hover:-translate-y-1 active:scale-95 mt-8">
              <Download size={18} />
              <span className="text-sm">Export Full Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
