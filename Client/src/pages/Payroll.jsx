import React, { useState, useEffect } from 'react';
import { 
  Download, CheckCircle2, Loader2, FileText, Filter, 
  Plus, Search, Calendar, ChevronLeft, ChevronRight, 
  Edit2, MoreVertical, Check, X, Wallet, Clock, 
  FileEdit, CalendarDays, ExternalLink, Lock,
  AlertCircle, DollarSign, User, Briefcase, Info,
  ChevronDown, ArrowRight, Printer, Share2,
  PlusCircle, MinusCircle, History, TrendingUp, Percent,
  Coins, CreditCard, Building2
} from 'lucide-react';
import Modal from '../components/Modal';
import PayslipTemplate from '../components/PayslipTemplate';

// Generate last 12 months as selectable options, current month first
const generateMonthOptions = () => {
  const months = [];
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`);
  }
  return months;
};
const MONTH_OPTIONS = generateMonthOptions();
const CURRENT_MONTH = MONTH_OPTIONS[0];

const Payroll = () => {
  // Navigation & PIN Lock State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState('payrolls'); // 'payrolls' or 'structures'

  // Data State
  const [payrollList, setPayrollList] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [orgDetails, setOrgDetails] = useState(null);

  // Modal State
  const [modalType, setModalType] = useState(null); // 'create', 'edit', 'payment', 'filter', 'export', 'approve', 'download', 'structure'
  const [modalStep, setModalStep] = useState('form'); // 'form', 'success', 'preview', 'history', 'editStructure'
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Form States
  const [formData, setFormData] = useState({
    employeeId: '',
    month: CURRENT_MONTH,
    basicSalary: '',
    hra: '',
    conveyanceAllowance: '',
    medicalAllowance: '',
    specialAllowance: '',
    otherAllowances: '',
    performanceBonus: '',
    providentFund: '',
    professionalTax: '200',
    incomeTax: '',
    esi: '',
    otherDeductions: '',
    attendanceDeduction: '0',
    status: 'DRAFT',
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    leaveDays: 0
  });

  // Salary Structure Form State
  const [structForm, setStructForm] = useState({
    userId: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    structureType: 'MONTHLY',
    calculationMode: 'PERCENTAGE_BASED',
    basicSalary: '',
    hraPercent: '40',
    daPercent: '0',
    pfPercent: '12',
    esiPercent: '0.75',
    tdsPercent: '0',
    hra: '',
    da: '',
    conveyanceAllowance: '1600',
    medicalAllowance: '1250',
    specialAllowance: '5000',
    otherAllowances: '2000',
    performanceBonus: '0',
    providentFund: '',
    esi: '',
    professionalTax: '200',
    tds: '',
    otherDeductions: '0',
    // Statutory profile details to sync
    bankName: '',
    ifscCode: '',
    accountNumber: '',
    uanNumber: '',
    pfNumber: '',
    esiNumber: ''
  });

  const [structureHistory, setStructureHistory] = useState([]);

  const [filterData, setFilterData] = useState({
    month: CURRENT_MONTH,
    status: 'All Status'
  });

  const [exportData, setExportData] = useState({
    month: CURRENT_MONTH,
    type: 'Payroll Report',
    format: 'Excel (.xlsx)'
  });

  const [paymentData, setPaymentData] = useState({
    method: 'Bank Transfer',
    transactionId: ''
  });

  // Backend Sync
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/payroll/employees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEmployeesList(data);
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  const fetchPayrolls = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/payroll', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPayrollList(data);
      }
    } catch (err) {
      console.error("Failed to fetch payrolls:", err);
    }
  };

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/payroll/admin/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequestsList(data);
      }
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    }
  };

  const fetchSalaryStructures = async (userId) => {
    setIsLoading(true);
    setApiError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/payroll/salary-structure/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStructureHistory(data);
      } else {
        setStructureHistory([]);
      }
    } catch (err) {
      console.error("Failed to fetch structures:", err);
      setApiError('Could not load salary structure history.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrgDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrgDetails(data);
      }
    } catch (err) {
      console.error('Failed to fetch org details:', err);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchEmployees();
      fetchPayrolls();
      fetchRequests();
      fetchOrgDetails();
    }
  }, [isUnlocked]);

  // Fetch salary auto-calculation suggestions when employee or month changes
  useEffect(() => {
    if (formData.employeeId && formData.month && modalType === 'create') {
      const getCalculations = async () => {
        setIsLoading(true);
        setApiError('');
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/payroll/calculate?userId=${formData.employeeId}&month=${formData.month}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setFormData(prev => ({
              ...prev,
              basicSalary: String(data.basicSalary || ''),
              hra: String(data.hra || ''),
              conveyanceAllowance: String(data.conveyanceAllowance || ''),
              medicalAllowance: String(data.medicalAllowance || ''),
              specialAllowance: String(data.specialAllowance || ''),
              otherAllowances: String(data.otherAllowances || ''),
              performanceBonus: String(data.performanceBonus || '0'),
              providentFund: String(data.providentFund || ''),
              professionalTax: String(data.professionalTax || '200'),
              incomeTax: String(data.incomeTax || ''),
              esi: String(data.esi || ''),
              otherDeductions: String(data.otherDeductions || ''),
              attendanceDeduction: String(Math.round(data.attendanceDeduction || 0)),
              totalDays: data.totalDays || 0,
              presentDays: data.presentDays || 0,
              absentDays: data.absentDays || 0,
              leaveDays: data.leaveDays || 0
            }));
          } else {
            const errData = await res.json().catch(() => ({}));
            setApiError(errData.error || 'Failed to auto-calculate attendance proration. Make sure salary structure is configured first.');
          }
        } catch (err) {
          console.error("Failed to fetch calculations:", err);
        } finally {
          setIsLoading(false);
        }
      };
      getCalculations();
    }
  }, [formData.employeeId, formData.month]);

  // Calculate dynamic components on structure configuration form
  useEffect(() => {
    if (structForm.calculationMode === 'PERCENTAGE_BASED') {
      const basic = parseFloat(structForm.basicSalary) || 0;
      const hraPct = parseFloat(structForm.hraPercent) || 0;
      const daPct = parseFloat(structForm.daPercent) || 0;
      const pfPct = parseFloat(structForm.pfPercent) || 0;
      const esiPct = parseFloat(structForm.esiPercent) || 0;
      const tdsPct = parseFloat(structForm.tdsPercent) || 0;

      const calculatedHra = Math.round(basic * (hraPct / 100));
      const calculatedDa = Math.round(basic * (daPct / 100));
      const conveyance = parseFloat(structForm.conveyanceAllowance) || 0;
      const medical = parseFloat(structForm.medicalAllowance) || 0;
      const special = parseFloat(structForm.specialAllowance) || 0;
      const other = parseFloat(structForm.otherAllowances) || 0;
      const bonus = parseFloat(structForm.performanceBonus) || 0;

      const gross = basic + calculatedHra + calculatedDa + conveyance + medical + special + other + bonus;

      const calculatedPf = Math.round(basic * (pfPct / 100));
      const calculatedEsi = Math.round(gross * (esiPct / 100));
      const calculatedTds = Math.round(gross * (tdsPct / 100));

      setStructForm(prev => ({
        ...prev,
        hra: String(calculatedHra),
        da: String(calculatedDa),
        providentFund: String(calculatedPf),
        esi: String(calculatedEsi),
        tds: String(calculatedTds)
      }));
    }
  }, [
    structForm.calculationMode,
    structForm.basicSalary,
    structForm.hraPercent,
    structForm.daPercent,
    structForm.pfPercent,
    structForm.esiPercent,
    structForm.tdsPercent,
    structForm.conveyanceAllowance,
    structForm.medicalAllowance,
    structForm.specialAllowance,
    structForm.otherAllowances,
    structForm.performanceBonus
  ]);

  // Calculations for total net pay preview
  const calculateTotal = () => {
    const earnings = getGrossEarnings();
    const deductions = getTotalDeductions();
    return (earnings - deductions).toLocaleString();
  };

  const getGrossEarnings = () => {
    return [
      formData.basicSalary, formData.hra, formData.conveyanceAllowance, 
      formData.medicalAllowance, formData.specialAllowance, 
      formData.otherAllowances, formData.performanceBonus
    ].reduce((acc, val) => acc + (parseInt(val) || 0), 0);
  };

  const getTotalDeductions = () => {
    return [
      formData.providentFund, formData.professionalTax, 
      formData.incomeTax, formData.esi, formData.otherDeductions,
      formData.attendanceDeduction
    ].reduce((acc, val) => acc + (parseInt(val) || 0), 0);
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
    setApiError('');
    
    if (type === 'create') {
      setFormData({ 
        employeeId: '', 
        month: CURRENT_MONTH, 
        basicSalary: '', 
        hra: '', 
        conveyanceAllowance: '', 
        medicalAllowance: '', 
        specialAllowance: '', 
        otherAllowances: '', 
        performanceBonus: '', 
        providentFund: '', 
        professionalTax: '200', 
        incomeTax: '', 
        esi: '', 
        otherDeductions: '', 
        attendanceDeduction: '0',
        status: 'DRAFT',
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        leaveDays: 0
      });
    } else if (type === 'edit' && item) {
      setFormData({ 
        employeeId: String(item.userId || ''), 
        month: item.month, 
        basicSalary: String(item.basicSalary || 0), 
        hra: String(item.hra || 0), 
        conveyanceAllowance: String(item.conveyanceAllowance || 0), 
        medicalAllowance: String(item.medicalAllowance || 0), 
        specialAllowance: String(item.specialAllowance || 0), 
        otherAllowances: String(item.otherAllowances || 0), 
        performanceBonus: String(item.performanceBonus || 0), 
        providentFund: String(item.providentFund || 0), 
        professionalTax: String(item.professionalTax || 200), 
        incomeTax: String(item.incomeTax || 0), 
        esi: String(item.esi || 0), 
        otherDeductions: String(item.otherDeductions || 0), 
        attendanceDeduction: String(Math.round(item.attendanceDeduction || 0)),
        status: item.status.toUpperCase(),
        totalDays: item.totalDays || 0,
        presentDays: item.presentDays || 0,
        absentDays: item.absentDays || 0,
        leaveDays: item.leaveDays || 0
      });
    } else if (type === 'payment') {
      setPaymentData({ method: 'Bank Transfer', transactionId: '' });
    } else if (type === 'structure' && item) {
      // Manage salary structure
      fetchSalaryStructures(item.id);
      setModalStep('history');
      setStructForm({
        userId: String(item.id),
        effectiveDate: new Date().toISOString().split('T')[0],
        structureType: 'MONTHLY',
        calculationMode: 'PERCENTAGE_BASED',
        basicSalary: String(item.basicSalary || 30000),
        hraPercent: '40',
        daPercent: '0',
        pfPercent: '12',
        esiPercent: '0.75',
        tdsPercent: '0',
        hra: '',
        da: '',
        conveyanceAllowance: '1600',
        medicalAllowance: '1250',
        specialAllowance: '5000',
        otherAllowances: '2000',
        performanceBonus: '0',
        providentFund: '',
        esi: '',
        professionalTax: '200',
        tds: '',
        otherDeductions: '0',
        bankName: item.bankName || '',
        ifscCode: item.ifscCode || '',
        accountNumber: item.accountNumber || '',
        uanNumber: item.uanNumber || '',
        pfNumber: item.pfNumber || '',
        esiNumber: item.esiNumber || ''
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedItem(null);
    setStructureHistory([]);
  };

  const handlePrint = () => {
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

  const handleSaveDraft = async () => {
    if (!formData.employeeId) {
      setApiError('Please select an employee first.');
      return;
    }
    setApiError('');
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = buildPayload('DRAFT');
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchPayrolls();
        setModalStep('success');
      } else {
        const errData = await res.json().catch(() => ({}));
        setApiError(errData.error || `Error ${res.status}: Failed to save draft.`);
      }
    } catch (err) {
      setApiError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const buildPayload = (overrideStatus) => ({
    userId: Number(formData.employeeId),
    month: formData.month,
    basicSalary: Number(formData.basicSalary || 0),
    hra: Number(formData.hra || 0),
    conveyanceAllowance: Number(formData.conveyanceAllowance || 0),
    medicalAllowance: Number(formData.medicalAllowance || 0),
    specialAllowance: Number(formData.specialAllowance || 0),
    otherAllowances: Number(formData.otherAllowances || 0),
    performanceBonus: Number(formData.performanceBonus || 0),
    providentFund: Number(formData.providentFund || 0),
    professionalTax: Number(formData.professionalTax || 200),
    incomeTax: Number(formData.incomeTax || 0),
    esi: Number(formData.esi || 0),
    otherDeductions: Number(formData.otherDeductions || 0),
    attendanceDeduction: Number(formData.attendanceDeduction || 0),
    totalDays: Number(formData.totalDays || 0),
    presentDays: Number(formData.presentDays || 0),
    absentDays: Number(formData.absentDays || 0),
    leaveDays: Number(formData.leaveDays || 0),
    status: overrideStatus || formData.status
  });

  const handleProcessAction = async () => {
    if ((modalType === 'create' || modalType === 'edit') && modalStep === 'form') {
      if (!formData.employeeId) {
        setApiError('Please select an employee before proceeding.');
        return;
      }
      setApiError('');
      setModalStep('preview');
      return;
    }

    setIsLoading(true);
    setApiError('');
    try {
      const token = localStorage.getItem('token');
      if (modalType === 'create' || modalType === 'edit') {
        const payload = buildPayload();

        let res;
        if (modalType === 'create') {
          res = await fetch('/api/payroll', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });
        } else {
          res = await fetch(`/api/payroll/${selectedItem.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });
        }
        if (res.ok) {
          fetchPayrolls();
          setModalStep('success');
        } else {
          const errData = await res.json().catch(() => ({}));
          setApiError(errData.error || `Error ${res.status}: Failed to save payroll.`);
        }
      } else if (modalType === 'payment') {
        const res = await fetch(`/api/payroll/${selectedItem.id}/status?status=PAID&method=${paymentData.method}&transactionId=${paymentData.transactionId}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          fetchPayrolls();
          setModalStep('success');
        } else {
          const errData = await res.json().catch(() => ({}));
          setApiError(errData.error || `Error ${res.status}: Failed to process payment.`);
        }
      } else if (modalType === 'approve') {
        const res = await fetch(`/api/payroll/admin/requests/${selectedItem.id}/status?status=APPROVED`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          fetchRequests();
          setModalStep('success');
        } else {
          const errData = await res.json().catch(() => ({}));
          setApiError(errData.error || `Error ${res.status}: Failed to approve request.`);
        }
      } else if (modalType === 'reject') {
        const res = await fetch(`/api/payroll/admin/requests/${selectedItem.id}/status?status=REJECTED`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          fetchRequests();
          closeModal();
        } else {
          const errData = await res.json().catch(() => ({}));
          setApiError(errData.error || `Error ${res.status}: Failed to reject request.`);
        }
      } else if (modalType === 'structure') {
        // Save salary structure revision
        const payload = {
          userId: Number(structForm.userId),
          effectiveDate: structForm.effectiveDate,
          structureType: structForm.structureType,
          calculationMode: structForm.calculationMode,
          basicSalary: Number(structForm.basicSalary || 0),
          hraPercent: Number(structForm.hraPercent || 0),
          daPercent: Number(structForm.daPercent || 0),
          pfPercent: Number(structForm.pfPercent || 0),
          esiPercent: Number(structForm.esiPercent || 0),
          tdsPercent: Number(structForm.tdsPercent || 0),
          hra: Number(structForm.hra || 0),
          da: Number(structForm.da || 0),
          conveyanceAllowance: Number(structForm.conveyanceAllowance || 0),
          medicalAllowance: Number(structForm.medicalAllowance || 0),
          specialAllowance: Number(structForm.specialAllowance || 0),
          otherAllowances: Number(structForm.otherAllowances || 0),
          performanceBonus: Number(structForm.performanceBonus || 0),
          providentFund: Number(structForm.providentFund || 0),
          esi: Number(structForm.esi || 0),
          professionalTax: Number(structForm.professionalTax || 200),
          tds: Number(structForm.tds || 0),
          otherDeductions: Number(structForm.otherDeductions || 0),
          bankName: structForm.bankName,
          ifscCode: structForm.ifscCode,
          accountNumber: structForm.accountNumber,
          uanNumber: structForm.uanNumber,
          pfNumber: structForm.pfNumber,
          esiNumber: structForm.esiNumber
        };

        const res = await fetch('/api/payroll/salary-structure', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          fetchEmployees(); // Refresh basic salary list
          setModalStep('success');
        } else {
          const errData = await res.json().catch(() => ({}));
          setApiError(errData.error || `Error ${res.status}: Failed to save structure.`);
        }
      }
    } catch (err) {
      console.error(err);
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportSubmit = () => {
    // Generate mock CSV data and download
    let headers = "Employee Name,Employee Code,Month,Gross Earnings,Total Deductions,Net Salary,Status\n";
    let rows = payrollList.map(p => 
      `"${p.employeeName}","${p.employeeId}","${p.month}",${p.totalEarnings},${p.totalDeductions},${p.netSalary},"${p.status}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Payroll_Report_${exportData.month.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    closeModal();
  };

  // Map backend lists to expected frontend structures
  const filteredPayrolls = payrollList.filter(p => {
    const matchesSearch = p.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.employeeId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMonth = filterData.month === 'All Months' || p.month === filterData.month;
    const matchesStatus = filterData.status === 'All Status' || p.status.toUpperCase() === filterData.status.toUpperCase();
    return matchesSearch && matchesMonth && matchesStatus;
  });

  const mappedPayrollList = filteredPayrolls.map(pay => {
    const avatar = pay.employeeName ? pay.employeeName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'EE';
    return {
      ...pay,
      name: pay.employeeName || 'Unknown',
      empId: pay.employeeId || String(pay.userId),
      avatar,
      base: `₹${pay.basicSalary.toLocaleString('en-IN')}`,
      bonus: `₹${pay.performanceBonus.toLocaleString('en-IN')}`,
      deductions: `₹${pay.totalDeductions.toLocaleString('en-IN')}`,
      total: `₹${pay.netSalary.toLocaleString('en-IN')}`,
      status: pay.status.charAt(0).toUpperCase() + pay.status.slice(1).toLowerCase()
    };
  });

  const mappedRequestsList = requestsList.map(req => {
    const avatar = req.employeeName ? req.employeeName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'EE';
    return {
      ...req,
      name: req.employeeName || 'Unknown',
      empId: req.employeeId || String(req.userId),
      avatar,
      status: req.status.charAt(0).toUpperCase() + req.status.slice(1).toLowerCase()
    };
  });

  const filteredEmployees = employeesList.filter(emp => 
    emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    emp.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const paidCount = payrollList.filter(p => p.status === 'PAID').length;
  const pendingCount = payrollList.filter(p => p.status === 'PENDING').length;
  const draftCount = payrollList.filter(p => p.status === 'DRAFT').length;
  const totalNetPaid = payrollList
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + (p.netSalary || 0), 0);

  const stats = [
    { id: 1, title: 'Paid Payrolls', value: String(paidCount), sub: 'Employees paid', icon: Wallet, color: 'bg-emerald-50 text-emerald-600' },
    { id: 2, title: 'Pending Payments', value: String(pendingCount), sub: 'Payments to be made', icon: Clock, color: 'bg-orange-50 text-orange-600' },
    { id: 3, title: 'Draft Payrolls', value: String(draftCount), sub: 'Payrolls in draft', icon: FileEdit, color: 'bg-blue-50 text-blue-600' },
    { id: 4, title: 'Total Employees', value: String(employeesList.length), sub: 'Active staff', icon: CalendarDays, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payroll Management</h1>
          <p className="text-base text-gray-500 mt-1 font-medium font-sans">Indian statutory compliance & attendance-based dynamic proration</p>
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
            <Plus size={20} /> Process Monthly Payroll
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {/* Main Total Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[32px] p-6 text-white shadow-xl shadow-indigo-100/50 relative overflow-hidden flex flex-col justify-between group min-h-[160px]">
          <div className="relative z-10">
            <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-[0.15em] opacity-80">Total Disbursed Net</p>
            <h3 className="text-3xl font-bold mt-2 flex items-center gap-2">
              {totalNetPaid > 0 ? `₹${totalNetPaid.toLocaleString('en-IN')}` : '₹ —'}
            </h3>
          </div>
          <p className="text-indigo-200 text-[10px] font-semibold mt-auto relative z-10 opacity-70">Disbursed amount this period</p>
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

      {/* Tabs Selector */}
      <div className="flex border-b-2 border-gray-100 gap-8 mt-2">
        <button 
          onClick={() => setActiveTab('payrolls')}
          className={`pb-4 text-base font-bold transition-all relative ${
            activeTab === 'payrolls' ? 'text-indigo-600 border-b-4 border-indigo-600 -mb-[2px]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Payrolls & Approval Requests
        </button>
        <button 
          onClick={() => setActiveTab('structures')}
          className={`pb-4 text-base font-bold transition-all relative ${
            activeTab === 'structures' ? 'text-indigo-600 border-b-4 border-indigo-600 -mb-[2px]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Employee Salary Structures (Indian Statutory Config)
        </button>
      </div>

      {activeTab === 'payrolls' ? (
        <>
          {/* Recent Payrolls Section */}
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-50 overflow-hidden">
            <div className="p-10 border-b border-gray-50 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Payroll Runs</h2>
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative group">
                  <select 
                    value={filterData.month}
                    onChange={(e) => setFilterData({...filterData, month: e.target.value})}
                    className="appearance-none bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3 pr-12 text-sm font-bold text-gray-600 outline-none focus:border-indigo-500/30 transition-all cursor-pointer"
                  >
                    <option value="All Months">All Months</option>
                    {MONTH_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
                
                <div className="relative group">
                  <select 
                    value={filterData.status}
                    onChange={(e) => setFilterData({...filterData, status: e.target.value})}
                    className="appearance-none bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3 pr-12 text-sm font-bold text-gray-600 outline-none focus:border-indigo-500/30 transition-all cursor-pointer"
                  >
                    <option value="All Status">All Status</option>
                    <option value="DRAFT">Draft</option>
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                  </select>
                  <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name or employee ID..."
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
                    <th className="px-6 py-6">Total Net Salary</th>
                    <th className="px-6 py-6 text-center">Status</th>
                    <th className="px-6 py-6">Payslip</th>
                    <th className="px-8 py-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {mappedPayrollList.length > 0 ? (
                    mappedPayrollList.map((pay) => (
                      <tr key={pay.id} className="hover:bg-indigo-50/5 transition-all group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[18px] bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold shadow-sm">
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
                        <td className="px-8 py-6 text-sm font-semibold text-rose-500">{pay.deductions}</td>
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
                              <Download size={16} className="group-hover/link:translate-y-0.5 transition-transform" /> View & Download
                            </button>
                          ) : (
                            <span className="text-gray-300 font-semibold tracking-widest">—</span>
                          )}
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex items-center justify-center gap-3">
                             {pay.status === 'Paid' ? (
                               <button className="flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-400 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-default border border-transparent">
                                  <Check size={14} /> Disbursed
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
                               </div>
                             )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-14 text-sm font-semibold text-gray-400">
                        No payroll runs matching the criteria were found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex items-center justify-center gap-3">
              <button className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all disabled:opacity-20" disabled>
                 <ChevronLeft size={24} />
              </button>
              <button className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-100">1</button>
              <button className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all" disabled>
                 <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* Payslip Approval Section */}
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-50 overflow-hidden">
            <div className="p-10 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Employee Payslip Approval Requests</h2>
                 <span className="bg-indigo-50 text-indigo-600 px-3.5 py-1 rounded-2xl text-xs font-bold ring-4 ring-indigo-500/5">{mappedRequestsList.length}</span>
              </div>
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
                  {mappedRequestsList.length > 0 ? (
                    mappedRequestsList.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50/50 transition-all group">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[18px] bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold">
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
                        <td className="px-8 py-6 text-center">
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-14 text-sm font-semibold text-gray-400">
                        No pending payslip requests at this time.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Salary Structures Tab (Configure structures individually) */
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-50 overflow-hidden">
          <div className="p-10 border-b border-gray-50 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Employee Salary Structures</h2>
              <p className="text-sm text-gray-400 mt-1 font-semibold">Configure components and statutory compliance (PF, ESI, TDS) individually for staff</p>
            </div>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employee..."
                className="pl-12 pr-6 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-semibold outline-none focus:border-indigo-500/30 w-72 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em] border-b border-gray-50 bg-gray-50/10">
                  <th className="px-8 py-6">Employee</th>
                  <th className="px-6 py-6">Designation</th>
                  <th className="px-6 py-6">Base Salary (Basic)</th>
                  <th className="px-6 py-6">UAN / PF Number</th>
                  <th className="px-6 py-6">Bank Account</th>
                  <th className="px-6 py-6 text-center">Status</th>
                  <th className="px-8 py-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-indigo-50/5 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[18px] bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold shadow-sm">
                            {emp.name ? emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'EE'}
                          </div>
                          <div>
                            <p className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{emp.name}</p>
                            <p className="text-[11px] font-semibold text-gray-400 tracking-wider uppercase">{emp.employeeCode || emp.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-semibold text-gray-500">{emp.designation || 'Staff'}</td>
                      <td className="px-8 py-6 text-sm font-extrabold text-slate-800">
                        ₹{(emp.basicSalary || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-8 py-6 text-xs font-bold text-slate-500">
                        {emp.uanNumber ? `UAN: ${emp.uanNumber}` : '—'}
                      </td>
                      <td className="px-8 py-6 text-xs font-semibold text-slate-500">
                        {emp.bankName ? `${emp.bankName} (${emp.accountNumber})` : '—'}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                          Active
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <button 
                          onClick={() => openModal('structure', emp)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95 mx-auto"
                        >
                          <Coins size={14} /> Configure Structure & Revisions
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-14 text-sm font-semibold text-gray-400">
                      No active employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dynamic Multi-Step Modal */}
      <Modal 
        isOpen={modalType !== null} 
        onClose={closeModal}
        maxWidth={
          modalStep === 'success' ? 'max-w-xl' :
          modalType === 'download' ? 'max-w-5xl' :
          modalStep === 'preview' ? 'max-w-5xl' :
          modalType === 'structure' ? 'max-w-5xl' :
          (modalType === 'create' || modalType === 'edit') ? 'max-w-4xl' : 
          'max-w-2xl'
        }
        title={
          modalStep === 'success' ? 'Operation Successful!' :
          modalStep === 'preview' ? 'Confirm Monthly Payroll Processing' :
          modalType === 'create' ? 'Process Monthly Payroll Draft' :
          modalType === 'edit' ? 'Edit Monthly Payroll Record' :
          modalType === 'payment' ? 'Disburse Net Payout' :
          modalType === 'export' ? 'Export Payroll Reports' :
          modalType === 'approve' ? 'Approve Payslip Access Request' :
          modalType === 'download' ? 'Professional Payslip (Indian Statutory Compliant)' :
          modalType === 'structure' ? `Salary Structure & Revision Timeline: ${selectedItem?.name || ''}` : 'Confirm'
        }
      >
        <div className="flex flex-col gap-6">
          {modalStep === 'form' && (
            <>
              {/* Create / Edit Payroll Form */}
              {(modalType === 'create' || modalType === 'edit') && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: General & Earnings */}
                    <div className="space-y-6">
                      <div className="bg-gray-50/50 p-6 rounded-[32px] border border-gray-100 space-y-5">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <User size={18} className="text-indigo-600" /> General Info
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Select Employee<span className="text-rose-500 ml-0.5">*</span></label>
                            <div className="relative">
                              <select 
                                value={formData.employeeId}
                                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                                className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-5 outline-none focus:border-indigo-500/50 font-bold text-sm appearance-none cursor-pointer"
                                disabled={modalType === 'edit'}
                              >
                                <option value="">Select Employee</option>
                                {employeesList.map(emp => (
                                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.employeeCode || emp.id})</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Salary Month<span className="text-rose-500 ml-0.5">*</span></label>
                            <div className="relative">
                              <select
                                value={formData.month}
                                onChange={(e) => setFormData({...formData, month: e.target.value})}
                                className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-5 outline-none focus:border-indigo-500/50 font-bold text-sm appearance-none cursor-pointer"
                                disabled={modalType === 'edit'}
                              >
                                {MONTH_OPTIONS.map(m => (
                                  <option key={m} value={m}>{m}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-emerald-50/30 p-6 rounded-[32px] border border-emerald-100/50 space-y-5">
                        <h3 className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                          <PlusCircle size={18} /> Earnings (Prorated Suggestion) (₹)
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { id: 'basicSalary', label: 'Basic Salary' },
                            { id: 'hra', label: 'HRA' },
                            { id: 'conveyanceAllowance', label: 'Conveyance' },
                            { id: 'medicalAllowance', label: 'Medical' },
                            { id: 'specialAllowance', label: 'Special' },
                            { id: 'otherAllowances', label: 'Other' },
                            { id: 'performanceBonus', label: 'Performance Bonus' },
                          ].map(field => (
                            <div key={field.id} className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">{field.label}</label>
                              <input 
                                type="number" 
                                value={formData[field.id]}
                                onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
                                placeholder="0"
                                className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-4 outline-none focus:border-emerald-500/50 font-bold text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Deductions & Summary */}
                    <div className="space-y-6">
                      <div className="bg-rose-50/30 p-6 rounded-[32px] border border-rose-100/50 space-y-5">
                        <h3 className="text-sm font-bold text-rose-700 flex items-center gap-2">
                          <MinusCircle size={18} /> Deductions (Computed Statutory) (₹)
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { id: 'providentFund', label: 'Provident Fund (12%)' },
                            { id: 'esi', label: 'ESI (0.75%)' },
                            { id: 'professionalTax', label: 'Prof. Tax (PT)' },
                            { id: 'incomeTax', label: 'Income Tax (TDS)' },
                            { id: 'otherDeductions', label: 'Other Deductions' },
                            { id: 'attendanceDeduction', label: 'LOP Deduction' }
                          ].map(field => (
                            <div key={field.id} className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">{field.label}</label>
                              <input 
                                type="number" 
                                value={formData[field.id]}
                                onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
                                placeholder="0"
                                className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-4 outline-none focus:border-rose-500/50 font-bold text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-indigo-600 p-8 rounded-[32px] text-white shadow-xl shadow-indigo-200 space-y-6">
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                          <span className="text-xs font-bold uppercase tracking-widest opacity-80">Gross Earnings</span>
                          <span className="text-xl font-bold">₹ {getGrossEarnings().toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                          <span className="text-xs font-bold uppercase tracking-widest opacity-80">Total Deductions</span>
                          <span className="text-xl font-bold">₹ {getTotalDeductions().toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-black uppercase tracking-[0.2em]">Net Payout</span>
                          <span className="text-3xl font-black">₹ {calculateTotal()}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Processing Status</label>
                        <div className="relative">
                          <select 
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-5 outline-none focus:border-indigo-500/30 font-bold text-sm appearance-none cursor-pointer"
                          >
                            <option value="DRAFT">DRAFT</option>
                            <option value="PENDING">PROCESSED (PENDING DISBURSEMENT)</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {apiError && (
                    <div className="flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl px-5 py-3 text-sm font-semibold">
                      <AlertCircle size={16} />
                      {apiError}
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-4 pt-4">
                    <button onClick={closeModal} className="px-7 py-3.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
                    {modalType === 'create' && (
                       <button
                         onClick={handleSaveDraft}
                         disabled={isLoading}
                         className="px-7 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
                       >Save Draft</button>
                    )}
                    <button 
                      onClick={handleProcessAction}
                      disabled={isLoading}
                      className="px-10 py-3.5 bg-indigo-600 text-white rounded-[20px] font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-70"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={18} /> : (modalType === 'create' ? 'Proceed to Preview' : 'Save Changes')}
                    </button>
                  </div>
                </div>
              )}

              {/* Export Form */}
              {modalType === 'export' && (
                <div className="space-y-6">
                   <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Select Month<span className="text-rose-500 ml-0.5">*</span></label>
                        <select 
                          value={exportData.month}
                          onChange={(e) => setExportData({...exportData, month: e.target.value})}
                          className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-5 font-bold text-sm appearance-none outline-none focus:border-indigo-500/30"
                        >
                           {MONTH_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Report Type<span className="text-rose-500 ml-0.5">*</span></label>
                        <select 
                          value={exportData.type}
                          onChange={(e) => setExportData({...exportData, type: e.target.value})}
                          className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-5 font-bold text-sm appearance-none outline-none focus:border-indigo-500/30"
                        >
                           <option>Payroll Report (Statutory & CTC Breakup)</option>
                           <option>Deductions Report (PF/ESI/PT/TDS Contribution)</option>
                           <option>LOP Deduction Summary</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Format<span className="text-rose-500 ml-0.5">*</span></label>
                        <select 
                          value={exportData.format}
                          onChange={(e) => setExportData({...exportData, format: e.target.value})}
                          className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-5 font-bold text-sm appearance-none outline-none focus:border-indigo-500/30"
                        >
                           <option>CSV Register File (.csv)</option>
                        </select>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 pt-4">
                      <button onClick={closeModal} className="flex-1 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-400 hover:text-gray-600 transition-all">Cancel</button>
                      <button onClick={handleExportSubmit} className="flex-[2] py-3.5 bg-indigo-600 text-white rounded-[20px] font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Export Register</button>
                   </div>
                </div>
              )}

              {/* Make Payment Form */}
              {modalType === 'payment' && (
                <div className="space-y-8">
                   <div className="space-y-4 text-left bg-gray-50 p-6 rounded-3xl border border-gray-100 font-sans">
                      <div className="flex justify-between">
                         <span className="text-xs font-semibold text-gray-400 uppercase">Employee</span>
                         <span className="text-sm font-bold text-gray-900">{selectedItem?.name} ({selectedItem?.empId})</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-xs font-semibold text-gray-400 uppercase">Pay Period</span>
                         <span className="text-sm font-bold text-gray-900">{selectedItem?.month}</span>
                      </div>
                      <div className="flex justify-between pt-4 border-t border-gray-200">
                         <span className="text-xs font-bold text-indigo-400 uppercase">Disbursing Net Payable</span>
                         <span className="text-xl font-black text-indigo-600">{selectedItem?.total}</span>
                      </div>
                   </div>
                   <div className="space-y-4 text-left">
                      <div className="space-y-1.5">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 block">Payment Dispatch Method<span className="text-rose-500 ml-0.5">*</span></label>
                         <div className="relative">
                            <select
                              value={paymentData.method}
                              onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-5 font-bold text-sm appearance-none outline-none focus:border-indigo-500/30"
                            >
                               <option value="Bank Transfer">Bank Transfer (IMPS/NEFT)</option>
                               <option value="UPI">UPI (GPay/PhonePe)</option>
                               <option value="Cheque">Corporate Cheque</option>
                               <option value="Cash">Cash Disbursement</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                         </div>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 block">Bank Transaction ID / Ref No (Optional)</label>
                         <input
                           type="text"
                           value={paymentData.transactionId}
                           onChange={(e) => setPaymentData({...paymentData, transactionId: e.target.value})}
                           placeholder="Ex: TXN1829038290"
                           className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-5 font-semibold text-sm outline-none focus:border-indigo-500/30"
                         />
                      </div>
                   </div>
                   {apiError && (
                     <div className="flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl px-5 py-3 text-sm font-semibold">
                       <AlertCircle size={16} />
                       {apiError}
                     </div>
                   )}
                   <div className="flex items-center gap-4">
                      <button onClick={closeModal} className="flex-1 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-400 hover:text-gray-600 transition-all">Cancel</button>
                      <button
                        onClick={handleProcessAction}
                        disabled={isLoading}
                        className="flex-[2] py-3.5 bg-indigo-600 text-white rounded-[20px] font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Record Disbursement'}
                      </button>
                   </div>
                </div>
              )}

              {/* Approve Request Form */}
              {modalType === 'approve' && (
                <div className="space-y-8">
                   <div className="space-y-4 text-left bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 font-sans">
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
                   <div className="flex items-center gap-4">
                      <button onClick={closeModal} className="flex-1 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-400 hover:text-gray-600 transition-all">Cancel</button>
                      <button onClick={handleProcessAction} className="flex-[2] py-3.5 bg-emerald-600 text-white rounded-[20px] font-bold text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all">Approve Payslip Access</button>
                  </div>
                </div>
               )}
            </>
          )}

          {/* Salary Structure Configuration Screen */}
          {modalType === 'structure' && (
            <div className="space-y-6 text-left">
              {modalStep === 'history' && (
                <div className="space-y-6">
                  {/* Revision logs */}
                  <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <History size={18} className="text-indigo-600" /> Structure Revision & Increment Timeline
                      </h3>
                      <button 
                        onClick={() => setModalStep('editStructure')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-sm"
                      >
                        <Plus size={14} /> Revise Structure / Record Increment
                      </button>
                    </div>

                    {isLoading ? (
                      <div className="flex flex-col items-center py-12 gap-3">
                        <Loader2 className="animate-spin text-indigo-600" size={32} />
                        <p className="text-xs font-semibold text-gray-400">Loading history logs...</p>
                      </div>
                    ) : structureHistory.length > 0 ? (
                      <div className="relative border-l-2 border-indigo-100 ml-4 pl-8 space-y-8 py-4">
                        {structureHistory.map((struct, idx) => (
                          <div key={struct.id} className="relative">
                            {/* Dot icon */}
                            <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-white border-4 border-indigo-600 flex items-center justify-center shadow-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="text-sm font-extrabold text-slate-900">
                                  ₹{(struct.basicSalary || 0).toLocaleString('en-IN')} (Basic)
                                </span>
                                <span className="px-3 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                                  {struct.calculationMode === 'PERCENTAGE_BASED' ? 'Statutory % Mode' : 'Fixed Component Mode'}
                                </span>
                                {idx === 0 && (
                                  <span className="px-3 py-0.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                                    Active Structure
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-xs font-semibold text-slate-500">
                                <div>
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Gross Est.</p>
                                  <p className="font-extrabold text-slate-800 mt-0.5">
                                    ₹{(struct.basicSalary + struct.hra + struct.da + struct.conveyanceAllowance + struct.medicalAllowance + struct.specialAllowance + struct.otherAllowances).toLocaleString('en-IN')}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">PF (Employer/Emp)</p>
                                  <p className="font-bold text-slate-700 mt-0.5">
                                    ₹{struct.providentFund.toLocaleString('en-IN')} ({struct.pfPercent}%)
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">ESI (Employer/Emp)</p>
                                  <p className="font-bold text-slate-700 mt-0.5">
                                    ₹{struct.esi.toLocaleString('en-IN')} ({struct.esiPercent}%)
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Effective From</p>
                                  <p className="font-bold text-slate-700 mt-0.5 flex items-center gap-1.5">
                                    <Calendar size={12} className="text-gray-400" /> {new Date(struct.effectiveDate).toLocaleDateString('en-IN')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <TrendingUp className="mx-auto text-slate-300 mb-2" size={32} />
                        <p className="text-sm font-bold text-slate-500">No revisions configured yet</p>
                        <p className="text-xs text-gray-400 font-semibold mt-1">Configure their initial salary structure to begin generating attendance proration payrolls.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-4">
                    <button onClick={closeModal} className="px-8 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-sm font-bold transition-all active:scale-95">Close</button>
                  </div>
                </div>
              )}

              {modalStep === 'editStructure' && (
                <div className="space-y-6">
                  {/* Revision Form */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* General Settings */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 space-y-5">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">1. Revision Parameters</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Effective Date<span className="text-rose-500 ml-0.5">*</span></label>
                            <input 
                              type="date"
                              value={structForm.effectiveDate}
                              onChange={(e) => setStructForm({...structForm, effectiveDate: e.target.value})}
                              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-indigo-500/50 font-bold text-sm"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Calculation Method<span className="text-rose-500 ml-0.5">*</span></label>
                            <div className="relative">
                              <select 
                                value={structForm.calculationMode}
                                onChange={(e) => setStructForm({...structForm, calculationMode: e.target.value})}
                                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 pr-10 outline-none focus:border-indigo-500/50 font-bold text-sm appearance-none cursor-pointer"
                              >
                                <option value="PERCENTAGE_BASED">Percentage-Based Statutory Formulas</option>
                                <option value="FIXED">Flat Fixed Component Values</option>
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Earnings */}
                      <div className="bg-emerald-50/30 p-6 rounded-3xl border border-emerald-100/50 space-y-5">
                        <h4 className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1.5"><PlusCircle size={16} /> 2. Earnings Components (Monthly Base)</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Basic Salary<span className="text-rose-500 ml-0.5">*</span></label>
                            <input 
                              type="number"
                              value={structForm.basicSalary}
                              onChange={(e) => setStructForm({...structForm, basicSalary: e.target.value})}
                              placeholder="0"
                              className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-4 outline-none focus:border-emerald-500/50 font-extrabold text-sm"
                            />
                          </div>

                          {structForm.calculationMode === 'PERCENTAGE_BASED' ? (
                            <>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">HRA (% of Basic)</label>
                                <input 
                                  type="number"
                                  value={structForm.hraPercent}
                                  onChange={(e) => setStructForm({...structForm, hraPercent: e.target.value})}
                                  placeholder="40"
                                  className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-4 outline-none focus:border-emerald-500/50 font-bold text-sm"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Dearness Allowance (DA %)</label>
                                <input 
                                  type="number"
                                  value={structForm.daPercent}
                                  onChange={(e) => setStructForm({...structForm, daPercent: e.target.value})}
                                  placeholder="0"
                                  className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-4 outline-none focus:border-emerald-500/50 font-bold text-sm"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">HRA Amount (₹)</label>
                                <input 
                                  type="number"
                                  value={structForm.hra}
                                  onChange={(e) => setStructForm({...structForm, hra: e.target.value})}
                                  placeholder="0"
                                  className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-4 outline-none focus:border-emerald-500/50 font-bold text-sm"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">DA Amount (₹)</label>
                                <input 
                                  type="number"
                                  value={structForm.da}
                                  onChange={(e) => setStructForm({...structForm, da: e.target.value})}
                                  placeholder="0"
                                  className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-4 outline-none focus:border-emerald-500/50 font-bold text-sm"
                                />
                              </div>
                            </>
                          )}

                          {[
                            { id: 'conveyanceAllowance', label: 'Conveyance Allowance' },
                            { id: 'medicalAllowance', label: 'Medical Allowance' },
                            { id: 'specialAllowance', label: 'Special Allowance' },
                            { id: 'otherAllowances', label: 'Other Allowances / Fixed' },
                            { id: 'performanceBonus', label: 'Incentives / Bonus' }
                          ].map(f => (
                            <div key={f.id} className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">{f.label}</label>
                              <input 
                                type="number"
                                value={structForm[f.id]}
                                onChange={(e) => setStructForm({...structForm, [f.id]: e.target.value})}
                                placeholder="0"
                                className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-4 outline-none focus:border-emerald-500/50 font-bold text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Deductions */}
                      <div className="bg-rose-50/30 p-6 rounded-3xl border border-rose-100/50 space-y-5">
                        <h4 className="text-xs font-black text-rose-700 uppercase tracking-widest flex items-center gap-1.5"><MinusCircle size={16} /> 3. Deductions Components (Monthly Base)</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {structForm.calculationMode === 'PERCENTAGE_BASED' ? (
                            <>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Provident Fund (PF % of Basic)</label>
                                <input 
                                  type="number"
                                  value={structForm.pfPercent}
                                  onChange={(e) => setStructForm({...structForm, pfPercent: e.target.value})}
                                  placeholder="12"
                                  className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-4 outline-none focus:border-rose-500/50 font-bold text-sm"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">ESI (% of Gross)</label>
                                <input 
                                  type="number"
                                  value={structForm.esiPercent}
                                  onChange={(e) => setStructForm({...structForm, esiPercent: e.target.value})}
                                  placeholder="0.75"
                                  className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-4 outline-none focus:border-rose-500/50 font-bold text-sm"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Income Tax (TDS % of Gross)</label>
                                <input 
                                  type="number"
                                  value={structForm.tdsPercent}
                                  onChange={(e) => setStructForm({...structForm, tdsPercent: e.target.value})}
                                  placeholder="0"
                                  className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-4 outline-none focus:border-rose-500/50 font-bold text-sm"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">PF Flat Deducted (₹)</label>
                                <input 
                                  type="number"
                                  value={structForm.providentFund}
                                  onChange={(e) => setStructForm({...structForm, providentFund: e.target.value})}
                                  placeholder="0"
                                  className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-4 outline-none focus:border-rose-500/50 font-bold text-sm"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">ESI Flat Deducted (₹)</label>
                                <input 
                                  type="number"
                                  value={structForm.esi}
                                  onChange={(e) => setStructForm({...structForm, esi: e.target.value})}
                                  placeholder="0"
                                  className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-4 outline-none focus:border-rose-500/50 font-bold text-sm"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">TDS Flat Deducted (₹)</label>
                                <input 
                                  type="number"
                                  value={structForm.tds}
                                  onChange={(e) => setStructForm({...structForm, tds: e.target.value})}
                                  placeholder="0"
                                  className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-4 outline-none focus:border-rose-500/50 font-bold text-sm"
                                />
                              </div>
                            </>
                          )}

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Professional Tax (PT) (₹)</label>
                            <input 
                              type="number"
                              value={structForm.professionalTax}
                              onChange={(e) => setStructForm({...structForm, professionalTax: e.target.value})}
                              placeholder="200"
                              className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-4 outline-none focus:border-rose-500/50 font-bold text-sm"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Other Flat Deductions</label>
                            <input 
                              type="number"
                              value={structForm.otherDeductions}
                              onChange={(e) => setStructForm({...structForm, otherDeductions: e.target.value})}
                              placeholder="0"
                              className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-4 outline-none focus:border-rose-500/50 font-bold text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Banking & Statutory Credentials */}
                      <div className="bg-[#F8FAFC] p-6 rounded-3xl border border-slate-200 space-y-5">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Building2 size={16} /> 4. Banking & Compliance Registration</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Bank Name</label>
                            <input 
                              type="text"
                              value={structForm.bankName}
                              onChange={(e) => setStructForm({...structForm, bankName: e.target.value})}
                              placeholder="HDFC Bank"
                              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-indigo-500/50 font-semibold text-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">IFSC Code</label>
                            <input 
                              type="text"
                              value={structForm.ifscCode}
                              onChange={(e) => setStructForm({...structForm, ifscCode: e.target.value})}
                              placeholder="HDFC0000123"
                              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-indigo-500/50 font-semibold text-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Account Number</label>
                            <input 
                              type="text"
                              value={structForm.accountNumber}
                              onChange={(e) => setStructForm({...structForm, accountNumber: e.target.value})}
                              placeholder="5010023902380"
                              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-indigo-500/50 font-bold text-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">UAN (PF Universal A/C No)</label>
                            <input 
                              type="text"
                              value={structForm.uanNumber}
                              onChange={(e) => setStructForm({...structForm, uanNumber: e.target.value})}
                              placeholder="100982903820"
                              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-indigo-500/50 font-semibold text-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">PF Number</label>
                            <input 
                              type="text"
                              value={structForm.pfNumber}
                              onChange={(e) => setStructForm({...structForm, pfNumber: e.target.value})}
                              placeholder="KN/BLR/00238/000/00021"
                              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-indigo-500/50 font-semibold text-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">ESI Number</label>
                            <input 
                              type="text"
                              value={structForm.esiNumber}
                              onChange={(e) => setStructForm({...structForm, esiNumber: e.target.value})}
                              placeholder="3100029302830"
                              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-indigo-500/50 font-semibold text-sm"
                            />
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Live Preview / Calculation breakups (Interactive card) */}
                    <div>
                      <div className="sticky top-6 bg-indigo-600 p-8 rounded-[32px] text-white shadow-xl shadow-indigo-150 space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] border-b border-white/20 pb-3 flex items-center gap-1.5">
                          <TrendingUp size={16} /> Real-Time Revision Preview
                        </h4>
                        
                        <div className="space-y-4 text-sm font-semibold">
                          <div className="flex justify-between">
                            <span className="opacity-75">Basic Salary</span>
                            <span>₹{Number(structForm.basicSalary || 0).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="opacity-75">HRA</span>
                            <span>₹{Number(structForm.hra || 0).toLocaleString('en-IN')}</span>
                          </div>
                          {Number(structForm.da) > 0 && (
                            <div className="flex justify-between">
                              <span className="opacity-75">DA</span>
                              <span>₹{Number(structForm.da || 0).toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="opacity-75">Other Allowances</span>
                            <span>
                              ₹{(
                                Number(structForm.conveyanceAllowance || 0) +
                                Number(structForm.medicalAllowance || 0) +
                                Number(structForm.specialAllowance || 0) +
                                Number(structForm.otherAllowances || 0)
                              ).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-white/20 pt-4 font-black">
                            <span>Base Gross Earnings</span>
                            <span>
                              ₹{(
                                Number(structForm.basicSalary || 0) +
                                Number(structForm.hra || 0) +
                                Number(structForm.da || 0) +
                                Number(structForm.conveyanceAllowance || 0) +
                                Number(structForm.medicalAllowance || 0) +
                                Number(structForm.specialAllowance || 0) +
                                Number(structForm.otherAllowances || 0) +
                                Number(structForm.performanceBonus || 0)
                              ).toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="border-t border-white/20 pt-4 space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-200">Statutory Deductions Preview</p>
                            <div className="flex justify-between font-bold text-xs opacity-90">
                              <span>Provident Fund (PF)</span>
                              <span>₹{Number(structForm.providentFund || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between font-bold text-xs opacity-90">
                              <span>ESI Contribution</span>
                              <span>₹{Number(structForm.esi || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between font-bold text-xs opacity-90">
                              <span>Professional Tax</span>
                              <span>₹{Number(structForm.professionalTax || 200).toLocaleString('en-IN')}</span>
                            </div>
                            {Number(structForm.tds) > 0 && (
                              <div className="flex justify-between font-bold text-xs opacity-90">
                                <span>TDS Deduction</span>
                                <span>₹{Number(structForm.tds || 0).toLocaleString('en-IN')}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between border-t border-white/20 pt-4 font-black text-lg">
                            <span>Estimated Net Pay</span>
                            <span>
                              ₹{(
                                (Number(structForm.basicSalary || 0) +
                                  Number(structForm.hra || 0) +
                                  Number(structForm.da || 0) +
                                  Number(structForm.conveyanceAllowance || 0) +
                                  Number(structForm.medicalAllowance || 0) +
                                  Number(structForm.specialAllowance || 0) +
                                  Number(structForm.otherAllowances || 0) +
                                  Number(structForm.performanceBonus || 0)) -
                                (Number(structForm.providentFund || 0) +
                                  Number(structForm.esi || 0) +
                                  Number(structForm.professionalTax || 200) +
                                  Number(structForm.tds || 0) +
                                  Number(structForm.otherDeductions || 0))
                              ).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {apiError && (
                    <div className="flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl px-5 py-3 text-sm font-semibold">
                      <AlertCircle size={16} />
                      {apiError}
                    </div>
                  )}

                  <div className="flex justify-end gap-4 pt-4">
                    <button 
                      onClick={() => { setModalStep('history'); setApiError(''); }} 
                      className="px-7 py-3.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Back to History
                    </button>
                    <button 
                      onClick={handleProcessAction}
                      disabled={isLoading}
                      className="px-10 py-3.5 bg-indigo-600 text-white rounded-[20px] font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-70"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Save Revision Structure'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payroll Preview Step (Side-by-Side Breakdown) */}
          {modalStep === 'preview' && (
            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Attendance Proration & Compliance Breakdown</h3>
                    <p className="text-sm text-gray-500 font-medium">Reviewing details for {employeesList.find(e => e.id === formData.employeeId)?.name || 'Employee'}</p>
                  </div>
                  <div className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold uppercase tracking-widest">
                    {formData.month}
                  </div>
                </div>

                {/* Days breakdown details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-150 mb-8 text-center text-sm font-bold text-slate-700">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Present / Late Days</span>
                    <span className="text-lg text-slate-800 font-extrabold mt-1 block">{formData.presentDays} / {formData.totalDays}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Leave Days (Approved)</span>
                    <span className="text-lg text-slate-800 font-extrabold mt-1 block">{formData.leaveDays}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Absent Days</span>
                    <span className="text-lg text-slate-800 font-extrabold mt-1 block">{formData.absentDays}</span>
                  </div>
                  <div className="text-indigo-600 bg-indigo-50/50 rounded-xl py-2 border border-indigo-100">
                    <span className="text-[10px] text-indigo-400 block uppercase tracking-wider font-extrabold">Net Paid Days</span>
                    <span className="text-lg font-black mt-0.5 block">{(formData.totalDays - (parseFloat(formData.absentDays) || 0))}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12 text-left">
                  {/* Earnings */}
                  <div className="space-y-6">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 pb-4">
                      <span>Prorated Earnings</span>
                      <span>Amount (₹)</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { id: 'basicSalary', label: 'Basic Salary' },
                        { id: 'hra', label: 'House Rent Allowance (HRA)' },
                        { id: 'conveyanceAllowance', label: 'Conveyance Allowance' },
                        { id: 'medicalAllowance', label: 'Medical Allowance' },
                        { id: 'specialAllowance', label: 'Special Allowance' },
                        { id: 'otherAllowances', label: 'Other Allowances' },
                        { id: 'performanceBonus', label: 'Performance Bonus' },
                      ].filter(f => parseFloat(formData[f.id]) > 0).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center group px-4 py-2 rounded-xl hover:bg-emerald-50/50 transition-all">
                           <div className="flex items-center gap-3">
                              <PlusCircle size={18} className="text-emerald-500/40 group-hover:text-emerald-500" />
                              <span className="text-sm font-semibold text-gray-600">{item.label}</span>
                           </div>
                           <span className="text-sm font-bold text-gray-900">₹ {parseFloat(formData[item.id] || 0).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex justify-between items-center">
                       <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Gross Total</span>
                       <span className="text-xl font-bold text-emerald-700">₹ {getGrossEarnings().toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-6">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 pb-4">
                      <span>Statutory Deductions & LOP</span>
                      <span>Amount (₹)</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { id: 'providentFund', label: 'Provident Fund (PF)' },
                        { id: 'esi', label: 'ESI Contribution' },
                        { id: 'professionalTax', label: 'Professional Tax (PT)' },
                        { id: 'incomeTax', label: 'Income Tax (TDS)' },
                        { id: 'otherDeductions', label: 'Other Deductions' },
                        { id: 'attendanceDeduction', label: 'Loss of Pay (LOP) Deduction' }
                      ].filter(f => parseFloat(formData[f.id]) > 0).map((item, idx) => (
                         <div key={idx} className="flex justify-between items-center group px-4 py-2 rounded-xl hover:bg-rose-50/50 transition-all">
                           <div className="flex items-center gap-3">
                              <MinusCircle size={18} className="text-rose-500/40 group-hover:text-rose-500" />
                              <span className="text-sm font-semibold text-gray-600">{item.label}</span>
                           </div>
                           <span className="text-sm font-bold text-gray-900">₹ {parseFloat(formData[item.id] || 0).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 bg-rose-50 p-6 rounded-2xl border border-rose-100 flex justify-between items-center">
                       <span className="text-xs font-bold text-rose-700 uppercase tracking-widest">Total Deductions</span>
                       <span className="text-xl font-bold text-rose-700">₹ {getTotalDeductions().toLocaleString('en-IN')}</span>
                    </div>
                    
                    {/* Net Salary Payable */}
                    <div className="mt-6 bg-indigo-600 p-6 rounded-2xl shadow-xl shadow-indigo-100 flex justify-between items-center text-white">
                       <span className="text-xs font-bold uppercase tracking-widest opacity-80">Final Payable Net Pay</span>
                       <span className="text-2xl font-bold">₹ {calculateTotal()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {apiError && (
                <div className="flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl px-5 py-3 text-sm font-semibold">
                  <AlertCircle size={16} />
                  {apiError}
                </div>
              )}

              <div className="flex justify-end gap-4">
                <button onClick={() => { setModalStep('form'); setApiError(''); }} className="px-8 py-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Back to Edit</button>
                <button 
                  onClick={handleProcessAction}
                  disabled={isLoading}
                  className="px-10 py-4 bg-indigo-600 text-white rounded-[20px] font-bold text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Finalize & Disburse Draft'}
                </button>
              </div>
            </div>
          )}

          {/* Payslip Preview for Downloaded Items */}
          {modalType === 'download' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div id="printable-payslip" className="bg-gray-50 rounded-3xl p-4 md:p-8 border-2 border-dashed border-gray-200">
                <PayslipTemplate 
                  data={{
                    orgName: orgDetails?.organisation_name || localStorage.getItem('organisation_name') || 'Avention Technologies Private Limited',
                    orgAddress: orgDetails?.organisation_address || '461 Sai Sobagu, 1st Floor Outer Ring Road Teachers Colony, Sector 6 HSR Layout Bangalore Karnataka 560034 India',
                    employeeName: selectedItem?.name,
                    employeeId: selectedItem?.employeeId || selectedItem?.empId,
                    designation: selectedItem?.designation || 'WordPress Developer Intern',
                    doj: selectedItem?.doj ? new Date(selectedItem.doj).toLocaleDateString('en-IN') : '27/01/2025',
                    month: selectedItem?.month?.split(' ')[0] || '',
                    year: selectedItem?.month?.split(' ')[1] || '',
                    payDate: selectedItem?.paymentDate ? new Date(selectedItem.paymentDate).toLocaleDateString('en-IN') : '',
                    earnings: [
                      { name: 'Basic Salary', amount: selectedItem?.basicSalary },
                      { name: 'House Rent Allowance (HRA)', amount: selectedItem?.hra },
                      { name: 'Conveyance Allowance', amount: selectedItem?.conveyanceAllowance },
                      { name: 'Medical Allowance', amount: selectedItem?.medicalAllowance },
                      { name: 'Special Allowance', amount: selectedItem?.specialAllowance },
                      { name: 'Other Allowances', amount: selectedItem?.otherAllowances },
                      { name: 'Performance Bonus', amount: selectedItem?.performanceBonus },
                    ].filter(e => e.amount > 0),
                    deductions: [
                      { name: 'Provident Fund (PF)', amount: selectedItem?.providentFund },
                      { name: 'Professional Tax', amount: selectedItem?.professionalTax },
                      { name: 'Income Tax (TDS)', amount: selectedItem?.incomeTax },
                      { name: 'ESI', amount: selectedItem?.esi },
                      { name: 'Other Deductions', amount: selectedItem?.otherDeductions },
                      { name: 'Attendance Deduction', amount: selectedItem?.attendanceDeduction },
                    ].filter(d => d.amount > 0),
                    totalEarnings: selectedItem?.totalEarnings,
                    totalDeductions: selectedItem?.totalDeductions,
                    netSalary: selectedItem?.netSalary,
                    paidDays: selectedItem?.totalDays - (selectedItem?.lopDays || selectedItem?.absentDays || 0),
                    lopDays: selectedItem?.lopDays || selectedItem?.absentDays || 0,
                    totalDays: selectedItem?.totalDays || 30,
                    rawNetSalary: selectedItem?.netSalary || 0,
                    uanNumber: selectedItem?.uanNumber || '',
                    pfNumber: selectedItem?.pfNumber || '',
                    esiNumber: selectedItem?.esiNumber || '',
                    bankName: selectedItem?.bankName || '',
                    ifscCode: selectedItem?.ifscCode || '',
                    accountNumber: selectedItem?.accountNumber || ''
                  }} 
                />
              </div>
              <div className="flex justify-center gap-4">
                <button onClick={handlePrint} className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                   <Printer size={20} /> Print / Export PDF
                </button>
                <button onClick={closeModal} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">
                   Done
                </button>
              </div>
            </div>
          )}

          {modalStep === 'success' && (
            <div className="text-center py-10 space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="w-28 h-28 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner relative">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping"></div>
                <Check size={56} strokeWidth={4} />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-bold text-gray-900">
                  {modalType === 'create' ? 'Payroll Completed Successfully!' :
                   modalType === 'payment' ? 'Disbursement Successful!' :
                   modalType === 'approve' ? 'Access Granted!' :
                   modalType === 'structure' ? 'Salary Structure Recorded!' : 'Changes Saved!'}
                </h3>
                <p className="text-base text-gray-500 font-semibold px-10">
                   {modalType === 'create' ? `Payroll for ${employeesList.find(e => e.id === formData.employeeId)?.name} (${formData.month}) has been finalized and processed.` :
                    modalType === 'payment' ? `Payment of ${selectedItem?.total} to ${selectedItem?.name} has been processed via ${paymentData.method}.` :
                    modalType === 'approve' ? `${selectedItem?.name} has been notified and can view their payslip now.` :
                    modalType === 'structure' ? `A new salary structure revision has been generated for ${selectedItem?.name}.` :
                    'The record has been updated successfully.'}
                </p>
                {(modalType === 'create' || modalType === 'payment') && (
                   <div className="mt-6">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Disbursed Amount</p>
                      <p className="text-4xl font-bold text-gray-900 mt-2">
                        {modalType === 'create' ? `₹${calculateTotal()}` : selectedItem?.total}
                      </p>
                   </div>
                )}
              </div>
              <div className="flex items-center gap-4 px-10">
                <button onClick={closeModal} className="w-full py-4 bg-indigo-600 text-white rounded-[20px] font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Done and Return to Dashboard</button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Payroll;
