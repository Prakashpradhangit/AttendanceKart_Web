import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Loader2, Save, History, CheckCircle2 } from 'lucide-react';

export default function SalaryStructureDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    userId, effectiveDate: new Date().toISOString().split('T')[0], calculationMode: 'PERCENTAGE_BASED',
    basicSalary: '30000', hraPercent: '40', daPercent: '0', pfPercent: '12', esiPercent: '0.75', tdsPercent: '0',
    conveyanceAllowance: '1600', medicalAllowance: '1250', specialAllowance: '5000', otherAllowances: '2000', performanceBonus: '0',
    incentives: '0', overtime: '0', otherEarnings: '0', professionalTax: '200', insurance: '0', advanceDeduction: '0',
    loanDeduction: '0', otherDeductions: '0', salaryType: 'Monthly', paymentMode: 'Bank Transfer', payrollFrequency: 'Monthly',
    bankName: '', ifscCode: '', accountNumber: '', uanNumber: '', pfNumber: '', esiNumber: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/payroll/salary-structure/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [userId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/payroll/salary-structure', {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        fetchData(); // Reload history
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const calculateTotals = () => {
    const basic = parseFloat(form.basicSalary) || 0;
    const hra = form.calculationMode === 'PERCENTAGE_BASED' ? (basic * (parseFloat(form.hraPercent) || 0) / 100) : (parseFloat(form.hra) || 0);
    const da = form.calculationMode === 'PERCENTAGE_BASED' ? (basic * (parseFloat(form.daPercent) || 0) / 100) : (parseFloat(form.da) || 0);
    const gross = basic + hra + da + ['conveyanceAllowance', 'medicalAllowance', 'specialAllowance', 'otherAllowances', 'performanceBonus', 'incentives', 'overtime', 'otherEarnings'].reduce((sum, key) => sum + (parseFloat(form[key]) || 0), 0);
    const pf = form.calculationMode === 'PERCENTAGE_BASED' ? (basic * (parseFloat(form.pfPercent) || 0) / 100) : (parseFloat(form.providentFund) || 0);
    const esi = form.calculationMode === 'PERCENTAGE_BASED' ? (gross * (parseFloat(form.esiPercent) || 0) / 100) : (parseFloat(form.esi) || 0);
    const tds = form.calculationMode === 'PERCENTAGE_BASED' ? (gross * (parseFloat(form.tdsPercent) || 0) / 100) : (parseFloat(form.tds) || 0);
    const ded = pf + esi + tds + ['professionalTax', 'insurance', 'advanceDeduction', 'loanDeduction', 'otherDeductions'].reduce((sum, key) => sum + (parseFloat(form[key]) || 0), 0);
    return { gross, net: gross - ded, ctc: gross + (basic * 0.12) + (gross * 0.0325) };
  };

  const totals = calculateTotals();

  const handleCopyFromHistory = (h) => {
    setForm({
      ...form, ...h,
      effectiveDate: new Date().toISOString().split('T')[0], // Don't copy date
      id: undefined // Remove id to create new
    });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0061E0]" size={32} /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/payroll/structures')} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configure Salary Structure</h1>
          <p className="text-sm text-gray-500">Manage earnings, deductions, and banking details</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            {success && <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl flex items-center gap-2 text-sm"><CheckCircle2 size={16} /> Saved successfully</div>}
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="font-bold text-gray-900">New Revision</h3>
              <input type="date" value={form.effectiveDate} onChange={e => setForm({...form, effectiveDate: e.target.value})} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Calculation Mode</label>
                  <select value={form.calculationMode} onChange={e => setForm({...form, calculationMode: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="PERCENTAGE_BASED">Percentage Based (Auto-calc)</option>
                    <option value="FLAT_AMOUNT">Flat Amount (Manual)</option>
                  </select>
               </div>
               <div>
                 <label className="block text-xs font-semibold text-gray-500 mb-1">Basic Salary (Monthly)</label>
                 <input type="number" value={form.basicSalary} onChange={e => setForm({...form, basicSalary: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold" required />
               </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Earnings */}
              <div className="space-y-3">
                 <h4 className="font-bold text-emerald-700 text-sm">Earnings</h4>
                 {form.calculationMode === 'PERCENTAGE_BASED' && (
                   <>
                     <div className="flex items-center gap-2"><label className="flex-1 text-sm">HRA (%)</label><input type="number" value={form.hraPercent} onChange={e => setForm({...form, hraPercent: e.target.value})} className="w-20 px-2 py-1 border rounded" /></div>
                     <div className="flex items-center gap-2"><label className="flex-1 text-sm">DA (%)</label><input type="number" value={form.daPercent} onChange={e => setForm({...form, daPercent: e.target.value})} className="w-20 px-2 py-1 border rounded" /></div>
                   </>
                 )}
                 {['conveyanceAllowance', 'medicalAllowance', 'specialAllowance', 'otherAllowances', 'performanceBonus', 'incentives', 'overtime', 'otherEarnings'].map(f => (
                   <div key={f} className="flex items-center gap-2"><label className="flex-1 text-sm capitalize">{f.replace(/([A-Z])/g, ' $1').trim()}</label><input type="number" value={form[f]} onChange={e => setForm({...form, [f]: e.target.value})} className="w-24 px-2 py-1 border rounded text-right" /></div>
                 ))}
              </div>

              {/* Deductions */}
              <div className="space-y-3">
                 <h4 className="font-bold text-rose-600 text-sm">Deductions</h4>
                 {form.calculationMode === 'PERCENTAGE_BASED' && (
                   <>
                     <div className="flex items-center gap-2"><label className="flex-1 text-sm">PF (%)</label><input type="number" step="0.01" value={form.pfPercent} onChange={e => setForm({...form, pfPercent: e.target.value})} className="w-20 px-2 py-1 border rounded" /></div>
                     <div className="flex items-center gap-2"><label className="flex-1 text-sm">ESI (%)</label><input type="number" step="0.01" value={form.esiPercent} onChange={e => setForm({...form, esiPercent: e.target.value})} className="w-20 px-2 py-1 border rounded" /></div>
                     <div className="flex items-center gap-2"><label className="flex-1 text-sm">TDS (%)</label><input type="number" step="0.01" value={form.tdsPercent} onChange={e => setForm({...form, tdsPercent: e.target.value})} className="w-20 px-2 py-1 border rounded" /></div>
                   </>
                 )}
                 {['professionalTax', 'insurance', 'advanceDeduction', 'loanDeduction', 'otherDeductions'].map(f => (
                   <div key={f} className="flex items-center gap-2"><label className="flex-1 text-sm capitalize">{f.replace(/([A-Z])/g, ' $1').trim()}</label><input type="number" value={form[f]} onChange={e => setForm({...form, [f]: e.target.value})} className="w-24 px-2 py-1 border rounded text-right" /></div>
                 ))}
              </div>
            </div>

            {/* Banking */}
            <div className="pt-4 border-t border-gray-100">
               <h4 className="font-bold text-gray-900 text-sm mb-3">Banking & Statutory Details</h4>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                 {['bankName', 'ifscCode', 'accountNumber', 'uanNumber', 'pfNumber', 'esiNumber'].map(f => (
                    <div key={f}>
                      <label className="block text-xs text-gray-500 mb-1 capitalize">{f.replace(/([A-Z])/g, ' $1').trim()}</label>
                      <input type="text" value={form[f]} onChange={e => setForm({...form, [f]: e.target.value})} className="w-full px-2 py-1.5 border rounded text-sm" />
                    </div>
                 ))}
               </div>
            </div>

            {/* Totals Preview */}
            <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Est. Gross: <span className="font-bold text-gray-900">₹{Math.round(totals.gross).toLocaleString()}</span></p>
                <p className="text-sm text-gray-500">Est. Net: <span className="font-bold text-[#0061E0]">₹{Math.round(totals.net).toLocaleString()}</span></p>
              </div>
              <button type="submit" disabled={saving} className="px-6 py-2 bg-[#0061E0] text-white rounded-xl font-bold flex items-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Revision
              </button>
            </div>
          </form>
        </div>

        {/* History Panel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit">
          <div className="flex items-center gap-2 mb-4">
             <History size={18} className="text-[#0061E0]" />
             <h3 className="font-bold text-gray-900">Revision History</h3>
          </div>
          <div className="space-y-4">
             {history.length === 0 ? <p className="text-sm text-gray-500 text-center py-4">No past structures</p> : 
              history.map(h => (
                <div key={h.id} className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                     <div>
                       <p className="font-bold text-gray-900 text-sm">Effective: {h.effectiveDate}</p>
                       <p className="text-xs text-gray-500">Gross: ₹{(h.grossSalary || 0).toLocaleString()}</p>
                     </div>
                     <button onClick={() => handleCopyFromHistory(h)} className="text-[10px] uppercase font-bold text-[#0061E0] hover:underline">Copy</button>
                  </div>
                </div>
              ))
             }
          </div>
        </div>
      </div>
    </div>
  );
}
