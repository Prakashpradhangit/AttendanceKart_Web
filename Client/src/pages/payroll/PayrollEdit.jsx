import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, AlertCircle, CheckCircle2, Download } from 'lucide-react';

const fmt = (v) => Number(v || 0).toLocaleString('en-IN');

const Field = ({ label, value, onChange, type = 'number', readOnly = false, highlight }) => (
  <div className={`flex items-center justify-between py-2.5 border-b border-gray-50 ${highlight ? 'bg-yellow-50 rounded-lg px-2' : ''}`}>
    <label className="text-sm text-gray-600 font-medium">{label}</label>
    {readOnly ? (
      <span className="text-sm font-bold text-gray-800">₹{fmt(value)}</span>
    ) : (
      <input
        type={type}
        value={value}
        onChange={e => onChange(type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value)}
        className="w-36 text-right px-3 py-1.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0061E0]/20 focus:border-[#0061E0]"
      />
    )}
  </div>
);

export default function PayrollEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchPayroll = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/payroll', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const all = await res.json();
          const found = all.find(p => String(p.id) === String(id));
          if (found) setForm({ ...found });
          else setError('Payroll record not found');
        }
      } catch (e) { setError('Failed to load payroll'); }
      finally { setLoading(false); }
    };
    fetchPayroll();
  }, [id]);

  const setField = (field) => (val) => setForm(prev => ({ ...prev, [field]: val }));

  const grossEarnings = form ? [
    form.basicSalary, form.hra, form.conveyanceAllowance, form.medicalAllowance,
    form.specialAllowance, form.otherAllowances, form.performanceBonus,
    form.incentives, form.overtime, form.otherEarnings
  ].reduce((a, b) => a + (Number(b) || 0), 0) : 0;

  const totalDeductions = form ? [
    form.providentFund, form.professionalTax, form.incomeTax, form.esi,
    form.insurance, form.advanceDeduction, form.loanDeduction,
    form.otherDeductions, form.attendanceDeduction
  ].reduce((a, b) => a + (Number(b) || 0), 0) : 0;

  const netSalary = grossEarnings - totalDeductions;

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const payload = { ...form, totalEarnings: grossEarnings, totalDeductions, netSalary };
      const res = await fetch(`/api/payroll/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to save'); }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleApprove = async (status) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/payroll/${id}/status?status=${status}`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}` },
      });
      setForm(prev => ({ ...prev, status }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/payroll/payslip/${id}/download`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Payslip-${form?.employeeName?.replace(/\s/g,'_')}-${form?.month?.replace(/\s/g,'_')}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert('Download failed'); }
    finally { setDownloading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[#0061E0]" size={32} /></div>
  );
  if (!form) return (
    <div className="text-center py-16 text-gray-400">{error || 'Payroll not found'}</div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/payroll')} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Payroll</h1>
            <p className="text-sm text-gray-500">{form.employeeName} · {form.month}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {form.status !== 'PAID' && (
            <button onClick={() => handleApprove('PENDING')} disabled={saving} className="px-4 py-2 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl text-sm font-semibold hover:bg-amber-600 hover:text-white transition-all">
              Mark Pending
            </button>
          )}
          {form.status !== 'PAID' && (
            <button onClick={() => handleApprove('PAID')} disabled={saving} className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-sm font-semibold hover:bg-emerald-600 hover:text-white transition-all">
              Mark Paid
            </button>
          )}
          {form.status !== 'DRAFT' && (
            <button onClick={handleDownload} disabled={downloading} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
              {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Payslip PDF
            </button>
          )}
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-[#0061E0] text-white rounded-xl text-sm font-bold hover:bg-[#0052cc] transition-all shadow-lg shadow-blue-500/20">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
          </button>
        </div>
      </div>

      {error && <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm"><AlertCircle size={16}/>{error}</div>}
      {success && <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm"><CheckCircle2 size={16}/>Saved successfully!</div>}

      {/* Employee Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
            {form.employeeName?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900 text-lg">{form.employeeName}</h2>
            <p className="text-sm text-gray-500">{form.employeeId} · {form.designation || 'N/A'}</p>
          </div>
          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <p className="text-xs text-gray-400">Month</p>
              <p className="font-bold text-gray-800">{form.month}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Status</p>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${form.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : form.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                {form.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Attendance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">Attendance</h3>
          <div className="space-y-3">
            {[
              ['Total Days', 'totalDays'], ['Present Days', 'presentDays'], ['Absent Days', 'absentDays'],
              ['Leave Days', 'leaveDays'], ['LOP Days', 'lopDays'], ['Paid Days', 'paidDays'],
              ['Week Offs', 'weekOffs'], ['Holidays', 'holidays'],
            ].map(([label, field]) => (
              <div key={field} className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-sm text-gray-600">{label}</span>
                <input type="number" value={form[field] || 0} onChange={e => setField(field)(parseFloat(e.target.value)||0)}
                  className="w-20 text-right px-2 py-1 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0061E0]/20" />
              </div>
            ))}
          </div>
        </div>

        {/* Earnings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-emerald-700 mb-4">Earnings</h3>
          <Field label="Basic Salary" value={form.basicSalary} onChange={setField('basicSalary')} />
          <Field label="HRA" value={form.hra} onChange={setField('hra')} />
          <Field label="Conveyance" value={form.conveyanceAllowance} onChange={setField('conveyanceAllowance')} />
          <Field label="Medical" value={form.medicalAllowance} onChange={setField('medicalAllowance')} />
          <Field label="Special Allowance" value={form.specialAllowance} onChange={setField('specialAllowance')} />
          <Field label="Other Allowances" value={form.otherAllowances} onChange={setField('otherAllowances')} />
          <Field label="Performance Bonus" value={form.performanceBonus} onChange={setField('performanceBonus')} />
          <Field label="Incentives" value={form.incentives} onChange={setField('incentives')} />
          <Field label="Overtime" value={form.overtime} onChange={setField('overtime')} />
          <Field label="Other Earnings" value={form.otherEarnings} onChange={setField('otherEarnings')} />
          <div className="pt-3 flex items-center justify-between">
            <span className="font-bold text-gray-900 text-sm">Gross Earnings</span>
            <span className="font-bold text-emerald-600 text-base">₹{fmt(grossEarnings)}</span>
          </div>
        </div>

        {/* Deductions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-rose-600 mb-4">Deductions</h3>
          <Field label="Provident Fund (PF)" value={form.providentFund} onChange={setField('providentFund')} />
          <Field label="ESI" value={form.esi} onChange={setField('esi')} />
          <Field label="Professional Tax" value={form.professionalTax} onChange={setField('professionalTax')} />
          <Field label="Income Tax (TDS)" value={form.incomeTax} onChange={setField('incomeTax')} />
          <Field label="Insurance" value={form.insurance} onChange={setField('insurance')} />
          <Field label="Advance Deduction" value={form.advanceDeduction} onChange={setField('advanceDeduction')} />
          <Field label="Loan Deduction" value={form.loanDeduction} onChange={setField('loanDeduction')} />
          <Field label="Other Deductions" value={form.otherDeductions} onChange={setField('otherDeductions')} />
          <Field label="LOP Deduction" value={form.attendanceDeduction} onChange={setField('attendanceDeduction')} highlight />
          <div className="pt-3 flex items-center justify-between">
            <span className="font-bold text-gray-900 text-sm">Total Deductions</span>
            <span className="font-bold text-rose-500 text-base">₹{fmt(totalDeductions)}</span>
          </div>
        </div>
      </div>

      {/* Net Salary Banner */}
      <div className="bg-gradient-to-r from-[#0061E0] to-indigo-600 rounded-2xl p-8 text-white flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm font-semibold mb-1">Net Salary — {form.month}</p>
          <p className="text-4xl font-bold">₹{fmt(netSalary)}</p>
        </div>
        <div className="text-right text-sm text-white/70 space-y-1">
          <p>Gross: <span className="text-white font-bold">₹{fmt(grossEarnings)}</span></p>
          <p>Deductions: <span className="text-white font-bold">₹{fmt(totalDeductions)}</span></p>
          <p>CTC: <span className="text-white font-bold">₹{fmt(form.ctc)}</span></p>
        </div>
      </div>

      {/* Statutory Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">Banking & Statutory Details</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[['Bank Name','bankName','text'],['IFSC Code','ifscCode','text'],['Account No','accountNumber','text'],
            ['UAN Number','uanNumber','text'],['PF Number','pfNumber','text'],['ESI Number','esiNumber','text']].map(([label,field,type]) => (
            <div key={field}>
              <label className="block text-xs text-gray-500 font-semibold mb-1">{label}</label>
              <input type={type} value={form[field]||''} onChange={e => setField(field)(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0061E0]/20" />
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-3">Audit Notes</h3>
        <textarea value={form.auditLog || ''} onChange={e => setField('auditLog')(e.target.value)} rows={3}
          placeholder="Add notes about manual adjustments..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0061E0]/20 resize-none" />
        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <input type="checkbox" checked={form.adjustedManually || false} onChange={e => setField('adjustedManually')(e.target.checked)} className="accent-[#0061E0]" />
          <span className="text-sm font-semibold text-gray-600">Mark as manually adjusted</span>
        </label>
      </div>
    </div>
  );
}
