import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Payroll from './pages/Payroll';
import Login from './pages/Login';
import LoginSelection from './pages/LoginSelection';
import EmployeeLogin from './pages/EmployeeLogin';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeAttendance from './pages/EmployeeAttendance';
import EmployeeLayout from './layouts/EmployeeLayout';
import EmployeeLeaves from './pages/Employeeleaves';
import { EmployeeProvider } from './context/EmployeeContext';

// Import Pages
import Attendance from './pages/Attendance/Attendance';
import Settings from './pages/Settings';
import Leaves from './pages/Leaves';
import Reports from './pages/Reports';

// Super Admin
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminOrganizations from './pages/SuperAdminOrganizations';
import SuperAdminPayments from './pages/SuperAdminPayments';
import SuperAdminSettings from './pages/SuperAdminSettings';

function App() {
  return (
    <EmployeeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginSelection />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/employee/login" element={<EmployeeLogin />} />
          <Route path="/superadmin-login" element={<SuperAdminLogin />} />

          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/employees" element={<Employees />} />
            <Route path="/admin/attendance" element={<Attendance />} />
            <Route path="/admin/payroll" element={<Payroll />} />
            <Route path="/admin/leaves" element={<Leaves />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>

          <Route element={<EmployeeLayout />}>
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/attendance" element={<EmployeeAttendance />} />
            <Route path="/employee/leaves" element={<EmployeeLeaves />} />
          </Route>

          <Route element={<SuperAdminLayout />}>
            <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/superadmin/organizations" element={<SuperAdminOrganizations />} />
            <Route path="/superadmin/payments" element={<SuperAdminPayments />} />
            <Route path="/superadmin/settings" element={<SuperAdminSettings />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </EmployeeProvider>
  );
}

export default App;
