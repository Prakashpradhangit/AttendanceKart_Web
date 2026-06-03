import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet, Users, CheckCircle2, Clock, FileText, Download,
  Plus, Search, Filter, TrendingUp, AlertCircle, Loader2,
  ChevronRight, Calendar, ArrowUpRight, IndianRupee, RefreshCw
} from 'lucide-react';

const fmt = (v) => Number(v || 0).toLocaleString('en-IN');

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

const STATUS_COLORS = {
  PAID: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
  DRAFT: 'bg-gray-100 text-gray-500 border-gray-200',
  PROCESSED: 'bg-blue-50 text-blue-600 border-blue-100',
};

export default function PayrollDashboard() {
  const navigate = useNavigate();
  const [payrolls, setPayrolls] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState(MONTH_OPTIONS[0]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [pRes, rRes] = await Promise.all([
        fetch('/api/payroll', { headers }),
        fetch('/api/payroll/admin/requests', { headers }),
      ]);
      if (pRes.ok) setPayrolls(await pRes.json());
      if (rRes.ok) setRequests(await rRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = payrolls.filter(p => {
    const matchMonth = p.month === filterMonth;
    const matchStatus = filterStatus === 'All' || p.status?.toUpperCase() === filterStatus;
    const matchSearch = !search || p.employeeName?.toLowerCase().includes(search.toLowerCase()) || p.employeeId?.toLowerCase().includes(search.toLowerCase());
    return matchMonth && matchStatus && matchSearch;
  });

  const monthPayrolls = payrolls.filter(p => p.month === filterMonth);
  const totalPayout = monthPayrolls.reduce((s, p) => s + (p.netSalary || 0), 0);
  const paid = monthPayrolls.filter(p => p.status === 'PAID').length;
  const pending = monthPayrolls.filter(p => p.status === 'PENDING').length;
  const draft = monthPayrolls.filter(p => p.status === 'DRAFT').length;

  const handleDownload = async (pay) => {
    setDownloadingId(pay.id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/payroll/payslip/${pay.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Payslip-${pay.employeeName?.replace(/\s/g, '_')}-${pay.month?.replace(/\s/g, '_')}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) { alert('Download failed. Please try again.'); }
    finally { setDownloadingId(null); }
  };

  const handleApproveRequest = async (req) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/payroll/admin/requests/${req.id}/status`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });
      fetchData();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-sm text-gray-500 mt-1">Process salaries, manage payslips & statutory compliance</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => navigate('/admin/payroll/create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0061E0] text-white rounded-xl font-semibold text-sm hover:bg-[#0052cc] transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus size={18} /> Run Payroll
          </button>
          <button
            onClick={() => navigate('/admin/payroll/reports')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all"
          >
            <TrendingUp size={18} /> Reports
          </button>
          <button onClick={fetchData} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
            <RefreshCw size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: 'Payroll List', path: '/admin/payroll', active: true },
          { label: 'Salary Structures', path: '/admin/payroll/structures', active: false },
          { label: 'Templates', path: '/admin/payroll/templates', active: false },
          { label: 'Policies', path: '/admin/payroll/policies', active: false },
          { label: 'Reports', path: '/admin/payroll/reports', active: false },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${item.active ? 'bg-[#0061E0] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#0061E0] hover:text-[#0061E0]'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Payout', value: `₹${fmt(totalPayout)}`, icon: IndianRupee, color: 'bg-blue-50 text-blue-600', sub: filterMonth },
          { label: 'Paid', value: paid, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600', sub: 'Employees' },
          { label: 'Pending', value: pending, icon: Clock, color: 'bg-amber-50 text-amber-600', sub: 'Awaiting payment' },
          { label: 'Draft', value: draft, icon: FileText, color: 'bg-gray-100 text-gray-600', sub: 'Not finalized' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
              <card.icon size={20} />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search employee..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0061E0]/20 focus:border-[#0061E0]"
            />
          </div>
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0061E0]/20 bg-white"
          >
            {MONTH_OPTIONS.map(m => <option key={m}>{m}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0061E0]/20 bg-white"
          >
            {['All', 'DRAFT', 'PENDING', 'PAID'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#0061E0]" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Wallet size={40} className="text-gray-200 mb-3" />
            <p className="font-semibold text-gray-400">No payroll records</p>
            <p className="text-sm text-gray-400 mt-1">Run payroll for {filterMonth} to see records here.</p>
            <button
              onClick={() => navigate('/admin/payroll/create')}
              className="mt-4 px-5 py-2 bg-[#0061E0] text-white rounded-xl text-sm font-semibold"
            >
              Run Payroll
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-gray-400 border-b border-gray-50">
                  <th className="text-left px-6 py-4">Employee</th>
                  <th className="text-left px-4 py-4">Month</th>
                  <th className="text-left px-4 py-4">Gross Pay</th>
                  <th className="text-left px-4 py-4">Deductions</th>
                  <th className="text-left px-4 py-4">Net Salary</th>
                  <th className="text-center px-4 py-4">Status</th>
                  <th className="text-left px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(pay => (
                  <tr key={pay.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                          {pay.employeeName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-[#0061E0] transition-colors">{pay.employeeName}</p>
                          <p className="text-xs text-gray-400">{pay.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600 font-medium">{pay.month}</td>
                    <td className="px-4 py-4 font-semibold text-gray-800">₹{fmt(pay.totalEarnings)}</td>
                    <td className="px-4 py-4 text-rose-500 font-semibold">₹{fmt(pay.totalDeductions)}</td>
                    <td className="px-4 py-4 font-bold text-gray-900">₹{fmt(pay.netSalary)}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLORS[pay.status] || STATUS_COLORS.DRAFT}`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/payroll/${pay.id}/edit`)}
                          className="px-3 py-1.5 text-[#0061E0] border border-[#0061E0]/30 rounded-lg text-xs font-semibold hover:bg-[#0061E0] hover:text-white transition-all"
                        >
                          Edit
                        </button>
                        {pay.status !== 'DRAFT' && (
                          <button
                            onClick={() => handleDownload(pay)}
                            disabled={downloadingId === pay.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                          >
                            {downloadingId === pay.id ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                            PDF
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payslip Requests */}
      {requests.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-500" />
              <h2 className="font-bold text-gray-900">Payslip Requests</h2>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-xs font-bold rounded-full">{requests.length}</span>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {requests.map(req => (
              <div key={req.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-semibold text-gray-800">{req.employeeName}</p>
                  <p className="text-xs text-gray-400">{req.month} · Requested {req.requestDate}</p>
                  {req.reason && <p className="text-xs text-gray-500 mt-0.5 italic">"{req.reason}"</p>}
                </div>
                <button
                  onClick={() => handleApproveRequest(req)}
                  className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all"
                >
                  Approve
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
