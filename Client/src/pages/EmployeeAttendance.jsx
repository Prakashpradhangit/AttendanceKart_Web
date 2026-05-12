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
  const [currentMonthIndex, setCurrentMonthIndex] = useState(3); // Default to April (index 3)

  const handlePreviousMonth = () => {
    setCurrentMonthIndex((prev) => (prev === 0 ? months.length - 1 : prev - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => (prev === months.length - 1 ? 0 : prev + 1));
  };

  const daysInMonth = new Date(2026, currentMonthIndex + 1, 0).getDate();
  const startDay = (new Date(2026, currentMonthIndex, 1).getDay() + 6) % 7; // Adjust for Mon start
  const prevMonthDays = new Date(2026, currentMonthIndex, 0).getDate();


  const history = [
    { date: '24 April 2025', time: '09:30 AM - 05:30 PM', status: 'Present' },
    { date: '20 April 2025', time: '09:30 AM - 05:30 PM', status: 'Present' },
    { date: '12 April 2025', time: '09:30 AM - 05:30 PM', status: 'Present' },
    { date: '09 April 2025', time: 'No shift data recorded', status: 'Absent' },
  ];

  const presentDays = [3, 24, 25, 26, 30];
  const absentDays = [11];

  const weeklyShifts = [
    { day: 'Mon', date: '11 May', shift: 'Morning', time: '09:00 AM - 05:00 PM', status: 'Present', type: 'morning' },
    { day: 'Tue', date: '12 May', shift: 'Morning', time: '09:00 AM - 05:00 PM', status: 'Present', type: 'morning' },
    { day: 'Wed', date: '13 May', shift: 'Evening', time: '02:00 PM - 10:00 PM', status: 'Present', type: 'evening' },
    { day: 'Thu', date: '14 May', shift: 'Leave', time: '---', status: 'On Leave', type: 'leave' },
    { day: 'Fri', date: '15 May', shift: 'Night', time: '10:00 PM - 06:00 AM', status: 'Upcoming', type: 'night', current: true },
    { day: 'Sat', date: '16 May', shift: 'Off Day', time: '---', status: 'Holiday', type: 'off' },
    { day: 'Sun', date: '17 May', shift: 'Off Day', time: '---', status: 'Holiday', type: 'off' },
  ];

  const getShiftStyles = (type) => {
    switch(type) {
      case 'morning': return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', icon: Sun };
      case 'evening': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', icon: Sunset };
      case 'night': return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', icon: Moon };
      case 'leave': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', icon: Plane };
      case 'off': return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-100', icon: Coffee };
      default: return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100', icon: Clock };
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Attendance</h1>
          <p className="text-xs md:text-sm text-gray-400 font-medium mt-1">Track and manage your daily attendance records</p>
        </div>
        <div className="flex gap-3">
          <button className="hidden sm:flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-black text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
            <Download size={16} /> Export
          </button>
          <button className="p-3 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-2xl border border-gray-100 shadow-sm">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
      {/* Weekly Shift Overview */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h2 className="text-xl font-black text-gray-800 tracking-tight">Weekly Shift Overview</h2>
           <div className="flex gap-2">
             <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-1.5 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all">Next Week</button>
           </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {weeklyShifts.map((item, index) => {
            const styles = getShiftStyles(item.type);
            const Icon = styles.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative group bg-white p-5 rounded-[32px] border ${
                  item.current ? 'border-blue-500 ring-4 ring-blue-50 shadow-xl' : 'border-gray-50 shadow-sm'
                } hover:shadow-md transition-all cursor-pointer overflow-hidden`}
              >
                {item.current && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-blue-500 text-[8px] font-black text-white px-3 py-1 rounded-b-xl uppercase tracking-widest">
                    Today
                  </div>
                )}
                
                <div className="text-center mt-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.day}</p>
                  <p className="text-xs font-black text-gray-900 mb-4">{item.date}</p>
                  
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-2xl flex items-center justify-center ${styles.bg} ${styles.text} shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} />
                  </div>
                  
                  <h4 className="text-xs font-black text-gray-900 mb-1">{item.shift}</h4>
                  <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-gray-400 mb-4">
                    <Clock size={10} />
                    {item.time}
                  </div>
                  
                  <span className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                    item.status === 'Present' ? 'bg-green-50 text-green-600' :
                    item.status === 'On Leave' ? 'bg-red-50 text-red-600' :
                    item.status === 'Upcoming' ? 'bg-blue-50 text-blue-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {item.status}
                  </span>
                </div>

                {/* Hover Background Pattern */}
                <div className={`absolute -bottom-6 -right-6 w-16 h-16 rounded-full opacity-0 group-hover:opacity-10 transition-opacity blur-xl ${styles.bg}`}></div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side - Calendar & Activity */}
        <div className="lg:col-span-7 space-y-8">
          {/* Calendar Section */}
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-50">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-900">{months[currentMonthIndex]}</h3>
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
                <span key={day} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{day}</span>
              ))}
              
              {/* Previous Month Days (Grayed out) */}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`prev-${i}`} className="flex items-center justify-center">
                  <span className="text-gray-200 py-2 sm:py-3 text-xs sm:text-sm font-bold opacity-30">
                    {prevMonthDays - startDay + i + 1}
                  </span>
                </div>
              ))}
              
              {/* Current Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isPresent = presentDays.includes(day);
                const isAbsent = absentDays.includes(day);
                const isSunday = (startDay + i) % 7 === 6;
                
                return (
                  <div key={day} className="flex items-center justify-center">
                    <span className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-xs sm:text-sm font-black transition-all rounded-full ${
                      isPresent ? 'border-2 border-[#22C55E] text-[#22C55E]' : 
                      isAbsent ? 'border-2 border-[#EF4444] text-[#EF4444]' : 
                      isSunday ? 'border-2 border-blue-500 text-blue-500 bg-blue-50/30' :
                      'text-gray-600 hover:bg-gray-50 cursor-pointer'
                    }`}>
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Activity Section */}
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-50">
            <h3 className="text-lg font-black text-gray-800 mb-6 tracking-tight">Today's Activity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 bg-gray-50/50 p-6 rounded-[24px] border border-gray-100 group transition-all">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-[#22C55E] shadow-inner group-hover:scale-105 transition-transform">
                  <LogIn size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Check-in</p>
                  <h3 className="text-xl font-black text-gray-900">09:30 AM</h3>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-gray-50/50 p-6 rounded-[24px] border border-gray-100 group transition-all">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-[#EF4444] shadow-inner group-hover:scale-105 transition-transform">
                  <LogOut size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Check-out</p>
                  <h3 className="text-xl font-black text-gray-900">05:30 PM</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - History */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-50 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-xl font-black text-gray-800 tracking-tight">Recent History</h2>
               <button className="text-[11px] font-black text-blue-600 hover:underline uppercase tracking-widest">View All</button>
            </div>

            <div className="space-y-4 flex-1">
              {history.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-[24px] border border-gray-50 group hover:border-blue-100 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm border border-gray-100">
                      <CalendarIcon size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900">{item.date}</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    item.status === 'Present' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <button className="w-full bg-[#2563EB] text-white py-4 rounded-[20px] font-black flex items-center justify-center gap-3 shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all transform hover:-translate-y-1 active:scale-95 mt-8">
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
