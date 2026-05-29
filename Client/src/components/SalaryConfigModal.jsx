import React from 'react';
import { X, DollarSign, Building2, CreditCard, CheckCircle2, History, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fmt = (v) => Number(v || 0).toLocaleString('en-IN');

const Field = ({ label, type = 'number', value, onChange, prefix, note, readOnly }) => (
  <div>
    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`w-full ${prefix ? 'pl-7' : 'pl-3'} pr-3 py-2.5 bg-white border rounded-xl text-sm font-semibold text-gray-800 outline-none transition-all ${readOnly ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100' : 'border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50'}`}
      />
    </div>
    {note && <p className="text-[10px] text-gray-400 mt-1 ml-1">{note}</p>}
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="w-full pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 appearance-none cursor-pointer"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const SalaryConfigModal = ({ employee, onClose, onSaved }) => {
  const [tab, setTab] = React.useState('configure');
  const [history, setHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  const [form, setForm] = React.useState({
    effectiveDate: new Date().toISOString().split('T')[0],
    basicSalary: String(employee.basicSalary || 30000),
    hraPercent: '40', daPercent: '0',
    pfPercent: '12', esiPercent: '0.75', tdsPercent: '0',
    conveyanceAllowance: '1600', medicalAllowance: '1250',
    specialAllowance: '5000', otherAllowances: '2000', performanceBonus: '0',
    incentives: '0', overtime: '0', otherEarnings: '0',
    professionalTax: '200', insurance: '0', advanceDeduction: '0', loanDeduction: '0', otherDeductions: '0',
    uanNumber: employee.uanNumber || '', pfNumber: employee.pfNumber || '',
    esiNumber: employee.esiNumber || '', bankName: employee.bankName || '',
    ifscCode: employee.ifscCode || '', accountNumber: employee.accountNumber || '',
    salaryType: 'Monthly', paymentMode: 'Bank Transfer', payrollFrequency: 'Monthly'
  });

  const f = (k) => parseFloat(form[k]) || 0;

  const calc = React.useMemo(() => {
    const basic = f('basicSalary');
    const hra = Math.round(basic * (f('hraPercent') / 100));
    const da = Math.round(basic * (f('daPercent') / 100));
    const gross = basic + hra + da + f('conveyanceAllowance') + f('medicalAllowance') + f('specialAllowance') + f('otherAllowances') + f('performanceBonus') + f('incentives') + f('overtime') + f('otherEarnings');
    const pf = Math.round(basic * (f('pfPercent') / 100));
    const esi = Math.round(gross * (f('esiPercent') / 100));
    const tds = Math.round(gross * (f('tdsPercent') / 100));
    const totalDed = pf + esi + f('professionalTax') + tds + f('insurance') + f('advanceDeduction') + f('loanDeduction') + f('otherDeductions');
    const net = gross - totalDed;
    const empPf = Math.round(basic * 0.12);
    const empEsi = Math.round(gross * 0.0325);
    return { hra, da, gross, pf, esi, tds, totalDed, net, ctc: gross + empPf + empEsi };
  }, [form]);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  React.useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/payroll/salary-structure/${employee.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
          if (data.length > 0) {
            const l = data[0];
            setForm(p => ({
              ...p,
              basicSalary: String(l.basicSalary || 30000),
              hraPercent: String(l.hraPercent || 40), daPercent: String(l.daPercent || 0),
              pfPercent: String(l.pfPercent || 12), esiPercent: String(l.esiPercent || 0.75),
              tdsPercent: String(l.tdsPercent || 0),
              conveyanceAllowance: String(l.conveyanceAllowance || 1600),
              medicalAllowance: String(l.medicalAllowance || 1250),
              specialAllowance: String(l.specialAllowance || 5000),
              otherAllowances: String(l.otherAllowances || 2000),
              performanceBonus: String(l.performanceBonus || 0),
              incentives: String(l.incentives || 0),
              overtime: String(l.overtime || 0),
              otherEarnings: String(l.otherEarnings || 0),
              professionalTax: String(l.professionalTax || 200),
              insurance: String(l.insurance || 0),
              advanceDeduction: String(l.advanceDeduction || 0),
              loanDeduction: String(l.loanDeduction || 0),
              otherDeductions: String(l.otherDeductions || 0),
              uanNumber: l.uanNumber || employee.uanNumber || '',
              pfNumber: l.pfNumber || employee.pfNumber || '',
              esiNumber: l.esiNumber || employee.esiNumber || '',
              bankName: l.bankName || employee.bankName || '',
              ifscCode: l.ifscCode || employee.ifscCode || '',
              accountNumber: l.accountNumber || employee.accountNumber || '',
              salaryType: l.salaryType || 'Monthly',
              paymentMode: l.paymentMode || 'Bank Transfer',
              payrollFrequency: l.payrollFrequency || 'Monthly'
            }));
          }
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchHistory();
  }, [employee.id]);

  const handleSave = async () => {
    if (!form.basicSalary || parseFloat(form.basicSalary) <= 0) { setError('Basic salary is required.'); return; }
    setError(''); setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        userId: employee.id, effectiveDate: form.effectiveDate, structureType: form.salaryType, calculationMode: 'PERCENTAGE_BASED',
        basicSalary: f('basicSalary'), hraPercent: f('hraPercent'), daPercent: f('daPercent'),
        pfPercent: f('pfPercent'), esiPercent: f('esiPercent'), tdsPercent: f('tdsPercent'),
        hra: calc.hra, da: calc.da,
        conveyanceAllowance: f('conveyanceAllowance'), medicalAllowance: f('medicalAllowance'),
        specialAllowance: f('specialAllowance'), otherAllowances: f('otherAllowances'), performanceBonus: f('performanceBonus'),
        incentives: f('incentives'), overtime: f('overtime'), otherEarnings: f('otherEarnings'),
        providentFund: calc.pf, esi: calc.esi, professionalTax: f('professionalTax'), tds: calc.tds,
        insurance: f('insurance'), advanceDeduction: f('advanceDeduction'), loanDeduction: f('loanDeduction'), otherDeductions: f('otherDeductions'),
        uanNumber: form.uanNumber, pfNumber: form.pfNumber, esiNumber: form.esiNumber,
        bankName: form.bankName, ifscCode: form.ifscCode, accountNumber: form.accountNumber,
        salaryType: form.salaryType, paymentMode: form.paymentMode, payrollFrequency: form.payrollFrequency, active: true
      };
      const res = await fetch('/api/payroll/salary-structure', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) { setSuccess(true); if (onSaved) onSaved(); setTimeout(() => { setSuccess(false); setTab('history'); }, 2000); }
      else { const e = await res.json().catch(() => ({})); setError(e.error || 'Failed to save.'); }
    } catch (e) { setError('Network error.'); } finally { setSaving(false); }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[95] flex items-start justify-center bg-slate-900/50 backdrop-blur-sm p-4 pt-8 overflow-y-auto" onClick={e => e.target === e.currentTarget && onClose()}>
        <motion.div initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 16 }}
          className="bg-white rounded-[28px] shadow-2xl w-full max-w-5xl overflow-hidden">

          {/* Header */}
          <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200">
                {employee.name?.charAt(0) || 'E'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Salary Configuration</h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">{employee.name} · {employee.empId || employee.id} · {employee.role || employee.designation || 'Employee'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-xl p-1 text-xs font-bold">
                <button onClick={() => setTab('configure')} className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${tab === 'configure' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Settings size={14} /> Configure
                </button>
                <button onClick={() => setTab('history')} className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${tab === 'history' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  <History size={14} /> History {history.length > 0 && <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full text-[9px]">{history.length}</span>}
                </button>
              </div>
              <button onClick={onClose} className="p-2.5 bg-gray-100 rounded-xl text-gray-500 hover:bg-gray-200 transition-all"><X size={18} /></button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>
          ) : tab === 'history' ? (
            /* ── History Tab ── */
            <div className="p-7">
              {history.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <DollarSign size={40} className="mx-auto mb-3 text-gray-200" />
                  <p className="font-semibold text-gray-500">No salary structures configured yet.</p>
                  <button onClick={() => setTab('configure')} className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700">Configure Now</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((h, idx) => {
                    const g = h.basicSalary + h.hra + h.da + h.conveyanceAllowance + h.medicalAllowance + h.specialAllowance + h.otherAllowances + h.performanceBonus + (h.incentives || 0) + (h.overtime || 0) + (h.otherEarnings || 0);
                    const d = h.providentFund + h.esi + h.professionalTax + h.tds + (h.insurance || 0) + (h.advanceDeduction || 0) + (h.loanDeduction || 0) + h.otherDeductions;
                    return (
                      <div key={h.id || idx} className={`border rounded-2xl p-5 ${idx === 0 ? 'border-indigo-200 bg-gradient-to-r from-indigo-50/60 to-white' : 'border-gray-100 bg-gray-50/40'}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            {idx === 0 && <span className="bg-indigo-100 text-indigo-600 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-indigo-200">Current Active</span>}
                            <span className="text-xs text-gray-400 font-semibold">Effective: {h.effectiveDate}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Basic Salary</p>
                            <p className="text-2xl font-black text-gray-900">₹{fmt(h.basicSalary)}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-3 text-xs">
                          <div className="bg-white rounded-xl p-3 border border-gray-100">
                            <p className="text-gray-400 font-semibold">Gross Earnings</p>
                            <p className="font-black text-gray-800 mt-1">₹{fmt(g)}</p>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-gray-100">
                            <p className="text-gray-400 font-semibold">Total Deductions</p>
                            <p className="font-black text-rose-600 mt-1">₹{fmt(d)}</p>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-gray-100">
                            <p className="text-gray-400 font-semibold">Net Salary</p>
                            <p className="font-black text-emerald-600 mt-1">₹{fmt(g - d)}</p>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-gray-100">
                            <p className="text-gray-400 font-semibold">PF / ESI</p>
                            <p className="font-black text-gray-800 mt-1">₹{fmt(h.providentFund)} / ₹{fmt(h.esi)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* ── Configure Tab ── */
            <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
              {/* Form - 2 cols */}
              <div className="lg:col-span-2 p-7 space-y-6 overflow-y-auto max-h-[75vh]">

                {/* Basic Setup */}
                <section>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><DollarSign size={13}/>Basic Setup</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2"><Field label="Basic Salary (₹) *" prefix="₹" value={form.basicSalary} onChange={set('basicSalary')} /></div>
                    <Field label="Effective Date" type="date" value={form.effectiveDate} onChange={set('effectiveDate')} />
                    <Field label="HRA %" prefix="%" value={form.hraPercent} onChange={set('hraPercent')} note="Calculated HRA: ₹" />
                  </div>
                </section>

                {/* Salary Configuration Options */}
                <section>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Salary Configuration BLUEPRINT</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <SelectField label="Salary Type" value={form.salaryType} onChange={set('salaryType')} options={['Monthly', 'Hourly', 'Daily']} />
                    <SelectField label="Payment Mode" value={form.paymentMode} onChange={set('paymentMode')} options={['Bank Transfer', 'Cash', 'Cheque']} />
                    <SelectField label="Payroll Frequency" value={form.payrollFrequency} onChange={set('payrollFrequency')} options={['Monthly', 'Bi-weekly', 'Weekly']} />
                  </div>
                </section>

                {/* Allowances */}
                <section>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Earnings & Allowances</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="HRA (₹) – Auto" prefix="₹" value={calc.hra} readOnly />
                    <Field label="DA % (Dearness Allow.)" prefix="%" value={form.daPercent} onChange={set('daPercent')} note="Calculated DA: ₹" />
                    <Field label="Conveyance Allowance" prefix="₹" value={form.conveyanceAllowance} onChange={set('conveyanceAllowance')} />
                    <Field label="Medical Allowance" prefix="₹" value={form.medicalAllowance} onChange={set('medicalAllowance')} />
                    <Field label="Special Allowance" prefix="₹" value={form.specialAllowance} onChange={set('specialAllowance')} />
                    <Field label="Incentives" prefix="₹" value={form.incentives} onChange={set('incentives')} />
                    <Field label="Overtime Hourly Rate" prefix="₹" value={form.overtime} onChange={set('overtime')} />
                    <Field label="Other Earnings" prefix="₹" value={form.otherEarnings} onChange={set('otherEarnings')} />
                    <Field label="Performance Bonus" prefix="₹" value={form.performanceBonus} onChange={set('performanceBonus')} />
                  </div>
                </section>

                {/* Deductions */}
                <section>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Statutory Deductions (India Compliance)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="PF % (default 12%)" prefix="%" value={form.pfPercent} onChange={set('pfPercent')} note={`Employee PF: ₹${fmt(calc.pf)} | Employer PF: ₹${fmt(Math.round((parseFloat(form.basicSalary)||0)*0.12))}`} />
                    <Field label="ESI % (default 0.75%)" prefix="%" value={form.esiPercent} onChange={set('esiPercent')} note={`Employee ESI: ₹${fmt(calc.esi)} | Employer ESI: ₹${fmt(Math.round(calc.gross*0.0325))}`} />
                    <Field label="TDS % (Income Tax)" prefix="%" value={form.tdsPercent} onChange={set('tdsPercent')} note={`TDS Amount: ₹${fmt(calc.tds)}`} />
                    <Field label="Professional Tax (₹)" prefix="₹" value={form.professionalTax} onChange={set('professionalTax')} note="Standard: ₹200/month (if gross ≥ ₹15,000)" />
                    <Field label="Insurance Deduction (₹)" prefix="₹" value={form.insurance} onChange={set('insurance')} />
                    <Field label="Advance Deduction (₹)" prefix="₹" value={form.advanceDeduction} onChange={set('advanceDeduction')} />
                    <Field label="Loan Deduction (₹)" prefix="₹" value={form.loanDeduction} onChange={set('loanDeduction')} />
                    <Field label="Other Deductions (₹)" prefix="₹" value={form.otherDeductions} onChange={set('otherDeductions')} />
                  </div>
                </section>

                {/* Statutory IDs */}
                <section>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><CreditCard size={13}/>Statutory IDs</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="UAN Number" type="text" value={form.uanNumber} onChange={set('uanNumber')} />
                    <Field label="PF Number" type="text" value={form.pfNumber} onChange={set('pfNumber')} />
                    <Field label="ESI Number" type="text" value={form.esiNumber} onChange={set('esiNumber')} />
                  </div>
                </section>

                {/* Bank */}
                <section>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Building2 size={13}/>Bank Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Bank Name" type="text" value={form.bankName} onChange={set('bankName')} />
                    <Field label="IFSC Code" type="text" value={form.ifscCode} onChange={set('ifscCode')} />
                    <div className="col-span-2"><Field label="Account Number" type="text" value={form.accountNumber} onChange={set('accountNumber')} /></div>
                  </div>
                </section>
              </div>

              {/* Live Preview - 1 col */}
              <div className="bg-gradient-to-b from-indigo-50 to-slate-50 border-l border-gray-100 p-6 flex flex-col gap-5 overflow-y-auto max-h-[85vh]">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Live Calculation Preview</p>
                  <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm">
                    <p className="text-xs text-gray-400 font-semibold mb-1">Basic Salary</p>
                    <p className="text-2xl font-black text-gray-900">₹{fmt(form.basicSalary)}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Earnings</p>
                  {[
                    ['Basic', form.basicSalary],
                    ['HRA', calc.hra],
                    ['DA', calc.da],
                    ['Conveyance', form.conveyanceAllowance],
                    ['Medical', form.medicalAllowance],
                    ['Special', form.specialAllowance],
                    ['Incentives', form.incentives],
                    ['Overtime', form.overtime],
                    ['Other Earnings', form.otherEarnings],
                    ['Bonus', form.performanceBonus]
                  ].map(([l,v])=>(
                    <div key={l} className="flex justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                      <span className="text-gray-500 font-medium">{l}</span>
                      <span className="font-bold text-gray-800">₹{fmt(v)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-black mt-3 pt-2 border-t-2 border-emerald-100 text-emerald-700">
                    <span>Gross</span><span>₹{fmt(calc.gross)}</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-rose-100">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3">Deductions</p>
                  {[
                    ['PF (Emp)', calc.pf],
                    ['ESI (Emp)', calc.esi],
                    ['Prof. Tax', form.professionalTax],
                    ['TDS', calc.tds],
                    ['Insurance', form.insurance],
                    ['Advance Ded.', form.advanceDeduction],
                    ['Loan Ded.', form.loanDeduction],
                    ['Others', form.otherDeductions]
                  ].map(([l,v])=>(
                    <div key={l} className="flex justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                      <span className="text-gray-500 font-medium">{l}</span>
                      <span className="font-bold text-rose-600">₹{fmt(v)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-black mt-3 pt-2 border-t-2 border-rose-100 text-rose-600">
                    <span>Total Ded.</span><span>₹{fmt(calc.totalDed)}</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-4 text-white">
                  <p className="text-[10px] font-black opacity-70 uppercase tracking-widest mb-1">Net Salary / Month</p>
                  <p className="text-3xl font-black">₹{fmt(calc.net)}</p>
                  <div className="mt-3 pt-3 border-t border-white/20 text-xs opacity-80 space-y-1">
                    <div className="flex justify-between"><span>CTC / Month</span><span className="font-bold">₹{fmt(calc.ctc)}</span></div>
                    <div className="flex justify-between"><span>CTC / Annum</span><span className="font-bold">₹{fmt(calc.ctc * 12)}</span></div>
                  </div>
                </div>

                {error && <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl p-3">{error}</div>}
                {success && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl p-3 flex items-center gap-2">
                    <CheckCircle2 size={16}/> Salary structure saved successfully!
                  </div>
                )}

                <button onClick={handleSave} disabled={saving || success}
                  className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-200 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"/>Saving...</> : success ? <><CheckCircle2 size={18}/>Saved!</> : 'Save Salary Structure'}
                </button>
                <p className="text-[10px] text-center text-gray-400 font-medium">Attendance pro-rating and policy penalty engine calculations will be applied automatically during monthly payroll run.</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SalaryConfigModal;
