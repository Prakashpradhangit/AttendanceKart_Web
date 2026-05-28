import React from 'react';
import { Search, Calendar, Download, ChevronDown } from 'lucide-react';

const AttendanceFilters = ({ 
  searchTerm, setSearchTerm, 
  statusFilter, setStatusFilter, 
  dateFilter, setDateFilter,
  onExport 
}) => {
  return (
    <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
        {/* Date Picker */}
        <div className="relative w-full md:w-auto">
          <input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[11px] font-semibold text-gray-700 min-w-[150px] uppercase cursor-pointer"
          />
        </div>

        {/* Search */}
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[11px] font-medium"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-5 pr-10 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[11px] font-semibold text-gray-600 cursor-pointer w-full md:min-w-[140px]"
          >
            <option>All Status</option>
            <option>On Time</option>
            <option>Present</option>
            <option>Absent</option>
            <option>Late</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
      </div>

      <button 
        onClick={onExport}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-[11px] font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm w-full xl:w-auto"
      >
        <Download size={16} /> Export List
      </button>
    </div>
  );
};

export default AttendanceFilters;
