import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState([
    { label: 'Total Organizations', value: '0', change: '+0%', isPositive: true, icon: Building2, color: 'blue' },
    { label: 'Active Users', value: '0', change: '+0%', isPositive: true, icon: Users, color: 'emerald' },
    { label: 'Monthly Revenue', value: '$0', change: '+0%', isPositive: true, icon: CreditCard, color: 'amber' },
    { label: 'Platform Uptime', value: '99.99%', change: '0%', isPositive: true, icon: Zap, color: 'blue' },
  ]);

  const [recentOrganizations, setRecentOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch Admins (Organizations)
        const adminsResponse = await fetch('/api/admin', { headers });
        const adminsData = await adminsResponse.json();

        // Fetch Users (All)
        const usersResponse = await fetch('/api/users?page=0&size=1', { headers });
        const usersData = await usersResponse.json();
        const totalUsers = Array.isArray(usersData) ? usersData.length : usersData.totalElements || 0;

        // Update Stats
        setStats([
          { label: 'Total Organizations', value: adminsData.length.toString(), change: '+12.5%', isPositive: true, icon: Building2, color: 'blue' },
          { label: 'Active Users', value: totalUsers.toString(), change: '+18.2%', isPositive: true, icon: Users, color: 'emerald' },
          { label: 'Monthly Revenue', value: `$${(adminsData.length * 199).toLocaleString()}`, change: '+24.1%', isPositive: true, icon: CreditCard, color: 'amber' },
          { label: 'Platform Uptime', value: '99.99%', change: '-0.01%', isPositive: false, icon: Zap, color: 'blue' },
        ]);

        // Update Recent Organizations (latest 4)
        const recent = adminsData.slice(-4).reverse().map(admin => ({
          name: admin.organisation_name || 'N/A',
          industry: 'Enterprise', // Backend doesn't have industry, defaulting
          users: 'N/A', // Backend doesn't return user count per admin easily here
          joined: admin.starting_date || 'N/A',
          status: 'Active'
        }));
        setRecentOrganizations(recent);

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#1E293B] tracking-tight">Super Admin Dashboard</h1>
          <p className="text-gray-500 mt-1 font-medium">Platform overview and organization management</p>
        </div>
        <div className="flex items-center gap-3 bg-[#3B82F6]/10 px-4 py-2 rounded-2xl border border-[#3B82F6]/20">
          <ShieldCheck className="text-[#3B82F6]" size={20} />
          <span className="text-[#3B82F6] text-sm font-semibold uppercase tracking-wider">System Secure</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-100 p-6 rounded-[2rem] hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-blue-50 text-[#3B82F6] group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${stat.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-semibold">{stat.label}</h3>
            <p className="text-2xl font-semibold text-[#1E293B] mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Organizations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <h2 className="text-xl font-semibold text-[#1E293B]">Recent Organizations</h2>
              <button className="text-[#3B82F6] text-sm font-semibold hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-50">
                    <th className="px-8 py-5">Organization</th>
                    <th className="px-8 py-5">Industry</th>
                    <th className="px-8 py-5">Users</th>
                    <th className="px-8 py-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrganizations.map((org, index) => (
                    <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#3B82F6] font-semibold border border-gray-100">
                            {org.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#1E293B] group-hover:text-[#3B82F6] transition-colors">{org.name}</p>
                            <p className="text-xs text-gray-400 font-medium">{org.joined}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-600 font-medium">{org.industry}</td>
                      <td className="px-8 py-5 text-sm font-semibold text-[#1E293B]">{org.users}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          org.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 
                          org.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {org.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* System Health / Activity */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm h-full">
            <h2 className="text-xl font-semibold text-[#1E293B] mb-6">System Health</h2>
            <div className="space-y-6">
              {[
                { label: 'Database Status', value: 'Stable', color: 'emerald' },
                { label: 'API Latency', value: '42ms', color: 'emerald' },
                { label: 'Storage Usage', value: '68%', color: 'amber' },
                { label: 'Cache Hit Rate', value: '94%', color: 'emerald' },
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-semibold">{item.label}</span>
                    <span className={`text-${item.color}-600 font-bold`}>{item.value}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'} rounded-full`}
                      style={{ width: item.label === 'Storage Usage' ? '68%' : '90%' }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 p-6 bg-[#3B82F6] rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
              <h4 className="text-white font-semibold mb-2 relative z-10">Platform Update</h4>
              <p className="text-blue-100 text-xs mb-4 relative z-10">v2.4.0 is ready to deploy. Review the changelog before proceeding.</p>
              <button className="bg-white text-[#3B82F6] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg relative z-10 hover:bg-blue-50 transition-colors">
                Update Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
