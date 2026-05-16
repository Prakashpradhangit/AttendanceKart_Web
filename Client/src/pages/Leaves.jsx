import React, { useState } from 'react';
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

  React.useEffect(() => {
    fetchAllLeaves();
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
    const matchesSearch = record.userId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         record.leaveType?.toLowerCase().includes(searchTerm.toLowerCase());
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
        return <span className="px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">{type}</span>;
      case 'Casual Leave':
        return <span className="px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-600 border border-green-200">{type}</span>;
      case 'Annual Leave':
        return <span className="px-2 py-1 rounded text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">{type}</span>;
      default:
        return <span className="px-2 py-1 rounded text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-200">{type}</span>;
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

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main Content (Left) */}
        <div className="flex-1 space-y-6">
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
                    <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User ID</th>
                    <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Type</th>
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
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{record.userId}</td>
                      <td className="py-3 px-4"><TypeBadge type={record.leaveType} /></td>
                      <td className="py-3 px-4 text-sm text-gray-600">{record.duration}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {record.fromDate === record.toDate ? record.fromDate : `${record.fromDate} - ${record.toDate}`}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 max-w-[150px] truncate" title={record.reason}>{record.reason}</td>
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
                          <td colSpan="8" className="py-10 text-center text-gray-400">No leave requests found</td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Distribution */}
        <div className="w-full xl:w-80 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-500" />
              Distribution
            </h3>
            <div className="mt-4 space-y-3">
               <div className="flex items-center justify-between text-sm">
                   <span className="text-gray-600">Pending</span>
                   <span className="font-medium text-amber-600">{pendingCount}</span>
               </div>
               <div className="flex items-center justify-between text-sm">
                   <span className="text-gray-600">Approved</span>
                   <span className="font-medium text-green-600">{approvedCount}</span>
               </div>
               <div className="flex items-center justify-between text-sm">
                   <span className="text-gray-600">Rejected</span>
                   <span className="font-medium text-rose-600">{rejectedCount}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaves;
