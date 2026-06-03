import React, { useState, useEffect } from 'react';
import { Download, Loader2, Filter, TrendingUp, IndianRupee } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

export default function PayrollReports() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(MONTH_OPTIONS[0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/payroll', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setPayrolls(await res.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const monthData = payrolls.filter(p => p.month === selectedMonth);
  
  const totalGross = monthData.reduce((s, p) => s + (p.totalEarnings || 0), 0);
  const totalNet = monthData.reduce((s, p) => s + (p.netSalary || 0), 0);
  const totalDeductions = monthData.reduce((s, p) => s + (p.totalDeductions || 0), 0);
  const totalCTC = monthData.reduce((s, p) => s + (p.ctc || 0), 0);

  // Chart Data preparation
  const chartData = [...payrolls].reverse().reduce((acc, curr) => {
    const existing = acc.find(item => item.month === curr.month);
    if (existing) {
      existing.Net += curr.netSalary || 0;
      existing.Gross += curr.totalEarnings || 0;
    } else {
      acc.push({ month: curr.month, Net: curr.netSalary || 0, Gross: curr.totalEarnings || 0 });
    }
    return acc;
  }, []);

  const exportCSV = () => {
    if (monthData.length === 0) return alert('No data to export for this month.');
    const headers = ['Employee Name', 'Employee ID', 'Month', 'Gross Earnings', 'Total Deductions', 'Net Salary', 'Status', 'CTC'];
    const csvContent = [
      headers.join(','),
      ...monthData.map(p => [
        `"${p.employeeName}"`, `"${p.employeeId}"`, `"${p.month}"`,
        p.totalEarnings||0, p.totalDeductions||0, p.netSalary||0, `"${p.status}"`, p.ctc||0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payroll_Report_${selectedMonth.replace(' ', '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0061E0]" size={32} /></div>;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Reports</h1>
          <p className="text-sm text-gray-500">Analyze salary distributions and historical trends.</p>
        </div>
        <div className="flex gap-2">
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-[#0061E0]/20">
            {MONTH_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <button onClick={exportCSV} className="flex items-center gap-2 px-5 py-2 bg-[#0061E0] text-white rounded-xl font-bold shadow-lg hover:bg-[#0052cc] transition-all">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Net Payout', val: totalNet, color: 'text-[#0061E0]' },
          { label: 'Total Gross Pay', val: totalGross, color: 'text-gray-900' },
          { label: 'Total Deductions', val: totalDeductions, color: 'text-rose-500' },
          { label: 'Total Employer CTC', val: totalCTC, color: 'text-emerald-600' }
        ].map((c, i) => (
           <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{c.label}</p>
              <p className={`text-2xl font-bold mt-2 ${c.color}`}>₹{fmt(c.val)}</p>
           </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-96">
        <div className="flex items-center gap-2 mb-6">
           <TrendingUp size={20} className="text-[#0061E0]" />
           <h3 className="font-bold text-gray-900 text-lg">Historical Payout Trends</h3>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0061E0" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0061E0" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#cbd5e1" fontSize={12} tickLine={false} />
              <YAxis stroke="#cbd5e1" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <Tooltip formatter={(value) => `₹${fmt(value)}`} />
              <Area type="monotone" dataKey="Net" stroke="#0061E0" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">No data available for chart</div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50"><h3 className="font-bold text-gray-900">Summary for {selectedMonth}</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-b border-gray-100 text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Gross Earnings</th>
                <th className="px-6 py-4">Deductions</th>
                <th className="px-6 py-4">Net Salary</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {monthData.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{p.employeeName}</td>
                  <td className="px-6 py-4 text-gray-600">₹{fmt(p.totalEarnings)}</td>
                  <td className="px-6 py-4 text-rose-500">₹{fmt(p.totalDeductions)}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">₹{fmt(p.netSalary)}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${p.status==='PAID'?'bg-emerald-50 text-emerald-600':'bg-amber-50 text-amber-600'}`}>{p.status}</span></td>
                </tr>
              ))}
              {monthData.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-500">No payroll processed for {selectedMonth}.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
