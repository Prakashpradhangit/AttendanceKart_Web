import React, { useState, useMemo, useEffect } from 'react';
import AttendanceCards from '../../components/Attendance/AttendanceCards';
import AttendanceCharts from '../../components/Attendance/AttendanceCharts';
import AttendanceFilters from '../../components/Attendance/AttendanceFilters';
import AttendanceTable from '../../components/Attendance/AttendanceTable';
import { useEmployees } from '../../context/EmployeeContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const Attendance = () => {
  const { employees } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [realRecords, setRealRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkInTime, setCheckInTime] = useState('09:00');
  const [gracePeriod, setGracePeriod] = useState(15);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, trendsRes, recordsRes, settingsRes] = await Promise.all([
        fetch('/api/attendance/admin/today/stats', { headers }),
        fetch('/api/attendance/admin/stats/7days', { headers }),
        fetch('/api/attendance/admin/today/all', { headers }),
        fetch('/api/admin/settings', { headers })
      ]);

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setCheckInTime(settingsData.defaultCheckInTime || '09:00');
        setGracePeriod(settingsData.gracePeriod || 15);
      }
      
      if (statsRes.ok) setStats(await statsRes.json());
      if (trendsRes.ok) setTrends(await trendsRes.json());
      if (recordsRes.ok) {
        const data = await recordsRes.json();
        const formatted = data.map(r => ({
          id: r.id,
          empId: r.userId,
          name: r.userName,
          department: r.department || 'General',
          date: r.attendanceDate,
          status: getDisplayStatus(r),
          checkIn: formatTime(r.checkInTime),
          checkOut: formatTime(r.checkOutTime)
        }));
        setRealRecords(formatted);
      }
    } catch (err) {
      console.error('Failed to fetch attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayStatus = (record) => {
    if (!record.checkInTime) return 'Absent';
    const [bHour, bMin] = checkInTime.split(':').map(Number);
    const totalMinutes = bMin + Number(gracePeriod);
    const tHour = bHour + Math.floor(totalMinutes / 60);
    const tMin = totalMinutes % 60;

    const checkIn = new Date(record.checkInTime);
    if (checkIn.getHours() > tHour || (checkIn.getHours() === tHour && checkIn.getMinutes() > tMin)) {
      return 'Late';
    }
    return 'Present';
  };

  const formatTime = (isoStr) => {
    if (!isoStr) return '---';
    try {
      return new Date(isoStr).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return '---';
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const filteredRecords = useMemo(() => {
    return realRecords.filter(record => {
      const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           record.empId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All Status' || record.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [realRecords, searchTerm, statusFilter]);

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
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Attendance Management</h1>
          <p className="text-[11px] text-gray-500 font-medium">Real-time organizational tracking & insights</p>
        </div>
      </div>

      {/* Summary Cards */}
      <AttendanceCards stats={stats} />

      {/* Charts Section */}
      <AttendanceCharts trends={trends} stats={stats} />

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
