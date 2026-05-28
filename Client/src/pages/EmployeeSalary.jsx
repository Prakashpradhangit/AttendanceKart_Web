import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  Calendar, 
  ChevronRight, 
  Download, 
  PlusCircle, 
  MinusCircle,
  FileText,
  ArrowDown,
  X,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

import PayslipTemplate from '../components/PayslipTemplate';

// Mock data structures removed - now bound dynamically to backend API data

const EmployeeSalary = () => {
  const [payrolls, setPayrolls] = React.useState([]);
  const [requests, setRequests] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const [showPayslip, setShowPayslip] = React.useState(false);
  const [showRequestSuccess, setShowRequestSuccess] = React.useState(false);
  const [showRequestModal, setShowRequestModal] = React.useState(false);
  const [requestReason, setRequestReason] = React.useState('');
  const [reasonError, setReasonError] = React.useState('');
  const [selectedMonth, setSelectedMonth] = React.useState('');
  const [orgDetails, setOrgDetails] = React.useState(null);

  const fetchMyData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch payrolls
      const pRes = await fetch('/api/payroll/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let payrollData = [];
      if (pRes.ok) {
        payrollData = await pRes.json();
        setPayrolls(payrollData);
      }

      // Fetch requests
      const rRes = await fetch('/api/payroll/my/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (rRes.ok) {
        const requestData = await rRes.json();
        setRequests(requestData);
      }

      // Fetch organization settings
      try {
        const oRes = await fetch('/api/admin/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (oRes.ok) {
          const oData = await oRes.json();
          setOrgDetails(oData);
        }
      } catch (err) {
        console.error("Failed to fetch organization settings:", err);
      }

      // Default to latest month
      if (payrollData.length > 0) {
        const sorted = [...payrollData].sort((a,b) => b.id - a.id);
        setSelectedMonth(sorted[0].month);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMyData();
  }, []);

  // Compute standard months dropdown values from actual payrolls
  const months = payrolls.length > 0
    ? Array.from(new Set(payrolls.map(p => p.month))).sort((a, b) => b.localeCompare(a))
    : [];

  const activePayroll = payrolls.find(p => p.month === selectedMonth);
  const hasRequestPending = requests.some(r => r.month === selectedMonth && r.status === 'PENDING');

  const trendData = payrolls
    .filter(p => p.status === 'PAID')
    .map(p => ({
      month: p.month.split(' ')[0], // just month name e.g. "May"
      salary: p.netSalary
    }))
    .reverse()
    .slice(-6);

  // Dynamic salary data for PayslipTemplate
  const salaryData = activePayroll ? {
    orgName: orgDetails?.organisation_name || localStorage.getItem('organisation_name') || 'AttendanceKart Solutions',
    orgAddress: orgDetails?.organisation_address || '461 Sai Sobagu, 1st Floor Outer Ring Road Teachers Colony, Sector 6 HSR Layout Bangalore Karnataka 560034 India',
    employeeName: activePayroll.employeeName || 'Employee',
    employeeId: activePayroll.employeeId || 'EMP',
    designation: activePayroll.designation || 'Staff',
    department: activePayroll.department || '',
    phoneNumber: activePayroll.phoneNumber || '',
    doj: activePayroll.doj ? new Date(activePayroll.doj).toLocaleDateString('en-IN') : '',
    month: activePayroll.month.split(' ')[0],
    year: activePayroll.month.split(' ')[1] || '2026',
    earnings: [
      { name: 'Basic Salary', amount: activePayroll.basicSalary.toLocaleString() },
      { name: 'House Rent Allowance (HRA)', amount: activePayroll.hra.toLocaleString() },
      { name: 'Conveyance Allowance', amount: activePayroll.conveyanceAllowance.toLocaleString() },
      { name: 'Medical Allowance', amount: activePayroll.medicalAllowance.toLocaleString() },
      { name: 'Special Allowance', amount: activePayroll.specialAllowance.toLocaleString() },
      { name: 'Other Allowances', amount: activePayroll.otherAllowances.toLocaleString() },
      { name: 'Performance Bonus', amount: activePayroll.performanceBonus.toLocaleString() },
    ],
    deductions: [
      { name: 'Provident Fund (PF)', amount: activePayroll.providentFund.toLocaleString() },
      { name: 'Professional Tax', amount: activePayroll.professionalTax.toLocaleString() },
      { name: 'Income Tax (TDS)', amount: activePayroll.incomeTax.toLocaleString() },
      { name: 'ESI', amount: activePayroll.esi.toLocaleString() },
      { name: 'Other Deductions', amount: activePayroll.otherDeductions.toLocaleString() },
      { name: 'Attendance Deductions', amount: activePayroll.attendanceDeduction.toLocaleString() },
    ],
    totalEarnings: activePayroll.totalEarnings.toLocaleString(),
    totalDeductions: activePayroll.totalDeductions.toLocaleString(),
    netSalary: activePayroll.netSalary.toLocaleString(),
    daysWorked: activePayroll.presentDays || 0,
    totalDays: activePayroll.totalDays || 0,
    rawNetSalary: activePayroll.netSalary || 0,
    uanNumber: activePayroll.uanNumber || '',
    pfNumber: activePayroll.pfNumber || '',
    esiNumber: activePayroll.esiNumber || '',
    bankName: activePayroll.bankName || '',
    ifscCode: activePayroll.ifscCode || '',
    accountNumber: activePayroll.accountNumber || '',
    paidDays: activePayroll.totalDays - (activePayroll.lopDays || activePayroll.absentDays || 0),
    lopDays: activePayroll.lopDays || activePayroll.absentDays || 0
  } : null;

  const handleOpenRequestModal = () => {
    setRequestReason('');
    setReasonError('');
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async () => {
    if (!requestReason.trim()) {
      setReasonError('Please provide a reason for your request.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/payroll/my/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          month: selectedMonth,
          reason: requestReason
        })
      });
      if (res.ok) {
        setShowRequestModal(false);
        setShowRequestSuccess(true);
        fetchMyData(); // reload requests
        setTimeout(() => setShowRequestSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadPayslip = () => {
    const payslipEl = document.getElementById('printable-payslip');
    if (!payslipEl) return;

    // Clone payslip content and inject as direct child of body
    const clone = payslipEl.cloneNode(true);
    clone.removeAttribute('id');

    const wrapper = document.createElement('div');
    wrapper.id = 'print-wrapper';
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // Cleanup after print dialog closes
    const cleanup = () => {
      if (document.body.contains(wrapper)) {
        document.body.removeChild(wrapper);
      }
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);

    window.print();
  };

  return (
    <div className="px-6 lg:px-10 pt-2 pb-10 bg-[#F8FAFC] min-h-screen relative">
      {/* Request Success Toast */}
      <AnimatePresence>
        {showRequestSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-4 left-1/2 z-[100] bg-white border border-emerald-100 shadow-2xl shadow-emerald-200/50 rounded-2xl px-6 py-4 flex items-center gap-4 min-w-[320px]"
          >
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle2 className="text-emerald-600" size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Request Sent Successfully</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Admin will review your request shortly.</p>
            </div>
            <button onClick={() => setShowRequestSuccess(false)} className="ml-auto text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request Payslip Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setShowRequestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-8 pb-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <FileText className="text-[#0061E0]" size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Request Payslip</h2>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{selectedMonth}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-8 pb-8 space-y-6">
                {/* Purpose Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Purpose of Request<span className="text-rose-500 ml-0.5">*</span></label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Loan Application', 'Visa Processing', 'Income Proof', 'Other'].map((purpose) => (
                      <button
                        key={purpose}
                        onClick={() => setRequestReason(purpose)}
                        className={`py-3 px-4 rounded-2xl text-xs font-bold border-2 transition-all ${
                          requestReason === purpose
                            ? 'border-[#0061E0] bg-blue-50 text-[#0061E0]'
                            : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                        }`}
                      >
                        {purpose}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason Textarea */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Additional Details</label>
                  <textarea
                    value={requestReason === 'Loan Application' || requestReason === 'Visa Processing' || requestReason === 'Income Proof'
                      ? ''
                      : requestReason.startsWith('Other') || !['Loan Application','Visa Processing','Income Proof'].includes(requestReason)
                        ? requestReason
                        : ''}
                    onChange={(e) => setRequestReason(e.target.value)}
                    placeholder="Briefly describe why you need this payslip..."
                    rows={4}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-5 text-sm font-medium text-gray-700 outline-none focus:border-[#0061E0]/30 focus:ring-4 focus:ring-blue-500/5 resize-none transition-all placeholder:text-gray-300"
                  />
                  {reasonError && (
                    <p className="text-xs text-rose-500 font-semibold ml-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full inline-block"></span>
                      {reasonError}
                    </p>
                  )}
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-600 font-medium leading-relaxed">
                    Your request will be sent to HR/Admin. You will be notified once the payslip is approved and ready for download.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 py-4 rounded-2xl border-2 border-gray-100 text-sm font-bold text-gray-400 hover:text-gray-600 hover:border-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitRequest}
                    className="flex-[2] py-4 rounded-2xl bg-[#0061E0] hover:bg-[#0052cc] text-white text-sm font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <FileText size={16} />
                    Submit Request
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#1E293B]">Salary</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your monthly earnings, deductions, and payslips.</p>
        </div>

        {/* Month Selector Dropdown */}
        <div className="relative group">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="appearance-none bg-white border border-gray-100 text-[#1E293B] text-sm font-semibold rounded-2xl py-3 pl-6 pr-12 shadow-sm hover:border-[#0061E0]/30 transition-all outline-none cursor-pointer min-w-[180px]"
            disabled={months.length === 0}
          >
            {months.length > 0 ? (
              months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))
            ) : (
              <option value="">No Payroll Generated</option>
            )}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#0061E0] transition-colors">
            <ChevronDown size={18} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0061E0]"></div>
        </div>
      ) : (
        <>
          {/* Top Stats Cards - Separated into individual divs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Net Salary Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm flex flex-col justify-center"
            >
              <p className="text-sm font-semibold text-gray-400 mb-2">Net Salary</p>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl font-semibold text-[#1E293B]">
                  ₹ {activePayroll ? activePayroll.netSalary.toLocaleString() : '—'}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  activePayroll?.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' :
                  activePayroll?.status === 'PENDING' ? 'bg-orange-50 text-orange-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {activePayroll ? activePayroll.status : 'Unprocessed'}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium">
                {activePayroll && activePayroll.paymentDate ? `Paid on ${activePayroll.paymentDate}` : 
                 activePayroll ? 'Payout Pending' : 'No payroll record for this month'}
              </p>
            </motion.div>

            {/* Gross Salary Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm flex items-center gap-5"
            >
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                <Wallet className="text-[#0061E0]" size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">Gross Salary</p>
                <p className="text-xl font-semibold text-[#1E293B]">
                  ₹ {activePayroll ? activePayroll.totalEarnings.toLocaleString() : '—'}
                </p>
              </div>
            </motion.div>

            {/* Total Deductions Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm flex items-center gap-5"
            >
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center shrink-0">
                <ArrowDown className="text-rose-500" size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">Total Deductions</p>
                <p className="text-xl font-semibold text-[#1E293B]">
                  ₹ {activePayroll ? activePayroll.totalDeductions.toLocaleString() : '—'}
                </p>
              </div>
            </motion.div>

            {/* Days Worked Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm flex items-center gap-5"
            >
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                <Calendar className="text-emerald-500" size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">Days Worked</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-semibold text-[#1E293B]">
                    {activePayroll ? `${activePayroll.presentDays} / ${activePayroll.totalDays}` : '—'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Present Days</p>
              </div>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Salary Breakdown: Earnings & Deductions side by side */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-3"
            >
              <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm h-full">
                <h2 className="text-lg font-semibold text-[#1E293B] mb-8">Salary Details</h2>
                
                {activePayroll ? (
                  <div className="grid md:grid-cols-2 gap-12">
                    {/* Earnings Section */}
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-50 pb-4 px-2">
                        <span>Earnings</span>
                        <span>Amount (₹)</span>
                      </div>
                      <div className="space-y-3">
                        {salaryData.earnings.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center group px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <PlusCircle size={16} className="text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
                              <span className="text-sm font-medium text-gray-600">{item.name}</span>
                            </div>
                            <span className="text-sm font-semibold text-[#1E293B]">₹ {item.amount}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 flex justify-between items-center bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/30">
                        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Total Earnings</span>
                        <span className="text-lg font-semibold text-emerald-700">₹ {salaryData.totalEarnings}</span>
                      </div>
                    </div>

                    {/* Deductions Section */}
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-50 pb-4 px-2">
                        <span>Deductions</span>
                        <span>Amount (₹)</span>
                      </div>
                      <div className="space-y-3">
                        {salaryData.deductions.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center group px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <MinusCircle size={16} className="text-rose-500/40 group-hover:text-rose-500 transition-colors" />
                              <span className="text-sm font-medium text-gray-600">{item.name}</span>
                            </div>
                            <span className="text-sm font-semibold text-[#1E293B]">₹ {item.amount}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 flex justify-between items-center bg-rose-50/50 p-5 rounded-2xl border border-rose-100/30">
                        <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Total Deductions</span>
                        <span className="text-lg font-semibold text-rose-700">₹ {salaryData.totalDeductions}</span>
                      </div>
                      
                      {/* Final Net Salary inside the same card */}
                      <div className="mt-6 flex justify-between items-center bg-[#F0F7FF] p-5 rounded-[20px] border border-[#E0EFFF] shadow-sm">
                        <span className="text-xs font-semibold text-[#0061E0] uppercase tracking-widest">Net Salary</span>
                        <span className="text-2xl font-semibold text-[#0061E0]">₹ {salaryData.netSalary}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
                      <Wallet size={28} />
                    </div>
                    <h3 className="text-base font-bold text-gray-700">No Salary Payout Record</h3>
                    <p className="text-xs text-gray-400 font-medium mt-1 max-w-sm">Payroll calculations for this month are not generated yet. Please contact your HR/Admin or request a payslip request.</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right Column: Payslip only */}
            <div className="lg:col-span-1 h-full">
              {/* Payslip Download */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm h-full flex flex-col min-h-[360px]"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                    <FileText size={20} className="text-[#1E293B]" />
                  </div>
                  <h2 className="text-lg font-semibold text-[#1E293B]">Payslip</h2>
                </div>
                <p className="text-sm font-medium text-gray-500 mb-8">
                  Review and download your payslip for <span className="text-[#1E293B] font-semibold">{selectedMonth}</span>.
                </p>
                
                <div className="flex flex-col items-center gap-6 my-auto py-4">
                  {activePayroll ? (
                    <>
                      <div 
                        className="relative group cursor-pointer"
                        onClick={() => setShowPayslip(true)}
                      >
                        <div className="w-24 h-28 border-2 border-indigo-100 rounded-2xl flex items-center justify-center bg-indigo-50/20 group-hover:border-[#0061E0]/50 group-hover:bg-blue-50/30 transition-all shadow-md">
                           <FileText size={48} className="text-[#0061E0]/70 group-hover:text-[#0061E0] transition-colors" />
                        </div>
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute -bottom-3 -right-3 w-10 h-10 bg-[#0061E0] rounded-full flex items-center justify-center shadow-lg border-2 border-white text-white"
                        >
                          <Download size={16} />
                        </motion.div>
                      </div>
                      
                      <button 
                        onClick={() => setShowPayslip(true)}
                        className="w-full bg-[#0061E0] hover:bg-[#0052cc] text-white py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 transition-all transform hover:-translate-y-1 active:translate-y-0 mt-4"
                      >
                        <FileText size={20} />
                        View & Download
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-24 h-28 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center bg-gray-50">
                         <FileText size={48} className="text-gray-300" />
                      </div>
                      
                      <button 
                        onClick={handleOpenRequestModal}
                        disabled={hasRequestPending}
                        className={`w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 shadow-md transition-all mt-4 ${
                          hasRequestPending 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100'
                        }`}
                      >
                        <FileText size={20} />
                        {hasRequestPending ? 'Request Pending' : 'Request Payslip'}
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Salary Trend Chart */}
          {trendData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm mt-8"
            >
              <h2 className="text-lg font-semibold text-[#1E293B] mb-6">Salary Payout Trend</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0061E0" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0061E0" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="salary" stroke="#0061E0" strokeWidth={3} fillOpacity={1} fill="url(#colorSalary)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Payslip Modal Overlay */}
      <AnimatePresence>
        {showPayslip && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 lg:p-8"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl relative"
            >
              {/* Modal Header Actions */}
              <div className="sticky top-0 right-0 p-6 flex justify-end gap-4 bg-white/80 backdrop-blur-md z-10 border-b border-gray-50">
                <button 
                  onClick={handleDownloadPayslip}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#0061E0] text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  <Download size={18} />
                  Download PDF
                </button>
                <button 
                  onClick={() => setShowPayslip(false)}
                  className="p-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Template Content */}
              <div id="printable-payslip" className="p-8 lg:p-12">
                <PayslipTemplate data={salaryData} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeSalary;
