# AttendanceKart Application Workflow

## Overview
AttendanceKart is a React-based employee attendance management system built with Vite, featuring a modern UI with Tailwind CSS, animations via Framer Motion, and data visualization using Recharts. The application manages employee data, attendance tracking, leave requests, payroll, and reporting.

## Main Functionalities and Workflow

### 1. Authentication
- **Login Page**: Users authenticate to access the system
- Route: `/login`
- Features: Secure login form

### 2. Dashboard
- **Route**: `/`
- **Purpose**: Provides an overview of key metrics and recent activities
- **Features**:
  - Summary cards: Total employees, active employees, leave requests, payroll processed
  - Attendance trend chart (line chart)
  - Department distribution (pie chart)
  - Recent activity feed
  - Navigation to other sections

### 3. Employee Management
- **Route**: `/employees`
- **Purpose**: Manage employee records
- **Features**:
  - View employee list with search and department filtering
  - Add new employees via modal form
  - Bulk import employees from Excel files
  - Edit employee details
  - Reset daily attendance status
  - Export employee data
  - Status indicators (active/inactive)

### 4. Attendance Tracking
- **Route**: `/attendance`
- **Purpose**: Monitor and manage employee attendance
- **Features**:
  - View attendance records in table format
  - Filter by employee name/ID, status, date
  - Attendance summary cards (present, absent, late)
  - Charts: Attendance trends, status distribution
  - Export attendance data to Excel
  - Real-time sync with employee data

### 5. Leave Management
- **Route**: `/leaves`
- **Purpose**: Handle employee leave requests
- **Features**:
  - View leave requests
  - Approve/reject leaves
  - Leave balance tracking
  - Leave types (sick, vacation, etc.)

### 6. Payroll Processing
- **Route**: `/payroll`
- **Purpose**: Manage employee payroll
- **Features**:
  - Calculate salaries based on attendance
  - Generate payroll reports
  - Process payments
  - Tax calculations

### 7. Reports Generation
- **Route**: `/reports`
- **Purpose**: Generate various business reports
- **Features**:
  - Attendance reports
  - Employee reports
  - Payroll reports
  - Custom date range filtering
  - Export to PDF/Excel

### 8. Settings
- **Route**: `/settings`
- **Purpose**: Configure application settings
- **Features**:
  - User preferences
  - System configuration
  - Notification settings
  - Security settings

## Data Flow
- **Frontend**: React components with context for state management
- **Data Storage**: Currently uses mock data; designed for backend integration
- **Charts & Visualizations**: Powered by Recharts library
- **File Operations**: XLSX for Excel import/export, File-Saver for downloads

## User Journey
1. User logs in via Login page
2. Redirected to Dashboard for overview
3. Navigate to Employees to add/manage staff
4. Use Attendance to track daily presence
5. Manage leave requests in Leaves section
6. Process payroll in Payroll section
7. Generate reports in Reports section
8. Configure settings as needed

## Technical Stack
- **Frontend**: React 19, Vite, Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Context
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **File Handling**: XLSX, File-Saver
- **Build Tool**: Vite
- **Linting**: ESLint