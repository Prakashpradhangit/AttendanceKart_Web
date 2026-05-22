import React, { useState, useMemo, useEffect } from 'react';
import AttendanceCards from '../../components/Attendance/AttendanceCards';
import AttendanceCharts from '../../components/Attendance/AttendanceCharts';
import AttendanceFilters from '../../components/Attendance/AttendanceFilters';
import AttendanceTable from '../../components/Attendance/AttendanceTable';
import { useEmployees } from '../../context/EmployeeContext';
import { useAlert } from '../../context/AlertContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, Check, XCircle } from 'lucide-react';
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
  const { showConfirm, showToast, showAlert } = useAlert();

  // Clock Out Requests State
  const [clockOutRequests, setClockOutRequests] = useState([]);
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, trendsRes, recordsRes, settingsRes, requestsRes] = await Promise.all([
        fetch('/api/attendance/admin/today/stats', { headers }),
        fetch('/api/attendance/admin/stats/7days', { headers }),
        fetch('/api/attendance/admin/today/all', { headers }),
        fetch('/api/admin/settings', { headers }),
        fetch('/api/attendance/clock-out-requests/admin', { headers })
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
      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setClockOutRequests(data);
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

  const handleRequestAction = async (id, status) => {
    if (!(await showConfirm(`Are you sure you want to ${status.toLowerCase()} this request?`))) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/attendance/clock-out-requests/${id}/status?status=${status}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast(`Request ${status.toLowerCase()} successfully`);
        fetchAttendanceData();
      } else {
        const err = await res.json();
        showAlert(err.error || 'Failed to update request', 'error');
      }
    } catch (err) {
      showAlert('An error occurred', 'error');
    }
  };

  const pendingRequests = clockOutRequests.filter(r => r.status === 'PENDING');

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Attendance Management</h1>
          <p className="text-[11px] text-gray-500 font-medium">Real-time organizational tracking & insights</p>
        </div>
        <button
          onClick={() => setShowRequestsModal(true)}
          className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
        >
          <Clock size={16} className="text-purple-500" />
          Pending Requests
          {pendingRequests.length > 0 && (
            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {pendingRequests.length}
            </span>
          )}
        </button>
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

      {/* Clock Out Requests Modal */}
      <AnimatePresence>
        {showRequestsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRequestsModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl p-6 shadow-2xl z-10 flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock size={20} className="text-purple-500" />
                  Clock-Out Requests
                </h3>
                <button
                  onClick={() => setShowRequestsModal(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="overflow-auto flex-1 border border-gray-100 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Employee</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Date</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Requested In</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Requested Out</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Note</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Status</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {clockOutRequests.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-gray-500 text-sm">No requests found.</td>
                      </tr>
                    ) : (
                      clockOutRequests.map(req => (
                        <tr key={req.id} className="hover:bg-gray-50/50">
                          <td className="p-4">
                            <p className="font-semibold text-gray-900 text-sm">{req.employeeName}</p>
                            <p className="text-xs text-gray-500">ID: {req.userId}</p>
                          </td>
                          <td className="p-4 text-sm font-medium text-gray-700">{req.attendanceDate}</td>
                          <td className="p-4 text-sm font-medium text-gray-700">{req.requestedCheckInTime || '-'}</td>
                          <td className="p-4 text-sm font-medium text-gray-700">{req.requestedCheckOutTime || '-'}</td>
                          <td className="p-4 text-sm text-gray-600 max-w-[200px] truncate" title={req.note}>{req.note || '-'}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                              req.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {req.status === 'PENDING' && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleRequestAction(req.id, 'APPROVED')}
                                  className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                  title="Approve"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={() => handleRequestAction(req.id, 'REJECTED')}
                                  className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                  title="Reject"
                                >
                                  <XCircle size={16} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Attendance;
