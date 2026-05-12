import React, { useState, useMemo } from 'react';
import AttendanceCards from '../../components/Attendance/AttendanceCards';
import AttendanceCharts from '../../components/Attendance/AttendanceCharts';
import AttendanceFilters from '../../components/Attendance/AttendanceFilters';
import AttendanceTable from '../../components/Attendance/AttendanceTable';
import { useEmployees } from '../../context/EmployeeContext';
import { attendanceRecords as initialRecords } from '../../utils/mockData';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const Attendance = () => {
  const { employees } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateFilter, setDateFilter] = useState('2026-04-27');

  // Sync mock records with current employees for "Realtime" feel
  const syncedRecords = useMemo(() => {
    // We combine the base mock records with any new employees from the context
    const existingIds = new Set(initialRecords.map(r => r.empId));
    const newRecords = employees
      .filter(emp => !existingIds.has(emp.id))
      .map(emp => ({
        id: `REC_${emp.id}`,
        empId: emp.id,
        name: emp.name,
        department: emp.department || 'General',
        date: '2026-04-27',
        status: 'Present', // Default for new ones
        checkIn: '09:00 AM',
        checkOut: '06:00 PM',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`
      }));
    
    return [...newRecords, ...initialRecords];
  }, [employees]);

  const filteredRecords = useMemo(() => {
    return syncedRecords.filter(record => {
      const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           record.empId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All Status' || record.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [syncedRecords, searchTerm, statusFilter]);

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredRecords);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, `Attendance_Report_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Attendance Management</h1>
          <p className="text-[11px] text-gray-500 font-medium">Real-time organizational tracking & insights</p>
        </div>
      </div>

      {/* Summary Cards */}
      <AttendanceCards records={syncedRecords} totalCount={employees.length} />

      {/* Charts Section */}
      <AttendanceCharts records={syncedRecords} totalCount={employees.length} />

      {/* Filters Section */}
      <AttendanceFilters 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        onExport={handleExport}
      />

      {/* Attendance Table */}
      <AttendanceTable records={filteredRecords} />
    </div>
  );
};

export default Attendance;
