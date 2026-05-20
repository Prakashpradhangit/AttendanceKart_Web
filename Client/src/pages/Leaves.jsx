import React, { useState, useEffect } from 'react';
import { 
  FileText, Clock, CheckCircle, XCircle, Search, Filter, 
  Download, Calendar as CalendarIcon, ChevronLeft, ChevronRight,
  MoreVertical, Check, X, ChevronDown, BookOpen, Briefcase, RefreshCw, BarChart2,
  FileSpreadsheet
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { leaveStats, leaveRecords, leaveDistribution } from '../utils/mockData';

const Leaves = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedLeaves, setSelectedLeaves] = useState([]);
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [limits, setLimits] = useState({ sick: 12, casual: 12, emergency: 6, accrualRate: 1.5, holidays: [] });

  const fetchLimits = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLimits({
          sick: data.sickLeavesLimit !== undefined ? data.sickLeavesLimit : 12,
          casual: data.casualLeavesLimit !== undefined ? data.casualLeavesLimit : 12,
          emergency: data.emergencyLeavesLimit !== undefined ? data.emergencyLeavesLimit : 6,
          accrualRate: data.monthlyAccrualRate !== undefined ? data.monthlyAccrualRate : 1.5,
          holidays: (() => {
            try {
              return data.declaredHolidays ? JSON.parse(data.declaredHolidays) : [];
            } catch (e) {
              return [];
            }
          })()
        });
      }
    } catch (err) {
      console.error('Failed to fetch limits:', err);
    }
  };

  const calculateLeaveDays = (fromDateStr, toDateStr, duration) => {
    if (duration !== 'Full Day') return 0.5;
    if (!fromDateStr || !toDateStr) return 1.0;
    
    // YYYY-MM-DD parsing in UTC
    const start = new Date(fromDateStr);
    const end = new Date(toDateStr);
    let count = 0;
    
    let current = new Date(start);
    while (current <= end) {
      const day = current.getUTCDay();
      const dateStr = current.toISOString().split('T')[0];
      
      const isWeekend = (day === 0 || day === 6); // 0 = Sunday, 6 = Saturday
      const isHoliday = limits.holidays && limits.holidays.some(h => h.date === dateStr);
      
      if (!isWeekend && !isHoliday) {
        count++;
      }
      current.setUTCDate(current.getUTCDate() + 1);
    }
    return count;
  };

  const fetchAllLeaves = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/leaves/admin/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeaveRecords(data);
      }
    } catch (err) {
      console.error('Fetch all leaves error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLeaves();
    fetchLimits();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/leaves/admin/${id}/status?status=${status}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAllLeaves();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const filteredLeaves = leaveRecords.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (record.userId && String(record.userId).toLowerCase().includes(searchLower)) ||
      (record.employeeName && record.employeeName.toLowerCase().includes(searchLower)) ||
      (record.employeeCode && record.employeeCode.toLowerCase().includes(searchLower)) ||
      (record.leaveType && record.leaveType.toLowerCase().includes(searchLower)) ||
      (record.reason && record.reason.toLowerCase().includes(searchLower));
    const matchesType = leaveTypeFilter === 'All' || record.leaveType === leaveTypeFilter;
    const matchesStatus = statusFilter === 'All' || record.status === statusFilter.toUpperCase();
    return matchesSearch && matchesType && matchesStatus;
  });

  const pendingCount = leaveRecords.filter(l => l.status === 'PENDING').length;
  const approvedCount = leaveRecords.filter(l => l.status === 'APPROVED').length;
  const rejectedCount = leaveRecords.filter(l => l.status === 'REJECTED').length;

  const leaveStats = [
    { id: 1, title: 'Total Requests', value: leaveRecords.length, icon: 'file-text', color: 'bg-blue-50 text-blue-600' },
    { id: 2, title: 'Pending Approval', value: pendingCount, icon: 'clock', color: 'bg-amber-50 text-amber-600' },
    { id: 3, title: 'Approved', value: approvedCount, icon: 'check-circle', color: 'bg-green-50 text-green-600' },
    { id: 4, title: 'Rejected', value: rejectedCount, icon: 'x-circle', color: 'bg-rose-50 text-rose-600' },
  ];

  // Handle Select All
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeaves(filteredLeaves.map(record => record.id));
    } else {
      setSelectedLeaves([]);
    }
  };

  // Handle individual selection
  const handleSelectLeave = (e, id) => {
    if (e.target.checked) {
      setSelectedLeaves([...selectedLeaves, id]);
    } else {
      setSelectedLeaves(selectedLeaves.filter(leaveId => leaveId !== id));
    }
  };

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1 w-max"><CheckCircle className="w-3 h-3" /> Approved</span>;
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 flex items-center gap-1 w-max"><Clock className="w-3 h-3" /> Pending</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1 w-max"><XCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  // Type Badge Component
  const TypeBadge = ({ type }) => {
    switch (type) {
      case 'Sick Leave':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100 whitespace-nowrap">{type}</span>;
      case 'Casual Leave':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100 whitespace-nowrap">{type}</span>;
      case 'Annual Leave':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100 whitespace-nowrap">{type}</span>;
      case 'Emergency Leave':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200 whitespace-nowrap">{type}</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 whitespace-nowrap">{type || 'Unknown'}</span>;
    }
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'file-text': return <FileText className="w-6 h-6" />;
      case 'clock': return <Clock className="w-6 h-6" />;
      case 'check-circle': return <CheckCircle className="w-6 h-6" />;
      case 'x-circle': return <XCircle className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto bg-gray-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Leave Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and track employee leave requests</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg shadow-sm transition-all duration-200">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {leaveStats.map((stat) => (
          <div key={stat.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <h3 className="text-3xl font-semibold text-gray-900 mt-2">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                {getIcon(stat.icon)}
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Updated just now</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Filters & Actions Bar */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex flex-col lg:flex-row justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by ID or type..."
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full md:w-64 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    value={leaveTypeFilter}
                    onChange={(e) => setLeaveTypeFilter(e.target.value)}
                  >
                    <option value="All">All Leave Types</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Annual Leave">Annual Leave</option>
                  </select>
                  <select 
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {setSearchTerm(''); setLeaveTypeFilter('All'); setStatusFilter('All');}}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" /> Reset
                </button>
              </div>
            </div>
          </div>

          {/* Leave Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="py-4 px-4 w-12">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        onChange={handleSelectAll}
                        checked={selectedLeaves.length === filteredLeaves.length && filteredLeaves.length > 0}
                      />
                    </th>
                    <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Type</th>
                    <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeaves.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-3 px-4">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          checked={selectedLeaves.includes(record.id)}
                          onChange={(e) => handleSelectLeave(e, record.id)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-indigo-100 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
                            {record.employeeName ? record.employeeName.charAt(0).toUpperCase() : 'E'}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 leading-tight">{record.employeeName || 'Unknown Employee'}</div>
                            <div className="text-xs text-indigo-500 font-mono mt-0.5">{record.employeeCode || `ID: ${record.userId}`}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4"><TypeBadge type={record.leaveType} /></td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          record.leaveCategory === 'LOP' 
                            ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                            : 'bg-green-50 text-green-600 border border-green-100'
                        }`}>
                          {record.leaveCategory || 'Paid'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        <div className="font-medium text-gray-800">{record.duration}</div>
                        <div className="text-[10px] font-extrabold text-indigo-600 uppercase mt-0.5 tracking-wider">
                          {calculateLeaveDays(record.fromDate, record.toDate, record.duration)} Work Days
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <CalendarIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span className="font-medium">
                            {record.fromDate === record.toDate ? record.fromDate : `${record.fromDate} - ${record.toDate}`}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div 
                          className="max-w-[220px] text-sm text-gray-700 truncate" 
                          title={record.reason}
                        >
                          {record.reason || <span className="text-gray-300 italic text-xs">No reason provided</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4"><StatusBadge status={record.status} /></td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center items-center gap-2">
                          {record.status === 'PENDING' && (
                            <>
                              <button 
                                onClick={() => handleStatusUpdate(record.id, 'APPROVED')}
                                className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors border border-green-100" 
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(record.id, 'REJECTED')}
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors border border-red-100" 
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredLeaves.length === 0 && (
                      <tr>
                          <td colSpan="9" className="py-12 text-center text-gray-400 font-medium">No leave requests found</td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaves;
