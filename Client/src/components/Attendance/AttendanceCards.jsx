import React from 'react';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import { attendanceRecords } from '../../utils/mockData';

const iconMap = {
  users: Users,
  'user-check': UserCheck,
  'user-x': UserX,
  clock: Clock
};

const AttendanceCards = ({ stats }) => {
  const totalCount = stats?.totalEmployees || 0;
  const presentToday = stats?.presentToday || 0;
  const absentToday = stats?.absentToday || 0;
  const lateArrivals = stats?.lateArrivals || 0;

  const statsList = [
    { id: 1, title: 'Total Employees', value: totalCount.toString(), change: 'Total', icon: 'users', color: 'bg-[#0061E0]' },
    { id: 2, title: 'Present Today', value: presentToday.toString(), change: `${totalCount > 0 ? Math.round((presentToday / totalCount) * 100) : 0}%`, icon: 'user-check', color: 'bg-[#22C55E]' },
    { id: 3, title: 'Absent Today', value: absentToday.toString(), change: `${totalCount > 0 ? Math.round((absentToday / totalCount) * 100) : 0}%`, icon: 'user-x', color: 'bg-red-500' },
    { id: 4, title: 'Late Arrivals', value: lateArrivals.toString(), change: `${totalCount > 0 ? Math.round((lateArrivals / totalCount) * 100) : 0}%`, icon: 'clock', color: 'bg-orange-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsList.map((stat) => {
        const Icon = iconMap[stat.icon];
        return (
          <div key={stat.id} className="relative overflow-hidden bg-white p-4 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-500">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-xl ${stat.color} bg-opacity-10 text-white`}>
                <div className={`p-1.5 rounded-lg ${stat.color} shadow-lg shadow-current/20`}>
                  <Icon size={18} />
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                stat.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-xl font-bold text-gray-900 mt-0.5">{stat.value}</h3>
            </div>
            
            {/* Background Decorative Wave */}
            <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-500 group-hover:scale-110">
               <Icon size={80} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AttendanceCards;
