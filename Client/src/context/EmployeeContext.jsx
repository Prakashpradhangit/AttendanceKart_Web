import React, { createContext, useContext, useState, useEffect } from 'react';
import { employeesList as initialEmployees } from '../utils/mockData';

const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // 'team' or 'employee'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [maxUsers, setMaxUsers] = useState(100);
  const [departmentsList, setDepartmentsList] = useState(['Development', 'Design', 'HR', 'Marketing', 'Sales']);
  const [employeePage, setEmployeePage] = useState(0);
  const [employeePagination, setEmployeePagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0
  });
  const employeePageRef = React.useRef(0);
  const employeePageSizeRef = React.useRef(20);

  React.useEffect(() => {
    employeePageRef.current = employeePage;
  }, [employeePage]);

  React.useEffect(() => {
    employeePageSizeRef.current = employeePagination.size;
  }, [employeePagination.size]);

  const fetchMaxUsers = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.departments) {
          try {
            const depts = JSON.parse(data.departments);
            if (Array.isArray(depts)) {
              setDepartmentsList(depts);
            }
          } catch (e) {
            console.error('Failed to parse departments:', e);
          }
        }
        if (data && data.maxUsers !== undefined) {
          setMaxUsers(data.maxUsers);
        }
      }
    } catch (err) {
      console.error('Failed to fetch max users:', err);
    }
  }, []);

  useEffect(() => {
    fetchMaxUsers();
  }, [fetchMaxUsers]);

  const fetchEmployees = React.useCallback(async (options = {}) => {
    try {
      const page = options.page ?? employeePageRef.current;
      const size = options.size ?? employeePageSizeRef.current;
      const search = options.search || '';
      const department = options.department || '';
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: String(page),
        size: String(size)
      });
      if (search) params.set('search', search);
      if (department && department !== 'All Departments') params.set('department', department);

      const response = await fetch(`/api/users?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const pageContent = Array.isArray(data) ? data : data.content || [];
        // Map backend User to frontend Employee structure
        const mappedData = pageContent
          .filter(user => user.role !== 'ADMIN') // Exclude Admin accounts from employee details
          .map(user => ({
            id: user.id,
            empId: user.employeeCode,
            name: user.name,
            email: user.email,
            phone: user.phoneNumber,
            department: user.department,
            role: user.designation,
            userRole: user.role,
            joiningDate: user.joiningDate,
            profileImage: user.profileImage,
            status: user.status || 'Active',
            employmentType: user.employmentType || 'FULL_TIME'
          }));
        setEmployees(mappedData);
        if (!Array.isArray(data)) {
          setEmployeePage(data.number || 0);
          setEmployeePagination({
            page: data.number || 0,
            size: data.size || size,
            totalElements: data.totalElements || 0,
            totalPages: data.totalPages || 0
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const generateUniqueId = (currentEmployees) => {
    if (currentEmployees.length === 0) return 'EMP001';
    const ids = currentEmployees
      .map(emp => parseInt(emp.id.replace('EMP', '')))
      .filter(id => !isNaN(id));
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    return `EMP${String(maxId + 1).padStart(3, '0')}`;
  };

  const addEmployee = async (employee) => {
    try {
      const token = localStorage.getItem('token');
      const userData = {
        name: employee.name,
        email: employee.email,
        password: employee.password,
        phoneNumber: employee.phone,
        department: employee.department,
        designation: employee.role,
        role: 'EMPLOYEE', // default role
        joiningDate: employee.joiningDate,
        emailVerificationToken: employee.emailVerificationToken,
        employmentType: employee.employmentType || 'FULL_TIME'
      };

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        fetchEmployees();
        return { success: true };
      } else {
        const errorText = await response.text();
        let displayError = errorText;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed && parsed.message) {
            displayError = parsed.message;
          }
        } catch (e) {
          // Fallback to raw text
        }
        console.error('Failed to add employee:', displayError);
        return { success: false, error: displayError };
      }
    } catch (err) {
      console.error('Error adding employee:', err);
      return { success: false, error: err.message };
    }
  };

  const addBulkEmployees = async (newEmployees) => {
    try {
      const token = localStorage.getItem('token');
      const payload = newEmployees.map(emp => ({
        name: emp.name || '',
        email: emp.email || '',
        phoneNumber: emp.phone || emp.phonenumber || '',
        department: emp.department || '',
        designation: emp.role || emp.designation || '',
        joiningDate: emp.joiningdate || emp.joiningDate || new Date().toISOString().split('T')[0]
      }));

      const response = await fetch('/api/users/bulk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh active list
        fetchEmployees();
        return { success: true, ...result };
      } else {
        const errorText = await response.text();
        return { success: false, error: errorText };
      }
    } catch (err) {
      console.error('Bulk import error:', err);
      return { success: false, error: err.message };
    }
  };

  const updateEmployee = async (id, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const userData = {
        name: updatedData.name,
        email: updatedData.email,
        phoneNumber: updatedData.phone,
        department: updatedData.department,
        designation: updatedData.role,
        role: updatedData.userRole, // Send the enum role back
        joiningDate: updatedData.joiningDate,
        status: updatedData.status || 'Active',
        employmentType: updatedData.employmentType || 'FULL_TIME'
      };

      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        fetchEmployees();
      }
    } catch (err) {
      console.error('Failed to update employee:', err);
    }
  };

  const resetTodayAttendance = (id) => {
    setEmployees((prev) => prev.map(emp => 
      emp.id === id ? { ...emp, lastCheckIn: null, lastCheckOut: null, attendanceStatus: 'Pending' } : emp
    ));
  };

  const deleteEmployee = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchEmployees();
      }
    } catch (err) {
      console.error('Failed to delete employee:', err);
    }
  };

  return (
    <EmployeeContext.Provider value={{ 
      employees, 
      employeePage,
      employeePagination,
      setEmployeePage,
      maxUsers,
      fetchMaxUsers,
      departmentsList,
      setDepartmentsList,
      addEmployee, 
      addBulkEmployees,
      updateEmployee, 
      deleteEmployee,
      resetTodayAttendance,
      fetchEmployees,
      activeChat,
      setActiveChat,
      selectedEmployee,
      setSelectedEmployee
    }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployees = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
};
