import React from 'react';

const PayslipTemplate = ({ data }) => {
  const {
    orgName = 'AttendanceKart Solutions',
    employeeName = 'John Doe',
    employeeId = 'EMP1024',
    designation = 'Senior Software Engineer',
    month = 'May',
    year = '2025',
    earnings = [],
    deductions = [],
    netSalary = '45,680',
    totalEarnings = '62,000',
    totalDeductions = '16,320',
  } = data;

  return (
    <div className="bg-white p-12 max-w-[850px] mx-auto shadow-2xl border border-gray-100 font-sans text-slate-800 printable-payslip">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-[#0061E0] pb-8 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0061E0] mb-2">{orgName}</h1>
          <p className="text-sm text-slate-500 max-w-[300px]">
            123 Business Avenue, Tech Park, Phase 2, Bangalore - 560001
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold uppercase tracking-widest text-slate-400">Payslip</h2>
          <p className="text-lg font-semibold text-slate-600">{month} {year}</p>
        </div>
      </div>

      {/* Employee Info Grid */}
      <div className="grid grid-cols-2 gap-y-4 gap-x-12 mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <div className="flex justify-between">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Employee Name</span>
          <span className="text-sm font-semibold text-slate-800">{employeeName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Employee ID</span>
          <span className="text-sm font-semibold text-slate-800">{employeeId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Designation</span>
          <span className="text-sm font-semibold text-slate-800">{designation}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Days Worked</span>
          <span className="text-sm font-semibold text-slate-800">26 / 31</span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="grid grid-cols-2 gap-x-12 mb-10">
        {/* Earnings Column */}
        <div>
          <h3 className="text-sm font-bold text-[#0061E0] uppercase tracking-widest mb-4 pb-2 border-b border-blue-100">Earnings</h3>
          <div className="space-y-3">
            {earnings.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-slate-600">{item.name}</span>
                <span className="font-semibold text-slate-800">₹ {item.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Deductions Column */}
        <div>
          <h3 className="text-sm font-bold text-rose-500 uppercase tracking-widest mb-4 pb-2 border-b border-rose-100">Deductions</h3>
          <div className="space-y-3">
            {deductions.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-slate-600">{item.name}</span>
                <span className="font-semibold text-slate-800">₹ {item.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Totals Section */}
      <div className="grid grid-cols-2 gap-x-12 mb-10 py-4 border-t border-b border-slate-100">
        <div className="flex justify-between items-center pr-2">
          <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Gross Earnings</span>
          <span className="text-lg font-bold text-slate-900">₹ {totalEarnings}</span>
        </div>
        <div className="flex justify-between items-center pl-2">
          <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Total Deductions</span>
          <span className="text-lg font-bold text-slate-900">₹ {totalDeductions}</span>
        </div>
      </div>

      {/* Net Salary Highlight */}
      <div className="bg-[#0061E0] text-white p-8 rounded-[2rem] flex justify-between items-center shadow-xl shadow-blue-500/20 mb-12">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] font-bold opacity-70 mb-1">Net Salary Payable</p>
          <p className="text-sm font-medium opacity-90 italic">In Words: Rupees Forty-Five Thousand Six Hundred and Eighty Only</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold">₹ {netSalary}</p>
        </div>
      </div>

      {/* Footer / Signatures */}
      <div className="grid grid-cols-2 gap-20 pt-10">
        <div className="text-center">
          <div className="h-[1px] bg-slate-300 mb-4 w-48 mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500 uppercase">Employee Signature</p>
        </div>
        <div className="text-center">
          <div className="h-[1px] bg-slate-300 mb-4 w-48 mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500 uppercase">Employer Signature</p>
        </div>
      </div>

      <p className="mt-20 text-center text-[10px] text-slate-400 font-medium italic">
        * This is a computer-generated document and does not require a physical signature.
      </p>
    </div>
  );
};

export default PayslipTemplate;
