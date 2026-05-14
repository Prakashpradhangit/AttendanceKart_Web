import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Send, 
  Plus,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  Upload,
  CalendarDays,
  Info
} from 'lucide-react';

const EmployeeLeaves = () => {
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [leaveDuration, setLeaveDuration] = useState('Full Day');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);



  const leaveStats = [
    { label: 'Total Leaves', value: '24', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Used Leaves', value: '06', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { label: 'Remaining', value: '18', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
  ];

  const leaveHistory = [
    { type: 'Sick Leave', duration: '12 May - 14 May', days: '3 Days', status: 'Approved', requestedOn: '10 May 2026' },
    { type: 'Casual Leave', duration: '20 April - 20 April', days: '1 Day', status: 'Approved', requestedOn: '18 April 2026' },
    { type: 'Sick Leave', duration: '05 April - 06 April', days: '2 Days', status: 'Rejected', requestedOn: '02 April 2026' },
    { type: 'Annual Leave', duration: '15 March - 20 March', days: '6 Days', status: 'Approved', requestedOn: '10 March 2026' },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Leave Management</h1>
          <p className="text-sm text-gray-400 font-medium mt-1">Request time off and track your leave balances</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-white border border-gray-200 rounded-2xl text-[11px] font-bold text-gray-700 uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
            Leave Policy
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {leaveStats.map((stat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.bg} ${stat.border} border p-6 rounded-[32px] shadow-sm flex items-center justify-between group hover:shadow-lg transition-all`}
          >
            <div>
              <p className={`text-[10px] font-bold ${stat.color} opacity-60 uppercase tracking-widest mb-1`}>{stat.label}</p>
              <h3 className={`text-3xl font-bold ${stat.color}`}>{stat.value}</h3>
            </div>
            <div className="w-14 h-14 bg-white/60 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <stat.icon size={28} className={stat.color} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side - History Table (8 Columns) */}
        <div className="lg:col-span-8 bg-white rounded-[40px] p-8 shadow-sm border border-gray-50 overflow-hidden">
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">Recent Leave Requests</h2>
            <div className="flex gap-2">
              <button className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-all">Filter</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="pb-4 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                  <th className="pb-4 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration</th>
                  <th className="pb-4 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Days</th>
                  <th className="pb-4 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                  <th className="pb-4 px-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leaveHistory.map((leave, index) => (
                  <tr key={index} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-5 px-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          leave.type === 'Sick Leave' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                        }`}>
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{leave.type}</p>
                          <p className="text-[9px] font-semibold text-gray-400 uppercase">Requested: {leave.requestedOn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-2">
                      <p className="text-sm font-semibold text-gray-700">{leave.duration}</p>
                    </td>
                    <td className="py-5 px-2">
                      <p className="text-sm font-bold text-gray-900">{leave.days}</p>
                    </td>
                    <td className="py-5 px-2 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest inline-block ${
                        leave.status === 'Approved' ? 'bg-green-50 text-green-600' : 
                        leave.status === 'Rejected' ? 'bg-red-50 text-red-600' : 
                        'bg-yellow-50 text-yellow-600'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="py-5 px-2 text-right">
                      <button className="p-2 text-gray-300 hover:text-gray-600 rounded-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side - Form (4 Columns) */}
        <div className="lg:col-span-4 bg-[#1E293B] rounded-[40px] p-8 shadow-xl text-white relative overflow-hidden min-h-[600px] flex flex-col">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative z-10 flex flex-col h-full"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                <Plus size={20} className="text-blue-400" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Apply for Leave</h2>
            </div>

            <form className="space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Leave Type</label>
                  <select 
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-semibold outline-none focus:border-blue-400 transition-all cursor-pointer appearance-none"
                  >
                    <option className="bg-[#1E293B]">Sick Leave</option>
                    <option className="bg-[#1E293B]">Casual Leave</option>
                    <option className="bg-[#1E293B]">Annual Leave</option>
                    <option className="bg-[#1E293B]">Half Day</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Duration</label>
                  <select 
                    value={leaveDuration}
                    onChange={(e) => setLeaveDuration(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-semibold outline-none focus:border-blue-400 transition-all cursor-pointer appearance-none"
                  >
                    <option className="bg-[#1E293B]">Full Day</option>
                    <option className="bg-[#1E293B]">First Half</option>
                    <option className="bg-[#1E293B]">Second Half</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">
                    {leaveDuration === 'Full Day' ? 'From Date' : 'Date'}
                  </label>
                  <input type="date" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-semibold outline-none focus:border-blue-400 transition-all [color-scheme:dark]" />
                </div>
                {leaveDuration === 'Full Day' ? (
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">To Date</label>
                    <input type="date" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-semibold outline-none focus:border-blue-400 transition-all [color-scheme:dark]" />
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Select Time</label>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5">
                      <Clock size={16} className="text-blue-400" />
                      <input type="time" className="bg-transparent border-none outline-none text-xs font-semibold w-full [color-scheme:dark]" />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Attach Documents (Optional)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  <div className="w-full bg-white/5 border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center gap-2 group-hover:border-blue-400/50 transition-all">
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                      <Upload size={18} className="text-white/40 group-hover:text-blue-400" />
                    </div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest group-hover:text-white transition-colors">Click to upload doc</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Reason</label>
                <textarea 
                  placeholder="Tell us why you need this leave..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-semibold outline-none focus:border-blue-400 transition-all min-h-[100px] resize-none"
                ></textarea>
              </div>

              <button 
                type="button"
                onClick={() => setShowSuccessPopup(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[24px] font-bold text-sm uppercase tracking-widest shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 mt-4"
              >
                <Send size={18} />
                Submit Request
              </button>
            </form>

            <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-3">
              <AlertCircle size={20} className="text-yellow-500 shrink-0" />
              <p className="text-[10px] font-medium text-white/60 leading-relaxed">
                Requests should be submitted at least 2 days in advance for approval.
              </p>
            </div>
          </motion.div>
          
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>
        </div>
      </div>

      {/* Success Modal - Centered in main viewport */}
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
                  <Send size={44} className="text-[#0052CC] -rotate-12 translate-x-1" />
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
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Request sent to admin</h2>
              <p className="text-sm font-medium text-gray-500 mb-8 leading-relaxed px-4">
                Your request for the leave <span className="text-[#0052CC] font-semibold">({leaveType})</span> has been sent successfully.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full bg-blue-50/80 border border-blue-100 rounded-3xl p-5 mb-10 flex items-start gap-4 text-left"
            >
              <div className="w-7 h-7 bg-[#0052CC] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
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
              className="w-full bg-gradient-to-r from-[#0052CC] to-[#0747A6] text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-2xl shadow-blue-200 transition-all"
              onClick={() => setShowSuccessPopup(false)}
            >
              OK, Got it
            </motion.button>
            
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0052CC] via-blue-400 to-[#0052CC]"></div>
          </motion.div>
        </div>
      )}
    </div>
  );
};




export default EmployeeLeaves;
