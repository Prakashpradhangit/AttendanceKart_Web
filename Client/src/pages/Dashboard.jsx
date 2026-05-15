import React, { useEffect, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { UserPlus, Calendar, CreditCard, FileText, ChevronRight, Users, ChartBar } from 'lucide-react';
import { attendanceData, recentActivity } from '../utils/mockData';
import SummaryCard from '../components/SummaryCard';
import { useEmployees } from '../context/EmployeeContext';

import { useNavigate } from 'react-router-dom';

const COLORS = ['#0061E0', '#22C55E', '#F6AD55', '#F56565'];

const Dashboard = () => {
  const { employees, fetchEmployees } = useEmployees();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = React.useState('Last 30 Days');
  const [isCheckingStatus, setIsCheckingStatus] = React.useState(true);
  const [pendingLeaveCount, setPendingLeaveCount] = React.useState(0);
  const [todayPresentCount, setTodayPresentCount] = React.useState(0);
  const [trendsData, setTrendsData] = React.useState([]);
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const fetchDashboardStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [leaveRes, attendanceRes, trendsRes] = await Promise.all([
        fetch('/api/leaves/admin/pending/count', { headers }),
        fetch('/api/attendance/admin/today/count', { headers }),
        fetch(`/api/attendance/admin/trends?month=${selectedMonth}`, { headers })
      ]);

      if (leaveRes.ok) {
        const data = await leaveRes.json();
        setPendingLeaveCount(data.count);
      }
      if (attendanceRes.ok) {
        const data = await attendanceRes.json();
        setTodayPresentCount(data.count);
      }
      if (trendsRes.ok) {
        const data = await trendsRes.json();
        setTrendsData(data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    }
  }, [selectedMonth]);

  useEffect(() => {
    const checkAccountStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/auth/status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'Inactive') {
            // Logout if account is deactivated
            localStorage.clear();
            navigate('/login');
          }
        }
      } catch (err) {
        console.error('Status check failed:', err);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkAccountStatus();
    fetchEmployees();
    fetchDashboardStats();
    // Periodically check status every 5 minutes
    const interval = setInterval(() => {
      checkAccountStatus();
      fetchDashboardStats();
    }, 300000);
    return () => clearInterval(interval);
  }, [navigate, fetchEmployees, fetchDashboardStats, selectedMonth]);

  // Dynamic Summary Stats
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const departments = [...new Set(employees.map(e => e.department))];
  
  const deptData = departments.map(dept => ({
    name: dept,
    value: employees.filter(e => e.department === dept).length
  }));

  const dynamicSummaryCards = [
    {
      id: 1,
      title: 'Total Employees',
      value: totalEmployees.toString(),
      icon: <Users size={24} />,
      trend: '+12% from last month',
      color: 'bg-[#0061E0]'
    },
    {
      id: 2,
      title: 'Present Today',
      value: todayPresentCount.toString(),
      icon: <Calendar size={24} />,
      trend: `${totalEmployees > 0 ? Math.round((todayPresentCount / totalEmployees) * 100) : 0}% attendance rate`,
      color: 'bg-[#22C55E]'
    },
    {
      id: 3,
      title: 'Leave Requests',
      value: pendingLeaveCount.toString(),
      icon: <FileText size={24} />,
      trend: `${pendingLeaveCount} pending approval`,
      color: 'bg-orange-500'
    },
    {
      id: 4,
      title: 'Total Payroll',
      value: '₹45,200',
      icon: <CreditCard size={24} />,
      trend: 'April 2026',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1 font-medium">Welcome back, {localStorage.getItem('name') || 'Admin'}! Here's what's happening today.</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full sm:w-auto px-5 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-600 outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm cursor-pointer"
          >
            <option>Today</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dynamicSummaryCards.map(card => (
          <SummaryCard key={card.id} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Overview Chart */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-md rounded-3xl shadow-sm p-6 border border-white/40 transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Attendance Overview</h2>
            <input 
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold text-gray-500 px-4 py-2 outline-none cursor-pointer focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} dy={15} />
                <YAxis allowDecimals={false} domain={[0, 'auto']} axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 16px'}}
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '30px'}} />
                <Line type="monotone" name="Present" dataKey="present" stroke="#22C55E" strokeWidth={4} dot={{r: 6, fill: '#22C55E', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
                <Line type="monotone" name="On Leave" dataKey="onLeave" stroke="#F6AD55" strokeWidth={4} dot={{r: 6, fill: '#F6AD55', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-4">
           <h2 className="text-xl font-semibold text-gray-900 mb-2">Quick Actions</h2>
           <button 
             onClick={() => navigate('/admin/employees')}
             className="flex items-center gap-4 p-5 bg-[#0061E0] text-white rounded-3xl font-semibold shadow-lg shadow-blue-200 hover:opacity-90 transition-all group"
           >
             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
               <UserPlus size={24} />
             </div>
             <div className="text-left">
               <p className="text-lg">Add Employee</p>
               <p className="text-indigo-100 text-xs font-medium">Onboard new talent</p>
             </div>
           </button>
           <button 
             onClick={() => navigate('/admin/attendance')}
             className="flex items-center gap-4 p-5 bg-[#22C55E] text-white rounded-3xl font-semibold shadow-lg shadow-green-200 hover:opacity-90 transition-all group"
           >
             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
               <Calendar size={24} />
             </div>
             <div className="text-left">
               <p className="text-lg">Check Attendance</p>
               <p className="text-emerald-100 text-xs font-medium">Daily check-in logs</p>
             </div>
           </button>
           <button 
             onClick={() => navigate('/admin/payroll')}
             className="flex items-center gap-4 p-5 bg-purple-600 text-white rounded-3xl font-semibold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all group"
           >
             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
               <CreditCard size={24} />
             </div>
             <div className="text-left">
               <p className="text-lg">Generate Payroll</p>
               <p className="text-purple-100 text-xs font-medium">Monthly salary slips</p>
             </div>
           </button>
           <button 
             onClick={() => navigate('/admin/reports')}
             className="flex items-center gap-4 p-5 bg-orange-500 text-white rounded-3xl font-semibold shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all group"
           >
             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
               <ChartBar size={24} />
             </div>
             <div className="text-left">
               <p className="text-lg">View Reports</p>
               <p className="text-orange-100 text-xs font-medium">Performance insights</p>
             </div>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Department Distribution */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm p-6 border border-white/40 transition-all duration-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Departments</h2>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="text-3xl font-bold text-gray-900">{totalEmployees}</span>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4">
             {deptData.map((item, index) => (
               <div key={item.name} className="flex items-center gap-3 bg-white/40 p-3 rounded-2xl border border-white/20">
                 <div className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                 <div className="min-w-0">
                   <p className="text-[10px] font-bold text-gray-400 uppercase truncate">{item.name}</p>
                   <p className="text-sm font-semibold text-gray-900">{item.value} Employees</p>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm p-6 border border-white/40 transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <button className="text-primary text-xs font-semibold hover:underline flex items-center gap-1">
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex flex-col gap-6">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center shadow-sm overflow-hidden border border-white/20">
                  <img src={activity.avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="text-sm font-semibold text-gray-900 truncate">{activity.name}</p>
                    <span className="text-[10px] font-semibold text-gray-400 ml-2 whitespace-nowrap">{activity.time}</span>
                  </div>
                  <p className="text-xs font-medium text-gray-500 mt-0.5 truncate">{activity.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payroll Summary */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm p-6 border border-white/40 transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Payroll Trends</h2>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">Q2 2026</span>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 700}} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#F9FAFB'}} />
                <Bar dataKey="value" fill="#0061E0" radius={[10, 10, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 p-5 bg-primary rounded-3xl flex items-center justify-between shadow-xl shadow-primary/20">
            <div>
              <p className="text-xs font-semibold text-indigo-200 uppercase tracking-widest">Total Monthly Spent</p>
              <p className="text-2xl font-bold text-white mt-1">₹128,450</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white">
               <CreditCard size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
