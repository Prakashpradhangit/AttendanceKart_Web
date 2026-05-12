import React, { createContext, useContext, useState, useEffect } from 'react';
import { employeesList as initialEmployees } from '../utils/mockData';

const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState(() => {
    const data = initialEmployees;
    
    // Sanitize IDs to ensure uniqueness (fix for existing duplicate ID bug)
    const idMap = new Set();
    return data.map((emp, index) => {
      let uniqueId = emp.id;
      if (!uniqueId || idMap.has(uniqueId)) {
        uniqueId = `EMP_FIX_${index}_${Math.random().toString(36).substr(2, 5)}`;
      }
      idMap.add(uniqueId);
      return { ...emp, id: uniqueId };
    });
  });

  const generateUniqueId = (currentEmployees) => {
    if (currentEmployees.length === 0) return 'EMP001';
    const ids = currentEmployees
      .map(emp => parseInt(emp.id.replace('EMP', '')))
      .filter(id => !isNaN(id));
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    return `EMP${String(maxId + 1).padStart(3, '0')}`;
  };

  const addEmployee = (employee) => {
    setEmployees((prev) => [
      { 
        ...employee, 
        id: employee.empId || generateUniqueId(prev),
        status: 'Active'
      }, 
      ...prev
    ]);
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

  const updateEmployee = (id, updatedData) => {
    setEmployees((prev) => prev.map(emp => emp.id === id ? { ...emp, ...updatedData } : emp));
  };

  const resetTodayAttendance = (id) => {
    setEmployees((prev) => prev.map(emp => 
      emp.id === id ? { ...emp, lastCheckIn: null, lastCheckOut: null, attendanceStatus: 'Pending' } : emp
    ));
  };

  const deleteEmployee = (id) => {
    setEmployees((prev) => prev.filter(emp => emp.id !== id));
  };

  return (
    <EmployeeContext.Provider value={{ 
      employees, 
      addEmployee, 
      addBulkEmployees,
      updateEmployee, 
      deleteEmployee,
      resetTodayAttendance
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
