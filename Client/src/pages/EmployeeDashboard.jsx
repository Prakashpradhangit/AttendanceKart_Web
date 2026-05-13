import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Calendar, 
  UserPlus, 
  Users, 
  TrendingUp,
  Clock,
  X,
  Camera,
  User,
  Send,
  Upload,
  AlertCircle,
  FileText,
  CheckCircle2,
  Plus,
  Info
} from 'lucide-react';
import { 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const generateMonthData = () => {
  return Array.from({ length: 31 }, (_, i) => {
    const date = i + 1;
    // Generate some mock data
    const isWeekend = [6, 7, 13, 14, 20, 21, 27, 28].includes(date);
    const hours = isWeekend ? (Math.random() > 0.8 ? 4 : 0) : (7 + Math.random() * 3).toFixed(1);
    
    return {
      date: date,
      hours: parseFloat(hours),
      checkIn: hours > 0 ? "09:15 AM" : "---",
      checkOut: hours > 0 ? `${(9 + Math.floor(hours)) % 12 || 12}:${Math.floor((hours % 1) * 60).toString().padStart(2, '0')} PM` : "---"
    };
  });
};

const data = generateMonthData();

const EmployeeDashboard = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [attendanceType, setAttendanceType] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState('May 2026');
  const [chartData, setChartData] = useState(data);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [leaveDuration, setLeaveDuration] = useState('Full Day');

  useEffect(() => {
    // Regenerate data when month changes to simulate data fetching
    setChartData(generateMonthData());
  }, [selectedMonth]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const handleAttendanceClick = (type) => {
    setAttendanceType(type);
    setShowPopup(true);
  };

  return (
    <>
      <div className="flex flex-col gap-6 animate-in fade-in duration-700 max-w-7xl mx-auto pb-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">Dashboard Overview</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1 font-medium">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{formatDate(currentTime)}</p>
                <p className="text-sm font-semibold text-gray-900">{formatTime(currentTime)}</p>
             </div>
             <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20">
                <Bell size={20} />
             </div>
          </div>
        </div>
        {/* Stats Row - Updated with Total Present, Shift and Leave */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#F0FFF4] p-6 rounded-[32px] border border-green-50 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
            <div>
              <p className="text-[10px] font-semibold text-[#22C55E]/60 uppercase tracking-widest mb-1">Total Present</p>
              <h3 className="text-2xl font-semibold text-[#22C55E]">24</h3>
            </div>
            <div className="w-12 h-12 bg-white/50 rounded-2xl flex items-center justify-center text-[#22C55E]">
              <TrendingUp size={24} />
            </div>
          </div>

          <div className="bg-[#F0F7FF] p-6 rounded-[32px] border border-blue-50 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
            <div>
              <p className="text-[10px] font-semibold text-[#0061E0]/60 uppercase tracking-widest mb-1">Current Shift</p>
              <h3 className="text-2xl font-semibold text-[#0061E0]">09:30 AM - 05:30 PM</h3>
            </div>
            <div className="w-12 h-12 bg-white/50 rounded-2xl flex items-center justify-center text-[#0061E0]">
              <Clock size={24} />
            </div>
          </div>

          <div className="bg-[#FFF7ED] p-6 rounded-[32px] border border-orange-50 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
            <div>
              <p className="text-[10px] font-semibold text-[#F97316]/60 uppercase tracking-widest mb-1">Leave Taken</p>
              <h3 className="text-2xl font-semibold text-[#F97316]">6</h3>
            </div>
            <div className="w-12 h-12 bg-white/50 rounded-2xl flex items-center justify-center text-[#F97316]">
              <Calendar size={24} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Insights Chart (7 Columns) */}
          <div className="lg:col-span-7 bg-white rounded-[40px] p-8 shadow-sm border border-gray-50 flex flex-col">
             <div className="mb-6 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Attendance Trends</p>
                   <div className="flex items-end gap-3">
                      <h3 className="text-3xl font-semibold text-gray-900">92%</h3>
                      <span className="text-sm font-semibold text-[#22C55E] flex items-center gap-1 mb-1">
                         +4% <TrendingUp size={16} />
                      </span>
                   </div>
                </div>
                
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-semibold text-gray-500 px-4 py-2.5 outline-none cursor-pointer hover:bg-white hover:shadow-sm transition-all uppercase tracking-widest"
                >
                  <option value="January 2026">January 2026</option>
                  <option value="February 2026">February 2026</option>
                  <option value="March 2026">March 2026</option>
                  <option value="April 2026">April 2026</option>
                  <option value="May 2026">May 2026</option>
                  <option value="June 2026">June 2026</option>
                </select>
             </div>

             <div className="flex-1 min-h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                     <XAxis 
                       dataKey="date" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fill: '#9CA3AF', fontSize: 8, fontWeight: 800}} 
                       dy={10}
                       interval={0} // Show all dates if possible, or adjust to 1
                     />
                     <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 800}}
                       domain={[0, 12]}
                       ticks={[0, 2, 4, 6, 8, 10, 12]}
                     />
                     <Tooltip 
                       cursor={{fill: '#F8FAFC'}}
                       content={({ active, payload }) => {
                         if (active && payload && payload.length) {
                           const item = payload[0].payload;
                           return (
                             <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-50 animate-in fade-in zoom-in duration-200">
                               <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-2">Day {item.date}</p>
                               <div className="space-y-1.5">
                                 <div className="flex justify-between gap-4">
                                   <span className="text-xs font-semibold text-gray-400">Check In:</span>
                                   <span className="text-xs font-semibold text-gray-900">{item.checkIn}</span>
                                 </div>
                                 <div className="flex justify-between gap-4">
                                   <span className="text-xs font-semibold text-gray-400">Check Out:</span>
                                   <span className="text-xs font-semibold text-gray-900">{item.checkOut}</span>
                                 </div>
                                 <div className="pt-1.5 border-t border-gray-50 flex justify-between gap-4">
                                   <span className="text-xs font-semibold text-[#8B5CF6]">Total:</span>
                                   <span className="text-xs font-semibold text-[#8B5CF6]">{item.hours} hrs</span>
                                 </div>
                               </div>
                             </div>
                           );
                         }
                         return null;
                       }}
                     />
                     <Bar 
                       dataKey="hours" 
                       radius={[4, 4, 4, 4]} 
                       barSize={8}
                     >
                       {data.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.hours > 0 ? '#22C55E' : '#F1F5F9'} 
                          />
                       ))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
             </div>
          </div>

          {/* Quick Actions (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
               <div className="flex-1 flex flex-col gap-4">
                 <div className="flex gap-4">
                    <button 
                      onClick={() => handleAttendanceClick('Check In')}
                      className={`flex-1 p-4 rounded-[24px] flex flex-col items-center justify-center gap-2 transition-all transform hover:-translate-y-1 active:scale-95 group ${
                        isCheckedIn 
                          ? 'bg-[#22C55E] text-white shadow-xl shadow-green-100' 
                          : 'bg-white text-gray-600 border border-gray-100 shadow-sm hover:shadow-lg'
                      }`}
                    >
                      <div className={`p-2 rounded-[14px] transition-all ${
                        isCheckedIn ? 'bg-white/20' : 'bg-gray-50 text-gray-400 group-hover:bg-green-50 group-hover:text-green-500'
                      }`}>
                        <Clock size={20} />
                      </div>
                      <div className="text-center">
                        <p className={`text-[8px] font-semibold uppercase tracking-widest mb-0 ${
                          isCheckedIn ? 'text-white/60' : 'text-gray-400'
                        }`}>Start Day</p>
                        <span className="text-sm font-semibold tracking-tight">Check In</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => handleAttendanceClick('Check Out')}
                      className={`flex-1 p-4 rounded-[24px] flex flex-col items-center justify-center gap-2 transition-all transform hover:-translate-y-1 active:scale-95 group ${
                        isCheckedOut 
                          ? 'bg-[#EF4444] text-white shadow-xl shadow-red-100' 
                          : 'bg-white text-gray-600 border border-gray-100 shadow-sm hover:shadow-lg'
                      }`}
                    >
                      <div className={`p-2 rounded-[14px] transition-all ${
                        isCheckedOut ? 'bg-white/20' : 'bg-gray-50 text-gray-400 group-hover:bg-red-50 group-hover:text-red-500'
                      }`}>
                        <Clock size={20} />
                      </div>
                      <div className="text-center">
                        <p className={`text-[8px] font-semibold uppercase tracking-widest mb-0 ${
                          isCheckedOut ? 'text-white/60' : 'text-gray-400'
                        }`}>End Day</p>
                        <span className="text-sm font-semibold tracking-tight">Check Out</span>
                      </div>
                    </button>
                 </div>
                 
                 {/* Active Time Display Div */}
                 <div className="bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm flex flex-col items-center justify-center group hover:shadow-md transition-all">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Current Time</p>
                    <div className="flex items-center gap-3">
                       <Clock size={20} className="text-[#0061E0]" />
                       <span className="text-2xl font-semibold text-gray-900 tracking-tight">{formatTime(currentTime)}</span>
                    </div>
                 </div>
               </div>

             <div className="grid grid-cols-2 gap-6">
                <button 
                  onClick={() => setShowLeaveModal(true)}
                  className="bg-white p-6 rounded-[32px] flex flex-col items-start gap-4 text-gray-600 border border-gray-100 shadow-sm hover:shadow-lg transition-all group w-full text-left"
                >
                  <div className="p-3 bg-gray-50 rounded-[18px] text-gray-400 group-hover:bg-blue-50 group-hover:text-[#0061E0] transition-all">
                     <UserPlus size={24} />
                  </div>
                  <span className="text-sm font-semibold tracking-tight">Apply Leave</span>
                </button>

                <button className="bg-white p-6 rounded-[32px] flex flex-col items-start gap-4 text-gray-600 border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
                  <div className="p-3 bg-gray-50 rounded-[18px] text-gray-400 group-hover:bg-blue-50 group-hover:text-[#0061E0] transition-all">
                     <Users size={24} />
                  </div>
                  <span className="text-sm font-semibold tracking-tight">Meetings</span>
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Attendance Modal */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden relative"
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowPopup(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <div className="p-8 flex flex-col items-center text-center">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">{attendanceType}</h2>
                <p className="text-sm font-medium text-gray-500 mt-1">Please authenticate your face to proceed</p>
              </div>

              {/* Face Auth Simulation UI */}
              <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-[#22C55E]/10 flex items-center justify-center">
                  <div className="w-[90%] h-[90%] rounded-full border border-[#22C55E]/30" />
                </div>
                <div className="w-48 h-48 rounded-full bg-[#F1F5F9] flex items-center justify-center border-4 border-white shadow-inner">
                  <User size={80} className="text-[#94A3B8]" />
                </div>
                {/* Scanning Animation Circle */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-t-4 border-l-4 border-transparent border-t-[#22C55E] border-l-[#22C55E]/30"
                />
              </div>

              <div className="mb-8">
                <p className="text-[#22C55E] font-semibold tracking-widest text-xs uppercase mb-2">Face Authentication</p>
                <div className="flex flex-col items-center">
                  <span className={`text-4xl font-semibold ${
                    attendanceType === 'Check In' && (currentTime.getHours() > 10 || (currentTime.getHours() === 10 && currentTime.getMinutes() >= 30))
                      ? 'text-red-500' 
                      : 'text-[#1E293B]'
                  }`}>
                    {formatTime(currentTime)}
                  </span>
                  <span className="text-gray-400 text-sm font-semibold mt-1">{formatDate(currentTime)}</span>
                </div>
              </div>

              <button 
                onClick={async () => {
                  try {
                    const endpoint = attendanceType === 'Check In' ? '/api/attendance/clock-in' : '/api/attendance/clock-out';
                    const token = localStorage.getItem('token');
                    const response = await fetch(endpoint, {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                      if (attendanceType === 'Check In') setIsCheckedIn(true);
                      if (attendanceType === 'Check Out') setIsCheckedOut(true);
                      setShowPopup(false);
                      // In a real app, refresh data here
                    } else {
                      const errData = await response.text();
                      alert(`Failed to ${attendanceType}: ${errData}`);
                    }
                  } catch (err) {
                    console.error(`Error during ${attendanceType}:`, err);
                    alert(`Error during ${attendanceType}`);
                  }
                }}
                className="w-full bg-[#0061E0] text-white py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-blue-100 hover:bg-[#0052cc] transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Camera size={20} />
                Capture
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden relative"
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowLeaveModal(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all z-20"
            >
              <X size={20} />
            </button>

            <div className="p-8 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Plus size={20} className="text-[#0061E0]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Apply for Leave</h2>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">Submit your request</p>
                  </div>
                </div>

                <form className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest block mb-2 ml-1">Leave Type</label>
                      <select 
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#0061E0] focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer appearance-none"
                      >
                        <option>Sick Leave</option>
                        <option>Casual Leave</option>
                        <option>Annual Leave</option>
                        <option>Half Day</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest block mb-2 ml-1">Duration</label>
                      <select 
                        value={leaveDuration}
                        onChange={(e) => setLeaveDuration(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#0061E0] focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer appearance-none"
                      >
                        <option>Full Day</option>
                        <option>First Half</option>
                        <option>Second Half</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest block mb-2 ml-1">
                        {leaveDuration === 'Full Day' ? 'From Date' : 'Date'}
                      </label>
                      <input type="date" className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-[11px] font-semibold text-gray-700 outline-none focus:border-[#0061E0] focus:ring-4 focus:ring-blue-500/5 transition-all" />
                    </div>
                    {leaveDuration === 'Full Day' ? (
                      <div>
                        <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest block mb-2 ml-1">To Date</label>
                        <input type="date" className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-[11px] font-semibold text-gray-700 outline-none focus:border-[#0061E0] focus:ring-4 focus:ring-blue-500/5 transition-all" />
                      </div>
                    ) : (
                      <div>
                        <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest block mb-2 ml-1">Time</label>
                        <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                          <Clock size={16} className="text-[#0061E0]" />
                          <input type="time" className="bg-transparent border-none outline-none text-[11px] font-semibold text-gray-700 w-full" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest block mb-2 ml-1">Documents (Optional)</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                      />
                      <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 group-hover:border-[#0061E0]/50 group-hover:bg-blue-50/30 transition-all">
                        <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <Upload size={18} className="text-gray-400 group-hover:text-[#0061E0]" />
                        </div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">Upload document</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest block mb-2 ml-1">Reason</label>
                    <textarea 
                      placeholder="Tell us why..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs font-semibold text-gray-700 outline-none focus:border-[#0061E0] focus:ring-4 focus:ring-blue-500/5 transition-all min-h-[90px] resize-none"
                    ></textarea>
                  </div>

                  <button 
                    type="button"
                    onClick={() => {
                      setShowLeaveModal(false);
                      setShowSuccessPopup(true);
                    }}
                    className="w-full bg-[#0061E0] hover:bg-[#0052cc] text-white py-4 rounded-2xl font-semibold text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-1 active:scale-95"
                  >
                    <Send size={18} />
                    Submit Request
                  </button>
                </form>

                <div className="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex gap-3">
                  <AlertCircle size={18} className="text-orange-500 shrink-0" />
                  <p className="text-[10px] font-medium text-orange-700 leading-relaxed">
                    Submit at least 2 days in advance. Ensure all documents are clear.
                  </p>
                </div>
              </div>
              
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-50 rounded-full -ml-24 -mb-24 blur-[80px]"></div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-[48px] shadow-2xl w-full max-w-[360px] overflow-hidden p-10 flex flex-col items-center text-center relative border border-white/20"
          >
            {/* Animated Icon Container */}
            <div className="relative mb-10">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center relative"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Send size={44} className="text-[#0061E0] -rotate-12 translate-x-1" />
                </motion.div>
                
                <motion.div 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute bottom-1 right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg"
                >
                  <CheckCircle2 size={16} className="text-white" />
                </motion.div>
              </motion.div>
              
              {/* Decorative Pulse Rings */}
              <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping -z-10 scale-150 opacity-0 group-hover:opacity-100"></div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">Request sent to admin</h2>
              <p className="text-sm font-medium text-gray-500 mb-8 leading-relaxed px-4">
                Your request for the leave <span className="text-[#0061E0] font-semibold">({leaveType})</span> has been sent successfully.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full bg-blue-50/80 border border-blue-100 rounded-3xl p-5 mb-10 flex items-start gap-4 text-left"
            >
              <div className="w-7 h-7 bg-[#0061E0] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                <Info size={14} className="text-white" />
              </div>
              <p className="text-[11px] font-semibold text-gray-600 leading-normal">
                You will be notified once the admin approves your request. Check your inbox for updates.
              </p>
            </motion.div>

            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-[#0061E0] to-[#0052cc] text-white py-5 rounded-2xl font-semibold text-sm uppercase tracking-widest shadow-2xl shadow-blue-200 transition-all"
              onClick={() => setShowSuccessPopup(false)}
            >
              OK, Got it
            </motion.button>
            
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0061E0] via-blue-400 to-[#0061E0]"></div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default EmployeeDashboard;
