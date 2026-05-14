import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Users, IndianRupee, Calendar, Download, Filter, 
  ChevronDown, FileText, PieChart as PieChartIcon, Activity
} from 'lucide-react';
import { 
  monthlyAttendanceTrend, 
  departmentPayrollData, 
  leaveDistribution,
  reportHistory 
} from '../utils/mockData';

const Reports = () => {
  const stats = [
    { title: 'Avg. Attendance', value: '94.2%', trend: '+2.4%', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Total Payroll', value: '₹1.2M', trend: '+12%', icon: IndianRupee, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Leave Utilization', value: '12.5%', trend: '-1.2%', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Active Employees', value: '120', trend: '+5', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto bg-gray-50/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Comprehensive insights across all departments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm cursor-pointer hover:bg-gray-50 transition-all">
            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Last 6 Months</span>
            <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
            <Download className="w-4 h-4" />
            <span>Export All</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Attendance Trend</h3>
              <p className="text-sm text-gray-500">Monthly percentage of present employees</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                <Filter className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyAttendanceTrend}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9ca3af', fontSize: 12}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9ca3af', fontSize: 12}}
                  domain={[70, 100]}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRate)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leave Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900">Leave Distribution</h3>
            <p className="text-sm text-gray-500">Breakdown by leave category</p>
          </div>
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {leaveDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-semibold text-gray-900">128</span>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total</span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {leaveDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Payroll */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900">Department Payroll</h3>
            <p className="text-sm text-gray-500">Monthly budget allocation per department</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentPayrollData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis 
                  type="category" 
                  dataKey="dept" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#4b5563', fontSize: 12, fontWeight: 500}}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#8b5cf6" 
                  radius={[0, 8, 8, 0]} 
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Report History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Report History</h3>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Report Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reportHistory.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{report.name}</p>
                          <p className="text-xs text-gray-500">{report.type} • {report.size}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{report.date}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
