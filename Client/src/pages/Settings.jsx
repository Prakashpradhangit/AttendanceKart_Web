import React, { useState, useEffect } from 'react';
import { 
  Lock, Save, ShieldCheck, Globe, Layout, Users, 
  Clock, IndianRupee, FileText, Bell, Trash2, Plus,
  Camera, CheckCircle2, AlertCircle, RefreshCw, X
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';

const Settings = () => {
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [showAddDeptInput, setShowAddDeptInput] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    general: {
      companyName: 'AttendanceKart Pvt Ltd',
      companyEmail: 'admin@attendancekart.com',
      companyAddress: '',
      shortForm: '',
      language: 'English (IN)',
      timezone: 'GMT +5:30',
      theme: 'light'
    },
    dashboard: {
      showSummaryCards: true,
      showAttendanceTrend: true,
      showDeptDistribution: true,
      defaultRange: 'Last 30 Days'
    },
    employees: {
      departments: ['Development', 'Design', 'Marketing', 'HR', 'Sales'],
      roles: ['Manager', 'Developer', 'Designer', 'HR Specialist', 'Sales Lead']
    },
    attendance: {
      checkInTime: '09:00',
      checkOutTime: '18:00',
      gracePeriod: '15',
      shiftDuration: '9.0',
      workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    },
    payroll: {
      currency: '₹ (INR)',
      taxRate: '10',
      securityPin: '1234'
    },
    leaves: {
      sick: 12,
      casual: 12,
      emergency: 6,
      accrualRate: 1.5,
      internPeriodMonths: 3,
      probationPeriodMonths: 6,
      holidays: []
    },
    reports: {
      autoExport: false,
      notifyAdmin: true,
      format: 'PDF'
    }
  });

  // Handle Tab Change
  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'dashboard', label: 'Dashboard', icon: Layout },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'payroll', label: 'Payroll', icon: IndianRupee },
    { id: 'leaves', label: 'Leaves', icon: FileText },
    { id: 'reports', label: 'Reports', icon: Bell },
  ];

  const [loading, setLoading] = useState(false);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({
          ...prev,
          general: {
            ...prev.general,
            companyName: data.organisation_name || prev.general.companyName,
            companyEmail: data.email || prev.general.companyEmail,
            companyAddress: data.organisation_address || '',
            shortForm: data.short_form || ''
          },
          employees: {
            ...prev.employees,
            departments: (() => {
              try {
                return data.departments ? JSON.parse(data.departments) : prev.employees.departments;
              } catch (e) {
                return prev.employees.departments;
              }
            })()
          },
          attendance: {
            ...prev.attendance,
            checkInTime: data.defaultCheckInTime || '09:00',
            checkOutTime: data.defaultCheckOutTime || '18:00',
            gracePeriod: data.gracePeriod || 15,
            shiftDuration: data.shiftDuration !== undefined ? data.shiftDuration : '9.0'
          },
          leaves: {
            sick: data.sickLeavesLimit !== undefined ? data.sickLeavesLimit : 12,
            casual: data.casualLeavesLimit !== undefined ? data.casualLeavesLimit : 12,
            emergency: data.emergencyLeavesLimit !== undefined ? data.emergencyLeavesLimit : 6,
            accrualRate: data.monthlyAccrualRate !== undefined ? data.monthlyAccrualRate : 1.5,
            internPeriodMonths: data.internPeriodMonths !== undefined ? data.internPeriodMonths : 3,
            probationPeriodMonths: data.probationPeriodMonths !== undefined ? data.probationPeriodMonths : 6,
            holidays: (() => {
              try {
                return data.declaredHolidays ? JSON.parse(data.declaredHolidays) : [];
              } catch (e) {
                return [];
              }
            })()
          }
        }));
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setMessage('');
    setError('');
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          defaultCheckInTime: settings.attendance.checkInTime,
          defaultCheckOutTime: settings.attendance.checkOutTime,
          gracePeriod: settings.attendance.gracePeriod,
          shiftDuration: settings.attendance.shiftDuration,
          shortForm: settings.general.shortForm,
          organisationAddress: settings.general.companyAddress,
          sickLeavesLimit: settings.leaves.sick,
          casualLeavesLimit: settings.leaves.casual,
          emergencyLeavesLimit: settings.leaves.emergency,
          monthlyAccrualRate: settings.leaves.accrualRate,
          declaredHolidays: JSON.stringify(settings.leaves.holidays),
          departments: JSON.stringify(settings.employees.departments),
          internPeriodMonths: settings.leaves.internPeriodMonths,
          probationPeriodMonths: settings.leaves.probationPeriodMonths
        })
      });

      if (res.ok) {
        setMessage('All settings have been saved successfully!');
        fetchSettings();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('Failed to save settings.');
      }
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            System Settings
          </h1>
          <p className="text-sm text-gray-500 font-medium">Configure and manage all module functionalities</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-indigo-200"
        >
          <Save size={18} /> Save Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 bg-white p-3 rounded-3xl shadow-sm border border-gray-100 h-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[500px]">
          {message && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
              <CheckCircle2 size={20} />
              <p className="text-sm font-semibold">{message}</p>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">General Configuration</h3>
                <p className="text-sm text-gray-500 mt-1">Manage company profile and basic app preferences</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Company Name</label>
                  <input 
                    type="text" 
                    value={settings.general.companyName}
                    onChange={(e) => updateSetting('general', 'companyName', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold transition-all"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Company Address</label>
                  <textarea 
                    rows={2}
                    value={settings.general.companyAddress}
                    onChange={(e) => updateSetting('general', 'companyAddress', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold transition-all resize-none text-sm"
                    placeholder="Enter full company address for payslips"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Admin Email</label>
                  <input 
                    type="email" 
                    value={settings.general.companyEmail}
                    onChange={(e) => updateSetting('general', 'companyEmail', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Organization Short Form (e.g. SVT)</label>
                  <input 
                    type="text" 
                    value={settings.general.shortForm}
                    onChange={(e) => updateSetting('general', 'shortForm', e.target.value.trim().toUpperCase())}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold transition-all"
                    placeholder="e.g. SVT"
                  />
                  <p className="text-xs text-gray-400 mt-1 font-medium ml-1">
                    Enter short form (prefix) of your company to auto-generate Employee IDs (e.g., SVT00001).
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Language</label>
                  <select 
                    value={settings.general.language}
                    onChange={(e) => updateSetting('general', 'language', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold transition-all cursor-pointer"
                  >
                    <option>English (IN)</option>
                    <option>English (US)</option>
                    <option>Hindi (IN)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Timezone</label>
                  <select 
                    value={settings.general.timezone}
                    onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold transition-all cursor-pointer"
                  >
                    <option>GMT +5:30</option>
                    <option>GMT +0:00</option>
                    <option>GMT -5:00</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Dashboard Settings</h3>
                <p className="text-sm text-gray-500 mt-1">Customize your landing page metrics and layout</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Show Summary Cards</p>
                    <p className="text-xs text-gray-500">Enable/Disable top metric cards</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.dashboard.showSummaryCards}
                    onChange={(e) => updateSetting('dashboard', 'showSummaryCards', e.target.checked)}
                    className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Attendance Trend Chart</p>
                    <p className="text-xs text-gray-500">Show the monthly attendance line graph</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.dashboard.showAttendanceTrend}
                    onChange={(e) => updateSetting('dashboard', 'showAttendanceTrend', e.target.checked)}
                    className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Department Distribution</p>
                    <p className="text-xs text-gray-500">Display the pie chart for team breakdown</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.dashboard.showDeptDistribution}
                    onChange={(e) => updateSetting('dashboard', 'showDeptDistribution', e.target.checked)}
                    className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Employee Settings</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage organizational structure and taxonomies</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-3">Departments</label>
                  <div className="flex flex-wrap gap-2">
                    {settings.employees.departments.map((dept, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-semibold text-sm border border-indigo-100 group">
                        {dept}
                        <button 
                          onClick={() => {
                            const updated = settings.employees.departments.filter((_, i) => i !== idx);
                            updateSetting('employees', 'departments', updated);
                          }}
                          className="hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {showAddDeptInput ? (
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-250 rounded-xl p-1.5 animate-in fade-in duration-200">
                        <input 
                          type="text" 
                          placeholder="New Department..."
                          value={newDeptName}
                          onChange={(e) => setNewDeptName(e.target.value)}
                          className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-semibold outline-none w-36"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (!newDeptName.trim()) return;
                              if (settings.employees.departments.includes(newDeptName.trim())) {
                                showAlert("Department already exists!", "error");
                                return;
                              }
                              const updated = [...settings.employees.departments, newDeptName.trim()];
                              updateSetting('employees', 'departments', updated);
                              setNewDeptName('');
                              setShowAddDeptInput(false);
                            }
                          }}
                        />
                        <button 
                          onClick={() => {
                            if (!newDeptName.trim()) return;
                            if (settings.employees.departments.includes(newDeptName.trim())) {
                              showAlert("Department already exists!", "error");
                              return;
                            }
                            const updated = [...settings.employees.departments, newDeptName.trim()];
                            updateSetting('employees', 'departments', updated);
                            setNewDeptName('');
                            setShowAddDeptInput(false);
                          }}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-all"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                        <button 
                          onClick={() => {
                            setNewDeptName('');
                            setShowAddDeptInput(false);
                          }}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowAddDeptInput(true)}
                        className="flex items-center gap-1 px-4 py-2 bg-gray-50 text-gray-500 rounded-xl font-semibold text-sm border border-dashed border-gray-300 hover:bg-gray-100 transition-all"
                      >
                        <Plus size={14} /> Add New
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-3">Roles</label>
                  <div className="flex flex-wrap gap-2">
                    {settings.employees.roles.map((role, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-semibold text-sm border border-emerald-100 group">
                        {role}
                        <button className="hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button className="flex items-center gap-1 px-4 py-2 bg-gray-50 text-gray-500 rounded-xl font-semibold text-sm border border-dashed border-gray-300 hover:bg-gray-100 transition-all">
                      <Plus size={14} /> Add New
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Attendance Policies</h3>
                <p className="text-sm text-gray-500 mt-1">Set working hours and late mark thresholds</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Default Check-In</label>
                  <input 
                    type="time" 
                    value={settings.attendance.checkInTime}
                    onChange={(e) => updateSetting('attendance', 'checkInTime', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Default Check-Out</label>
                  <input 
                    type="time" 
                    value={settings.attendance.checkOutTime}
                    onChange={(e) => updateSetting('attendance', 'checkOutTime', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Late Grace Period (Min)</label>
                  <input 
                    type="number" 
                    value={settings.attendance.gracePeriod}
                    onChange={(e) => updateSetting('attendance', 'gracePeriod', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Shift Duration (Hours)</label>
                  <input 
                    type="number" 
                    step="0.5"
                    value={settings.attendance.shiftDuration}
                    onChange={(e) => updateSetting('attendance', 'shiftDuration', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Payroll & Financials</h3>
                <p className="text-sm text-gray-500 mt-1">Manage currency and payout security</p>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Currency</label>
                    <select 
                      value={settings.payroll.currency}
                      onChange={(e) => updateSetting('payroll', 'currency', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold transition-all"
                    >
                      <option>₹ (INR)</option>
                      <option>$ (USD)</option>
                      <option>€ (EUR)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Tax Deduction (%)</label>
                    <input 
                      type="number" 
                      value={settings.payroll.taxRate}
                      onChange={(e) => updateSetting('payroll', 'taxRate', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold transition-all"
                    />
                  </div>
                </div>

                <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl space-y-4">
                   <div className="flex items-center gap-3 text-rose-600">
                     <Lock size={20} />
                     <p className="font-semibold">Security PIN</p>
                   </div>
                   <p className="text-xs text-rose-500 font-medium">This PIN is required to unlock the Payroll module for sensitive data access.</p>
                   <input 
                    type="password" 
                    value={settings.payroll.securityPin}
                    onChange={(e) => updateSetting('payroll', 'securityPin', e.target.value)}
                    className="bg-white border border-rose-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-rose-500/20 font-semibold tracking-widest w-40"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leaves' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Leave Policies & Holidays</h3>
                <p className="text-sm text-gray-500 mt-1">Configure annual quotas, monthly accrual dynamics, and declared holidays</p>
              </div>
              <div className="space-y-6">
                {/* Limits section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 space-y-2">
                    <p className="text-sm font-semibold text-gray-950">Sick Leave Limit</p>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        value={settings.leaves.sick}
                        onChange={(e) => updateSetting('leaves', 'sick', parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-gray-200 rounded-2xl py-2.5 px-4 font-semibold text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 space-y-2">
                    <p className="text-sm font-semibold text-gray-950">Casual Leave Limit</p>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        value={settings.leaves.casual}
                        onChange={(e) => updateSetting('leaves', 'casual', parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-gray-200 rounded-2xl py-2.5 px-4 font-semibold text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 space-y-2">
                    <p className="text-sm font-semibold text-gray-950">Emergency Leave Limit</p>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        value={settings.leaves.emergency}
                        onChange={(e) => updateSetting('leaves', 'emergency', parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-gray-200 rounded-2xl py-2.5 px-4 font-semibold text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Accrual Settings */}
                <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-[32px] space-y-3">
                  <div className="flex items-center gap-3 text-indigo-700">
                    <RefreshCw size={20} className="animate-spin" style={{ animationDuration: '6s' }} />
                    <p className="font-bold text-sm">Monthly Accrual Policy</p>
                  </div>
                  <p className="text-xs text-indigo-500 font-medium leading-relaxed">
                    Leave balance accrues dynamically starting from each employee's unique joining date instead of being unlocked all at once annually. Configure the monthly rate below:
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-bold text-gray-500">Monthly Accrual Rate (Leaves/Month):</span>
                    <input 
                      type="number" 
                      step="0.1"
                      value={settings.leaves.accrualRate}
                      onChange={(e) => updateSetting('leaves', 'accrualRate', parseFloat(e.target.value) || 0)}
                      className="w-24 bg-white border border-gray-200 rounded-xl py-2 px-3 text-center font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                {/* Intern & Probation Period Configuration */}
                <div className="p-6 bg-amber-50/60 border border-amber-100 rounded-[32px] space-y-4">
                  <div className="flex items-center gap-3 text-amber-700">
                    <AlertCircle size={20} />
                    <p className="font-bold text-sm">Restricted Employment Periods</p>
                  </div>
                  <p className="text-xs text-amber-600 font-medium leading-relaxed">
                    Employees in <strong>Intern</strong> or <strong>Probation</strong> status can only apply for <strong>Loss of Pay (LOP)</strong> leaves — no paid leave is granted. Set the duration of each period below. After this period ends, the admin should manually update the employee's employment type to <strong>Full Time</strong>.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-4 border border-amber-100 space-y-2">
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Intern Period</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="24"
                          value={settings.leaves.internPeriodMonths}
                          onChange={(e) => updateSetting('leaves', 'internPeriodMonths', parseInt(e.target.value) || 1)}
                          className="w-20 bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-center font-bold text-sm outline-none focus:ring-2 focus:ring-amber-400/30"
                        />
                        <span className="text-xs text-gray-500 font-semibold">months</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border border-amber-100 space-y-2">
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Probation Period</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="24"
                          value={settings.leaves.probationPeriodMonths}
                          onChange={(e) => updateSetting('leaves', 'probationPeriodMonths', parseInt(e.target.value) || 1)}
                          className="w-20 bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-center font-bold text-sm outline-none focus:ring-2 focus:ring-amber-400/30"
                        />
                        <span className="text-xs text-gray-500 font-semibold">months</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Declared Holidays Manager */}
                <div className="p-6 bg-white border border-gray-100 rounded-[32px] space-y-6">
                  <div>
                    <h4 className="text-md font-bold text-gray-900">Declare Organization Holidays</h4>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">Weeks and declared holidays are automatically skipped when calculating employee leave days</p>
                  </div>
                  
                  {/* Holiday Form */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-gray-50 p-4 rounded-2xl">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Holiday Date</label>
                      <input 
                        type="date" 
                        value={newHolidayDate}
                        onChange={(e) => setNewHolidayDate(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-xs font-semibold outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Holiday Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Memorial Day"
                        value={newHolidayName}
                        onChange={(e) => setNewHolidayName(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-xs font-semibold outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newHolidayDate || !newHolidayName) return;
                        const existing = settings.leaves.holidays || [];
                        if (existing.some(h => h.date === newHolidayDate)) {
                          showAlert("A holiday with this date is already declared!", "error");
                          return;
                        }
                        const updated = [...existing, { date: newHolidayDate, name: newHolidayName }].sort((a,b) => new Date(a.date) - new Date(b.date));
                        updateSetting('leaves', 'holidays', updated);
                        setNewHolidayDate('');
                        setNewHolidayName('');
                      }}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
                    >
                      Declare Holiday
                    </button>
                  </div>

                  {/* Holidays List */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Declared Holidays ({ (settings.leaves.holidays || []).length })</p>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {(settings.leaves.holidays || []).map((holiday, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                          <div>
                            <p className="text-xs font-bold text-gray-800">{holiday.name}</p>
                            <p className="text-[10px] font-semibold text-gray-400">{holiday.date}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = settings.leaves.holidays.filter((_, i) => i !== idx);
                              updateSetting('leaves', 'holidays', updated);
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      {(settings.leaves.holidays || []).length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-4">No declared holidays yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Report Preferences</h3>
                <p className="text-sm text-gray-500 mt-1">Configure automated reporting and notifications</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Automatic Export</p>
                    <p className="text-xs text-gray-500">Generate and save monthly reports automatically</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.reports.autoExport}
                    onChange={(e) => updateSetting('reports', 'autoExport', e.target.checked)}
                    className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Admin Notifications</p>
                    <p className="text-xs text-gray-500">Get alerted when new reports are ready</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.reports.notifyAdmin}
                    onChange={(e) => updateSetting('reports', 'notifyAdmin', e.target.checked)}
                    className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
