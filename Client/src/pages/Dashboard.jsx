import React, { useEffect, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { UserPlus, Calendar, CreditCard, FileText, ChevronRight, Users, ChartBar, UserCheck, UserX, Loader2, Megaphone, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [notices, setNotices] = React.useState([]);
  const [selectedNotice, setSelectedNotice] = React.useState(null);

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

  const fetchNotices = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/notices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotices(data);
      }
    } catch (err) {
      console.error('Failed to fetch notices:', err);
    }
  }, []);

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
    fetchNotices();
    // Periodically check status every 5 minutes
    const interval = setInterval(() => {
      checkAccountStatus();
      fetchDashboardStats();
      fetchNotices();
    }, 300000);
    return () => clearInterval(interval);
  }, [navigate, fetchEmployees, fetchDashboardStats, fetchNotices, selectedMonth]);

  // Dynamic Summary Stats (only count Active employees)
  const activeEmployeesList = employees.filter(e => e.status === 'Active');
  const totalEmployees = activeEmployeesList.length;
  const activeEmployees = totalEmployees;
  const departments = [...new Set(activeEmployeesList.map(e => e.department))];
  
  const deptData = departments.map(dept => ({
    name: dept,
    value: activeEmployeesList.filter(e => e.department === dept).length
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
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {isCheckingStatus && <Loader2 className="animate-spin text-primary" size={20} />}
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl text-xs font-bold text-gray-500 px-4 py-2.5 outline-none cursor-pointer hover:bg-white hover:shadow-sm transition-all"
          >
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>This Month</option>
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
                <Line type="monotone" name="On Leave" dataKey="leave" stroke="#8B5CF6" strokeWidth={4} dot={{r: 6, fill: '#8B5CF6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
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

      {/* Dynamic Notice Board Section for Admin Dashboard */}
      {notices.length > 0 && (
        <div className="bg-white/70 backdrop-blur-md rounded-[40px] p-8 border border-white/40 shadow-sm flex flex-col gap-6 relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center justify-between border-b border-gray-100/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Megaphone size={20} className="animate-pulse" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-800 tracking-tight leading-tight">Notice Board Updates</h4>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Stay aware of live announcements published to all employees</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/notices')}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              Manage Board <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notices.slice(0, 3).map((notice) => {
              const isUrgent = notice.category === 'Urgent';
              const isHoliday = notice.category === 'Holiday';
              const isEvent = notice.category === 'Event';
              let pillClass = 'bg-teal-50 text-teal-600 border-teal-100';
              let accentClass = 'border-l-teal-500';
              if (isUrgent) {
                pillClass = 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse';
                accentClass = 'border-l-rose-500';
              } else if (isHoliday) {
                pillClass = 'bg-violet-50 text-violet-600 border-violet-100';
                accentClass = 'border-l-violet-500';
              } else if (isEvent) {
                pillClass = 'bg-blue-50 text-blue-600 border-blue-100';
                accentClass = 'border-l-blue-500';
              }

              return (
                <div
                  key={notice.id}
                  onClick={() => setSelectedNotice(notice)}
                  className={`bg-white/90 rounded-[28px] p-6 border-l-4 ${accentClass} border-t border-r border-b border-gray-100/80 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${pillClass}`}>
                        {notice.category}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        {(() => {
                          try {
                            const date = new Date(notice.createdAt);
                            return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                          } catch (e) {
                            return '';
                          }
                        })()}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-800 tracking-tight leading-snug group-hover:text-primary transition-colors mb-2 line-clamp-1">
                      {notice.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2">
                      {notice.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 border-t border-gray-50/50 pt-3 mt-4">
                    <div className="w-4 h-4 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-[8px]">
                      {notice.createdBy ? notice.createdBy.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      {notice.createdBy || 'Admin'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notice Detail Modal for Admin Dashboard */}
      <AnimatePresence>
        {selectedNotice && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNotice(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl overflow-hidden z-10 text-left"
            >
              {/* Decorative background gradient */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
              
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    selectedNotice.category === 'Urgent'
                      ? 'bg-rose-50 text-rose-600 border-rose-100'
                      : selectedNotice.category === 'Holiday'
                      ? 'bg-violet-50 text-violet-600 border-violet-100'
                      : selectedNotice.category === 'Event'
                      ? 'bg-blue-50 text-blue-600 border-blue-100'
                      : 'bg-teal-50 text-teal-600 border-teal-100'
                  }`}>
                    {selectedNotice.category}
                  </span>
                  <button
                    onClick={() => setSelectedNotice(null)}
                    className="p-1.5 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-snug">
                    {selectedNotice.title}
                  </h3>
                  <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(selectedNotice.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      By {selectedNotice.createdBy || 'Admin'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-slate-600 text-sm font-medium leading-relaxed max-h-[250px] overflow-y-auto whitespace-pre-wrap">
                  {selectedNotice.content}
                </div>

                <button 
                  onClick={() => setSelectedNotice(null)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-semibold hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 mt-2"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
