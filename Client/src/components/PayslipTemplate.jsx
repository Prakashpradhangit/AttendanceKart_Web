import React from 'react';

const numberToWords = (num) => {
  if (!num || isNaN(num)) return 'Zero';
  const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
  const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];

  let numVal = Math.round(Number(num));
  if (numVal === 0) return 'Zero';
  if (numVal.toString().length > 9) return 'Overflow';
  
  let n = ('000000000' + numVal).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return ''; 
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim();
};

const PayslipTemplate = ({ data }) => {
  const {
    orgName = 'Avention Technologies Private Limited',
    orgAddress = '461 Sai Sobagu, 1st Floor Outer Ring Road Teachers Colony, Sector 6 HSR Layout Bangalore Karnataka 560034 India',
    employeeName = 'Prakash Pradhan',
    employeeId = 'AVT00176',
    designation = 'WordPress Developer Intern',
    doj = '27/01/2025',
    month = 'April',
    year = '2025',
    payDate = '',
    earnings = [],
    deductions = [],
    netSalary = '9,334.00',
    totalEarnings = '9,334.00',
    totalDeductions = '0.00',
    paidDays = 28,
    lopDays = 2,
    totalDays = 30,
    rawNetSalary = 9334,
    
    // Statutory/banking details
    uanNumber = '',
    pfNumber = '',
    esiNumber = '',
    bankName = '',
    ifscCode = '',
    accountNumber = ''
  } = data;

  const amountInWords = numberToWords(rawNetSalary);

  // Set default pay date if not present (usually 5th of next month)
  let displayPayDate = payDate;
  if (!displayPayDate) {
    displayPayDate = `05/${month === 'December' ? '01' : String(
      ['January','February','March','April','May','June','July','August','September','October','November','December'].indexOf(month) + 2
    ).padStart(2, '0')}/${month === 'December' ? Number(year) + 1 : year}`;
  }

  // Helper to format currency
  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '₹0.00';
    let num = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val;
    if (isNaN(num)) return '₹0.00';
    return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-white p-8 md:p-12 max-w-[950px] mx-auto shadow-sm border border-gray-100 rounded-3xl font-sans text-slate-800 printable-payslip-content">
      
      {/* 1. Header (Exact Design Layout) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-6 mb-8 gap-4">
        <div className="flex items-center gap-4">
          {/* Logo Placeholder Box */}
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100/50 flex-shrink-0">
            <span className="text-indigo-600 font-black text-xl tracking-tighter">
              {orgName ? orgName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'AV'}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">{orgName}</h1>
            <p className="text-xs font-semibold text-slate-400 max-w-[550px] mt-1 leading-relaxed">
              {orgAddress}
            </p>
          </div>
        </div>
        <div className="text-left md:text-right flex-shrink-0">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Payslip For the Month</p>
          <h2 className="text-xl font-black text-slate-900 mt-1">{month} {year}</h2>
        </div>
      </div>

      {/* 2. Employee Summary (Aligned with Mockup) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-10">
        
        {/* Left side: Information Details Grid */}
        <div className="lg:col-span-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">EMPLOYEE SUMMARY</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3.5 gap-x-8 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-400 w-1/3">Employee Name</span>
              <span className="text-slate-400 font-semibold w-[5%]">:</span>
              <span className="font-bold text-slate-800 w-[60%]">{employeeName}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-400 w-1/3">Designation</span>
              <span className="text-slate-400 font-semibold w-[5%]">:</span>
              <span className="font-bold text-slate-800 w-[60%]">{designation}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-400 w-1/3">Employee ID</span>
              <span className="text-slate-400 font-semibold w-[5%]">:</span>
              <span className="font-bold text-slate-800 w-[60%]">{employeeId}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-400 w-1/3">Date of Joining</span>
              <span className="text-slate-400 font-semibold w-[5%]">:</span>
              <span className="font-bold text-slate-800 w-[60%]">{doj}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-400 w-1/3">Pay Period</span>
              <span className="text-slate-400 font-semibold w-[5%]">:</span>
              <span className="font-bold text-slate-800 w-[60%]">{month} {year}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-400 w-1/3">Pay Date</span>
              <span className="text-slate-400 font-semibold w-[5%]">:</span>
              <span className="font-bold text-slate-800 w-[60%]">{displayPayDate}</span>
            </div>

            {/* Statutory details show if present */}
            {bankName && (
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-400 w-1/3">Bank Details</span>
                <span className="text-slate-400 font-semibold w-[5%]">:</span>
                <span className="font-bold text-slate-800 w-[60%] truncate" title={`${bankName} A/C ${accountNumber}`}>
                  {bankName} - {accountNumber}
                </span>
              </div>
            )}

            {uanNumber && (
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-400 w-1/3">UAN / PF Number</span>
                <span className="text-slate-400 font-semibold w-[5%]">:</span>
                <span className="font-bold text-slate-800 w-[60%] truncate" title={`UAN: ${uanNumber} / PF: ${pfNumber}`}>
                  {uanNumber} / {pfNumber}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Beautiful Mint Box */}
        <div className="bg-[#EBF7F2] border border-[#D1F2E2] rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
          <div>
            <div className="border-l-4 border-emerald-500 pl-3">
              <h4 className="text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(netSalary)}</h4>
              <p className="text-[11px] font-black text-[#10B981] uppercase tracking-wider mt-1">Total Net Pay</p>
            </div>
          </div>
          
          <div className="border-t border-dashed border-[#A7E8C9] mt-6 pt-4 space-y-2.5 text-sm font-bold text-slate-700">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Paid Days</span>
              <span>: {paidDays}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">LOP Days</span>
              <span>: {lopDays}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Earnings & Deductions Double Column Grid */}
      <div className="border border-slate-100 rounded-3xl p-6 bg-slate-50/50 shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          
          {/* Earnings Column */}
          <div>
            <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest pb-3 border-b border-dashed border-slate-200">
              <span className="w-1/2">EARNINGS</span>
              <span className="w-1/4 text-right">AMOUNT</span>
              <span className="w-1/4 text-right">YTD</span>
            </div>
            
            <div className="mt-4 space-y-3.5 text-sm">
              {earnings.map((item, idx) => (
                <div key={idx} className="flex justify-between font-bold text-slate-700">
                  <span className="w-1/2 font-semibold text-slate-500">{item.name}</span>
                  <span className="w-1/4 text-right text-slate-800">{formatCurrency(item.amount)}</span>
                  <span className="w-1/4 text-right text-slate-400 font-semibold">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deductions Column */}
          <div>
            <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest pb-3 border-b border-dashed border-slate-200">
              <span className="w-1/2">DEDUCTIONS</span>
              <span className="w-1/4 text-right">AMOUNT</span>
              <span className="w-1/4 text-right">YTD</span>
            </div>
            
            <div className="mt-4 space-y-3.5 text-sm">
              {deductions.filter(d => parseFloat(d.amount?.replace(/,/g, '') || 0) > 0).map((item, idx) => (
                <div key={idx} className="flex justify-between font-bold text-slate-700">
                  <span className="w-1/2 font-semibold text-slate-500">{item.name}</span>
                  <span className="w-1/4 text-right text-slate-800">{formatCurrency(item.amount)}</span>
                  <span className="w-1/4 text-right text-slate-400 font-semibold">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              
              {deductions.filter(d => parseFloat(d.amount?.replace(/,/g, '') || 0) > 0).length === 0 && (
                <div className="text-center py-6 text-xs font-semibold text-slate-400 italic">
                  No statutory or other deductions.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Column Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 mt-8 pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center text-sm font-black text-slate-800">
            <span>Gross Earnings</span>
            <span className="text-base text-slate-900">{formatCurrency(totalEarnings)}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-black text-slate-800 mt-4 md:mt-0">
            <span>Total Deductions</span>
            <span className="text-base text-slate-900">{formatCurrency(totalDeductions)}</span>
          </div>
        </div>

      </div>

      {/* 4. TOTAL NET PAYABLE Bar (Highlight Footer) */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-[#F1F9F6] border border-[#D5EFE3] rounded-2xl p-5 mb-8 gap-4 shadow-inner">
        <div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">TOTAL NET PAYABLE</h4>
          <p className="text-[11px] font-semibold text-slate-400 uppercase mt-0.5 tracking-wider">Gross Earnings - Total Deductions</p>
        </div>
        <div className="bg-[#E1F4ED] border border-[#BDE8D6] rounded-xl px-6 py-2.5 text-center flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-extrabold text-slate-900">{formatCurrency(netSalary)}</span>
        </div>
      </div>

      <div className="text-slate-400 font-bold text-[11px] uppercase tracking-wider mb-10 px-1 italic">
        In Words: <span className="text-slate-600 not-italic font-black">Rupees {amountInWords} Only</span>
      </div>

      {/* 5. Footer / Signatures Block */}
      <div className="grid grid-cols-2 gap-20 pt-8 border-t border-dashed border-slate-200">
        <div className="text-center">
          <div className="h-[1px] bg-slate-200 mb-3 w-40 mx-auto"></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee Signature</p>
        </div>
        <div className="text-center">
          <div className="h-[1px] bg-slate-200 mb-3 w-40 mx-auto"></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized Signatory</p>
        </div>
      </div>

      <p className="mt-16 text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest">
        * This is a computer-generated payslip and does not require a physical signature.
      </p>

    </div>
  );
};

export default PayslipTemplate;
