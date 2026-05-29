import React, { useState, useEffect } from 'react';
import { 
  Download, CheckCircle2, Loader2, FileText, Filter, 
  Plus, Search, Calendar, ChevronLeft, ChevronRight, 
  Edit2, Check, X, Wallet, Clock, 
  FileEdit, CalendarDays, Lock, AlertCircle, DollarSign, 
  User, Briefcase, Info, ChevronDown, Printer,
  PlusCircle, MinusCircle, History, TrendingUp, Percent,
  Coins, CreditCard, Building2, ShieldAlert
} from 'lucide-react';
import Modal from '../components/Modal';
import PayslipTemplate from '../components/PayslipTemplate';

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

const fmt = (v) => Number(v || 0).toLocaleString('en-IN');

const Payroll = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState('payrolls'); // 'payrolls', 'structures', 'templates', 'policies'

  // Data Lists
  const [payrollList, setPayrollList] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  const [templatesList, setTemplatesList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [orgDetails, setOrgDetails] = useState(null);

  // Modals & Steps
  const [modalType, setModalType] = useState(null); // 'create', 'edit', 'payment', 'export', 'approve', 'download', 'structure', 'createTemplate', 'assignTemplate'
  const [modalStep, setModalStep] = useState('form'); // 'form', 'preview', 'success', 'history', 'editStructure'
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [bulkProgress, setBulkProgress] = useState('');

  // Bulk Wizard Selected Employees
  const [selectedBulkEmployees, setSelectedBulkEmployees] = useState([]);
  const [bulkCalculations, setBulkCalculations] = useState([]); // List of calculated payroll suggestions
  const [activeBulkIndex, setActiveBulkIndex] = useState(0); // For editing details in step 4

  // Form States
  const [formData, setFormData] = useState({
    employeeId: '', month: CURRENT_MONTH, basicSalary: '30000', hra: '12000', da: '0',
    conveyanceAllowance: '1600', medicalAllowance: '1250', specialAllowance: '5000',
    otherAllowances: '2000', performanceBonus: '0', incentives: '0', overtime: '0', otherEarnings: '0',
    providentFund: '3600', professionalTax: '200', incomeTax: '0', esi: '225', insurance: '0',
    advanceDeduction: '0', loanDeduction: '0', otherDeductions: '0', attendanceDeduction: '0',
    lateComingPenalty: '0', earlyCheckoutPenalty: '0', missingPunchPenalty: '0',
    totalDays: 30, presentDays: 30, absentDays: 0, leaveDays: 0, lopDays: 0, paidDays: 30,
    halfDays: 0, lateCount: 0, lopLeaveDays: 0, weekOffs: 4, holidays: 1, missingPunches: 0, overtimeHours: 0,
    pfPercent: '12', esiPercent: '0.75', tdsPercent: '0',
    status: 'DRAFT', auditLog: '', adjustedManually: false
  });

  // Template Form State
  const [templateForm, setTemplateForm] = useState({
    name: '', basicSalary: '30000', hraPercent: '40', daPercent: '0', pfPercent: '12', esiPercent: '0.75', tdsPercent: '0',
    conveyanceAllowance: '1600', medicalAllowance: '1250', specialAllowance: '5000', otherAllowances: '2000', performanceBonus: '0',
    incentives: '0', overtime: '0', otherEarnings: '0', professionalTax: '200', insurance: '0', advanceDeduction: '0',
    loanDeduction: '0', otherDeductions: '0', salaryType: 'Monthly', paymentMode: 'Bank Transfer', payrollFrequency: 'Monthly', active: true
  });

  // Policy Form State
  const [policyForm, setPolicyForm] = useState({
    defaultCheckInTime: '09:00', defaultCheckOutTime: '18:00', gracePeriod: 15, shiftDuration: 9,
    lateCountThreshold: 3, lateDeductionDays: 0.5, lateMinutesHalfDayThreshold: 30,
    earlyCheckoutHourThreshold: 1.0, earlyCheckoutDeductionDays: 0.5, autoPenaltyRulesEnabled: true,
    sickLeavesLimit: 12, casualLeavesLimit: 12, emergencyLeavesLimit: 6, departments: '[]', declaredHolidays: '[]'
  });

  // Individual Structure config Form State
  const [structForm, setStructForm] = useState({
    userId: '', effectiveDate: new Date().toISOString().split('T')[0], calculationMode: 'PERCENTAGE_BASED',
    basicSalary: '30000', hraPercent: '40', daPercent: '0', pfPercent: '12', esiPercent: '0.75', tdsPercent: '0',
    conveyanceAllowance: '1600', medicalAllowance: '1250', specialAllowance: '5000', otherAllowances: '2000', performanceBonus: '0',
    incentives: '0', overtime: '0', otherEarnings: '0', professionalTax: '200', insurance: '0', advanceDeduction: '0',
    loanDeduction: '0', otherDeductions: '0', salaryType: 'Monthly', paymentMode: 'Bank Transfer', payrollFrequency: 'Monthly',
    bankName: '', ifscCode: '', accountNumber: '', uanNumber: '', pfNumber: '', esiNumber: ''
  });

  const [structureHistory, setStructureHistory] = useState([]);
  const [filterData, setFilterData] = useState({ month: CURRENT_MONTH, status: 'All Status' });
  const [exportData, setExportData] = useState({ month: CURRENT_MONTH, type: 'Payroll Report', format: 'CSV (.csv)' });
  const [paymentData, setPaymentData] = useState({ method: 'Bank Transfer', transactionId: '' });

  // API Callbacks
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/payroll/employees', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setEmployeesList(data);
      }
    } catch (err) { console.error(err); }
  };

  const fetchPayrolls = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/payroll', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setPayrollList(data);
      }
    } catch (err) { console.error(err); }
  };

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/payroll/admin/requests', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setRequestsList(data);
      }
    } catch (err) { console.error(err); }
  };

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/payroll/templates', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setTemplatesList(data);
      }
    } catch (err) { console.error(err); }
  };

  const fetchOrgDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/settings', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setOrgDetails(data);
        setPolicyForm({
          defaultCheckInTime: data.defaultCheckInTime || '09:00',
          defaultCheckOutTime: data.defaultCheckOutTime || '18:00',
          gracePeriod: data.gracePeriod || 15,
          shiftDuration: data.shiftDuration || 9.0,
          lateCountThreshold: data.lateCountThreshold || 3,
          lateDeductionDays: data.lateDeductionDays || 0.5,
          lateMinutesHalfDayThreshold: data.lateMinutesHalfDayThreshold || 30,
          earlyCheckoutHourThreshold: data.earlyCheckoutHourThreshold || 1.0,
          earlyCheckoutDeductionDays: data.earlyCheckoutDeductionDays || 0.5,
          autoPenaltyRulesEnabled: data.autoPenaltyRulesEnabled !== false,
          sickLeavesLimit: data.sickLeavesLimit || 12,
          casualLeavesLimit: data.casualLeavesLimit || 12,
          emergencyLeavesLimit: data.emergencyLeavesLimit || 6,
          departments: data.departments || '[]',
          declaredHolidays: data.declaredHolidays || '[]'
        });
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchEmployees();
      fetchPayrolls();
      fetchRequests();
      fetchTemplates();
      fetchOrgDetails();
    }
  }, [isUnlocked]);

  // Sync calculations for individual payroll screen
  const calculateTotal = (data = formData) => {
    const e = [
      data.basicSalary, data.hra, data.conveyanceAllowance, data.medicalAllowance,
      data.specialAllowance, data.otherAllowances, data.performanceBonus, data.incentives,
      data.overtime, data.otherEarnings
    ].reduce((acc, v) => acc + (parseFloat(v) || 0), 0);
    const d = [
      data.providentFund, data.professionalTax, data.incomeTax, data.esi, data.insurance,
      data.advanceDeduction, data.loanDeduction, data.otherDeductions, data.attendanceDeduction
    ].reduce((acc, v) => acc + (parseFloat(v) || 0), 0);
    return Math.round(e - d);
  };

  const getGrossEarnings = (data = formData) => {
    return [
      data.basicSalary, data.hra, data.conveyanceAllowance, data.medicalAllowance,
      data.specialAllowance, data.otherAllowances, data.performanceBonus, data.incentives,
      data.overtime, data.otherEarnings
    ].reduce((acc, v) => acc + (parseFloat(v) || 0), 0);
  };

  const getTotalDeductions = (data = formData) => {
    return [
      data.providentFund, data.professionalTax, data.incomeTax, data.esi, data.insurance,
      data.advanceDeduction, data.loanDeduction, data.otherDeductions, data.attendanceDeduction
    ].reduce((acc, v) => acc + (parseFloat(v) || 0), 0);
  };

  // PIN security unlock code
  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === '1234') {
      setIsUnlocked(true);
      setPinError('');
    } else {
      setPinError('Incorrect PIN. Security authorization failed.');
      setPinInput('');
    }
  };

  // Open modals with initialized states
  const openModal = async (type, item = null) => {
    setSelectedItem(item);
    setModalType(type);
    setModalStep('form');
    setApiError('');
    setBulkProgress('');

    if (type === 'create') {
      // Wizard: select active employees
      setSelectedBulkEmployees(employeesList.map(e => e.id));
      setBulkCalculations([]);
      setModalStep('step1'); // Select Month
    } else if (type === 'edit' && item) {
      setFormData({
        employeeId: String(item.userId),
        month: item.month,
        basicSalary: String(item.basicSalary || 0),
        hra: String(item.hra || 0),
        da: String(item.da || 0),
        conveyanceAllowance: String(item.conveyanceAllowance || 0),
        medicalAllowance: String(item.medicalAllowance || 0),
        specialAllowance: String(item.specialAllowance || 0),
        otherAllowances: String(item.otherAllowances || 0),
        performanceBonus: String(item.performanceBonus || 0),
        incentives: String(item.incentives || 0),
        overtime: String(item.overtime || 0),
        otherEarnings: String(item.otherEarnings || 0),
        providentFund: String(item.providentFund || 0),
        professionalTax: String(item.professionalTax || 200),
        incomeTax: String(item.incomeTax || 0),
        esi: String(item.esi || 0),
        insurance: String(item.insurance || 0),
        advanceDeduction: String(item.advanceDeduction || 0),
        loanDeduction: String(item.loanDeduction || 0),
        otherDeductions: String(item.otherDeductions || 0),
        attendanceDeduction: String(Math.round(item.attendanceDeduction || 0)),
        lateComingPenalty: String(Math.round(item.lateComingPenalty || 0)),
        earlyCheckoutPenalty: String(Math.round(item.earlyCheckoutPenalty || 0)),
        missingPunchPenalty: String(Math.round(item.missingPunchPenalty || 0)),
        totalDays: item.totalDays || 30,
        presentDays: item.presentDays || 30,
        absentDays: item.absentDays || 0,
        leaveDays: item.leaveDays || 0,
        lopDays: item.lopDays || 0,
        paidDays: item.paidDays || 30,
        status: item.status.toUpperCase(),
        auditLog: item.auditLog || '',
        adjustedManually: item.adjustedManually || false
      });
    } else if (type === 'createTemplate') {
      setTemplateForm({
        name: '', basicSalary: '30000', hraPercent: '40', daPercent: '0', pfPercent: '12', esiPercent: '0.75', tdsPercent: '0',
        conveyanceAllowance: '1600', medicalAllowance: '1250', specialAllowance: '5000', otherAllowances: '2000', performanceBonus: '0',
        incentives: '0', overtime: '0', otherEarnings: '0', professionalTax: '200', insurance: '0', advanceDeduction: '0',
        loanDeduction: '0', otherDeductions: '0', salaryType: 'Monthly', paymentMode: 'Bank Transfer', payrollFrequency: 'Monthly', active: true
      });
    } else if (type === 'structure' && item) {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/payroll/salary-structure/${item.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setStructureHistory(data);
        }
      } catch (err) { console.error(err); }
      setIsLoading(false);
      setModalStep('history');
      setStructForm({
        userId: String(item.id), effectiveDate: new Date().toISOString().split('T')[0], calculationMode: 'PERCENTAGE_BASED',
        basicSalary: '30000', hraPercent: '40', daPercent: '0', pfPercent: '12', esiPercent: '0.75', tdsPercent: '0',
        conveyanceAllowance: '1600', medicalAllowance: '1250', specialAllowance: '5000', otherAllowances: '2000', performanceBonus: '0',
        incentives: '0', overtime: '0', otherEarnings: '0', professionalTax: '200', insurance: '0', advanceDeduction: '0',
        loanDeduction: '0', otherDeductions: '0', salaryType: 'Monthly', paymentMode: 'Bank Transfer', payrollFrequency: 'Monthly',
        bankName: item.bankName || '', ifscCode: item.ifscCode || '', accountNumber: item.accountNumber || '',
        uanNumber: item.uanNumber || '', pfNumber: item.pfNumber || '', esiNumber: item.esiNumber || ''
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedItem(null);
    setStructureHistory([]);
    setBulkCalculations([]);
  };

  // Step 2 & 3 Wizard Calculations
  const runAutoCalculations = async () => {
    setIsLoading(true);
    setApiError('');
    setBulkProgress('Fetching employee schedules and pro-rating salary rates...');
    try {
      const token = localStorage.getItem('token');
      const calculatedPayrolls = [];
      for (const empId of selectedBulkEmployees) {
        const res = await fetch(`/api/payroll/calculate?userId=${empId}&month=${formData.month}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          calculatedPayrolls.push({
            userId: Number(empId),
            employeeId: data.employeeId,
            employeeName: data.employeeName,
            designation: data.designation,
            month: formData.month,
            basicSalary: data.basicSalary,
            hra: data.hra,
            da: data.da,
            conveyanceAllowance: data.conveyanceAllowance,
            medicalAllowance: data.medicalAllowance,
            specialAllowance: data.specialAllowance,
            otherAllowances: data.otherAllowances,
            performanceBonus: data.performanceBonus,
            incentives: data.incentives,
            overtime: data.overtime,
            otherEarnings: data.otherEarnings,
            providentFund: data.providentFund,
            professionalTax: data.professionalTax,
            incomeTax: data.incomeTax,
            esi: data.esi,
            insurance: data.insurance,
            advanceDeduction: data.advanceDeduction,
            loanDeduction: data.loanDeduction,
            otherDeductions: data.otherDeductions,
            attendanceDeduction: data.attendanceDeduction,
            lateComingPenalty: data.lateComingPenalty,
            earlyCheckoutPenalty: data.earlyCheckoutPenalty,
            missingPunchPenalty: data.missingPunchPenalty,
            totalDays: data.totalDays,
            presentDays: data.presentDays,
            absentDays: data.absentDays,
            leaveDays: data.leaveDays,
            lopDays: data.lopDays,
            paidDays: data.paidDays,
            weekOffs: data.weekOffs,
            holidays: data.holidays,
            status: 'PENDING', // default pending payout after calculation
            adjustedManually: false,
            auditLog: ''
          });
        }
      }
      setBulkCalculations(calculatedPayrolls);
      setModalStep('step3'); // Show Register suggestion grid
    } catch (err) {
      setApiError('Calculations failed. Ensure salary structure is configured first.');
    }
    setIsLoading(false);
  };

  const handleEditBulkPayroll = (index) => {
    setActiveBulkIndex(index);
    const item = bulkCalculations[index];
    setFormData({
      employeeId: String(item.userId),
      month: item.month,
      basicSalary: String(item.basicSalary), hra: String(item.hra), da: String(item.da),
      conveyanceAllowance: String(item.conveyanceAllowance), medicalAllowance: String(item.medicalAllowance),
      specialAllowance: String(item.specialAllowance), otherAllowances: String(item.otherAllowances),
      performanceBonus: String(item.performanceBonus), incentives: String(item.incentives),
      overtime: String(item.overtime), otherEarnings: String(item.otherEarnings),
      providentFund: String(item.providentFund), professionalTax: String(item.professionalTax),
      incomeTax: String(item.incomeTax), esi: String(item.esi), insurance: String(item.insurance),
      advanceDeduction: String(item.advanceDeduction), loanDeduction: String(item.loanDeduction),
      otherDeductions: String(item.otherDeductions), attendanceDeduction: String(item.attendanceDeduction),
      lateComingPenalty: String(item.lateComingPenalty), earlyCheckoutPenalty: String(item.earlyCheckoutPenalty),
      missingPunchPenalty: String(item.missingPunchPenalty),
      totalDays: item.totalDays, presentDays: item.presentDays, absentDays: item.absentDays,
      leaveDays: item.leaveDays, lopDays: item.lopDays, paidDays: item.paidDays,
      weekOffs: item.weekOffs, holidays: item.holidays, status: item.status,
      auditLog: item.auditLog, adjustedManually: item.adjustedManually
    });
    setModalStep('step4'); // manual adjustment overlay
  };

  const handleSaveBulkOverride = () => {
    const updatedCalculations = [...bulkCalculations];
    const gross = getGrossEarnings();
    const deductions = getTotalDeductions();
    const net = calculateTotal();
    
    updatedCalculations[activeBulkIndex] = {
      ...updatedCalculations[activeBulkIndex],
      basicSalary: parseFloat(formData.basicSalary) || 0,
      hra: parseFloat(formData.hra) || 0,
      conveyanceAllowance: parseFloat(formData.conveyanceAllowance) || 0,
      medicalAllowance: parseFloat(formData.medicalAllowance) || 0,
      specialAllowance: parseFloat(formData.specialAllowance) || 0,
      otherAllowances: parseFloat(formData.otherAllowances) || 0,
      performanceBonus: parseFloat(formData.performanceBonus) || 0,
      incentives: parseFloat(formData.incentives) || 0,
      overtime: parseFloat(formData.overtime) || 0,
      otherEarnings: parseFloat(formData.otherEarnings) || 0,
      providentFund: parseFloat(formData.providentFund) || 0,
      professionalTax: parseFloat(formData.professionalTax) || 0,
      incomeTax: parseFloat(formData.incomeTax) || 0,
      esi: parseFloat(formData.esi) || 0,
      insurance: parseFloat(formData.insurance) || 0,
      advanceDeduction: parseFloat(formData.advanceDeduction) || 0,
      loanDeduction: parseFloat(formData.loanDeduction) || 0,
      otherDeductions: parseFloat(formData.otherDeductions) || 0,
      attendanceDeduction: parseFloat(formData.attendanceDeduction) || 0,
      adjustedManually: true,
      auditLog: formData.auditLog || 'Manual overrides applied by administrator'
    };
    setBulkCalculations(updatedCalculations);
    setModalStep('step3'); // back to wizard list
  };

  const handleFinalizeBulkPayroll = async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const token = localStorage.getItem('token');
      // Save in bulk
      const res = await fetch('/api/payroll/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(bulkCalculations)
      });
      if (res.ok) {
        fetchPayrolls();
        setModalStep('success');
      } else {
        const err = await res.json().catch(() => ({}));
        setApiError(err.error || 'Failed to process bulk payroll generation.');
      }
    } catch (e) {
      setApiError('Network connection error.');
    }
    setIsLoading(false);
  };

  // Standard Save operations
  const handleProcessAction = async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const token = localStorage.getItem('token');
      if (modalType === 'edit') {
        const payload = {
          userId: Number(formData.employeeId),
          month: formData.month,
          basicSalary: parseFloat(formData.basicSalary) || 0,
          hra: parseFloat(formData.hra) || 0,
          da: parseFloat(formData.da) || 0,
          conveyanceAllowance: parseFloat(formData.conveyanceAllowance) || 0,
          medicalAllowance: parseFloat(formData.medicalAllowance) || 0,
          specialAllowance: parseFloat(formData.specialAllowance) || 0,
          otherAllowances: parseFloat(formData.otherAllowances) || 0,
          performanceBonus: parseFloat(formData.performanceBonus) || 0,
          incentives: parseFloat(formData.incentives) || 0,
          overtime: parseFloat(formData.overtime) || 0,
          otherEarnings: parseFloat(formData.otherEarnings) || 0,
          providentFund: parseFloat(formData.providentFund) || 0,
          professionalTax: parseFloat(formData.professionalTax) || 200,
          incomeTax: parseFloat(formData.incomeTax) || 0,
          esi: parseFloat(formData.esi) || 0,
          insurance: parseFloat(formData.insurance) || 0,
          advanceDeduction: parseFloat(formData.advanceDeduction) || 0,
          loanDeduction: parseFloat(formData.loanDeduction) || 0,
          otherDeductions: parseFloat(formData.otherDeductions) || 0,
          attendanceDeduction: parseFloat(formData.attendanceDeduction) || 0,
          lateComingPenalty: parseFloat(formData.lateComingPenalty) || 0,
          earlyCheckoutPenalty: parseFloat(formData.earlyCheckoutPenalty) || 0,
          missingPunchPenalty: parseFloat(formData.missingPunchPenalty) || 0,
          totalDays: Number(formData.totalDays) || 30,
          presentDays: Number(formData.presentDays) || 30,
          absentDays: Number(formData.absentDays) || 0,
          leaveDays: Number(formData.leaveDays) || 0,
          lopDays: Number(formData.lopDays) || 0,
          paidDays: Number(formData.paidDays) || 30,
          weekOffs: Number(formData.weekOffs) || 4,
          holidays: Number(formData.holidays) || 1,
          status: formData.status,
          adjustedManually: true,
          auditLog: formData.auditLog || 'Manual details update by Administrator'
        };

        const res = await fetch(`/api/payroll/${selectedItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          fetchPayrolls();
          setModalStep('success');
        } else {
          const err = await res.json().catch(() => ({}));
          setApiError(err.error || 'Failed to update payroll.');
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
          const err = await res.json().catch(() => ({}));
          setApiError(err.error || 'Failed to record payment.');
        }
      } else if (modalType === 'approve') {
        const res = await fetch(`/api/payroll/admin/requests/${selectedItem.id}/status?status=APPROVED`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          fetchRequests();
          setModalStep('success');
        }
      } else if (modalType === 'reject') {
        const res = await fetch(`/api/payroll/admin/requests/${selectedItem.id}/status?status=REJECTED`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          fetchRequests();
          closeModal();
        }
      } else if (modalType === 'createTemplate') {
        const gross = parseFloat(templateForm.basicSalary) + (parseFloat(templateForm.basicSalary) * (parseFloat(templateForm.hraPercent)/100)) + (parseFloat(templateForm.basicSalary) * (parseFloat(templateForm.daPercent)/100)) + parseFloat(templateForm.conveyanceAllowance) + parseFloat(templateForm.medicalAllowance) + parseFloat(templateForm.specialAllowance) + parseFloat(templateForm.otherAllowances) + parseFloat(templateForm.performanceBonus) + parseFloat(templateForm.incentives) + parseFloat(templateForm.overtime) + parseFloat(templateForm.otherEarnings);
        const deductions = (parseFloat(templateForm.basicSalary) * (parseFloat(templateForm.pfPercent)/100)) + (gross * (parseFloat(templateForm.esiPercent)/100)) + parseFloat(templateForm.professionalTax) + (gross * (parseFloat(templateForm.tdsPercent)/100)) + parseFloat(templateForm.insurance) + parseFloat(templateForm.advanceDeduction) + parseFloat(templateForm.loanDeduction) + parseFloat(templateForm.otherDeductions);
        
        const payload = {
          name: templateForm.name,
          basicSalary: parseFloat(templateForm.basicSalary) || 0,
          hraPercent: parseFloat(templateForm.hraPercent) || 40,
          daPercent: parseFloat(templateForm.daPercent) || 0,
          pfPercent: parseFloat(templateForm.pfPercent) || 12,
          esiPercent: parseFloat(templateForm.esiPercent) || 0.75,
          tdsPercent: parseFloat(templateForm.tdsPercent) || 0,
          conveyanceAllowance: parseFloat(templateForm.conveyanceAllowance) || 0,
          medicalAllowance: parseFloat(templateForm.medicalAllowance) || 0,
          specialAllowance: parseFloat(templateForm.specialAllowance) || 0,
          otherAllowances: parseFloat(templateForm.otherAllowances) || 0,
          performanceBonus: parseFloat(templateForm.performanceBonus) || 0,
          incentives: parseFloat(templateForm.incentives) || 0,
          overtime: parseFloat(templateForm.overtime) || 0,
          otherEarnings: parseFloat(templateForm.otherEarnings) || 0,
          professionalTax: parseFloat(templateForm.professionalTax) || 200,
          insurance: parseFloat(templateForm.insurance) || 0,
          advanceDeduction: parseFloat(templateForm.advanceDeduction) || 0,
          loanDeduction: parseFloat(templateForm.loanDeduction) || 0,
          otherDeductions: parseFloat(templateForm.otherDeductions) || 0,
          salaryType: templateForm.salaryType,
          paymentMode: templateForm.paymentMode,
          payrollFrequency: templateForm.payrollFrequency,
          active: templateForm.active
        };

        const res = await fetch('/api/payroll/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          fetchTemplates();
          closeModal();
        } else {
          const err = await res.json().catch(() => ({}));
          setApiError(err.error || 'Failed to save salary blueprint template.');
        }
      } else if (modalType === 'assignTemplate') {
        const payload = {
          userIds: selectedBulkEmployees,
          effectiveDate: structForm.effectiveDate
        };
        const res = await fetch(`/api/payroll/templates/${selectedItem.id}/assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          fetchEmployees();
          closeModal();
        } else {
          const err = await res.json().catch(() => ({}));
          setApiError(err.error || 'Failed to bulk-assign template.');
        }
      }
    } catch (err) { console.error(err); setApiError('Action failed.'); }
    setIsLoading(false);
  };

  const handleUpdatePolicy = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(policyForm)
      });
      if (res.ok) {
        fetchOrgDetails();
        alert('Payroll Deduction Policies saved successfully!');
      } else {
        alert('Failed to save policy updates.');
      }
    } catch (err) { console.error(err); }
    setIsLoading(false);
  };

  const handleDeleteTemplate = async (id) => {
    if (!confirm('Are you sure you want to delete this salary template?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/payroll/templates/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchTemplates();
      }
    } catch (err) { console.error(err); }
  };

  const handleExportSubmit = () => {
    // Generate high compliance CSV register and download
    let headers = "Employee Name,Employee ID,Month,Present Days,LOP Days,Gross Earnings,Total Deductions,Net Salary,Payment Mode,UAN Number,Bank Name,Account Number,Status\n";
    let rows = payrollList.map(p => 
      `"${p.employeeName}","${p.employeeId || p.userId}","${p.month}",${p.presentDays},${p.lopDays},${p.totalEarnings},${p.totalDeductions},${p.netSalary},"${p.paymentMethod || 'Bank'}","${p.uanNumber || ''}","${p.bankName || ''}","${p.accountNumber || ''}","${p.status}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Salary_Register_Export_${exportData.month.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    closeModal();
  };

  const handlePrint = () => {
    const payslipEl = document.getElementById('printable-payslip');
    if (!payslipEl) return;
    const clone = payslipEl.cloneNode(true);
    const wrapper = document.createElement('div');
    wrapper.id = 'print-wrapper';
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);
    const cleanup = () => {
      if (document.body.contains(wrapper)) document.body.removeChild(wrapper);
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
  };

  // Mapped lists & Filters
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
      base: `₹${fmt(pay.basicSalary)}`,
      bonus: `₹${fmt(pay.performanceBonus)}`,
      deductions: `₹${fmt(pay.totalDeductions)}`,
      total: `₹${fmt(pay.netSalary)}`,
      status: pay.status === 'DRAFT' ? 'Pending Draft' : (pay.status === 'PENDING' ? 'Pending Payout' : pay.status.charAt(0).toUpperCase() + pay.status.slice(1).toLowerCase())
    };
  });

  const filteredEmployees = employeesList.filter(emp => 
    emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    emp.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  // UI PIN protection
  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[30px] flex items-center justify-center mx-auto mb-6">
            <Lock size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payroll Authorization</h2>
          <p className="text-sm text-gray-500 mb-8 font-semibold px-4">Indian statutory compliance & CTC details are protected. Enter Administrator PIN to unlock.</p>
          <form onSubmit={handlePinSubmit} className="flex flex-col gap-6">
            <input 
              type="password" 
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="• • • •"
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-[24px] px-6 py-5 text-center text-4xl tracking-[1em] outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all"
              maxLength={4}
              autoFocus
            />
            {pinError && <p className="text-rose-500 text-sm font-semibold">{pinError}</p>}
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-[24px] transition-all shadow-xl shadow-indigo-200 active:scale-95">
              Unlock Module
            </button>
          </form>
          <div className="mt-8 flex items-center justify-center gap-2 py-3 bg-gray-50 rounded-2xl">
             <Info size={14} className="text-gray-400" />
             <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Access PIN: 1234</p>
          </div>
        </div>
      </div>
    );
  }

  const paidCount = payrollList.filter(p => p.status === 'PAID').length;
  const pendingCount = payrollList.filter(p => p.status === 'PENDING').length;
  const draftCount = payrollList.filter(p => p.status === 'DRAFT').length;
  const totalNetPaid = payrollList.filter(p => p.status === 'PAID').reduce((sum, p) => sum + (p.netSalary || 0), 0);

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payroll Management</h1>
          <p className="text-base text-gray-500 mt-1 font-semibold">Indian statutory compliance & attendance-based pro-rating engine</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => openModal('export')}
            className="flex items-center gap-2 px-6 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-650 hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm active:scale-95"
          >
            <Download size={20} /> Export Register
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
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[32px] p-6 text-white shadow-xl shadow-indigo-100/50 relative overflow-hidden flex flex-col justify-between group min-h-[160px]">
          <div>
            <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-[0.15em] opacity-85">Total Disbursed Net</p>
            <h3 className="text-3xl font-bold mt-2">₹{fmt(totalNetPaid)}</h3>
          </div>
          <p className="text-indigo-200 text-[10px] font-semibold mt-auto opacity-70">Disbursed amount this period</p>
        </div>

        {[
          { id: 1, title: 'Paid Payrolls', value: paidCount, sub: 'Employees paid', icon: Wallet, color: 'bg-emerald-50 text-emerald-600' },
          { id: 2, title: 'Pending Payments', value: pendingCount, sub: 'Disbursements pending', icon: Clock, color: 'bg-orange-50 text-orange-600' },
          { id: 3, title: 'Draft Payrolls', value: draftCount, sub: 'Payrolls in draft', icon: FileEdit, color: 'bg-blue-50 text-blue-600' },
          { id: 4, title: 'Total Employees', value: employeesList.length, sub: 'Active staff', icon: CalendarDays, color: 'bg-purple-50 text-purple-600' },
        ].map((stat) => (
          <div key={stat.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-all group min-h-[160px]">
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
        {[
          { id: 'payrolls', label: 'Payrolls & Approvals' },
          { id: 'structures', label: 'Employee Salaries' },
          { id: 'templates', label: 'Salary Templates' },
          { id: 'policies', label: 'Payroll Policies' }
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`pb-4 text-base font-bold transition-all relative ${
              activeTab === t.id ? 'text-indigo-600 border-b-4 border-indigo-600 -mb-[2px]' : 'text-gray-400 hover:text-gray-650'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── tab payrolls ── */}
      {activeTab === 'payrolls' && (
        <>
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-50 overflow-hidden">
            <div className="p-10 border-b border-gray-50 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Payroll Runs</h2>
              <div className="flex flex-wrap items-center gap-4">
                <select 
                  value={filterData.month}
                  onChange={(e) => setFilterData({...filterData, month: e.target.value})}
                  className="appearance-none bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3 pr-10 text-sm font-bold text-gray-600 outline-none"
                >
                  <option value="All Months">All Months</option>
                  {MONTH_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                
                <select 
                  value={filterData.status}
                  onChange={(e) => setFilterData({...filterData, status: e.target.value})}
                  className="appearance-none bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3 pr-10 text-sm font-bold text-gray-600 outline-none"
                >
                  <option value="All Status">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                </select>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name or ID..."
                    className="pl-12 pr-6 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-semibold outline-none w-72"
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
                              <p className="text-[11px] font-semibold text-gray-400 uppercase">{pay.empId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm font-semibold text-gray-550">{pay.month}</td>
                        <td className="px-8 py-6 text-sm font-semibold text-gray-550">{pay.base}</td>
                        <td className="px-8 py-6 text-sm font-semibold text-gray-550">{pay.bonus}</td>
                        <td className="px-8 py-6 text-sm font-semibold text-rose-500">{pay.deductions}</td>
                        <td className="px-8 py-6 text-base font-bold text-gray-900">{pay.total}</td>
                        <td className="px-8 py-6 text-center">
                          <span className={`px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block shadow-sm ${
                            pay.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                            pay.status === 'Pending Payout' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 
                            'bg-gray-100 text-gray-400 border border-gray-100'
                          }`}>
                            {pay.status}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          {pay.status !== 'Pending Draft' ? (
                            <button 
                              onClick={() => openModal('download', pay)}
                              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-750 font-bold text-xs"
                            >
                              <Download size={16} /> View & Download
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
                             ) : pay.status === 'Pending Payout' ? (
                               <button 
                                 onClick={() => openModal('payment', pay)}
                                 className="flex items-center gap-2 px-5 py-2 bg-indigo-50 text-indigo-600 border-2 border-indigo-100 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                               >
                                  <Wallet size={14} /> Make Payment
                               </button>
                             ) : (
                               <button 
                                 onClick={() => openModal('edit', pay)}
                                 className="flex items-center gap-2 px-5 py-2 bg-white border-2 border-gray-100 rounded-xl text-[10px] font-bold text-gray-600 uppercase tracking-wider hover:border-indigo-500/30 hover:bg-gray-50 transition-all active:scale-95"
                               >
                                  <Edit2 size={14} /> Edit / Lock
                               </button>
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
          </div>

          {/* Payslip Approval Section */}
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-50 overflow-hidden mt-8">
            <div className="p-10 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Employee Payslip Access Requests</h2>
                 <span className="bg-indigo-50 text-indigo-600 px-3.5 py-1 rounded-2xl text-xs font-bold">{mappedRequestsList.length}</span>
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
                              <p className="text-[11px] font-semibold text-gray-400 uppercase">{req.empId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center text-sm font-semibold text-gray-550">{req.month}</td>
                        <td className="px-8 py-6 text-sm font-semibold text-gray-550">{req.requestDate}</td>
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
                                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 text-emerald-600 border-2 border-emerald-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                              >
                                 <CheckCircle2 size={16} /> Approve
                              </button>
                              <button 
                                onClick={() => openModal('reject', req)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-rose-50 text-rose-600 border-2 border-rose-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm animate-pulse"
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
                        No pending payslip requests.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── tab structures ── */}
      {activeTab === 'structures' && (
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-50 overflow-hidden">
          <div className="p-10 border-b border-gray-50 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Employee Salary Profiles</h2>
              <p className="text-sm text-gray-400 mt-1 font-semibold">Configure active compensation components and statutory profiles individually</p>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employee..."
                className="pl-12 pr-6 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-semibold outline-none w-72"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em] border-b border-gray-50 bg-gray-50/10">
                  <th className="px-8 py-6">Employee</th>
                  <th className="px-6 py-6">Designation</th>
                  <th className="px-6 py-6">Monthly Basic Salary</th>
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
                            <p className="text-[11px] font-semibold text-gray-400 uppercase">{emp.employeeCode || emp.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-semibold text-gray-550">{emp.designation || 'Staff'}</td>
                      <td className="px-8 py-6 text-sm font-extrabold text-slate-800">
                        ₹{fmt(emp.basicSalary)}
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
                          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-750 transition-all shadow-md mx-auto"
                        >
                          <Coins size={14} /> Configure & Timeline
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

      {/* ── tab templates (Salary blueprints) ── */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-50 overflow-hidden">
          <div className="p-10 border-b border-gray-50 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Salary Blueprint Templates</h2>
              <p className="text-sm text-gray-400 mt-1 font-semibold">Define shared compensation models (Earnings/Deductions) and assign in bulk</p>
            </div>
            <button 
              onClick={() => openModal('createTemplate')}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-750 transition-all active:scale-95 shadow-md"
            >
              <Plus size={16} /> Create Reusable Blueprint
            </button>
          </div>

          <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templatesList.length > 0 ? (
              templatesList.map(t => (
                <div key={t.id} className="border border-slate-100 rounded-3xl p-6 bg-gradient-to-br from-slate-50 to-white hover:shadow-lg transition-all relative overflow-hidden flex flex-col min-h-[280px]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{t.name}</h3>
                      <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-3 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1 inline-block">
                        {t.salaryType} / {t.payrollFrequency}
                      </span>
                    </div>
                    <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${t.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                      {t.active ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-semibold text-slate-500 mb-6 mt-4">
                    <div className="flex justify-between"><span>Basic Monthly Salary:</span><span className="font-extrabold text-slate-900">₹{fmt(t.basicSalary)}</span></div>
                    <div className="flex justify-between"><span>Gross Salary Blueprint:</span><span className="font-bold text-slate-800">₹{fmt(t.grossSalary)}</span></div>
                    <div className="flex justify-between"><span>Total Deductions:</span><span className="font-bold text-rose-600">₹{fmt(t.grossSalary - t.netSalary)}</span></div>
                    <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-black text-indigo-600"><span>Estimated Net Pay:</span><span>₹{fmt(t.netSalary)}</span></div>
                  </div>

                  <div className="flex gap-2 mt-auto border-t border-slate-50 pt-4">
                    <button 
                      onClick={() => { setSelectedItem(t); setSelectedBulkEmployees([]); setModalType('assignTemplate'); }}
                      className="flex-1 py-2.5 bg-indigo-50 hover:bg-indigo-150 text-indigo-600 rounded-xl text-xs font-bold shadow-sm transition-all"
                    >
                      Bulk Assign Staff
                    </button>
                    <button 
                      onClick={() => handleDeleteTemplate(t.id)}
                      className="py-2.5 px-3 bg-rose-550/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-20">
                <Coins className="mx-auto text-gray-300 mb-2" size={48} />
                <p className="text-base font-bold text-gray-500">No salary blueprint templates created yet</p>
                <p className="text-xs text-gray-400 font-semibold mt-1">Create common salary configurations (like Intern, Engineer, Lead) to streamline bulk assignments.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── tab policies (Late / Early Deductions Policies) ── */}
      {activeTab === 'policies' && (
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-50 overflow-hidden p-10 max-w-4xl mx-auto text-left">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shrink-0">
               <ShieldAlert size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Attendance Penalty Policy Engine</h2>
              <p className="text-sm text-gray-450 font-semibold mt-0.5">Define automated payroll deduction rules for late coming, missing punches, and early checkouts</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePolicy} className="space-y-8 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Default Shift Start (Check-In)</label>
                <input 
                  type="text" 
                  value={policyForm.defaultCheckInTime} 
                  onChange={(e) => setPolicyForm({...policyForm, defaultCheckInTime: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none font-bold text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Default Shift End (Check-Out)</label>
                <input 
                  type="text" 
                  value={policyForm.defaultCheckOutTime} 
                  onChange={(e) => setPolicyForm({...policyForm, defaultCheckOutTime: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none font-bold text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Grace Period (Minutes)</label>
                <input 
                  type="number" 
                  value={policyForm.gracePeriod} 
                  onChange={(e) => setPolicyForm({...policyForm, gracePeriod: Number(e.target.value)})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none font-bold text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Shift Duration (Hours)</label>
                <input 
                  type="number" 
                  step="0.5"
                  value={policyForm.shiftDuration} 
                  onChange={(e) => setPolicyForm({...policyForm, shiftDuration: Number(e.target.value)})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none font-bold text-sm"
                />
              </div>

              <div className="bg-indigo-50/30 p-6 rounded-3xl border border-indigo-100 col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-indigo-700 uppercase tracking-widest">Configurable Deductions Policies</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-indigo-650">Enable Auto Penalties:</span>
                    <input 
                      type="checkbox" 
                      checked={policyForm.autoPenaltyRulesEnabled}
                      onChange={(e) => setPolicyForm({...policyForm, autoPenaltyRulesEnabled: e.target.checked})}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-650 block">Late Arrival Threshold (e.g. 3 arrivals)</label>
                    <input 
                      type="number" 
                      value={policyForm.lateCountThreshold}
                      onChange={(e) => setPolicyForm({...policyForm, lateCountThreshold: Number(e.target.value)})}
                      className="w-full bg-white border border-indigo-150 rounded-xl py-2.5 px-4 outline-none font-bold text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-655 block">Late Penalty LOP (Deductions in Days)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={policyForm.lateDeductionDays}
                      onChange={(e) => setPolicyForm({...policyForm, lateDeductionDays: Number(e.target.value)})}
                      className="w-full bg-white border border-indigo-150 rounded-xl py-2.5 px-4 outline-none font-bold text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-655 block">Arrival Delay {'>'} 30 Mins (Counts as LOP)</label>
                    <input 
                      type="number" 
                      value={policyForm.lateMinutesHalfDayThreshold}
                      onChange={(e) => setPolicyForm({...policyForm, lateMinutesHalfDayThreshold: Number(e.target.value)})}
                      className="w-full bg-white border border-indigo-150 rounded-xl py-2.5 px-4 outline-none font-bold text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-655 block">Early Checkout Hour Threshold (e.g. 1.0 Hour)</label>
                    <input 
                      type="number" 
                      step="0.5"
                      value={policyForm.earlyCheckoutHourThreshold}
                      onChange={(e) => setPolicyForm({...policyForm, earlyCheckoutHourThreshold: Number(e.target.value)})}
                      className="w-full bg-white border border-indigo-150 rounded-xl py-2.5 px-4 outline-none font-bold text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-655 block">Early Checkout Deduction Days</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={policyForm.earlyCheckoutDeductionDays}
                      onChange={(e) => setPolicyForm({...policyForm, earlyCheckoutDeductionDays: Number(e.target.value)})}
                      className="w-full bg-white border border-indigo-150 rounded-xl py-2.5 px-4 outline-none font-bold text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={isLoading}
                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[20px] font-bold text-sm shadow-xl shadow-indigo-100 flex items-center gap-2 active:scale-95 disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Save Penalties & Shift Policies'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Wizard Modals / Standard Modals overlay */}
      <Modal
        isOpen={modalType !== null}
        onClose={closeModal}
        maxWidth={
          modalStep === 'step3' ? 'max-w-6xl' :
          modalStep === 'preview' ? 'max-w-5xl' :
          modalType === 'download' ? 'max-w-5xl' :
          modalType === 'structure' ? 'max-w-5xl' :
          (modalType === 'create' || modalType === 'edit') ? 'max-w-4xl' : 
          'max-w-2xl'
        }
        title={
          modalStep === 'success' ? 'Success' :
          modalStep === 'step1' ? 'Select Payroll Month' :
          modalStep === 'step2' ? 'Fetch & Select Active Employees' :
          modalStep === 'step3' ? `Auto Calculations suggestion Sheet: ${formData.month}` :
          modalStep === 'step4' ? `Manual Adjustments: Override suggest calculation` :
          modalType === 'edit' ? `Modify processed Payroll: ${selectedItem?.name}` :
          modalType === 'payment' ? 'Make Disbursals Payment' :
          modalType === 'export' ? 'Download Registers' :
          modalType === 'approve' ? 'Approve Payslip Requests' :
          modalType === 'createTemplate' ? 'Define Shared Salary blueprint Template' :
          modalType === 'assignTemplate' ? `Bulk Assign Template: ${selectedItem?.name}` :
          modalType === 'download' ? 'Download Professional PDF Payslip' : 'Confirm'
        }
      >
        <div className="flex flex-col gap-6 font-sans">
          
          {/* STEP 1: Select Month */}
          {modalStep === 'step1' && (
            <div className="space-y-6 text-left">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block ml-1">Payroll Month & Year</label>
                <div className="relative">
                  <select 
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 font-bold text-sm appearance-none outline-none focus:border-indigo-400"
                  >
                    {MONTH_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                 <button onClick={closeModal} className="px-6 py-3.5 text-sm font-bold text-gray-450">Cancel</button>
                 <button onClick={() => setModalStep('step2')} className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-750 transition-all">Next: Select Employees</button>
              </div>
            </div>
          )}

          {/* STEP 2: Select Employees */}
          {modalStep === 'step2' && (
            <div className="space-y-6 text-left">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-bold text-slate-700">Choose active employees to include in payroll suggestion calculations:</p>
                <button 
                  onClick={() => {
                    if (selectedBulkEmployees.length === employeesList.length) setSelectedBulkEmployees([]);
                    else setSelectedBulkEmployees(employeesList.map(e => e.id));
                  }}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Toggle All Checkmarks
                </button>
              </div>

              <div className="max-h-[350px] overflow-y-auto border border-slate-100 rounded-2xl p-4 space-y-2">
                {employeesList.map(emp => (
                  <div key={emp.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50/20 transition-all">
                    <input 
                      type="checkbox"
                      checked={selectedBulkEmployees.includes(emp.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedBulkEmployees([...selectedBulkEmployees, emp.id]);
                        else setSelectedBulkEmployees(selectedBulkEmployees.filter(id => id !== emp.id));
                      }}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="text-sm">
                      <p className="font-bold text-slate-800">{emp.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">{emp.designation || 'Staff'} · {emp.employeeCode || emp.id}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between gap-3 pt-4 border-t border-gray-50">
                 <button onClick={() => setModalStep('step1')} className="px-6 py-3.5 text-sm font-bold text-gray-450">Back</button>
                 <button 
                   onClick={runAutoCalculations}
                   disabled={selectedBulkEmployees.length === 0}
                   className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-750 transition-all active:scale-95 disabled:opacity-50"
                 >
                   Calculate Suggestions
                 </button>
              </div>
            </div>
          )}

          {/* STEP 3: Auto calculations summary register sheet */}
          {modalStep === 'step3' && (
            <div className="space-y-6 text-left">
              <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl flex justify-between items-center text-xs font-semibold text-indigo-750">
                <p>Verify dynamic pro-ratings below. Penalty calculations, leaves, and statutory components are calculated dynamically from shifts & attendance logs.</p>
                <span className="font-extrabold uppercase bg-white border border-indigo-200 text-indigo-600 px-3 py-1 rounded-full text-[10px] tracking-widest">{formData.month}</span>
              </div>

              <div className="overflow-x-auto border border-slate-100 rounded-3xl">
                <table className="w-full text-left text-xs font-semibold text-slate-500">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-150 py-3 uppercase tracking-wider">
                      <th className="p-4">Staff Name</th>
                      <th className="p-4">Present/Total Days</th>
                      <th className="p-4">LOP Days</th>
                      <th className="p-4">Gross Earnings</th>
                      <th className="p-4">Total Deductions</th>
                      <th className="p-4">Net Salary Suggestion</th>
                      <th className="p-4 text-center">Overrides</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {bulkCalculations.map((calcItem, idx) => (
                      <tr key={calcItem.userId} className="hover:bg-slate-50">
                        <td className="p-4">
                          <p className="font-bold text-slate-800">{calcItem.employeeName}</p>
                          <p className="text-[9px] text-gray-400 uppercase tracking-widest">{calcItem.designation}</p>
                        </td>
                        <td className="p-4">{calcItem.presentDays} / {calcItem.totalDays}</td>
                        <td className="p-4 text-rose-500 font-bold">{calcItem.lopDays} Days</td>
                        <td className="p-4 text-slate-800 font-bold">₹{fmt(getGrossEarnings(calcItem))}</td>
                        <td className="p-4 text-rose-500 font-bold">₹{fmt(getTotalDeductions(calcItem))}</td>
                        <td className="p-4 text-slate-900 font-extrabold">₹{fmt(calculateTotal(calcItem))}</td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => handleEditBulkPayroll(idx)}
                            className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] font-black text-indigo-600 uppercase tracking-widest transition-all"
                          >
                            Manual Adjust
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {apiError && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold">{apiError}</div>}

              <div className="flex justify-between gap-3 pt-4 border-t border-gray-50">
                 <button onClick={() => setModalStep('step2')} className="px-6 py-3.5 text-sm font-bold text-gray-400">Back</button>
                 <button 
                   onClick={handleFinalizeBulkPayroll}
                   disabled={isLoading}
                   className="px-10 py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-750 transition-all flex items-center gap-2 active:scale-95"
                 >
                   {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Finalize & Lock Payrolls'}
                 </button>
              </div>
            </div>
          )}

          {/* STEP 4: Manual Adjustment Override Screen */}
          {modalStep === 'step4' && (
            <div className="space-y-6 text-left">
              <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl text-xs font-bold text-amber-700">
                You are overriding calculations suggestion for {bulkCalculations[activeBulkIndex]?.employeeName}. Changes will be snapshotted but won't permanently modify salary structures.
              </div>

              <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[350px] p-2">
                <div className="bg-emerald-50/20 p-5 rounded-2xl border border-emerald-100/50 space-y-4">
                  <h4 className="text-xs font-black text-emerald-700 uppercase tracking-widest">Allowances / Earnings Override</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Basic Salary (₹)" value={formData.basicSalary} onChange={(e) => setFormData({...formData, basicSalary: e.target.value})} />
                    <Field label="HRA (₹)" value={formData.hra} onChange={(e) => setFormData({...formData, hra: e.target.value})} />
                    <Field label="Conveyance Allow." value={formData.conveyanceAllowance} onChange={(e) => setFormData({...formData, conveyanceAllowance: e.target.value})} />
                    <Field label="Medical Allow." value={formData.medicalAllowance} onChange={(e) => setFormData({...formData, medicalAllowance: e.target.value})} />
                    <Field label="Special Allow." value={formData.specialAllowance} onChange={(e) => setFormData({...formData, specialAllowance: e.target.value})} />
                    <Field label="Incentives (₹)" value={formData.incentives} onChange={(e) => setFormData({...formData, incentives: e.target.value})} />
                    <Field label="Overtime Paid (₹)" value={formData.overtime} onChange={(e) => setFormData({...formData, overtime: e.target.value})} />
                    <Field label="Other Earnings" value={formData.otherEarnings} onChange={(e) => setFormData({...formData, otherEarnings: e.target.value})} />
                    <Field label="Performance Bonus" value={formData.performanceBonus} onChange={(e) => setFormData({...formData, performanceBonus: e.target.value})} />
                  </div>
                </div>

                <div className="bg-rose-50/20 p-5 rounded-2xl border border-rose-100/50 space-y-4">
                  <h4 className="text-xs font-black text-rose-700 uppercase tracking-widest">Deductions Override</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Provident Fund (PF)" value={formData.providentFund} onChange={(e) => setFormData({...formData, providentFund: e.target.value})} />
                    <Field label="ESI Contribution" value={formData.esi} onChange={(e) => setFormData({...formData, esi: e.target.value})} />
                    <Field label="Professional Tax" value={formData.professionalTax} onChange={(e) => setFormData({...formData, professionalTax: e.target.value})} />
                    <Field label="TDS Deduction" value={formData.incomeTax} onChange={(e) => setFormData({...formData, incomeTax: e.target.value})} />
                    <Field label="Attendance LOP" value={formData.attendanceDeduction} onChange={(e) => setFormData({...formData, attendanceDeduction: e.target.value})} />
                    <Field label="Insurance Ded." value={formData.insurance} onChange={(e) => setFormData({...formData, insurance: e.target.value})} />
                    <Field label="Advance Ded." value={formData.advanceDeduction} onChange={(e) => setFormData({...formData, advanceDeduction: e.target.value})} />
                    <Field label="Loan Ded." value={formData.loanDeduction} onChange={(e) => setFormData({...formData, loanDeduction: e.target.value})} />
                    <Field label="Other Deductions" value={formData.otherDeductions} onChange={(e) => setFormData({...formData, otherDeductions: e.target.value})} />
                  </div>
                </div>

                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block ml-1">Admin Audit Remarks (Reason for manual override)<span className="text-rose-500 ml-0.5">*</span></label>
                  <textarea
                    value={formData.auditLog}
                    onChange={(e) => setFormData({...formData, auditLog: e.target.value})}
                    placeholder="Provide details about incentives, bonus adjustments, or overridden pro-ratings for history tracking..."
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 font-semibold text-sm outline-none resize-none"
                  />
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-3xl p-5 flex justify-between items-center">
                 <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Adjusted Net Pay</p>
                   <p className="text-2xl font-black">₹{fmt(calculateTotal())}</p>
                 </div>
                 <button 
                   onClick={handleSaveBulkOverride}
                   disabled={!formData.auditLog.trim()}
                   className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                 >
                   Save & Apply Override
                 </button>
              </div>
            </div>
          )}

          {/* CREATE SALARY BLUEPRINT TEMPLATE MODAL */}
          {modalType === 'createTemplate' && (
            <div className="space-y-6 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 block">Template Blueprint Name (e.g. Software Engineer L2)</label>
                <input 
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                  placeholder="Enter blueprint name"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 font-bold text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <SelectField label="Salary Type" value={templateForm.salaryType} onChange={(e) => setTemplateForm({...templateForm, salaryType: e.target.value})} options={['Monthly', 'Hourly', 'Daily']} />
                <SelectField label="Payment Mode" value={templateForm.paymentMode} onChange={(e) => setTemplateForm({...templateForm, paymentMode: e.target.value})} options={['Bank Transfer', 'Cash', 'Cheque']} />
                <SelectField label="Payroll Frequency" value={templateForm.payrollFrequency} onChange={(e) => setTemplateForm({...templateForm, payrollFrequency: e.target.value})} options={['Monthly', 'Bi-weekly', 'Weekly']} />
              </div>

              <div className="grid grid-cols-2 gap-4 max-h-[350px] overflow-y-auto p-2">
                <div className="bg-emerald-50/20 p-5 rounded-2xl border border-emerald-100/50 space-y-4">
                  <h4 className="text-xs font-black text-emerald-700 uppercase tracking-widest">1. Earnings blueprints</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Monthly Basic Salary" value={templateForm.basicSalary} onChange={(e) => setTemplateForm({...templateForm, basicSalary: e.target.value})} />
                    <Field label="HRA % of Basic" value={templateForm.hraPercent} onChange={(e) => setTemplateForm({...templateForm, hraPercent: e.target.value})} />
                    <Field label="DA % of Basic" value={templateForm.daPercent} onChange={(e) => setTemplateForm({...templateForm, daPercent: e.target.value})} />
                    <Field label="Conveyance Allowance" value={templateForm.conveyanceAllowance} onChange={(e) => setTemplateForm({...templateForm, conveyanceAllowance: e.target.value})} />
                    <Field label="Medical Allowance" value={templateForm.medicalAllowance} onChange={(e) => setTemplateForm({...templateForm, medicalAllowance: e.target.value})} />
                    <Field label="Special Allowance" value={templateForm.specialAllowance} onChange={(e) => setTemplateForm({...templateForm, specialAllowance: e.target.value})} />
                    <Field label="Other Allowances" value={templateForm.otherAllowances} onChange={(e) => setTemplateForm({...templateForm, otherAllowances: e.target.value})} />
                  </div>
                </div>

                <div className="bg-rose-50/20 p-5 rounded-2xl border border-rose-100/50 space-y-4">
                  <h4 className="text-xs font-black text-rose-700 uppercase tracking-widest">2. Deductions blueprints</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="PF % of Basic" value={templateForm.pfPercent} onChange={(e) => setTemplateForm({...templateForm, pfPercent: e.target.value})} />
                    <Field label="ESI % of Gross" value={templateForm.esiPercent} onChange={(e) => setTemplateForm({...templateForm, esiPercent: e.target.value})} />
                    <Field label="Professional Tax" value={templateForm.professionalTax} onChange={(e) => setTemplateForm({...templateForm, professionalTax: e.target.value})} />
                    <Field label="TDS % of Gross" value={templateForm.tdsPercent} onChange={(e) => setTemplateForm({...templateForm, tdsPercent: e.target.value})} />
                    <Field label="Insurance Deduction" value={templateForm.insurance} onChange={(e) => setTemplateForm({...templateForm, insurance: e.target.value})} />
                    <Field label="Advance Deduction" value={templateForm.advanceDeduction} onChange={(e) => setTemplateForm({...templateForm, advanceDeduction: e.target.value})} />
                    <Field label="Loan Deduction" value={templateForm.loanDeduction} onChange={(e) => setTemplateForm({...templateForm, loanDeduction: e.target.value})} />
                    <Field label="Other Deductions" value={templateForm.otherDeductions} onChange={(e) => setTemplateForm({...templateForm, otherDeductions: e.target.value})} />
                  </div>
                </div>
              </div>

              {apiError && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold">{apiError}</div>}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                 <button onClick={closeModal} className="px-6 py-3 bg-gray-150 text-gray-500 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95">Cancel</button>
                 <button 
                   onClick={handleProcessAction}
                   disabled={isLoading || !templateForm.name.trim()}
                   className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-indigo-755 transition-all active:scale-95"
                 >
                   Create blueprint
                 </button>
              </div>
            </div>
          )}

          {/* BULK ASSIGN TEMPLATE MODAL */}
          {modalType === 'assignTemplate' && (
            <div className="space-y-6 text-left">
              <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl text-xs font-semibold text-indigo-700">
                You are assigning blueprint salary template <strong className="text-indigo-850 font-black">"{selectedItem?.name}"</strong> in bulk. This generates new active salary structures with effective date for selected employees.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-550 uppercase tracking-widest block ml-1">Structure Effective Date</label>
                <input 
                  type="date"
                  value={structForm.effectiveDate}
                  onChange={(e) => setStructForm({...structForm, effectiveDate: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 font-bold text-sm outline-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-550 uppercase tracking-widest block ml-1">Select Employees to Assign</label>
                <div className="max-h-[220px] overflow-y-auto border border-slate-100 rounded-2xl p-4 space-y-2 bg-white shadow-inner">
                  {employeesList.map(emp => (
                    <div key={emp.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-indigo-50/20 transition-all">
                      <input 
                        type="checkbox"
                        checked={selectedBulkEmployees.includes(emp.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedBulkEmployees([...selectedBulkEmployees, emp.id]);
                          else setSelectedBulkEmployees(selectedBulkEmployees.filter(id => id !== emp.id));
                        }}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                      <div className="text-xs">
                        <p className="font-bold text-slate-800">{emp.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{emp.employeeCode || emp.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {apiError && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold">{apiError}</div>}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                 <button onClick={closeModal} className="px-6 py-3 bg-gray-150 text-gray-500 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95">Cancel</button>
                 <button 
                   onClick={handleProcessAction}
                   disabled={isLoading || selectedBulkEmployees.length === 0}
                   className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-indigo-755 transition-all active:scale-95 disabled:opacity-50"
                 >
                   Assign Template in Bulk
                 </button>
              </div>
            </div>
          )}

          {/* EDIT STANDARD PAYROLL RUN OVERLAY (accidental modification preventions) */}
          {modalType === 'edit' && (
            <div className="space-y-6 text-left">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <div>
                   <p className="font-bold text-slate-900">Editing Processed Payroll statement</p>
                   <p className="text-[10px] mt-0.5">Ensure manual adjustments and reasons are noted down in the audit trail.</p>
                </div>
                <span className="font-black bg-indigo-50 border border-indigo-200 text-indigo-600 px-3.5 py-1 rounded-full">{formData.month}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto p-1">
                <div className="bg-emerald-50/20 p-5 rounded-2xl border border-emerald-100/50 space-y-3">
                  <h4 className="text-xs font-black text-emerald-700 uppercase tracking-widest">Earnings Overrides</h4>
                  <Field label="Basic Monthly" value={formData.basicSalary} onChange={(e) => setFormData({...formData, basicSalary: e.target.value})} />
                  <Field label="HRA (₹)" value={formData.hra} onChange={(e) => setFormData({...formData, hra: e.target.value})} />
                  <Field label="Conveyance" value={formData.conveyanceAllowance} onChange={(e) => setFormData({...formData, conveyanceAllowance: e.target.value})} />
                  <Field label="Medical" value={formData.medicalAllowance} onChange={(e) => setFormData({...formData, medicalAllowance: e.target.value})} />
                  <Field label="Special Allowance" value={formData.specialAllowance} onChange={(e) => setFormData({...formData, specialAllowance: e.target.value})} />
                  <Field label="Incentives (₹)" value={formData.incentives} onChange={(e) => setFormData({...formData, incentives: e.target.value})} />
                  <Field label="Overtime Paid" value={formData.overtime} onChange={(e) => setFormData({...formData, overtime: e.target.value})} />
                  <Field label="Other Earnings" value={formData.otherEarnings} onChange={(e) => setFormData({...formData, otherEarnings: e.target.value})} />
                  <Field label="Performance Bonus" value={formData.performanceBonus} onChange={(e) => setFormData({...formData, performanceBonus: e.target.value})} />
                </div>

                <div className="bg-rose-50/20 p-5 rounded-2xl border border-rose-100/50 space-y-3">
                  <h4 className="text-xs font-black text-rose-700 uppercase tracking-widest">Deductions Overrides</h4>
                  <Field label="PF Employee" value={formData.providentFund} onChange={(e) => setFormData({...formData, providentFund: e.target.value})} />
                  <Field label="ESI Employee" value={formData.esi} onChange={(e) => setFormData({...formData, esi: e.target.value})} />
                  <Field label="Professional Tax" value={formData.professionalTax} onChange={(e) => setFormData({...formData, professionalTax: e.target.value})} />
                  <Field label="TDS Income Tax" value={formData.incomeTax} onChange={(e) => setFormData({...formData, incomeTax: e.target.value})} />
                  <Field label="Attendance LOP Deduction" value={formData.attendanceDeduction} onChange={(e) => setFormData({...formData, attendanceDeduction: e.target.value})} />
                  <Field label="Insurance Deduction" value={formData.insurance} onChange={(e) => setFormData({...formData, insurance: e.target.value})} />
                  <Field label="Advance Deduction" value={formData.advanceDeduction} onChange={(e) => setFormData({...formData, advanceDeduction: e.target.value})} />
                  <Field label="Loan Deduction" value={formData.loanDeduction} onChange={(e) => setFormData({...formData, loanDeduction: e.target.value})} />
                  <Field label="Other Deductions" value={formData.otherDeductions} onChange={(e) => setFormData({...formData, otherDeductions: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block ml-1">Manual Adjustments Reason (Required)<span className="text-rose-500 ml-0.5">*</span></label>
                <textarea
                  value={formData.auditLog}
                  onChange={(e) => setFormData({...formData, auditLog: e.target.value})}
                  placeholder="Provide audit remarks detailing reasons for manual salary adjustment..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 font-semibold text-sm outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4 bg-slate-900 text-white rounded-3xl p-5 text-xs font-semibold">
                <div><span className="opacity-70 uppercase text-[9px] block">Gross Payout</span><strong className="text-base text-emerald-450 block">₹{fmt(getGrossEarnings())}</strong></div>
                <div><span className="opacity-70 uppercase text-[9px] block">Total Deduct</span><strong className="text-base text-rose-400 block">₹{fmt(getTotalDeductions())}</strong></div>
                <div><span className="opacity-70 uppercase text-[9px] block">Disbursed Net Pay</span><strong className="text-base text-indigo-300 block">₹{fmt(calculateTotal())}</strong></div>
              </div>

              {apiError && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold">{apiError}</div>}

              <div className="flex justify-end gap-3 border-t border-gray-50 pt-4">
                 <button onClick={closeModal} className="px-6 py-3 bg-gray-150 text-gray-500 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95">Cancel</button>
                 <button 
                   onClick={handleProcessAction}
                   disabled={isLoading || !formData.auditLog.trim()}
                   className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-indigo-755 transition-all active:scale-95 disabled:opacity-50"
                 >
                   {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Save Modifications'}
                 </button>
              </div>
            </div>
          )}

          {/* MAKE PAYMENTS / DISBURSE MODALS */}
          {modalType === 'payment' && (
            <div className="space-y-6 text-left font-sans">
              <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs font-semibold text-indigo-700 flex flex-col gap-2">
                <div className="flex justify-between"><span>Disbursing Staff:</span><strong className="text-slate-800">{selectedItem?.name} ({selectedItem?.empId})</strong></div>
                <div className="flex justify-between"><span>Salary Month Period:</span><strong className="text-slate-850">{selectedItem?.month}</strong></div>
                <div className="flex justify-between border-t border-indigo-200 pt-2 text-sm font-black text-indigo-650"><span>Payable Net Payout:</span><span>{selectedItem?.total}</span></div>
              </div>

              <div className="space-y-4">
                <SelectField label="Payment Dispatch Mode" value={paymentData.method} onChange={(e) => setPaymentData({...paymentData, method: e.target.value})} options={['Bank Transfer', 'UPI', 'Cheque', 'Cash']} />
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-450 uppercase tracking-widest block ml-1">Bank Transaction Reference / Cheque ID</label>
                  <input
                    type="text"
                    value={paymentData.transactionId}
                    onChange={(e) => setPaymentData({...paymentData, transactionId: e.target.value})}
                    placeholder="Ex: Ref UTR98290382903"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 font-semibold text-sm outline-none"
                  />
                </div>
              </div>

              {apiError && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold">{apiError}</div>}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                 <button onClick={closeModal} className="px-6 py-3 bg-gray-150 text-gray-500 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95">Cancel</button>
                 <button 
                   onClick={handleProcessAction}
                   disabled={isLoading}
                   className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-indigo-755 transition-all active:scale-95"
                 >
                   {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Record Disbursement'}
                 </button>
              </div>
            </div>
          )}

          {/* EXPORTS REGISTER SHEET MODAL */}
          {modalType === 'export' && (
            <div className="space-y-6 text-left">
              <div className="space-y-4">
                <SelectField label="Salary Run Month" value={exportData.month} onChange={(e) => setExportData({...exportData, month: e.target.value})} options={MONTH_OPTIONS} />
                <SelectField label="Register File Format" value={exportData.format} onChange={(e) => setExportData({...exportData, format: e.target.value})} options={['CSV Register (.csv)', 'Excel Worksheet (.xlsx)']} />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                 <button onClick={closeModal} className="px-6 py-3 bg-gray-150 text-gray-500 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95">Cancel</button>
                 <button 
                   onClick={handleExportSubmit}
                   className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-indigo-755 transition-all active:scale-95"
                 >
                   Export Salary Register
                 </button>
              </div>
            </div>
          )}

          {/* TIMELINE TIMELINE & STRUCTURE TIMELINE MODAL */}
          {modalType === 'structure' && modalStep === 'history' && (
            <div className="space-y-6 text-left">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-base font-bold text-slate-800 flex items-center gap-2"><History size={18} className="text-indigo-600" /> Structure Revision Timeline</h3>
                 <button 
                   onClick={() => setModalStep('editStructure')}
                   className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-sm"
                 >
                    <Plus size={14} /> Increment / Revise Salary
                 </button>
              </div>

              {structureHistory.length > 0 ? (
                <div className="border-l-2 border-indigo-100 ml-4 pl-6 space-y-6 py-2">
                  {structureHistory.map((s, idx) => {
                    const gross = s.basicSalary + s.hra + s.da + s.conveyanceAllowance + s.medicalAllowance + s.specialAllowance + s.otherAllowances + s.performanceBonus + (s.incentives || 0) + (s.overtime || 0) + (s.otherEarnings || 0);
                    const deduct = s.providentFund + s.esi + s.professionalTax + s.tds + (s.insurance || 0) + (s.advanceDeduction || 0) + (s.loanDeduction || 0) + s.otherDeductions;
                    return (
                      <div key={s.id || idx} className="relative">
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-indigo-650 border-4 border-white shadow-sm" />
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-extrabold text-slate-900">₹{fmt(s.basicSalary)} Basic / Month</span>
                            {idx === 0 && <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-wider">Active</span>}
                            <span className="text-xs text-gray-400 font-semibold">{s.effectiveDate}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-4 mt-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-semibold text-slate-500 font-sans">
                            <div><p className="text-[9px] text-gray-400 uppercase tracking-widest">Gross</p><p className="font-extrabold text-slate-800 mt-0.5">₹{fmt(gross)}</p></div>
                            <div><p className="text-[9px] text-gray-400 uppercase tracking-widest">PF</p><p className="font-bold text-slate-700 mt-0.5">₹{fmt(s.providentFund)}</p></div>
                            <div><p className="text-[9px] text-gray-400 uppercase tracking-widest">Net Payable</p><p className="font-bold text-emerald-600 mt-0.5">₹{fmt(gross - deduct)}</p></div>
                            <div><p className="text-[9px] text-gray-400 uppercase tracking-widest">CTC</p><p className="font-bold text-slate-700 mt-0.5">₹{fmt(s.monthlyCtc)}</p></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                   <TrendingUp size={36} className="mx-auto text-slate-300 mb-2" />
                   <p className="text-sm font-bold text-slate-500">No structures defined yet.</p>
                </div>
              )}

              <div className="flex justify-end pt-4">
                 <button onClick={closeModal} className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all">Close</button>
              </div>
            </div>
          )}

          {/* INDIVIDUAL STRUCTURE REVISE FORM SCREEN */}
          {modalType === 'structure' && modalStep === 'editStructure' && (
            <div className="space-y-6 text-left font-sans">
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-xs font-semibold text-indigo-700">
                Revise compensation structure or record annual increments. Setting new parameters will generate a new timeline structure snapshot.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Effective Revision Date" type="date" value={structForm.effectiveDate} onChange={(e) => setStructForm({...structForm, effectiveDate: e.target.value})} />
                <SelectField label="Salary Type" value={structForm.salaryType} onChange={(e) => setStructForm({...structForm, salaryType: e.target.value})} options={['Monthly', 'Hourly', 'Daily']} />
              </div>

              <div className="grid grid-cols-2 gap-4 max-h-[250px] overflow-y-auto p-1">
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1.5">Earnings Base Rates</h4>
                  <Field label="Monthly Basic Salary" value={structForm.basicSalary} onChange={(e) => setStructForm({...structForm, basicSalary: e.target.value})} />
                  <Field label="HRA % of Basic" value={structForm.hraPercent} onChange={(e) => setStructForm({...structForm, hraPercent: e.target.value})} />
                  <Field label="DA % of Basic" value={structForm.daPercent} onChange={(e) => setStructForm({...structForm, daPercent: e.target.value})} />
                  <Field label="Conveyance Allowance" value={structForm.conveyanceAllowance} onChange={(e) => setStructForm({...structForm, conveyanceAllowance: e.target.value})} />
                  <Field label="Medical Allowance" value={structForm.medicalAllowance} onChange={(e) => setStructForm({...structForm, medicalAllowance: e.target.value})} />
                  <Field label="Special Allowance" value={structForm.specialAllowance} onChange={(e) => setStructForm({...structForm, specialAllowance: e.target.value})} />
                  <Field label="Other Allowances" value={structForm.otherAllowances} onChange={(e) => setStructForm({...structForm, otherAllowances: e.target.value})} />
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1.5">Deductions Base Rates</h4>
                  <Field label="PF % of Basic" value={structForm.pfPercent} onChange={(e) => setStructForm({...structForm, pfPercent: e.target.value})} />
                  <Field label="ESI % of Gross" value={structForm.esiPercent} onChange={(e) => setStructForm({...structForm, esiPercent: e.target.value})} />
                  <Field label="TDS % of Gross" value={structForm.tdsPercent} onChange={(e) => setStructForm({...structForm, tdsPercent: e.target.value})} />
                  <Field label="Professional Tax" value={structForm.professionalTax} onChange={(e) => setStructForm({...structForm, professionalTax: e.target.value})} />
                  <Field label="Insurance Deduction" value={structForm.insurance} onChange={(e) => setStructForm({...structForm, insurance: e.target.value})} />
                  <Field label="Advance Deduction" value={structForm.advanceDeduction} onChange={(e) => setStructForm({...structForm, advanceDeduction: e.target.value})} />
                  <Field label="Loan Deduction" value={structForm.loanDeduction} onChange={(e) => setStructForm({...structForm, loanDeduction: e.target.value})} />
                  <Field label="Other Deductions" value={structForm.otherDeductions} onChange={(e) => setStructForm({...structForm, otherDeductions: e.target.value})} />
                </div>
              </div>

              {apiError && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold">{apiError}</div>}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                 <button onClick={() => setModalStep('history')} className="px-6 py-3 bg-gray-150 text-gray-500 rounded-xl text-xs font-bold shadow-sm transition-all">Back</button>
                 <button 
                   onClick={handleProcessAction}
                   disabled={isLoading}
                   className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-indigo-755 transition-all active:scale-95"
                 >
                   {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Save Revision Structure'}
                 </button>
              </div>
            </div>
          )}

          {/* APPROVE PENDING REQUESTS ACCESS MODAL */}
          {modalType === 'approve' && (
            <div className="space-y-6 text-left font-sans">
              <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl text-xs font-semibold text-emerald-800 flex flex-col gap-2">
                 <div className="flex justify-between"><span>Employee Name:</span><strong className="text-slate-800">{selectedItem?.name} ({selectedItem?.empId})</strong></div>
                 <div className="flex justify-between"><span>Period Month:</span><strong className="text-slate-850">{selectedItem?.month}</strong></div>
                 <div className="flex justify-between border-t border-emerald-200 pt-2 text-xs font-bold"><span>Employee's Reason:</span><span className="text-emerald-900">"{selectedItem?.reason}"</span></div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                 <button onClick={closeModal} className="px-6 py-3 bg-gray-150 text-gray-500 rounded-xl text-xs font-bold shadow-sm transition-all">Cancel</button>
                 <button onClick={handleProcessAction} className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition-all active:scale-95">Approve Request</button>
              </div>
            </div>
          )}

          {/* DOWNLOAD AND VIEW DETAILED COMPLIANT PAYSLIPS */}
          {modalType === 'download' && (
            <div className="space-y-6 font-sans">
              <div id="printable-payslip" className="bg-gray-50 rounded-3xl p-6 md:p-10 border border-slate-200 text-left">
                <PayslipTemplate 
                  data={{
                    orgName: orgDetails?.organisation_name || 'AttendanceKart Solutions Private Limited',
                    orgAddress: orgDetails?.organisation_address || '461 Sai Sobagu, 1st Floor Outer Ring Road Teachers Colony, Sector 6 HSR Layout Bangalore Karnataka 560034 India',
                    employeeName: selectedItem?.name,
                    employeeId: selectedItem?.employeeId || selectedItem?.empId,
                    designation: selectedItem?.designation || ' WordPress Developer Intern',
                    department: selectedItem?.department || '',
                    phoneNumber: selectedItem?.phoneNumber || '',
                    doj: selectedItem?.doj ? new Date(selectedItem.doj).toLocaleDateString('en-IN') : '27/01/2025',
                    month: selectedItem?.month?.split(' ')[0] || '',
                    year: selectedItem?.month?.split(' ')[1] || '',
                    payDate: selectedItem?.paymentDate ? new Date(selectedItem.paymentDate).toLocaleDateString('en-IN') : 'Not paid',
                    earnings: [
                      { name: 'Basic Salary', amount: selectedItem?.basicSalary },
                      { name: 'House Rent Allowance (HRA)', amount: selectedItem?.hra },
                      { name: 'Conveyance Allowance', amount: selectedItem?.conveyanceAllowance },
                      { name: 'Medical Allowance', amount: selectedItem?.medicalAllowance },
                      { name: 'Special Allowance', amount: selectedItem?.specialAllowance },
                      { name: 'Other Allowances', amount: selectedItem?.otherAllowances },
                      { name: 'Performance Bonus', amount: selectedItem?.performanceBonus },
                      { name: 'Incentives', amount: selectedItem?.incentives },
                      { name: 'Overtime Paid', amount: selectedItem?.overtime },
                      { name: 'Other Earnings', amount: selectedItem?.otherEarnings }
                    ].filter(e => (parseFloat(e.amount) || 0) > 0),
                    deductions: [
                      { name: 'Provident Fund (PF)', amount: selectedItem?.providentFund },
                      { name: 'Professional Tax (PT)', amount: selectedItem?.professionalTax },
                      { name: 'Income Tax (TDS)', amount: selectedItem?.incomeTax },
                      { name: 'ESI Contribution', amount: selectedItem?.esi },
                      { name: 'Insurance Deduction', amount: selectedItem?.insurance },
                      { name: 'Advance Deduction', amount: selectedItem?.advanceDeduction },
                      { name: 'Loan Deduction', amount: selectedItem?.loanDeduction },
                      { name: 'Other Deductions', amount: selectedItem?.otherDeductions },
                      { name: 'Attendance LOP Deduction', amount: selectedItem?.attendanceDeduction }
                    ].filter(d => (parseFloat(d.amount) || 0) > 0),
                    totalEarnings: selectedItem?.totalEarnings,
                    totalDeductions: selectedItem?.totalDeductions,
                    netSalary: selectedItem?.netSalary,
                    totalDays: selectedItem?.totalDays || 30,
                    presentDays: selectedItem?.presentDays || 30,
                    paidDays: selectedItem?.paidDays || 30,
                    lopDays: selectedItem?.lopDays || 0,
                    weekOffs: selectedItem?.weekOffs || 4,
                    holidays: selectedItem?.holidays || 1,
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
                 <button onClick={handlePrint} className="flex items-center gap-2 px-8 py-3.5 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"><Printer size={20} /> Print / Export PDF</button>
                 <button onClick={closeModal} className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl transition-all">Close</button>
              </div>
            </div>
          )}

          {/* SUCCESS MODALS */}
          {modalStep === 'success' && (
            <div className="text-center py-10 space-y-6">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner relative">
                 <Check size={40} strokeWidth={4} />
              </div>
              <div className="space-y-2">
                 <h3 className="text-2xl font-bold text-gray-900">Success!</h3>
                 <p className="text-sm font-semibold text-gray-500">The payroll operation was finalized and recorded safely.</p>
              </div>
              <div className="pt-4 px-10">
                 <button onClick={closeModal} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-md">Return to Dashboard</button>
              </div>
            </div>
          )}

        </div>
      </Modal>

    </div>
  );
};

// Internal custom field component
const Field = ({ label, type = 'number', value, onChange, prefix, note, readOnly }) => (
  <div className="space-y-1 text-left font-sans">
    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">{label}</label>
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`w-full ${prefix ? 'pl-7' : 'pl-3'} pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none transition-all focus:border-indigo-400`}
      />
    </div>
    {note && <p className="text-[9px] text-gray-400 ml-1">{note}</p>}
  </div>
);

// Internal select component
const SelectField = ({ label, value, onChange, options }) => (
  <div className="space-y-1 text-left font-sans">
    <label className="block text-[10px] font-bold text-gray-550 uppercase tracking-wider ml-1">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none cursor-pointer appearance-none"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
    </div>
  </div>
);

export default Payroll;
