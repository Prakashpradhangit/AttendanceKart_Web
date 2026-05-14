import React, { useState } from 'react';
import { Search, EllipsisVertical, Plus, Upload, CircleCheck, CircleAlert, Edit2, RotateCcw } from 'lucide-react';
import { useEmployees } from '../context/EmployeeContext';
import EmployeeForm from '../components/EmployeeForm';
import ImportModal from '../components/ImportModal';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';

const Employees = () => {
  const { employees, addEmployee, addBulkEmployees, updateEmployee, resetTodayAttendance } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const departments = ['All Departments', ...new Set(employees.map(emp => emp.department))];

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'All Departments' || emp.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handleAddEmployee = (data) => {
    addEmployee(data);
    showNotification('New employee added successfully!');
  };

  const handleUpdateEmployee = (data) => {
    updateEmployee(editingEmployee.id, data);
    showNotification('Employee details updated successfully!');
    setEditingEmployee(null);
  };

  const handleBulkImport = (data) => {
    addBulkEmployees(data);
    showNotification(`${data.length} employees imported successfully!`);
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
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <Upload size={18} /> Import
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
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
                  <td className="px-8 py-5 text-sm font-semibold text-gray-900">{emp.id}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shadow-sm">
                        {emp.name.charAt(0)}
                      </div>
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
    </div>
  );
};

export default Employees;
