import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, Users, Calculator, CheckCircle2,
  Loader2, Search, Check, X, AlertCircle, Plus, Minus
} from 'lucide-react';

const MONTH_OPTIONS = (() => {
  const months = [];
  const names = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${names[d.getMonth()]} ${d.getFullYear()}`);
  }
  return months;
})();

const fmt = (v) => Number(v || 0).toLocaleString('en-IN');

export default function PayrollCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=month, 2=employees, 3=calculate, 4=review, 5=success
  const [selectedMonth, setSelectedMonth] = useState(MONTH_OPTIONS[0]);
  const [employees, setEmployees] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [calculations, setCalculations] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    const fetchEmployees = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/payroll/employees', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
        setSelectedIds(data.map(e => e.id));
      }
    };
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(e =>
    !search || e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.employeeCode?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleEmployee = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    const results = [];
    for (let i = 0; i < selectedIds.length; i++) {
      const id = selectedIds[i];
      setProgress(`Calculating ${i + 1}/${selectedIds.length}...`);
      try {
        const res = await fetch(`/api/payroll/calculate?userId=${id}&month=${encodeURIComponent(selectedMonth)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const emp = employees.find(e => e.id === id);
          results.push({ userId: id, name: emp?.name, employeeCode: emp?.employeeCode, ...data, status: 'PENDING' });
        }
      } catch (e) { console.error(e); }
    }
    setCalculations(results);
    setActiveIdx(0);
    setLoading(false);
    setProgress('');
    setStep(4);
  };

  const updateCalc = (idx, field, value) => {
    setCalculations(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleSaveAll = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    let saved = 0;
    for (const calc of calculations) {
      try {
        const payload = {
          userId: calc.userId,
          month: selectedMonth,
          basicSalary: calc.basicSalary || 0,
          hra: calc.hra || 0,
          conveyanceAllowance: calc.conveyanceAllowance || 0,
          medicalAllowance: calc.medicalAllowance || 0,
          specialAllowance: calc.specialAllowance || 0,
          otherAllowances: calc.otherAllowances || 0,
          performanceBonus: calc.performanceBonus || 0,
          incentives: calc.incentives || 0,
          overtime: calc.overtime || 0,
          otherEarnings: calc.otherEarnings || 0,
          providentFund: calc.providentFund || 0,
          professionalTax: calc.professionalTax || 0,
          incomeTax: calc.incomeTax || 0,
          esi: calc.esi || 0,
          insurance: calc.insurance || 0,
          advanceDeduction: calc.advanceDeduction || 0,
          loanDeduction: calc.loanDeduction || 0,
          otherDeductions: calc.otherDeductions || 0,
          attendanceDeduction: calc.attendanceDeduction || 0,
          lateComingPenalty: calc.lateComingPenalty || 0,
          earlyCheckoutPenalty: calc.earlyCheckoutPenalty || 0,
          missingPunchPenalty: calc.missingPunchPenalty || 0,
          totalDays: calc.totalDays || 30,
          presentDays: calc.presentDays || 0,
          absentDays: calc.absentDays || 0,
          leaveDays: calc.leaveDays || 0,
          weekOffs: calc.weekOffs || 0,
          holidays: calc.holidays || 0,
          lopDays: calc.lopDays || 0,
          paidDays: calc.paidDays || 0,
          status: calc.status || 'PENDING',
        };
        await fetch('/api/payroll', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        saved++;
      } catch (e) { console.error(e); }
    }
    setSavedCount(saved);
    setLoading(false);
    setStep(5);
  };

  const activeCalc = calculations[activeIdx] || {};

  const EarningsRow = ({ label, field, idx }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-50">
      <span className="text-sm text-gray-600">{label}</span>
      <input
        type="number"
        value={calculations[idx]?.[field] || 0}
        onChange={e => updateCalc(idx, field, parseFloat(e.target.value) || 0)}
        className="w-32 text-right px-3 py-1 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0061E0]/20"
      />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/payroll')} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Run Payroll</h1>
          <p className="text-sm text-gray-500">Generate salaries for selected employees</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {['Select Month', 'Choose Employees', 'Calculate', 'Review & Edit', 'Done'].map((label, i) => {
          const s = i + 1;
          const active = step === s;
          const done = step > s;
          return (
            <React.Fragment key={label}>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${active ? 'bg-[#0061E0] text-white' : done ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                {done ? <CheckCircle2 size={14} /> : <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[10px]">{s}</span>}
                <span className="hidden sm:block">{label}</span>
              </div>
              {i < 4 && <ChevronRight size={14} className="text-gray-300" />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step 1 – Select Month */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Select Payroll Month</h2>
          <p className="text-sm text-gray-500 mb-6">Choose the month for which you want to generate payroll.</p>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base font-semibold text-gray-800 focus:outline-none focus:border-[#0061E0]"
          >
            {MONTH_OPTIONS.map(m => <option key={m}>{m}</option>)}
          </select>
          <button
            onClick={() => setStep(2)}
            className="mt-6 w-full py-3 bg-[#0061E0] text-white rounded-xl font-bold text-sm hover:bg-[#0052cc] transition-all"
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step 2 – Select Employees */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">Select Employees</h2>
              <p className="text-xs text-gray-400">{selectedIds.length} of {employees.length} selected</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedIds(employees.map(e => e.id))} className="px-3 py-1.5 text-xs font-semibold text-[#0061E0] border border-[#0061E0]/30 rounded-lg hover:bg-blue-50">Select All</button>
              <button onClick={() => setSelectedIds([])} className="px-3 py-1.5 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">Clear</button>
            </div>
          </div>
          <div className="p-4">
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0061E0]/20" />
            </div>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {filteredEmployees.map(emp => (
                <div key={emp.id} onClick={() => toggleEmployee(emp.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${selectedIds.includes(emp.id) ? 'bg-blue-50 border-[#0061E0]/30' : 'border-gray-100 hover:bg-gray-50'}`}>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedIds.includes(emp.id) ? 'bg-[#0061E0] border-[#0061E0]' : 'border-gray-300'}`}>
                    {selectedIds.includes(emp.id) && <Check size={12} className="text-white" />}
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                    {emp.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{emp.name}</p>
                    <p className="text-xs text-gray-400">{emp.employeeCode} · {emp.designation || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-5 border-t border-gray-50 flex justify-between">
            <button onClick={() => setStep(1)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">← Back</button>
            <button
              onClick={() => { setStep(3); handleCalculate(); }}
              disabled={selectedIds.length === 0}
              className="px-6 py-2.5 bg-[#0061E0] text-white rounded-xl font-bold text-sm hover:bg-[#0052cc] disabled:opacity-50 transition-all"
            >
              Calculate Salaries →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 – Calculating */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center text-center">
          <Loader2 size={48} className="animate-spin text-[#0061E0] mb-4" />
          <h2 className="text-lg font-bold text-gray-900">Calculating Salaries</h2>
          <p className="text-sm text-gray-500 mt-2">{progress || 'Processing attendance, leaves, and deductions...'}</p>
        </div>
      )}

      {/* Step 4 – Review & Edit */}
      {step === 4 && calculations.length > 0 && (
        <div className="space-y-4">
          {error && <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm"><AlertCircle size={16} />{error}</div>}

          {/* Employee selector tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {calculations.map((c, i) => (
              <button key={c.userId} onClick={() => setActiveIdx(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeIdx === i ? 'bg-[#0061E0] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#0061E0]'}`}>
                {c.name}
              </button>
            ))}
          </div>

          {/* Active employee payroll form */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Attendance Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Attendance Summary</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  ['Total Days', activeCalc.totalDays],
                  ['Present', activeCalc.presentDays],
                  ['Absent', activeCalc.absentDays],
                  ['Leave', activeCalc.leaveDays],
                  ['LOP Days', activeCalc.lopDays],
                  ['Paid Days', activeCalc.paidDays],
                  ['Half Days', activeCalc.halfDays],
                  ['Week Offs', activeCalc.weekOffs],
                  ['Holidays', activeCalc.holidays],
                ].map(([label, val]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-gray-900">{val ?? 0}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>

              <h3 className="font-bold text-gray-900 mt-6 mb-4">Payroll Status</h3>
              <div className="space-y-2">
                {['PENDING', 'DRAFT', 'PAID'].map(s => (
                  <label key={s} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${calculations[activeIdx]?.status === s ? 'border-[#0061E0] bg-blue-50' : 'border-gray-100'}`}>
                    <input type="radio" name="status" value={s} checked={calculations[activeIdx]?.status === s} onChange={() => updateCalc(activeIdx, 'status', s)} className="accent-[#0061E0]" />
                    <span className="text-sm font-semibold text-gray-700">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Earnings & Deductions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-emerald-700">Earnings</h3>
                {[
                  ['Basic Salary', 'basicSalary'], ['HRA', 'hra'], ['DA', 'da'],
                  ['Conveyance', 'conveyanceAllowance'], ['Medical', 'medicalAllowance'],
                  ['Special Allowance', 'specialAllowance'], ['Other Allowances', 'otherAllowances'],
                  ['Performance Bonus', 'performanceBonus'], ['Incentives', 'incentives'],
                  ['Overtime', 'overtime'], ['Other Earnings', 'otherEarnings'],
                ].map(([label, field]) => <EarningsRow key={field} label={label} field={field} idx={activeIdx} />)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mt-4 mb-3 text-rose-600">Deductions</h3>
                {[
                  ['Provident Fund', 'providentFund'], ['ESI', 'esi'], ['Professional Tax', 'professionalTax'],
                  ['Income Tax (TDS)', 'incomeTax'], ['Insurance', 'insurance'],
                  ['Advance Deduction', 'advanceDeduction'], ['Loan Deduction', 'loanDeduction'],
                  ['Other Deductions', 'otherDeductions'], ['Attendance Deduction (LOP)', 'attendanceDeduction'],
                ].map(([label, field]) => <EarningsRow key={field} label={label} field={field} idx={activeIdx} />)}
              </div>
            </div>
          </div>

          {/* Net Salary Summary */}
          <div className="bg-gradient-to-r from-[#0061E0] to-indigo-600 rounded-2xl p-6 text-white flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white/70">Net Salary for {activeCalc.name}</p>
              <p className="text-3xl font-bold mt-1">₹{fmt(
                ((activeCalc.basicSalary||0)+(activeCalc.hra||0)+(activeCalc.da||0)+(activeCalc.conveyanceAllowance||0)+(activeCalc.medicalAllowance||0)+(activeCalc.specialAllowance||0)+(activeCalc.otherAllowances||0)+(activeCalc.performanceBonus||0)+(activeCalc.incentives||0)+(activeCalc.overtime||0)+(activeCalc.otherEarnings||0)) -
                ((activeCalc.providentFund||0)+(activeCalc.esi||0)+(activeCalc.professionalTax||0)+(activeCalc.incomeTax||0)+(activeCalc.insurance||0)+(activeCalc.advanceDeduction||0)+(activeCalc.loanDeduction||0)+(activeCalc.otherDeductions||0)+(activeCalc.attendanceDeduction||0))
              )}</p>
            </div>
            <div className="text-right text-sm text-white/70">
              <p>Month: <span className="text-white font-bold">{selectedMonth}</span></p>
              <p>Employees: <span className="text-white font-bold">{calculations.length}</span></p>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50">← Back</button>
            <button
              onClick={handleSaveAll}
              disabled={loading}
              className="px-8 py-3 bg-[#0061E0] text-white rounded-xl font-bold hover:bg-[#0052cc] disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
              Save {calculations.length} Payrolls
            </button>
          </div>
        </div>
      )}

      {/* Step 5 – Success */}
      {step === 5 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Payroll Saved!</h2>
          <p className="text-gray-500 mt-2">{savedCount} payroll records saved for {selectedMonth}.</p>
          <div className="flex gap-3 mt-8">
            <button onClick={() => navigate('/admin/payroll')} className="px-6 py-3 bg-[#0061E0] text-white rounded-xl font-bold hover:bg-[#0052cc]">
              View Payrolls
            </button>
            <button onClick={() => { setStep(1); setCalculations([]); setSelectedIds(employees.map(e => e.id)); }}
              className="px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50">
              Run Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
