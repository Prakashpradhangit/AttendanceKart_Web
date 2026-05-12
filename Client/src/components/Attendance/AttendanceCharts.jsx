import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { attendanceData } from '../../utils/mockData';

const COLORS = ['#10B981', '#EF4444', '#F59E0B'];

const AttendanceCharts = ({ records, totalCount }) => {
  const counts = records.reduce((acc, rec) => {
    acc[rec.status] = (acc[rec.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = [
    { name: 'Present', value: counts['Present'] || 0 },
    { name: 'Absent', value: counts['Absent'] || 0 },
    { name: 'Late', value: counts['Late'] || 0 },
  ];

  const total = pieData.reduce((sum, item) => sum + item.value, 0);

  // Integrate real-time data for today into the dashboard's historical trend
  const dynamicBarData = [...attendanceData];
  dynamicBarData[dynamicBarData.length - 1] = {
    name: 'Today',
    present: counts['Present'] || 0,
    absent: counts['Absent'] || 0,
    leave: 0, // Placeholder until leave management is integrated
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Attendance Trends Bar Chart */}
      <div className="lg:col-span-2 bg-white p-5 rounded-3xl shadow-sm border border-gray-100 min-h-[420px] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-black text-gray-900 tracking-tight">Attendance Trends (Last 7 Days)</h2>
          <div className="flex gap-4">
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-green-500"></div>
               <span className="text-xs font-bold text-gray-500">Present</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-red-500"></div>
               <span className="text-xs font-bold text-gray-500">Absent</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
               <span className="text-xs font-bold text-gray-500">Leave</span>
             </div>
          </div>
        </div>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dynamicBarData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}}
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}}
              />
              <Tooltip 
                cursor={{fill: '#F9FAFB'}}
                contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 16px'}}
              />
              <Bar dataKey="present" fill="#10B981" radius={[6, 6, 0, 0]} barSize={24} />
              <Bar dataKey="absent" fill="#EF4444" radius={[6, 6, 0, 0]} barSize={24} />
              <Bar dataKey="leave" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attendance Distribution Pie Chart */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full min-h-[420px]">
        <h2 className="text-base font-black text-gray-900 tracking-tight mb-4 shrink-0">Attendance Distribution (Today)</h2>
        <div className="flex-1 w-full relative mb-4 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={8}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <span className="text-3xl font-black text-gray-900">{total}</span>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</p>
          </div>
        </div>
        <div className="space-y-2">
          {pieData.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index]}}></div>
                <span className="text-sm font-bold text-gray-700">{item.name}</span>
              </div>
              <span className="text-sm font-black text-gray-900">{total > 0 ? Math.round((item.value / total) * 100) : 0}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttendanceCharts;
