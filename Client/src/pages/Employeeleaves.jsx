import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, CheckCircle2, FileText, Send, Plus, AlertCircle,
  X, RefreshCw, DollarSign, Thermometer, Briefcase, Zap, ChevronRight,
  CalendarDays, ArrowRight, Trash2
} from 'lucide-react';

const LEAVE_TYPES = [
  { value: 'Sick Leave', label: 'Sick Leave', icon: Thermometer, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', selectedBg: 'bg-red-600', desc: 'Medical/health related' },
  { value: 'Casual Leave', label: 'Casual Leave', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', selectedBg: 'bg-blue-600', desc: 'Personal matters' },
  { value: 'Emergency Leave', label: 'Emergency Leave', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', selectedBg: 'bg-purple-600', desc: 'Urgent situations' },
];

const DURATION_OPTIONS = [
  { value: 'Full Day', label: 'Full Day' },
  { value: 'First Half', label: 'First Half' },
  { value: 'Second Half', label: 'Second Half' },
];

const StatusPill = ({ status }) => {
  const map = {
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    PENDING: 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

const EmployeeLeaves = () => {
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [leaveCategory, setLeaveCategory] = useState('Paid');
  const [leaveDuration, setLeaveDuration] = useState('Full Day');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [profile, setProfile] = useState(null);
  const [limits, setLimits] = useState({ sick: 12, casual: 12, emergency: 6, accrualRate: 1.5, holidays: [] });

  const fetchMyLeaves = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/leaves/my', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setLeaveHistory(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchLimits = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/settings', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setLimits({
          sick: data.sickLeavesLimit ?? 12,
          casual: data.casualLeavesLimit ?? 12,
          emergency: data.emergencyLeavesLimit ?? 6,
          accrualRate: data.monthlyAccrualRate ?? 1.5,
          holidays: (() => { try { return data.declaredHolidays ? JSON.parse(data.declaredHolidays) : []; } catch { return []; } })()
        });
      }
    } catch (err) { console.error(err); }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/profile', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setProfile(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchMyLeaves(); fetchLimits(); fetchProfile(); }, []);

  const calcLeaveDays = (from, to, duration) => {
    if (duration !== 'Full Day') return 0.5;
    if (!from || !to) return 0;
    let count = 0;
    let cur = new Date(from);
    const end = new Date(to);
    while (cur <= end) {
      const day = cur.getUTCDay();
      const ds = cur.toISOString().split('T')[0];
      const isWeekend = day === 0 || day === 6;
      const isHoliday = limits.holidays?.some(h => h.date === ds);
      if (!isWeekend && !isHoliday) count++;
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return count;
  };

  const joinDateStr = profile?.joiningDate;
  const now = new Date();
  let monthsElapsed = 1;
  if (joinDateStr) {
    const join = new Date(joinDateStr);
    const diff = (now.getFullYear() - join.getFullYear()) * 12 + (now.getMonth() - join.getMonth());
    monthsElapsed = Math.max(1, diff + 1);
  }
  const accruedAllowance = Math.round(monthsElapsed * (limits.accrualRate || 1.5) * 10) / 10;
  const approved = leaveHistory.filter(l => l.status === 'APPROVED');
  const usedSick = approved.filter(l => l.leaveType === 'Sick Leave' && l.leaveCategory !== 'LOP').reduce((s, l) => s + calcLeaveDays(l.fromDate, l.toDate, l.duration), 0);
  const usedCasual = approved.filter(l => l.leaveType === 'Casual Leave' && l.leaveCategory !== 'LOP').reduce((s, l) => s + calcLeaveDays(l.fromDate, l.toDate, l.duration), 0);
  const usedEmergency = approved.filter(l => l.leaveType === 'Emergency Leave' && l.leaveCategory !== 'LOP').reduce((s, l) => s + calcLeaveDays(l.fromDate, l.toDate, l.duration), 0);
  const usedLop = approved.filter(l => l.leaveCategory === 'LOP').reduce((s, l) => s + calcLeaveDays(l.fromDate, l.toDate, l.duration), 0);
  const totalPaidUsed = usedSick + usedCasual + usedEmergency;
  const remainingPaid = Math.max(0, accruedAllowance - totalPaidUsed);
  const previewDays = calcLeaveDays(fromDate, leaveDuration === 'Full Day' ? (toDate || fromDate) : fromDate, leaveDuration);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const actualDays = calcLeaveDays(fromDate, leaveDuration === 'Full Day' ? toDate : fromDate, leaveDuration);
    if (actualDays <= 0) { alert('Leave duration contains 0 working days. Please pick different dates.'); return; }
    if (leaveCategory === 'Paid' && actualDays > remainingPaid) { alert(`Insufficient paid leave balance! Requested: ${actualDays} days, Available: ${remainingPaid} days.`); return; }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ leaveType, leaveCategory, duration: leaveDuration, fromDate, toDate: leaveDuration === 'Full Day' ? toDate : fromDate, reason, status: 'PENDING' })
      });
      if (res.ok) {
        setShowSuccess(true);
        setFromDate(''); setToDate(''); setReason('');
        fetchMyLeaves();
        setTimeout(() => setShowSuccess(false), 3500);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to apply leave');
      }
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this leave request?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/leaves/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) fetchMyLeaves();
    } catch (err) { console.error(err); }
  };

  const selectedType = LEAVE_TYPES.find(t => t.value === leaveType);

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Leave Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Apply for time off · Track requests · View balances
            {profile?.joiningDate && (
              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold">
                Joined {profile.joiningDate}
              </span>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 font-medium">Accrual Rate</p>
          <p className="text-sm font-bold text-indigo-600">{limits.accrualRate} days/month</p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Accrued Balance', value: accruedAllowance, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', sub: 'Total earned' },
          { label: 'Paid Used', value: totalPaidUsed, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', sub: 'All paid leaves' },
          { label: 'Remaining Paid', value: remainingPaid, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', sub: 'Available now' },
          { label: 'LOP Used', value: usedLop, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', sub: 'Loss of pay' },
        ].map((card, i) => (
          <div key={i} className={`${card.bg} ${card.border} border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow`}>
            <p className={`text-xs font-bold uppercase tracking-widest ${card.color} opacity-70 mb-1`}>{card.label}</p>
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Leave Pool Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Sick Leave', used: usedSick, limit: limits.sick, color: 'bg-red-500', trackColor: 'bg-red-100' },
          { label: 'Casual Leave', used: usedCasual, limit: limits.casual, color: 'bg-blue-500', trackColor: 'bg-blue-100' },
          { label: 'Emergency Leave', used: usedEmergency, limit: limits.emergency, color: 'bg-purple-500', trackColor: 'bg-purple-100' },
        ].map((pool, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{pool.label}</p>
              <span className="text-xs font-semibold text-gray-400">{pool.used} / {pool.limit} days</span>
            </div>
            <div className={`w-full ${pool.trackColor} h-2.5 rounded-full overflow-hidden`}>
              <div
                className={`${pool.color} h-full rounded-full transition-all duration-700`}
                style={{ width: `${Math.min(100, (pool.used / pool.limit) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">{Math.max(0, pool.limit - pool.used)} days remaining</p>
          </div>
        ))}
      </div>

      {/* Main: Apply Form + History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Apply Form */}
        <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-7 py-6 border-b border-gray-50 flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Plus size={18} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Apply for Leave</h2>
              <p className="text-xs text-gray-400">Fill in the details below</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-7 py-6 space-y-6">

            {/* Leave Type Cards */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Leave Type</label>
              <div className="grid grid-cols-3 gap-2">
                {LEAVE_TYPES.map(type => {
                  const Icon = type.icon;
                  const isSelected = leaveType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setLeaveType(type.value)}
                      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 text-center ${
                        isSelected
                          ? `${type.selectedBg} border-transparent text-white shadow-md scale-105`
                          : `${type.bg} ${type.border} ${type.color} hover:scale-102 hover:shadow-sm`
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-[10px] font-bold leading-tight">{type.label}</span>
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow">
                          <CheckCircle2 size={12} className={type.color} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Leave Category Toggle */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Category</label>
              <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                {['Paid', 'LOP'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setLeaveCategory(cat)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      leaveCategory === cat
                        ? cat === 'LOP' ? 'bg-amber-500 text-white shadow' : 'bg-indigo-600 text-white shadow'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {cat === 'LOP' ? 'Loss of Pay (LOP)' : 'Paid Leave'}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Duration</label>
              <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                {DURATION_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setLeaveDuration(opt.value)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      leaveDuration === opt.value
                        ? 'bg-white text-gray-900 shadow border border-gray-100'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Pickers */}
            <div className={`grid gap-4 ${leaveDuration === 'Full Day' ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
                  {leaveDuration === 'Full Day' ? 'From Date' : 'Date'}
                </label>
                <input
                  type="date"
                  required
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 transition-all"
                />
              </div>
              {leaveDuration === 'Full Day' && (
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">To Date</label>
                  <input
                    type="date"
                    required
                    value={toDate}
                    min={fromDate}
                    onChange={e => setToDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Live Preview Badge */}
            {fromDate && (
              <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${selectedType?.bg} ${selectedType?.border}`}>
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className={selectedType?.color} />
                  <span className={`text-sm font-semibold ${selectedType?.color}`}>{selectedType?.label}</span>
                  <span className="text-gray-400 text-xs">·</span>
                  <span className="text-xs text-gray-500">{leaveCategory}</span>
                </div>
                <span className={`text-lg font-bold ${selectedType?.color}`}>
                  {previewDays} <span className="text-xs font-normal">day{previewDays !== 1 ? 's' : ''}</span>
                </span>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Reason</label>
              <textarea
                required
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Briefly describe why you need this leave..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 resize-none transition-all"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-200 transition-all duration-200 disabled:opacity-60"
            >
              {submitting ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
              {submitting ? 'Submitting...' : 'Submit Leave Request'}
            </button>

            {/* Notice */}
            <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 rounded-xl border border-amber-100">
              <AlertCircle size={15} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 leading-relaxed">Submit requests at least 2 days in advance for timely approval.</p>
            </div>
          </form>
        </div>

        {/* History Table */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-7 py-6 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">My Leave Requests</h2>
              <p className="text-xs text-gray-400 mt-0.5">{leaveHistory.length} total · {leaveHistory.filter(l => l.status === 'PENDING').length} pending</p>
            </div>
            <button onClick={fetchMyLeaves} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100">
                  <th className="py-3 px-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                  <th className="py-3 px-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dates</th>
                  <th className="py-3 px-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Days</th>
                  <th className="py-3 px-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reason</th>
                  <th className="py-3 px-5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="py-3 px-4 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leaveHistory.map((leave, i) => {
                  const typeInfo = LEAVE_TYPES.find(t => t.value === leave.leaveType);
                  const Icon = typeInfo?.icon || FileText;
                  const days = calcLeaveDays(leave.fromDate, leave.toDate, leave.duration);
                  return (
                    <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeInfo?.bg || 'bg-gray-50'}`}>
                            <Icon size={15} className={typeInfo?.color || 'text-gray-500'} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 leading-tight">{leave.leaveType}</p>
                            <p className={`text-[10px] font-bold uppercase ${leave.leaveCategory === 'LOP' ? 'text-amber-500' : 'text-green-600'}`}>
                              {leave.leaveCategory || 'Paid'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <p className="text-sm font-medium text-gray-700">
                          {leave.fromDate === leave.toDate ? leave.fromDate : `${leave.fromDate} – ${leave.toDate}`}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{leave.duration}</p>
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-sm font-bold text-gray-800">{days}</span>
                        <span className="text-xs text-gray-400 ml-1">day{days !== 1 ? 's' : ''}</span>
                      </td>
                      <td className="py-4 px-5">
                        <p className="text-xs text-gray-600 max-w-[140px] truncate" title={leave.reason}>{leave.reason || '—'}</p>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <StatusPill status={leave.status} />
                      </td>
                      <td className="py-4 px-4">
                        {leave.status === 'PENDING' && (
                          <button
                            onClick={() => handleDelete(leave.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Cancel"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {leaveHistory.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-14 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-300">
                        <FileText size={36} />
                        <p className="text-sm font-medium text-gray-400">No leave requests yet</p>
                        <p className="text-xs">Apply for your first leave using the form</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-600 text-white px-5 py-4 rounded-2xl shadow-2xl shadow-green-200 animate-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 size={20} />
          <div>
            <p className="font-bold text-sm">Request Submitted!</p>
            <p className="text-xs text-green-100">Your leave request has been sent to admin.</p>
          </div>
          <button onClick={() => setShowSuccess(false)} className="ml-2 text-green-200 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeaves;