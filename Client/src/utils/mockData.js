export const summaryCards = [
  { id: 1, title: 'Total Employees', value: '120', trend: '+5 this month', icon: 'users', color: 'bg-indigo-100 text-indigo-600' },
  { id: 2, title: 'Present Today', value: '80', trend: '81.67% of total', icon: 'user-check', color: 'bg-green-100 text-green-600' },
  { id: 3, title: 'Absent', value: '30', trend: '10.4% of total', icon: 'user-x', color: 'bg-red-100 text-red-600' },
  { id: 4, title: 'On Leave', value: '5', trend: '4% of total', icon: 'calendar', color: 'bg-yellow-100 text-yellow-600' },
];

export const attendanceData = [
  { name: 'Mon', present: 70, absent: 5, leave: 2 },
  { name: 'Tue', present: 75, absent: 3, leave: 1 },
  { name: 'Wed', present: 68, absent: 8, leave: 4 },
  { name: 'Thu', present: 80, absent: 2, leave: 0 },
  { name: 'Fri', present: 72, absent: 4, leave: 3 },
  { name: 'Sat', present: 77, absent: 2, leave: 1 },
  { name: 'Sun', present: 74, absent: 3, leave: 2 },
];

export const employeeGrowth = [
  { name: 'Jan', count: 100 },
  { name: 'Feb', count: 105 },
  { name: 'Mar', count: 110 },
  { name: 'Apr', count: 120 },
];

export const salaryDistribution = [
  { name: 'HR', amount: 50000 },
  { name: 'Developer', amount: 150000 },
  { name: 'Manager', amount: 90000 },
  { name: 'Designer', amount: 70000 },
];

export const recentActivity = [
  { id: 1, name: 'John Doe', action: 'Checked in at 09:15 AM', time: '5m ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
  { id: 2, name: 'Jane Smith', action: 'Applied for leave', time: '12m ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
  { id: 3, name: 'Robert Bown', action: 'Checked out at 06:30 PM', time: '9m ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert' },
  { id: 4, name: 'Emily Davis', action: 'Attendance marked late', time: '20m ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily' },
];

export const attendanceStats = [
  { id: 1, title: 'Total Employees', value: '120', change: '+12%', icon: 'users', color: 'bg-blue-500' },
  { id: 2, title: 'Present Today', value: '95', change: '79%', icon: 'user-check', color: 'bg-green-500' },
  { id: 3, title: 'Absent Today', value: '15', change: '12%', icon: 'user-x', color: 'bg-red-500' },
  { id: 4, title: 'Late Arrivals', value: '10', change: '8%', icon: 'clock', color: 'bg-orange-500' },
];

export const detailedAttendanceData = [
  { name: '21 Apr', present: 85, absent: 10, late: 5 },
  { name: '22 Apr', present: 88, absent: 8, late: 4 },
  { name: '23 Apr', present: 82, absent: 12, late: 6 },
  { name: '24 Apr', present: 90, absent: 5, late: 5 },
  { name: '25 Apr', present: 86, absent: 9, late: 5 },
  { name: '26 Apr', present: 92, absent: 4, late: 4 },
  { name: '27 Apr', present: 95, absent: 15, late: 10 },
];

export const attendanceRecords = [
  { id: 'REC001', empId: 'EMP001', name: 'John Doe', department: 'Development', date: '2026-04-27', status: 'Present', checkIn: '09:05 AM', checkOut: '06:15 PM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
  { id: 'REC002', empId: 'EMP002', name: 'Jane Smith', department: 'Design', date: '2026-04-27', status: 'Late', checkIn: '09:45 AM', checkOut: '06:30 PM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
  { id: 'REC003', empId: 'EMP003', name: 'Robert Brown', department: 'Management', date: '2026-04-27', status: 'Absent', checkIn: '-', checkOut: '-', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert' },
  { id: 'REC004', empId: 'EMP004', name: 'Emily Davis', department: 'HR', date: '2026-04-27', status: 'Present', checkIn: '08:55 AM', checkOut: '05:45 PM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily' },
  { id: 'REC005', empId: 'EMP005', name: 'Michael Wilson', department: 'Development', date: '2026-04-27', status: 'Late', checkIn: '10:15 AM', checkOut: '07:00 PM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' },
  { id: 'REC006', empId: 'EMP006', name: 'Sarah Miller', department: 'Marketing', date: '2026-04-27', status: 'Present', checkIn: '09:00 AM', checkOut: '06:00 PM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: 'REC007', empId: 'EMP007', name: 'David Lee', department: 'Sales', date: '2026-04-27', status: 'Absent', checkIn: '-', checkOut: '-', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
];

export const employeesList = [
  { id: 'EMP001', name: 'John Doe', role: 'Developer' },
  { id: 'EMP002', name: 'Jane Smith', role: 'Designer' },
  { id: 'EMP003', name: 'Robert Brown', role: 'Manager' },
  { id: 'EMP004', name: 'Emily Davis', role: 'HR' },
  { id: 'EMP005', name: 'Michael Wilson', role: 'Developer' },
];

export const leaveStats = [
  { id: 1, title: 'Total Requests', value: '128', icon: 'file-text', color: 'bg-blue-100 text-blue-600' },
  { id: 2, title: 'Pending Requests', value: '28', icon: 'clock', color: 'bg-yellow-100 text-yellow-600' },
  { id: 3, title: 'Approved Leaves', value: '86', icon: 'check-circle', color: 'bg-green-100 text-green-600' },
  { id: 4, title: 'Rejected Leaves', value: '14', icon: 'x-circle', color: 'bg-red-100 text-red-600' },
];

export const leaveRecords = [
  { id: 'LR001', empId: 'EMP001', name: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', type: 'Sick Leave', duration: '12 Oct - 14 Oct 2026', days: 3, reason: 'Fever and cold', status: 'Approved', appliedOn: '10 Oct 2026' },
  { id: 'LR002', empId: 'EMP002', name: 'Jane Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane', type: 'Annual Leave', duration: '20 Oct - 25 Oct 2026', days: 6, reason: 'Family vacation', status: 'Pending', appliedOn: '15 Oct 2026' },
  { id: 'LR003', empId: 'EMP003', name: 'Robert Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert', type: 'Casual Leave', duration: '05 Nov - 05 Nov 2026', days: 1, reason: 'Personal work', status: 'Rejected', appliedOn: '01 Nov 2026' },
  { id: 'LR004', empId: 'EMP004', name: 'Emily Davis', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', type: 'Sick Leave', duration: '02 Nov - 03 Nov 2026', days: 2, reason: 'Doctor appointment', status: 'Approved', appliedOn: '01 Nov 2026' },
  { id: 'LR005', empId: 'EMP005', name: 'Michael Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael', type: 'Maternity Leave', duration: '15 Nov - 15 Feb 2027', days: 90, reason: 'Maternity', status: 'Pending', appliedOn: '10 Oct 2026' },
  { id: 'LR006', empId: 'EMP006', name: 'Sarah Miller', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', type: 'Unpaid Leave', duration: '01 Dec - 05 Dec 2026', days: 5, reason: 'Personal reasons', status: 'Pending', appliedOn: '25 Nov 2026' },
];

export const leaveDistribution = [
  { name: 'Sick Leave', value: 45, color: '#3b82f6' }, // blue-500
  { name: 'Casual Leave', value: 30, color: '#10b981' }, // green-500
  { name: 'Annual Leave', value: 15, color: '#f59e0b' }, // amber-500
  { name: 'Other', value: 10, color: '#6366f1' }, // indigo-500
];

export const monthlyAttendanceTrend = [
  { month: 'Jan', rate: 85 },
  { month: 'Feb', rate: 88 },
  { month: 'Mar', rate: 82 },
  { month: 'Apr', rate: 94 },
  { month: 'May', rate: 89 },
  { month: 'Jun', rate: 91 },
];

export const departmentPayrollData = [
  { dept: 'Development', amount: 450000 },
  { dept: 'Design', amount: 280000 },
  { dept: 'Marketing', amount: 150000 },
  { dept: 'HR', amount: 120000 },
  { dept: 'Sales', amount: 200000 },
];

export const reportHistory = [
  { id: 'REP001', name: 'Monthly Attendance Report', type: 'PDF', date: '2026-04-01', size: '2.4 MB', status: 'Generated' },
  { id: 'REP002', name: 'Quarterly Payroll Summary', type: 'XLSX', date: '2026-03-31', size: '1.1 MB', status: 'Generated' },
  { id: 'REP003', name: 'Employee Performance Review', type: 'PDF', date: '2026-03-15', size: '4.5 MB', status: 'Archived' },
  { id: 'REP004', name: 'Leave Utilization Q1', type: 'CSV', date: '2026-03-10', size: '850 KB', status: 'Generated' },
  { id: 'REP005', name: 'New Hire Onboarding List', type: 'DOCX', date: '2026-04-15', size: '1.2 MB', status: 'Processing' },
];

export const payrollData = [
  { id: 'PAY001', name: 'John Doe', empId: 'EMP001', month: 'April 2024', base: '₹4,500', bonus: '₹500', deductions: '₹0', total: '₹5,000', status: 'Paid', avatar: 'JD' },
  { id: 'PAY002', name: 'Jane Smith', empId: 'EMP002', month: 'April 2024', base: '₹5,000', bonus: '₹200', deductions: '₹0', total: '₹5,200', status: 'Pending', avatar: 'JS' },
  { id: 'PAY003', name: 'Robert Bown', empId: 'EMP003', month: 'April 2024', base: '₹6,000', bonus: '₹0', deductions: '₹0', total: '₹6,000', status: 'Paid', avatar: 'RB' },
  { id: 'PAY004', name: 'Emily Davis', empId: 'EMP004', month: 'April 2024', base: '₹4,000', bonus: '₹100', deductions: '₹0', total: '₹4,100', status: 'Paid', avatar: 'ED' },
  { id: 'PAY005', name: 'Michael White', empId: 'EMP005', month: 'April 2024', base: '₹5,500', bonus: '₹300', deductions: '₹0', total: '₹5,800', status: 'Draft', avatar: 'MW' },
];

export const payslipRequests = [
  { id: 'REQ001', name: 'Jane Smith', empId: 'EMP002', month: 'April 2024', requestDate: 'Apr 26, 2024 10:30 AM', status: 'Pending', reason: 'Requesting payslip for loan application', avatar: 'JS' },
  { id: 'REQ002', name: 'Michael White', empId: 'EMP005', month: 'April 2024', requestDate: 'Apr 25, 2024 03:15 PM', status: 'Pending', reason: 'Personal record', avatar: 'MW' },
];
