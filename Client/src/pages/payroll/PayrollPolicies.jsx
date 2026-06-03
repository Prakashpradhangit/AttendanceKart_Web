import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle2, Clock, CalendarDays, ShieldAlert } from 'lucide-react';

export default function PayrollPolicies() {
  const [form, setForm] = useState({
    defaultCheckInTime: '09:00', defaultCheckOutTime: '18:00', gracePeriod: 15, shiftDuration: 9,
    lateCountThreshold: 3, lateDeductionDays: 0.5, lateMinutesHalfDayThreshold: 30,
    earlyCheckoutHourThreshold: 1.0, earlyCheckoutDeductionDays: 0.5, autoPenaltyRulesEnabled: true,
    sickLeavesLimit: 12, casualLeavesLimit: 12, emergencyLeavesLimit: 6, departments: '[]', declaredHolidays: '[]'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setForm({
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
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const InputRow = ({ label, field, type="number", step }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-50">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input type={type} step={step} value={form[field]} onChange={e => handleChange(field, type==='number' ? parseFloat(e.target.value)||0 : e.target.value)}
        className="w-24 text-right px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0061E0]" />
    </div>
  );

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0061E0]" size={32} /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Policies</h1>
          <p className="text-sm text-gray-500">Configure attendance rules, penalties, and leave limits</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-[#0061E0] text-white rounded-xl font-bold hover:bg-[#0052cc] shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Policies
        </button>
      </div>

      {success && <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl flex items-center gap-2 text-sm font-semibold border border-emerald-100"><CheckCircle2 size={18} /> Policies saved successfully!</div>}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Attendance Rules */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 text-[#0061E0]">
            <Clock size={20} />
            <h2 className="font-bold text-gray-900">Shift & Timing Rules</h2>
          </div>
          <InputRow label="Default Check-In Time" field="defaultCheckInTime" type="time" />
          <InputRow label="Default Check-Out Time" field="defaultCheckOutTime" type="time" />
          <InputRow label="Shift Duration (Hours)" field="shiftDuration" step="0.5" />
          <InputRow label="Grace Period (Minutes)" field="gracePeriod" />
        </div>

        {/* Penalty Rules */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2 text-rose-500">
              <ShieldAlert size={20} />
              <h2 className="font-bold text-gray-900">Penalty & LOP Rules</h2>
            </div>
            <label className="flex items-center cursor-pointer relative">
               <input type="checkbox" className="sr-only peer" checked={form.autoPenaltyRulesEnabled} onChange={e => handleChange('autoPenaltyRulesEnabled', e.target.checked)} />
               <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0061E0]"></div>
            </label>
          </div>
          
          <div className={`space-y-4 transition-opacity ${!form.autoPenaltyRulesEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
             <InputRow label="Late Marks for LOP Penalty" field="lateCountThreshold" />
             <InputRow label="Days Deducted per Penalty" field="lateDeductionDays" step="0.5" />
             <InputRow label="Late Mins = Half Day LOP" field="lateMinutesHalfDayThreshold" />
             <InputRow label="Early Checkout (Hours early)" field="earlyCheckoutHourThreshold" step="0.5" />
             <InputRow label="Early Checkout LOP Days" field="earlyCheckoutDeductionDays" step="0.5" />
          </div>
          {!form.autoPenaltyRulesEnabled && <p className="text-xs text-rose-500 font-semibold mt-2">Auto-penalties are currently disabled.</p>}
        </div>

        {/* Leave Limits */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 text-emerald-600">
            <CalendarDays size={20} />
            <h2 className="font-bold text-gray-900">Annual Leave Limits</h2>
          </div>
          <InputRow label="Sick Leaves (Annual)" field="sickLeavesLimit" />
          <InputRow label="Casual Leaves (Annual)" field="casualLeavesLimit" />
          <InputRow label="Emergency Leaves (Annual)" field="emergencyLeavesLimit" />
        </div>
      </div>
    </div>
  );
}
