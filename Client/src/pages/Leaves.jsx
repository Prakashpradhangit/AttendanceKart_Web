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

  // Handle Select All
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeaves(leaveRecords.map(record => record.id));
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
      case 'Approved':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1 w-max"><CheckCircle className="w-3 h-3" /> Approved</span>;
      case 'Pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 flex items-center gap-1 w-max"><Clock className="w-3 h-3" /> Pending</span>;
      case 'Rejected':
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
          <button className="btn-secondary flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg shadow-sm transition-all duration-200">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
          <button className="bg-primary text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm transition-all duration-200">
            <CalendarIcon className="w-4 h-4" />
            <span>Apply Leave</span>
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
                    placeholder="Search by name or ID..."
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
                  <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-white cursor-pointer hover:bg-gray-50">
                    <CalendarIcon className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700">This Month</span>
                    <ChevronDown className="w-4 h-4 text-gray-500 ml-2" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm">
                  <RefreshCw className="w-4 h-4" /> Reset
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
                  <Filter className="w-4 h-4" /> Filter
                </button>
              </div>
            </div>

            {/* Bulk Actions (visible only when items selected) */}
            {selectedLeaves.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between bg-indigo-50/50 -mx-4 -mb-4 px-4 py-3 rounded-b-xl border-b">
                <span className="text-sm font-medium text-indigo-900">
                  {selectedLeaves.length} requests selected
                </span>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors shadow-sm">
                    <X className="w-4 h-4" /> Reject Selected
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                    <Check className="w-4 h-4" /> Approve Selected
                  </button>
                </div>
              </div>
            )}
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
                        checked={selectedLeaves.length === leaveRecords.length && leaveRecords.length > 0}
                      />
                    </th>
                    <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Type</th>
                    <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Days</th>
                    <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applied On</th>
                    <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leaveRecords.map((record) => (
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
                          <img src={record.avatar} alt={record.name} className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{record.name}</p>
                            <p className="text-xs text-gray-500">{record.empId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4"><TypeBadge type={record.type} /></td>
                      <td className="py-3 px-4 text-sm text-gray-600">{record.duration}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-700">{record.days}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 max-w-[150px] truncate" title={record.reason}>{record.reason}</td>
                      <td className="py-3 px-4"><StatusBadge status={record.status} /></td>
                      <td className="py-3 px-4 text-sm text-gray-500">{record.appliedOn}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {record.status === 'Pending' && (
                            <>
                              <button className="p-1 rounded text-green-600 hover:bg-green-50 transition-colors" title="Approve">
                                <Check className="w-4 h-4" />
                              </button>
                              <button className="p-1 rounded text-red-600 hover:bg-red-50 transition-colors" title="Reject">
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
              <span className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-900">1</span> to <span className="font-medium text-gray-900">6</span> of <span className="font-medium text-gray-900">128</span> entries
              </span>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-indigo-600 text-white text-sm font-medium flex items-center justify-center">1</button>
                <button className="w-8 h-8 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium flex items-center justify-center hover:bg-gray-50">2</button>
                <button className="w-8 h-8 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium flex items-center justify-center hover:bg-gray-50">3</button>
                <span className="px-1 text-gray-400">...</span>
                <button className="w-8 h-8 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium flex items-center justify-center hover:bg-gray-50">12</button>
                <button className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-80 space-y-6">
          {/* Chart Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-500" />
              Leave Distribution
            </h3>
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaveDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {leaveDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-semibold text-gray-900">128</span>
                <span className="text-xs text-gray-500">Total Leaves</span>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {leaveDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Leave Policies</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </button>
              
              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-lg group-hover:bg-rose-100 transition-colors">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Company Holidays</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </button>

              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-100 transition-colors">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Leave Balance</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </button>

              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Custom Reports</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaves;
