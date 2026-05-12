import React from 'react';
import { EllipsisVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { attendanceRecords } from '../../utils/mockData';

const statusStyles = {
  Present: 'bg-green-100 text-green-600',
  Absent: 'bg-red-100 text-red-600',
  Late: 'bg-orange-100 text-orange-600',
};

const AttendanceTable = ({ records }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-[0.1em]">
              <th className="px-8 py-6">Date</th>
              <th className="px-8 py-6">Employee</th>
              <th className="px-8 py-6">Department</th>
              <th className="px-8 py-6 text-center">Status</th>
              <th className="px-8 py-6">Check-in</th>
              <th className="px-8 py-6">Check-out</th>
              <th className="px-8 py-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-primary/[0.02] transition-colors group">
                <td className="px-8 py-6 text-sm font-bold text-gray-900">{record.date}</td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden group-hover:scale-110 transition-transform shadow-sm">
                      <img src={record.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">{record.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{record.empId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm font-bold text-gray-500">{record.department}</td>
                <td className="px-8 py-6 text-center">
                  <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider ${statusStyles[record.status]}`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-sm font-black text-gray-700">{record.checkIn}</td>
                <td className="px-8 py-6 text-sm font-black text-gray-700">{record.checkOut}</td>
                <td className="px-8 py-6 text-right">
                  <button className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all">
                    <EllipsisVertical size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 md:px-8 py-6 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30">
        <p className="text-xs text-gray-500 font-bold text-center sm:text-left">
          Showing <span className="text-gray-900">1 - {records.length}</span> of <span className="text-gray-900">{records.length}</span> records
        </p>
        <div className="flex items-center gap-2">
          <button className="p-2 border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed bg-white">
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-1 px-1">
            <button className="w-9 h-9 bg-primary text-white rounded-xl text-xs font-black shadow-lg shadow-primary/20">1</button>
            <button className="w-9 h-9 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-colors hidden xs:block">2</button>
            <button className="w-9 h-9 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-colors hidden sm:block">3</button>
            <span className="w-9 h-9 flex items-center justify-center text-gray-400 font-bold hidden sm:flex">...</span>
            <button className="w-9 h-9 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-colors hidden md:block">26</button>
          </div>
          <button className="p-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 bg-white transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTable;
