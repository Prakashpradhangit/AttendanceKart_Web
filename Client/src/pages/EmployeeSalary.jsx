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
  ChevronDown
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

const salaryData = {
  orgName: 'AttendanceKart Solutions',
  employeeName: 'John Doe',
  employeeId: 'EMP1024',
  designation: 'Senior Software Engineer',
  month: 'May',
  year: '2025',
  earnings: [
    { name: 'Basic Salary', amount: '30,000' },
    { name: 'House Rent Allowance (HRA)', amount: '12,000' },
    { name: 'Conveyance Allowance', amount: '3,200' },
    { name: 'Medical Allowance', amount: '1,600' },
    { name: 'Special Allowance', amount: '5,000' },
    { name: 'Other Allowances', amount: '4,200' },
    { name: 'Performance Bonus', amount: '6,000' },
  ],
  deductions: [
    { name: 'Provident Fund (PF)', amount: '3,600' },
    { name: 'Professional Tax', amount: '200' },
    { name: 'Income Tax (TDS)', amount: '7,200' },
    { name: 'ESI', amount: '1,200' },
    { name: 'Other Deductions', amount: '4,120' },
  ],
  totalEarnings: '62,000',
  totalDeductions: '16,320',
  netSalary: '45,680'
};

const trendData = [
  { month: 'Dec 2024', salary: 42500 },
  { month: 'Jan 2025', salary: 43200 },
  { month: 'Feb 2025', salary: 44000 },
  { month: 'Mar 2025', salary: 46000 },
  { month: 'Apr 2025', salary: 44800 },
  { month: 'May 2025', salary: 45680 },
];

const EmployeeSalary = () => {
  const [showPayslip, setShowPayslip] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState('May 2025');

  const months = [
    'January 2025', 'February 2025', 'March 2025', 'April 2025', 'May 2025'
  ];

  const handleDownloadPayslip = () => {
    // In a real application, this would be an API call to fetch the PDF blob
    // or a redirect to a download URL.
    const orgName = localStorage.getItem('organisation_name') || 'AttendanceKart';
    const filename = `Payslip_${orgName.replace(/\s+/g, '_')}_May_2025.pdf`;
    
    // Simulating a download by creating a mock blob
    const element = document.createElement('a');
    const file = new Blob(['Mock Payslip Data for ' + orgName], {type: 'application/pdf'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="px-6 lg:px-10 pt-2 pb-10 bg-[#F8FAFC] min-h-screen relative">
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
          >
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#0061E0] transition-colors">
            <ChevronDown size={18} />
          </div>
        </div>
      </div>

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
            <span className="text-3xl font-semibold text-[#1E293B]">₹ 45,680</span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold uppercase tracking-wider">Paid</span>
          </div>
          <p className="text-xs text-gray-400 font-medium">Paid on 31 May 2025</p>
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
            <p className="text-xl font-semibold text-[#1E293B]">₹ 62,000</p>
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
            <p className="text-xl font-semibold text-[#1E293B]">₹ 16,320</p>
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
              <span className="text-xl font-semibold text-[#1E293B]">26 / 31</span>
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
            
            <div className="grid md:grid-cols-2 gap-12">
              {/* Earnings Section */}
              <div>
                <div className="flex justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-50 pb-4 px-2">
                  <span>Earnings</span>
                  <span>Amount (₹)</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Basic Salary', amount: '30,000' },
                    { name: 'House Rent Allowance (HRA)', amount: '12,000' },
                    { name: 'Conveyance Allowance', amount: '3,200' },
                    { name: 'Medical Allowance', amount: '1,600' },
                    { name: 'Special Allowance', amount: '5,000' },
                    { name: 'Other Allowances', amount: '4,200' },
                    { name: 'Performance Bonus', amount: '6,000' },
                  ].map((item, idx) => (
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
                  <span className="text-lg font-semibold text-emerald-700">₹ 62,000</span>
                </div>
              </div>

              {/* Deductions Section */}
              <div>
                <div className="flex justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-50 pb-4 px-2">
                  <span>Deductions</span>
                  <span>Amount (₹)</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Provident Fund (PF)', amount: '3,600' },
                    { name: 'Professional Tax', amount: '200' },
                    { name: 'Income Tax (TDS)', amount: '7,200' },
                    { name: 'ESI', amount: '1,200' },
                    { name: 'Other Deductions', amount: '4,120' },
                  ].map((item, idx) => (
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
                  <span className="text-lg font-semibold text-rose-700">₹ 16,320</span>
                </div>
                
                {/* Final Net Salary inside the same card */}
                <div className="mt-6 flex justify-between items-center bg-[#F0F7FF] p-5 rounded-[20px] border border-[#E0EFFF] shadow-sm">
                  <span className="text-xs font-semibold text-[#0061E0] uppercase tracking-widest">Net Salary</span>
                  <span className="text-2xl font-semibold text-[#0061E0]">₹ 45,680</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Payslip only */}
        <div className="lg:col-span-1 h-full">
          {/* Payslip Download */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm h-full flex flex-col"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-[#1E293B]" />
              </div>
              <h2 className="text-lg font-semibold text-[#1E293B]">Payslip</h2>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-8">Review and download your payslip for <span className="text-[#1E293B] font-semibold">May 2025</span>.</p>
            
            <div className="flex flex-col items-center gap-8 my-auto py-4">
              <div 
                className="relative group cursor-pointer"
                onClick={() => setShowPayslip(true)}
              >
                <div className="w-24 h-28 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center bg-gray-50 group-hover:border-[#0061E0]/50 group-hover:bg-blue-50/30 transition-all">
                   <FileText size={48} className="text-gray-300 group-hover:text-[#0061E0]/50 transition-colors" />
                </div>
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -bottom-3 -right-3 w-10 h-10 bg-[#0061E0] rounded-full flex items-center justify-center shadow-lg border-2 border-white text-white"
                >
                  <ArrowDown size={16} className="rotate-180" />
                </motion.div>
              </div>
              
              <button 
                onClick={() => setShowPayslip(true)}
                className="w-full bg-[#0061E0] hover:bg-[#0052cc] text-white py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 transition-all transform hover:-translate-y-1 active:translate-y-0 mt-4"
              >
                <FileText size={20} />
                View Payslip
              </button>
            </div>
          </motion.div>
        </div>
      </div>

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
              <div className="p-8 lg:p-12">
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
