import React, { createContext, useContext, useState, useEffect } from 'react';
import { employeesList as initialEmployees } from '../utils/mockData';

const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // 'team' or 'employee'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [maxUsers, setMaxUsers] = useState(100);

  const fetchMaxUsers = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
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

  const fetchEmployees = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Map backend User to frontend Employee structure
        const mappedData = data
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
            status: 'Active' // We can assume active since no status field in User
          }));
        setEmployees(mappedData);
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
        joiningDate: employee.joiningDate
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

  const addBulkEmployees = (newEmployees) => {
    setEmployees((prev) => {
      let currentList = [...prev];
      const processed = newEmployees.map((emp) => {
        const newEmp = {
          ...emp,
          id: emp.id || generateUniqueId(currentList),
          status: emp.status || 'Active'
        };
        currentList = [newEmp, ...currentList];
        return newEmp;
      });
      return [...processed, ...prev];
    });
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
        joiningDate: updatedData.joiningDate
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
      maxUsers,
      fetchMaxUsers,
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
