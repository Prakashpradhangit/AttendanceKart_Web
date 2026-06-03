import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Users, Loader2, Save, FileText, CheckCircle2, X } from 'lucide-react';
import Modal from '../../components/Modal';

export default function SalaryTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreateModal, setIsCreateModal] = useState(false);
  const [isAssignModal, setIsAssignModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  const [assignForm, setAssignForm] = useState({ userIds: [], effectiveDate: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '', basicSalary: '30000', hraPercent: '40', daPercent: '0', pfPercent: '12', esiPercent: '0.75', tdsPercent: '0',
    conveyanceAllowance: '1600', medicalAllowance: '1250', specialAllowance: '5000', otherAllowances: '2000', performanceBonus: '0',
    incentives: '0', overtime: '0', otherEarnings: '0', professionalTax: '200', insurance: '0', advanceDeduction: '0',
    loanDeduction: '0', otherDeductions: '0', salaryType: 'Monthly', paymentMode: 'Bank Transfer', payrollFrequency: 'Monthly', active: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [tRes, eRes] = await Promise.all([
        fetch('/api/payroll/templates', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/payroll/employees', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (tRes.ok) setTemplates(await tRes.json());
      if (eRes.ok) setEmployees(await eRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/payroll/templates', {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setIsCreateModal(false);
      fetchData();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/payroll/templates/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTemplate || assignForm.userIds.length === 0) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/payroll/templates/${selectedTemplate.id}/assign`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(assignForm)
      });
      setIsAssignModal(false);
      alert('Template assigned successfully!');
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0061E0]" size={32} /></div>;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salary Templates</h1>
          <p className="text-sm text-gray-500">Create reusable salary blueprints to assign to employees in bulk.</p>
        </div>
        <button onClick={() => {
           setForm({
            name: '', basicSalary: '30000', hraPercent: '40', daPercent: '0', pfPercent: '12', esiPercent: '0.75', tdsPercent: '0',
            conveyanceAllowance: '1600', medicalAllowance: '1250', specialAllowance: '5000', otherAllowances: '2000', performanceBonus: '0',
            incentives: '0', overtime: '0', otherEarnings: '0', professionalTax: '200', insurance: '0', advanceDeduction: '0',
            loanDeduction: '0', otherDeductions: '0', salaryType: 'Monthly', paymentMode: 'Bank Transfer', payrollFrequency: 'Monthly', active: true
           });
           setIsCreateModal(true);
        }} className="flex items-center gap-2 px-5 py-2.5 bg-[#0061E0] text-white rounded-xl font-bold hover:bg-[#0052cc]">
          <Plus size={18} /> New Template
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(t => (
          <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-[#0061E0]">
                 <FileText size={20} />
              </div>
              <button onClick={() => handleDelete(t.id)} className="p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{t.name}</h3>
            <p className="text-sm text-gray-500 mb-4">Gross: ₹{Math.round(t.grossSalary || 0).toLocaleString()} / month</p>
            
            <div className="mt-auto pt-4 border-t border-gray-50 flex gap-2">
               <button onClick={() => { setSelectedTemplate(t); setAssignForm({...assignForm, userIds: []}); setIsAssignModal(true); }} className="flex-1 py-2 bg-blue-50 text-[#0061E0] rounded-lg text-sm font-semibold hover:bg-blue-100 flex items-center justify-center gap-2">
                 <Users size={16} /> Assign to Employees
               </button>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
             <FileText size={40} className="mx-auto text-gray-300 mb-3" />
             <h3 className="font-bold text-gray-500">No Templates Found</h3>
             <p className="text-sm text-gray-400">Create a template to standardise salary structures.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isCreateModal} onClose={() => setIsCreateModal(false)} title="Create Salary Template">
        <form onSubmit={handleCreate} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Template Name</label>
            <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0061E0]/20 outline-none" placeholder="e.g. Junior Developer Blueprint" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div><label className="block text-xs font-semibold text-gray-500">Basic Salary</label><input type="number" required value={form.basicSalary} onChange={e => setForm({...form, basicSalary: e.target.value})} className="w-full px-3 py-2 border rounded-lg mt-1" /></div>
             <div><label className="block text-xs font-semibold text-gray-500">HRA (%)</label><input type="number" value={form.hraPercent} onChange={e => setForm({...form, hraPercent: e.target.value})} className="w-full px-3 py-2 border rounded-lg mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div><label className="block text-xs font-semibold text-gray-500">PF (%)</label><input type="number" step="0.01" value={form.pfPercent} onChange={e => setForm({...form, pfPercent: e.target.value})} className="w-full px-3 py-2 border rounded-lg mt-1" /></div>
             <div><label className="block text-xs font-semibold text-gray-500">ESI (%)</label><input type="number" step="0.01" value={form.esiPercent} onChange={e => setForm({...form, esiPercent: e.target.value})} className="w-full px-3 py-2 border rounded-lg mt-1" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setIsCreateModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-[#0061E0] text-white rounded-lg font-bold flex items-center gap-2">{saving ? <Loader2 className="animate-spin" size={16}/> : 'Save Template'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isAssignModal} onClose={() => setIsAssignModal(false)} title={`Assign ${selectedTemplate?.name}`}>
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Effective Date</label>
            <input type="date" required value={assignForm.effectiveDate} onChange={e => setAssignForm({...assignForm, effectiveDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Employees</label>
            <div className="max-h-60 overflow-y-auto border rounded-lg p-2 space-y-1">
               {employees.map(e => (
                 <label key={e.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                   <input type="checkbox" checked={assignForm.userIds.includes(e.id)} onChange={(ev) => {
                     const ids = ev.target.checked ? [...assignForm.userIds, e.id] : assignForm.userIds.filter(id => id !== e.id);
                     setAssignForm({...assignForm, userIds: ids});
                   }} className="accent-[#0061E0] w-4 h-4" />
                   <span className="text-sm font-medium">{e.name} <span className="text-gray-400">({e.employeeCode})</span></span>
                 </label>
               ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">{assignForm.userIds.length} employees selected.</p>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setIsAssignModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving || assignForm.userIds.length===0} className="px-5 py-2 bg-[#0061E0] text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-50">{saving ? <Loader2 className="animate-spin" size={16}/> : 'Assign & Apply'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
