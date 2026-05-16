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
  Info,
  X,
  RefreshCw
} from 'lucide-react';

const EmployeeLeaves = () => {
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [leaveDuration, setLeaveDuration] = useState('Full Day');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const fetchMyLeaves = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/leaves/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeaveHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMyLeaves();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/leaves/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          leaveType,
          duration: leaveDuration,
          fromDate,
          toDate: leaveDuration === 'Full Day' ? toDate : fromDate,
          reason,
          status: 'PENDING'
        })
      });

      if (res.ok) {
        setShowSuccessPopup(true);
        setFromDate('');
        setToDate('');
        setReason('');
        fetchMyLeaves();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to apply leave');
      }
    } catch (err) {
      console.error('Apply leave error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leave request?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/leaves/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchMyLeaves();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete leave');
      }
    } catch (err) {
      console.error('Delete leave error:', err);
    }
  };

  const approvedLeaves = leaveHistory.filter(l => l.status === 'APPROVED');
  const usedDays = approvedLeaves.reduce((acc, curr) => {
      if (curr.duration === 'Full Day') {
          const start = new Date(curr.fromDate);
          const end = new Date(curr.toDate);
          const diffTime = Math.abs(end - start);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          return acc + diffDays;
      }
      return acc + 0.5;
  }, 0);

  const leaveStats = [
    { label: 'Total Leaves', value: '24', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Used Leaves', value: usedDays.toString().padStart(2, '0'), icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { label: 'Remaining', value: (24 - usedDays).toString().padStart(2, '0'), icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
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
                  <th className="pb-4 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                  <th className="pb-4 px-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leaveHistory.map((leave, index) => (
                  <tr key={index} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-5 px-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${leave.leaveType === 'Sick Leave' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                          }`}>
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{leave.leaveType}</p>
                          <p className="text-[9px] font-semibold text-gray-400 uppercase">Type: {leave.duration}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-2">
                      <p className="text-sm font-semibold text-gray-700">
                        {leave.fromDate === leave.toDate ? leave.fromDate : `${leave.fromDate} - ${leave.toDate}`}
                      </p>
                    </td>
                    <td className="py-5 px-2 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest inline-block ${leave.status === 'APPROVED' ? 'bg-green-50 text-green-600' :
                          leave.status === 'REJECTED' ? 'bg-red-50 text-red-600' :
                            'bg-yellow-50 text-yellow-600'
                        }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="py-5 px-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                         {leave.status === 'PENDING' && (
                             <button 
                               onClick={() => handleDelete(leave.id)}
                               className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                             >
                               <X size={18} />
                             </button>
                         )}
                        <button className="p-2 text-gray-300 hover:text-gray-600 rounded-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {leaveHistory.length === 0 && (
                    <tr>
                        <td colSpan="4" className="py-10 text-center text-gray-400 text-sm">No leave requests found</td>
                    </tr>
                )}
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

            <form onSubmit={handleSubmit} className="space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Leave Type</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-semibold outline-none focus:border-blue-400 transition-all cursor-pointer appearance-none"
                  >
                    <option className="bg-[#1E293B]" value="Sick Leave">Sick Leave</option>
                    <option className="bg-[#1E293B]" value="Casual Leave">Casual Leave</option>
                    <option className="bg-[#1E293B]" value="Annual Leave">Annual Leave</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Duration</label>
                  <select
                    value={leaveDuration}
                    onChange={(e) => setLeaveDuration(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-semibold outline-none focus:border-blue-400 transition-all cursor-pointer appearance-none"
                  >
                    <option className="bg-[#1E293B]" value="Full Day">Full Day</option>
                    <option className="bg-[#1E293B]" value="First Half">First Half</option>
                    <option className="bg-[#1E293B]" value="Second Half">Second Half</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">
                    {leaveDuration === 'Full Day' ? 'From Date' : 'Date'}
                  </label>
                  <input 
                    type="date" 
                    required
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-semibold outline-none focus:border-blue-400 transition-all [color-scheme:dark]" 
                  />
                </div>
                {leaveDuration === 'Full Day' ? (
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">To Date</label>
                    <input 
                        type="date" 
                        required
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-semibold outline-none focus:border-blue-400 transition-all [color-scheme:dark]" 
                    />
                  </div>
                ) : null}
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Reason</label>
                <textarea
                  placeholder="Tell us why you need this leave..."
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-semibold outline-none focus:border-blue-400 transition-all min-h-[100px] resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[24px] font-bold text-sm uppercase tracking-widest shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 mt-4 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                {loading ? 'Submitting...' : 'Submit Request'}
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

      {/* Success Modal */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-[48px] shadow-2xl w-full max-w-[360px] overflow-hidden p-10 flex flex-col items-center text-center relative border border-white/20"
          >
            <div className="relative mb-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center relative"
              >
                <Send size={44} className="text-[#0052CC]" />
              </motion.div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Request sent to admin</h2>
            <p className="text-sm font-medium text-gray-500 mb-8 leading-relaxed px-4">
              Your leave request has been sent successfully.
            </p>

            <button
              className="w-full bg-[#0052CC] text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-2xl shadow-blue-200 transition-all"
              onClick={() => setShowSuccessPopup(false)}
            >
              OK, Got it
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeaves;