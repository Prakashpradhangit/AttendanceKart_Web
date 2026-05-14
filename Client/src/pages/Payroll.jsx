import React, { useState, useEffect } from 'react';
import { 
  Download, CheckCircle2, Loader2, FileText, Filter, 
  Plus, Search, Calendar, ChevronLeft, ChevronRight, 
  Edit2, MoreVertical, Check, X, Wallet, Clock, 
  FileEdit, CalendarDays, ExternalLink, Lock,
  AlertCircle, DollarSign, User, Briefcase, Info,
  ChevronDown, ArrowRight, Printer, Share2
} from 'lucide-react';
import Modal from '../components/Modal';
import PayslipTemplate from '../components/PayslipTemplate';
import { 
  payrollData as initialPayrollData, 
  payslipRequests as initialRequests,
  employeesList 
} from '../utils/mockData';

const Payroll = () => {
  // PIN Lock State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Data State
  const [payrollList, setPayrollList] = useState(initialPayrollData);
  const [requestsList, setRequestsList] = useState(initialRequests);

  // Modal State
  const [modalType, setModalType] = useState(null); 
  const [modalStep, setModalStep] = useState('form'); // 'form' or 'success' or 'preview'
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    employeeId: '',
    month: 'May 2024',
    base: '',
    bonus: '',
    deductions: '0',
    status: 'DRAFT'
  });

  const [filterData, setFilterData] = useState({
    month: 'May 2024',
    status: 'All Status'
  });

  const [exportData, setExportData] = useState({
    month: 'April 2024',
    type: 'Payroll Report',
    format: 'Excel (.xlsx)'
  });

  const [paymentData, setPaymentData] = useState({
    method: '',
    transactionId: ''
  });

  const [note, setNote] = useState('');

  // Calculated Total
  const calculateTotal = () => {
    const base = parseInt(formData.base) || 0;
    const bonus = parseInt(formData.bonus) || 0;
    const deductions = parseInt(formData.deductions) || 0;
    return (base + bonus - deductions).toLocaleString();
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    const correctPin = '1234';
    if (pinInput === correctPin) {
      setIsUnlocked(true);
      setPinError('');
    } else {
      setPinError('Incorrect PIN. Please try again.');
      setPinInput('');
    }
  };

  const openModal = (type, item = null) => {
    setSelectedItem(item);
    setModalType(type);
    setModalStep('form');
    setIsLoading(false);
    
    if (type === 'create') {
      setFormData({ employeeId: '', month: 'May 2024', base: '', bonus: '', deductions: '0', status: 'DRAFT' });
    } else if (type === 'edit' && item) {
      setFormData({ 
        employeeId: item.empId, 
        month: item.month, 
        base: item.base.replace(/\D/g,''), 
        bonus: item.bonus.replace(/\D/g,''), 
        deductions: item.deductions.replace(/\D/g,''), 
        status: item.status.toUpperCase() 
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedItem(null);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-payslip');
    const originalContent = document.body.innerHTML;
    
    // We'll use a cleaner approach: window.print() with a hidden class
    window.print();
  };

  const handleProcessAction = () => {
    if ((modalType === 'create' || modalType === 'edit') && modalStep === 'form') {
      setModalStep('preview');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      
      if (modalType === 'create') {
        const emp = employeesList.find(e => e.id === formData.employeeId);
        const newEntry = {
          id: `PAY${Math.floor(Math.random() * 1000)}`,
          name: emp?.name || 'New Employee',
          empId: formData.employeeId,
          month: formData.month,
          base: `₹${parseInt(formData.base).toLocaleString()}`,
          bonus: `₹${parseInt(formData.bonus).toLocaleString()}`,
          deductions: `₹${parseInt(formData.deductions).toLocaleString()}`,
          total: `₹${calculateTotal()}`,
          status: formData.status.charAt(0).toUpperCase() + formData.status.slice(1).toLowerCase(),
          avatar: emp?.name.split(' ').map(n => n[0]).join('') || 'NE'
        };
        setPayrollList([newEntry, ...payrollList]);
      } else if (modalType === 'payment') {
        setPayrollList(payrollList.map(p => p.id === selectedItem.id ? { ...p, status: 'Paid' } : p));
      } else if (modalType === 'approve') {
        setRequestsList(requestsList.filter(r => r.id !== selectedItem.id));
      } else if (modalType === 'edit') {
        setPayrollList(payrollList.map(p => p.id === selectedItem.id ? {
          ...p,
          base: `₹${parseInt(formData.base).toLocaleString()}`,
          bonus: `₹${parseInt(formData.bonus).toLocaleString()}`,
          deductions: `₹${parseInt(formData.deductions).toLocaleString()}`,
          total: `₹${calculateTotal()}`,
          status: formData.status.charAt(0).toUpperCase() + formData.status.slice(1).toLowerCase()
        } : p));
      }

      setModalStep('success');
    }, 1500);
  };

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 max-w-md w-full text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[30px] flex items-center justify-center mx-auto mb-6">
            <Lock size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payroll Security</h2>
          <p className="text-sm text-gray-500 mb-8 font-medium px-4">This section contains sensitive financial data. Please enter your administrator PIN.</p>
          
          <form onSubmit={handlePinSubmit} className="flex flex-col gap-6">
            <div className="relative group">
               <input 
                type="password" 
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="• • • •"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-[24px] px-6 py-5 text-center text-4xl tracking-[1em] outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all"
                maxLength={4}
                autoFocus
              />
            </div>
            {pinError && <p className="text-rose-500 text-sm font-semibold animate-shake">{pinError}</p>}
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-[24px] transition-all shadow-xl shadow-indigo-200 active:scale-95">
              Unlock Module
            </button>
          </form>
          <div className="mt-8 flex items-center justify-center gap-2 py-3 bg-gray-50 rounded-2xl">
             <Info size={14} className="text-gray-400" />
             <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Default Access PIN: 1234</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { id: 1, title: 'Paid Payrolls', value: '3', sub: 'Employees paid', icon: Wallet, color: 'bg-emerald-50 text-emerald-600' },
    { id: 2, title: 'Pending Payments', value: '1', sub: 'Payments to be made', icon: Clock, color: 'bg-orange-50 text-orange-600' },
    { id: 3, title: 'Draft Payrolls', value: '2', sub: 'Payrolls in draft', icon: FileEdit, color: 'bg-blue-50 text-blue-600' },
    { id: 4, title: 'Next Payout Date', value: 'May 01, 2024', sub: 'Wednesday', icon: CalendarDays, color: 'bg-purple-50 text-purple-600' },
  ];

  const avatarColors = {
    'JD': 'bg-indigo-100 text-indigo-600',
    'JS': 'bg-orange-100 text-orange-600',
    'RB': 'bg-emerald-100 text-emerald-600',
    'ED': 'bg-blue-100 text-blue-600',
    'MW': 'bg-indigo-100 text-indigo-600',
  };

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payroll Management</h1>
          <p className="text-base text-gray-500 mt-1 font-medium">Review and manage employee salaries and payslips</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => openModal('export')}
            className="flex items-center gap-2 px-6 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm active:scale-95"
          >
            <Download size={20} /> Export Reports
          </button>
          <button 
            onClick={() => openModal('create')}
            className="flex items-center gap-2 px-7 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 active:scale-95"
          >
            <Plus size={20} /> Create Payroll
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {/* Main Total Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[32px] p-6 text-white shadow-xl shadow-indigo-100/50 relative overflow-hidden flex flex-col justify-between group min-h-[160px]">
          <div className="relative z-10">
            <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-[0.15em] opacity-80">Total Payroll April</p>
            <h3 className="text-3xl font-bold mt-2 flex items-center gap-2">₹20,300</h3>
          </div>
          <p className="text-indigo-200 text-[10px] font-semibold mt-auto relative z-10 opacity-70">Total amount for April 2024</p>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg group-hover:rotate-12 transition-all">
             <span className="text-white font-bold text-xl">₹</span>
          </div>
        </div>

        {stats.map((stat) => (
          <div key={stat.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group min-h-[160px]">
            <div className={`w-12 h-12 ${stat.color} rounded-[18px] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
               <stat.icon size={24} />
            </div>
            <div className="mt-3">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.1em]">{stat.title}</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">{stat.value}</h3>
              <p className="text-gray-400 text-[10px] font-semibold mt-0.5 opacity-80">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Payrolls Section */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-50 overflow-hidden">
        <div className="p-10 border-b border-gray-50 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Payrolls</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group">
              <select className="appearance-none bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3 pr-12 text-sm font-bold text-gray-600 outline-none focus:border-indigo-500/30 transition-all cursor-pointer">
                <option>April 2024</option>
                <option>March 2024</option>
              </select>
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
            <button 
              onClick={() => openModal('filter')}
              className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-100 hover:border-gray-200 transition-all active:scale-95"
            >
              <Filter size={20} /> Filter
            </button>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search employee name or ID..."
                className="pl-12 pr-6 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-semibold outline-none focus:border-indigo-500/30 w-72 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em] border-b border-gray-50 bg-gray-50/10">
                <th className="px-8 py-6">Employee</th>
                <th className="px-6 py-6">Month</th>
                <th className="px-6 py-6">Base Salary</th>
                <th className="px-6 py-6">Bonus</th>
                <th className="px-6 py-6">Deductions</th>
                <th className="px-6 py-6">Total Amount</th>
                <th className="px-6 py-6 text-center">Status</th>
                <th className="px-6 py-6">Payslip</th>
                <th className="px-8 py-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payrollList.map((pay) => (
                <tr key={pay.id} className="hover:bg-indigo-50/5 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center text-sm font-bold shadow-sm ${avatarColors[pay.avatar] || 'bg-gray-100'}`}>
                        {pay.avatar}
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{pay.name}</p>
                        <p className="text-[11px] font-semibold text-gray-400 tracking-wider uppercase">{pay.empId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-semibold text-gray-500">{pay.month}</td>
                  <td className="px-8 py-6 text-sm font-semibold text-gray-500">{pay.base}</td>
                  <td className="px-8 py-6 text-sm font-semibold text-gray-500">{pay.bonus}</td>
                  <td className="px-8 py-6 text-sm font-semibold text-gray-500">{pay.deductions}</td>
                  <td className="px-8 py-6 text-base font-bold text-gray-900">{pay.total}</td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block shadow-sm ${
                      pay.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                      pay.status === 'Pending' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {pay.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {pay.status !== 'Draft' ? (
                      <button 
                        onClick={() => openModal('download', pay)}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold text-xs group/link"
                      >
                        <Download size={16} className="group-hover/link:translate-y-0.5 transition-transform" /> Download PDF
                      </button>
                    ) : (
                      <span className="text-gray-300 font-semibold tracking-widest">—</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex items-center justify-center gap-3">
                       {pay.status === 'Paid' ? (
                         <button className="flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-400 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-default border border-transparent">
                            <Check size={14} /> Paid
                         </button>
                       ) : pay.status === 'Pending' ? (
                         <button 
                           onClick={() => openModal('payment', pay)}
                           className="flex items-center gap-2 px-5 py-2 bg-indigo-50 text-indigo-600 border-2 border-indigo-100 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                         >
                            <Wallet size={14} /> Make Payment
                         </button>
                       ) : (
                         <div className="flex items-center gap-2">
                            <button 
                              onClick={() => openModal('edit', pay)}
                              className="flex items-center gap-2 px-5 py-2 bg-white border-2 border-gray-100 rounded-xl text-[10px] font-bold text-gray-600 uppercase tracking-wider hover:border-indigo-500/30 hover:bg-gray-50 transition-all active:scale-95"
                            >
                               <Edit2 size={14} /> Edit
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                               <MoreVertical size={20} />
                            </button>
                         </div>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex items-center justify-center gap-3">
          <button className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all disabled:opacity-20" disabled>
             <ChevronLeft size={24} />
          </button>
          <button className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-100">1</button>
          <button className="w-11 h-11 rounded-2xl text-gray-500 font-bold text-sm hover:bg-white border-2 border-transparent hover:border-gray-100 transition-all">2</button>
          <button className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all">
             <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Payslip Approval Section */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-50 overflow-hidden">
        <div className="p-10 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Payslip Approval Requests</h2>
             <span className="bg-indigo-50 text-indigo-600 px-3.5 py-1 rounded-2xl text-xs font-bold ring-4 ring-indigo-500/5">{requestsList.length}</span>
          </div>
          <button className="text-sm font-bold text-indigo-600 flex items-center gap-2 hover:translate-x-1 transition-transform">
             View All Requests <ExternalLink size={18} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.2em] border-b border-gray-50 bg-gray-50/30">
                <th className="px-10 py-6">Employee</th>
                <th className="px-8 py-6 text-center">Month</th>
                <th className="px-8 py-6">Request Date</th>
                <th className="px-8 py-6 text-center">Status</th>
                <th className="px-8 py-6">Reason (Optional)</th>
                <th className="px-8 py-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requestsList.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center text-sm font-bold ${avatarColors[req.avatar] || 'bg-gray-100'}`}>
                        {req.avatar}
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-900">{req.name}</p>
                        <p className="text-[11px] font-semibold text-gray-400 tracking-wider uppercase">{req.empId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center text-sm font-semibold text-gray-500">{req.month}</td>
                  <td className="px-8 py-6 text-sm font-semibold text-gray-500">{req.requestDate}</td>
                  <td className="px-8 py-6 text-center">
                    <span className="px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-orange-50 text-orange-600 border border-orange-100 shadow-sm">
                      {req.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium text-gray-500 max-w-xs truncate" title={req.reason}>
                    {req.reason}
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => openModal('approve', req)}
                          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 text-emerald-600 border-2 border-emerald-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                           <CheckCircle2 size={16} /> Approve
                        </button>
                        <button 
                          onClick={() => openModal('reject', req)}
                          className="flex items-center gap-2 px-6 py-2.5 bg-rose-50 text-rose-600 border-2 border-rose-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                           <X size={16} /> Reject
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Multi-Step Modal */}
      <Modal 
        isOpen={modalType !== null} 
        onClose={closeModal}
        maxWidth={
          modalStep === 'success' ? 'max-w-xl' :
          modalType === 'download' ? 'max-w-5xl' :
          modalStep === 'preview' ? 'max-w-5xl' :
          (modalType === 'create' || modalType === 'edit') ? 'max-w-4xl' : 
          'max-w-2xl'
        }
        title={
          modalStep === 'success' ? (modalType === 'approve' ? 'Request Approved!' : 'Success!') :
          modalStep === 'preview' ? 'Confirm Payroll Details' :
          modalType === 'create' ? 'Create Payroll' :
          modalType === 'edit' ? 'Edit Payroll' :
          modalType === 'payment' ? 'Make Payment' :
          modalType === 'filter' ? 'Filter Payrolls' :
          modalType === 'export' ? 'Export Reports' :
          modalType === 'approve' ? 'Approve Request' :
          modalType === 'download' ? 'Payslip Preview' : 'Confirmation'
        }
      >
        <div className="flex flex-col gap-6">
          {modalStep === 'form' && (
            <>
              {/* Create / Edit Form */}
              {(modalType === 'create' || modalType === 'edit') && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Employee<span className="text-rose-500 ml-0.5">*</span></label>
                      <div className="relative">
                        <select 
                          value={formData.employeeId}
                          onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                          className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-5 outline-none focus:border-indigo-500/30 font-bold text-sm appearance-none cursor-pointer"
                        >
                          <option value="">Select Employee</option>
                          {employeesList.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Month<span className="text-rose-500 ml-0.5">*</span></label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={formData.month}
                          className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-5 outline-none font-bold text-sm"
                          readOnly
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Base Salary<span className="text-rose-500 ml-0.5">*</span></label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                        <input 
                          type="number" 
                          value={formData.base}
                          onChange={(e) => setFormData({...formData, base: e.target.value})}
                          placeholder="0.00"
                          className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 pl-10 pr-5 outline-none focus:border-indigo-500/30 font-bold text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Bonus</label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                        <input 
                          type="number" 
                          value={formData.bonus}
                          onChange={(e) => setFormData({...formData, bonus: e.target.value})}
                          placeholder="0.00"
                          className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 pl-10 pr-5 outline-none focus:border-indigo-500/30 font-bold text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Deductions</label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                        <input 
                          type="number" 
                          value={formData.deductions}
                          onChange={(e) => setFormData({...formData, deductions: e.target.value})}
                          placeholder="0.00"
                          className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 pl-10 pr-5 outline-none focus:border-indigo-500/30 font-bold text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Total Amount</label>
                      <div className="relative group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400 font-bold">₹</span>
                        <input 
                          type="text" 
                          value={calculateTotal()}
                          readOnly
                          className="w-full bg-indigo-50/50 border-2 border-indigo-100 text-indigo-600 rounded-2xl py-3.5 pl-10 pr-5 outline-none font-bold text-base"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
                      <div className="relative">
                        <select 
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-5 outline-none focus:border-indigo-500/30 font-bold text-sm appearance-none cursor-pointer"
                        >
                          <option value="DRAFT">DRAFT</option>
                          <option value="PENDING">PENDING</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 pt-4">
                    <button onClick={closeModal} className="px-7 py-3.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
                    {modalType === 'create' && (
                       <button className="px-7 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">Save Draft</button>
                    )}
                    <button 
                      onClick={handleProcessAction}
                      disabled={isLoading}
                      className="px-10 py-3.5 bg-indigo-600 text-white rounded-[20px] font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={18} /> : (modalType === 'create' ? 'Generate Payroll' : 'Save Changes')}
                    </button>
                  </div>
                </div>
              )}

              {/* Filter Form */}
              {modalType === 'filter' && (
                <div className="space-y-6">
                   <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Month</label>
                        <div className="relative">
                          <input type="text" value={filterData.month} className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-5 font-bold text-sm" readOnly />
                          <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
                        <div className="relative">
                          <select 
                            value={filterData.status}
                            onChange={(e) => setFilterData({...filterData, status: e.target.value})}
                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-5 outline-none font-bold text-sm appearance-none"
                          >
                            <option>All Status</option>
                            <option>Paid</option>
                            <option>Pending</option>
                            <option>Draft</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 pt-4">
                      <button onClick={closeModal} className="flex-1 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-400 hover:text-gray-600 transition-all">Reset</button>
                      <button onClick={closeModal} className="flex-[2] py-3.5 bg-indigo-600 text-white rounded-[20px] font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Apply Filter</button>
                   </div>
                </div>
              )}

              {/* Export Form */}
              {modalType === 'export' && (
                <div className="space-y-6">
                   <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Select Month<span className="text-rose-500 ml-0.5">*</span></label>
                        <select className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-5 font-bold text-sm appearance-none outline-none">
                           <option>April 2024</option>
                           <option>March 2024</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Report Type<span className="text-rose-500 ml-0.5">*</span></label>
                        <select className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-5 font-bold text-sm appearance-none outline-none">
                           <option>Payroll Report</option>
                           <option>Attendance Report</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Format<span className="text-rose-500 ml-0.5">*</span></label>
                        <select className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-5 font-bold text-sm appearance-none outline-none">
                           <option>Excel (.xlsx)</option>
                           <option>PDF (.pdf)</option>
                           <option>CSV (.csv)</option>
                        </select>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 pt-4">
                      <button onClick={closeModal} className="flex-1 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-400 hover:text-gray-600 transition-all">Cancel</button>
                      <button onClick={handleProcessAction} className="flex-[2] py-3.5 bg-indigo-600 text-white rounded-[20px] font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Export</button>
                   </div>
                </div>
              )}

              {/* Make Payment Form */}
              {modalType === 'payment' && (
                <div className="space-y-8">
                   <div className="space-y-4 text-left bg-gray-50 p-6 rounded-3xl border border-gray-100">
                      <div className="flex justify-between">
                         <span className="text-xs font-semibold text-gray-400 uppercase">Employee</span>
                         <span className="text-sm font-bold text-gray-900">{selectedItem?.name} ({selectedItem?.empId})</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-xs font-semibold text-gray-400 uppercase">Month</span>
                         <span className="text-sm font-bold text-gray-900">{selectedItem?.month}</span>
                      </div>
                      <div className="flex justify-between pt-4 border-t border-gray-200">
                         <span className="text-xs font-bold text-indigo-400 uppercase">Total Amount</span>
                         <span className="text-xl font-bold text-indigo-600">{selectedItem?.total}</span>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="space-y-1.5">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 block text-left">Payment Method<span className="text-rose-500 ml-0.5">*</span></label>
                         <select className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-5 font-bold text-sm appearance-none outline-none">
                            <option>Select Method</option>
                            <option>Bank Transfer</option>
                            <option>UPI</option>
                            <option>Cheque</option>
                         </select>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 block text-left">Transaction ID (Optional)</label>
                         <input type="text" placeholder="Enter Transaction ID" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-5 font-bold text-sm outline-none" />
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <button onClick={closeModal} className="flex-1 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-400 hover:text-gray-600 transition-all">Cancel</button>
                      <button onClick={handleProcessAction} className="flex-[2] py-3.5 bg-indigo-600 text-white rounded-[20px] font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Confirm Payment</button>
                   </div>
                </div>
              )}

              {/* Approve Request Form */}
              {modalType === 'approve' && (
                <div className="space-y-8">
                   <div className="space-y-4 text-left bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100">
                      <div className="flex justify-between">
                         <span className="text-xs font-semibold text-emerald-600/60 uppercase">Employee</span>
                         <span className="text-sm font-bold text-emerald-900">{selectedItem?.name} ({selectedItem?.empId})</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-xs font-semibold text-emerald-600/60 uppercase">Month</span>
                         <span className="text-sm font-bold text-emerald-900">{selectedItem?.month}</span>
                      </div>
                      <div className="pt-4 border-t border-emerald-100">
                         <p className="text-xs font-semibold text-emerald-600/60 uppercase mb-1">Reason</p>
                         <p className="text-sm font-medium text-emerald-800 leading-relaxed">{selectedItem?.reason}</p>
                      </div>
                   </div>
                   <div className="space-y-1.5 text-left">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Add Note (Optional)</label>
                      <textarea placeholder="Enter note" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-5 font-semibold text-sm outline-none min-h-[100px] focus:border-emerald-500/30"></textarea>
                   </div>
                   <div className="flex items-center gap-4">
                      <button onClick={closeModal} className="flex-1 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-400 hover:text-gray-600 transition-all">Cancel</button>
                      <button onClick={handleProcessAction} className="flex-[2] py-3.5 bg-emerald-600 text-white rounded-[20px] font-bold text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all">Approve</button>
                   </div>
                 </div>
               )}

               {/* Payroll Preview Step (Side-by-Side Breakdown) */}
               {modalStep === 'preview' && (
                <div className="space-y-8">
                  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Payroll Breakdown</h3>
                        <p className="text-sm text-gray-500 font-medium">Reviewing details for {employeesList.find(e => e.id === formData.employeeId)?.name || 'Employee'}</p>
                      </div>
                      <div className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold uppercase tracking-widest">
                        {formData.month}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                      {/* Earnings */}
                      <div className="space-y-6">
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 pb-4">
                          <span>Earnings</span>
                          <span>Amount (₹)</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center group px-4 py-2 rounded-xl hover:bg-emerald-50/50 transition-all">
                             <div className="flex items-center gap-3">
                                <PlusCircle size={18} className="text-emerald-500/40 group-hover:text-emerald-500" />
                                <span className="text-sm font-semibold text-gray-600">Basic Salary</span>
                             </div>
                             <span className="text-sm font-bold text-gray-900">₹ {parseInt(formData.base).toLocaleString()}</span>
                          </div>
                          {parseInt(formData.bonus) > 0 && (
                            <div className="flex justify-between items-center group px-4 py-2 rounded-xl hover:bg-emerald-50/50 transition-all">
                               <div className="flex items-center gap-3">
                                  <PlusCircle size={18} className="text-emerald-500/40 group-hover:text-emerald-500" />
                                  <span className="text-sm font-semibold text-gray-600">Bonus & Incentives</span>
                               </div>
                               <span className="text-sm font-bold text-gray-900">₹ {parseInt(formData.bonus).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-8 bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex justify-between items-center">
                           <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Gross Total</span>
                           <span className="text-xl font-bold text-emerald-700">₹ {(parseInt(formData.base || 0) + parseInt(formData.bonus || 0)).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Deductions */}
                      <div className="space-y-6">
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 pb-4">
                          <span>Deductions</span>
                          <span>Amount (₹)</span>
                        </div>
                        <div className="space-y-3">
                           <div className="flex justify-between items-center group px-4 py-2 rounded-xl hover:bg-rose-50/50 transition-all">
                             <div className="flex items-center gap-3">
                                <MinusCircle size={18} className="text-rose-500/40 group-hover:text-rose-500" />
                                <span className="text-sm font-semibold text-gray-600">Tax & Other Deductions</span>
                             </div>
                             <span className="text-sm font-bold text-gray-900">₹ {parseInt(formData.deductions).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="mt-8 bg-rose-50 p-6 rounded-2xl border border-rose-100 flex justify-between items-center">
                           <span className="text-xs font-bold text-rose-700 uppercase tracking-widest">Total Deductions</span>
                           <span className="text-xl font-bold text-rose-700">₹ {parseInt(formData.deductions || 0).toLocaleString()}</span>
                        </div>
                        
                        {/* Net Salary Payable */}
                        <div className="mt-6 bg-indigo-600 p-6 rounded-2xl shadow-xl shadow-indigo-100 flex justify-between items-center text-white">
                           <span className="text-xs font-bold uppercase tracking-widest opacity-80">Net Payable</span>
                           <span className="text-2xl font-bold">₹ {calculateTotal()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button onClick={() => setModalStep('form')} className="px-8 py-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Back to Edit</button>
                    <button 
                      onClick={handleProcessAction}
                      disabled={isLoading}
                      className="px-10 py-4 bg-indigo-600 text-white rounded-[20px] font-bold text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Finalize & Generate'}
                    </button>
                  </div>
                </div>
              )}

              {/* Payslip Preview for Downloaded Items */}
              {modalType === 'download' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="bg-gray-50 rounded-3xl p-8 border-2 border-dashed border-gray-200">
                    <PayslipTemplate 
                      data={{
                        orgName: 'AttendanceKart Solutions',
                        employeeName: selectedItem?.name,
                        employeeId: selectedItem?.empId,
                        month: selectedItem?.month.split(' ')[0],
                        year: selectedItem?.month.split(' ')[1],
                        earnings: [
                          { name: 'Base Salary', amount: selectedItem?.base.replace('₹', '') },
                          { name: 'Bonus', amount: selectedItem?.bonus.replace('₹', '') }
                        ],
                        deductions: [
                          { name: 'Total Deductions', amount: selectedItem?.deductions.replace('₹', '') }
                        ],
                        totalEarnings: (parseInt(selectedItem?.base.replace(/\D/g,'')) + parseInt(selectedItem?.bonus.replace(/\D/g,''))).toLocaleString(),
                        totalDeductions: selectedItem?.deductions.replace('₹', ''),
                        netSalary: selectedItem?.total.replace('₹', '')
                      }} 
                    />
                  </div>
                  <div className="flex justify-center gap-4">
                    <button onClick={handlePrint} className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all">
                       <Printer size={20} /> Print Payslip
                    </button>
                    <button onClick={closeModal} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">
                       Done
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {modalStep === 'success' && (
            <div className="text-center py-10 space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="w-28 h-28 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner relative">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping"></div>
                <Check size={56} strokeWidth={4} />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-bold text-gray-900">
                  {modalType === 'create' ? 'Payroll Created Successfully!' :
                   modalType === 'payment' ? 'Payment Successful!' :
                   modalType === 'approve' ? 'Request Approved!' : 'Changes Saved!'}
                </h3>
                <p className="text-base text-gray-500 font-semibold px-10">
                   {modalType === 'create' ? `Payroll for ${employeesList.find(e => e.id === formData.employeeId)?.name} (${formData.month}) has been created.` :
                    modalType === 'payment' ? `Payment of ${selectedItem?.total} to ${selectedItem?.name} has been recorded.` :
                    modalType === 'approve' ? `${selectedItem?.name} can now download the payslip for ${selectedItem?.month}.` :
                    'The payroll record has been successfully updated.'}
                </p>
                {(modalType === 'create' || modalType === 'payment') && (
                   <div className="mt-6">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Amount</p>
                      <p className="text-4xl font-bold text-gray-900 mt-2">
                        {modalType === 'create' ? `₹${calculateTotal()}` : selectedItem?.total}
                      </p>
                   </div>
                )}
              </div>
              <div className="flex items-center gap-4 px-10">
                {modalType === 'create' && (
                  <button onClick={() => setModalStep('preview')} className="flex-1 py-4 bg-indigo-50 text-indigo-600 rounded-[20px] font-bold text-sm hover:bg-indigo-100 transition-all">View Payroll</button>
                )}
                <button onClick={closeModal} className="flex-1 py-4 bg-indigo-600 text-white rounded-[20px] font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Close</button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Payroll;
