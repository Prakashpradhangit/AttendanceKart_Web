import React, { useState } from 'react';
import { Search, EllipsisVertical, Plus, Upload, CircleCheck, CircleAlert, Edit2, RotateCcw, Trash2, Copy, Download, Check, FileSpreadsheet, X } from 'lucide-react';
import { useEmployees } from '../context/EmployeeContext';
import { useAlert } from '../context/AlertContext';
import EmployeeForm from '../components/EmployeeForm';
import ImportModal from '../components/ImportModal';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';

const Employees = () => {
  const { employees, maxUsers, addEmployee, addBulkEmployees, updateEmployee, deleteEmployee, resetTodayAttendance } = useEmployees();
  const activeEmployeeCount = employees.filter(e => e.status === 'Active').length;
  const { showConfirm } = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isLimitExceededModalOpen, setLimitExceededModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const [copiedPasswordIdx, setCopiedPasswordIdx] = useState(null);

  const departments = ['All Departments', ...new Set(employees.map(emp => emp.department))];

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), type === 'error' ? 5000 : 3000);
  };

  const filteredEmployees = employees.filter(emp => {
    const empCode = emp.empId || String(emp.id);
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         empCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'All Departments' || emp.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handleAddEmployee = async (data) => {
    const res = await addEmployee(data);
    if (res && res.success) {
      showNotification('New employee added successfully!', 'success');
    } else {
      const errMsg = (res && res.error) ? res.error : 'Failed to add employee.';
      showNotification(errMsg, 'error');
    }
  };

  const handleUpdateEmployee = (data) => {
    updateEmployee(editingEmployee.id, data);
    showNotification('Employee details updated successfully!');
    setEditingEmployee(null);
  };

  const downloadCredentialsSheet = (successEmployees) => {
    const sheetData = successEmployees.map(emp => ({
      "Employee Name": emp.name,
      "Email Address": emp.email,
      "Mobile Number": emp.phoneNumber || '',
      "Department": emp.department || '',
      "Designation": emp.designation || '',
      "Employee Code (ID)": emp.employeeCode,
      "Generated Login Password": emp.password
    }));

    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Credentials List");
    
    // Auto-fit columns
    const maxLens = {};
    sheetData.forEach(row => {
      Object.keys(row).forEach(key => {
        const valStr = String(row[key] || '');
        maxLens[key] = Math.max(maxLens[key] || key.length, valStr.length);
      });
    });
    worksheet['!cols'] = Object.keys(maxLens).map(key => ({
      wch: maxLens[key] + 4
    }));

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "Registered_Employees_Credentials.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPassword = (password, idx) => {
    navigator.clipboard.writeText(password);
    setCopiedPasswordIdx(idx);
    setTimeout(() => setCopiedPasswordIdx(null), 2000);
  };

  const handleBulkImport = async (data) => {
    showNotification('Processing import...', 'success');
    const res = await addBulkEmployees(data);
    if (res && res.success) {
      setBulkResult(res);
      showNotification(`Import complete! ${res.successCount} registered, ${res.failedCount} failed.`);
    } else {
      const errMsg = (res && res.error) ? res.error : 'Failed to import bulk employees.';
      showNotification(errMsg, 'error');
    }
  };

  const handleResetAttendance = (id) => {
    resetTodayAttendance(id);
    showNotification('Attendance reset for today!');
    setActiveMenuId(null);
  };

  const handleEditClick = (emp) => {
    setEditingEmployee(emp);
    setActiveMenuId(null);
  };

  const handleDeleteEmployee = async (id) => {
    if (await showConfirm('Are you sure you want to delete this employee?')) {
      deleteEmployee(id);
      showNotification('Employee deleted successfully!');
      setActiveMenuId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 left-4 md:left-auto md:top-8 md:right-8 z-[100]"
          >
            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
              notification.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
            }`}>
              {notification.type === 'success' ? <CircleCheck size={20} /> : <CircleAlert size={20} />}
              <span className="font-semibold text-sm md:text-base">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">Employee Management</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1 font-medium">Manage and view all your organization employees</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => {
              if (maxUsers && maxUsers > 0 && activeEmployeeCount >= maxUsers) {
                setLimitExceededModalOpen(true);
              } else {
                setIsImportModalOpen(true);
              }
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <Upload size={18} /> Import
          </button>
          <button 
            onClick={() => {
              if (maxUsers && maxUsers > 0 && activeEmployeeCount >= maxUsers) {
                setLimitExceededModalOpen(true);
              } else {
                setIsAddModalOpen(true);
              }
            }}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus size={18} /> Add Employee
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl shadow-sm !p-4 border border-gray-100 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm border-gray-100">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, ID or email..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-600 px-5 py-3 outline-none cursor-pointer focus:ring-2 focus:ring-primary/20 transition-all"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm !p-0 border border-gray-100 transition-all duration-300 overflow-hidden shadow-sm border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-[0.1em]">
                <th className="px-8 py-5">Employee ID</th>
                <th className="px-8 py-5">Name</th>
                <th className="px-8 py-5">Role</th>
                <th className="px-8 py-5">Email</th>
                <th className="px-8 py-5">Phone</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredEmployees.length > 0 ? filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-primary/[0.02] transition-colors group">
                  <td className="px-8 py-5 text-sm font-semibold text-gray-900">{emp.empId || emp.id}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      {emp.profileImage ? (
                        <img 
                          src={emp.profileImage} 
                          alt={emp.name}
                          className="w-10 h-10 rounded-2xl object-cover border border-gray-100 shadow-sm shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shadow-sm shrink-0">
                          {emp.name.charAt(0)}
                        </div>
                      )}
                      <span className="text-sm font-semibold text-gray-900">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-gray-600">{emp.role}</td>
                  <td className="px-8 py-5 text-sm font-medium text-gray-500">{emp.email}</td>
                  <td className="px-8 py-5 text-sm font-medium text-gray-500">{emp.phone}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      emp.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 relative">
                      <div className="relative">
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === emp.id ? null : emp.id)}
                          className={`p-2 rounded-xl transition-all ${
                            activeMenuId === emp.id ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-primary hover:bg-primary/10'
                          }`}
                        >
                          <EllipsisVertical size={18} />
                        </button>

                        <AnimatePresence>
                          {activeMenuId === emp.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setActiveMenuId(null)}
                              />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, x: 10 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95, x: 10 }}
                                className="absolute right-full mr-2 top-0 flex gap-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-20"
                              >
                                <button
                                  onClick={() => handleResetAttendance(emp.id)}
                                  title="Reset Today's Attendance"
                                  className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 hover:bg-orange-100 transition-colors shadow-sm"
                                >
                                  <RotateCcw size={18} />
                                </button>
                                <button
                                  onClick={() => handleEditClick(emp)}
                                  title="Edit Employee"
                                  className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 hover:bg-blue-100 transition-colors shadow-sm"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleDeleteEmployee(emp.id)}
                                  title="Delete Employee"
                                  className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors shadow-sm"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="px-8 py-24 text-center text-gray-400 bg-gray-50/30">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center text-gray-300">
                         <Search size={40} />
                       </div>
                       <div className="max-w-xs">
                         <p className="text-lg font-semibold text-gray-600">No employees found</p>
                         <p className="text-sm mt-1">Try adjusting your search or filter to find what you're looking for.</p>
                       </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-8 py-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
          <p className="text-sm text-gray-500 font-semibold">Showing <span className="text-gray-900">{filteredEmployees.length}</span> of <span className="text-gray-900">{employees.length}</span> entries</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-400 cursor-not-allowed bg-white">Previous</button>
            <button className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold shadow-lg shadow-primary/20">1</button>
            <button className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 bg-white">Next</button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EmployeeForm 
        isOpen={isAddModalOpen || !!editingEmployee} 
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingEmployee(null);
        }} 
        onSubmit={editingEmployee ? handleUpdateEmployee : handleAddEmployee} 
        initialData={editingEmployee}
      />
      
      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onImport={handleBulkImport}
      />

      {/* Limit Exceeded Premium Modal */}
      <AnimatePresence>
        {isLimitExceededModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLimitExceededModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            {/* Dialog Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl overflow-hidden z-10"
            >
              {/* Decorative background gradient */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
              
              <div className="flex flex-col items-center text-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100 shadow-sm animate-pulse">
                  <CircleAlert size={32} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">Maximum Employee Reached</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    You have reached the maximum allowed employee limit for your organization.
                  </p>
                </div>

                {/* Capacity Counter */}
                <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-around text-center mt-2">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Employees</p>
                    <p className="text-2xl font-extrabold text-slate-700 mt-1">{activeEmployeeCount}</p>
                  </div>
                  <div className="w-px bg-slate-200" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Max Capacity</p>
                    <p className="text-2xl font-extrabold text-rose-500 mt-1">{maxUsers}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-medium leading-relaxed mt-2">
                  To add more employees, please contact the <span className="text-primary font-bold">AttendanceKart Team</span> to upgrade your user tier limit.
                </div>

                <button 
                  onClick={() => setLimitExceededModalOpen(false)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-semibold hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 mt-4"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {bulkResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Glowing decor */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

              {/* Header */}
              <div className="flex justify-between items-center pb-6 border-b border-gray-100">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <FileSpreadsheet className="text-green-600" size={32} />
                    Bulk Import Summary
                  </h3>
                  <p className="text-sm text-slate-400 mt-1 font-semibold">Real-time registration logs & generated employee credentials</p>
                </div>
                <button 
                  onClick={() => setBulkResult(null)}
                  className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-colors font-bold"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content Container */}
              <div className="overflow-y-auto py-6 space-y-8 flex-1 pr-2">
                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-3xl p-5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest">Successfully Created</span>
                      <p className="text-3xl font-black text-emerald-600 mt-1">{bulkResult.successCount}</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center">
                      <CircleCheck size={24} />
                    </div>
                  </div>

                  <div className="bg-rose-50/50 border border-rose-100/50 rounded-3xl p-5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-rose-500 uppercase tracking-widest">Failed / Skipped</span>
                      <p className="text-3xl font-black text-rose-600 mt-1">{bulkResult.failedCount}</p>
                    </div>
                    <div className="w-12 h-12 bg-rose-500/10 text-rose-600 rounded-2xl flex items-center justify-center">
                      <CircleAlert size={24} />
                    </div>
                  </div>
                </div>

                {/* Successful Imports Section */}
                {bulkResult.successEmployees && bulkResult.successEmployees.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Registered Credentials List</h4>
                      <button
                        onClick={() => downloadCredentialsSheet(bulkResult.successEmployees)}
                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-green-600/10 transition-all active:scale-[0.97]"
                      >
                        <Download size={16} /> Download Login Credentials Sheet
                      </button>
                    </div>

                    <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm bg-slate-50/20">
                      <div className="overflow-x-auto max-h-[30vh]">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-50/80 sticky top-0 backdrop-blur-sm border-b border-slate-100">
                            <tr>
                              <th className="px-5 py-4 font-bold text-slate-400 uppercase tracking-tighter">Name</th>
                              <th className="px-5 py-4 font-bold text-slate-400 uppercase tracking-tighter">Email</th>
                              <th className="px-5 py-4 font-bold text-slate-400 uppercase tracking-tighter">Employee Code</th>
                              <th className="px-5 py-4 font-bold text-slate-400 uppercase tracking-tighter">Generated Password</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100/50 bg-white">
                            {bulkResult.successEmployees.map((emp, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-5 py-4 font-bold text-slate-800">{emp.name}</td>
                                <td className="px-5 py-4 font-semibold text-slate-500">{emp.email}</td>
                                <td className="px-5 py-4 font-extrabold text-indigo-600">
                                  <span className="bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-[10px] tracking-wide uppercase">{emp.employeeCode}</span>
                                </td>
                                <td className="px-5 py-4 font-semibold text-slate-700">
                                  <div className="flex items-center gap-3">
                                    <code className="bg-slate-100 border border-slate-200/50 px-3 py-1.5 rounded-lg text-xs font-mono font-bold select-all tracking-wider text-slate-800">{emp.password}</code>
                                    <button 
                                      onClick={() => handleCopyPassword(emp.password, idx)}
                                      className={`p-1.5 rounded-lg transition-all ${
                                        copiedPasswordIdx === idx ? 'bg-green-50 text-green-600' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                                      }`}
                                    >
                                      {copiedPasswordIdx === idx ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Failed Imports Section */}
                {bulkResult.failedEmployees && bulkResult.failedEmployees.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Errors / Exceeded Limit Logs</h4>
                    <div className="border border-rose-50 rounded-3xl p-5 bg-rose-50/10 space-y-3 max-h-[25vh] overflow-y-auto">
                      {bulkResult.failedEmployees.map((fail, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white border border-rose-100/50 rounded-2xl gap-2 hover:shadow-sm transition-shadow">
                          <div>
                            <p className="text-xs font-extrabold text-slate-800">{fail.name || 'Unknown User'}</p>
                            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{fail.email || 'No email provided'}</p>
                          </div>
                          <span className="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider self-start sm:self-center flex items-center gap-1.5">
                            <CircleAlert size={12} />
                            {fail.error}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="pt-6 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setBulkResult(null)}
                  className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-semibold hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20"
                >
                  Close & Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Employees;
