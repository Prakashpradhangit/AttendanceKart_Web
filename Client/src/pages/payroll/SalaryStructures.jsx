import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, ArrowRight, Settings } from 'lucide-react';

export default function SalaryStructures() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/payroll/employees', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setEmployees(await res.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchEmployees();
  }, []);

  const filtered = employees.filter(e => 
    !search || e.name?.toLowerCase().includes(search.toLowerCase()) || 
    e.employeeCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salary Structures</h1>
          <p className="text-sm text-gray-500 mt-1">Manage individual employee salary configurations</p>
        </div>
        <button onClick={() => navigate('/admin/payroll/templates')} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all flex items-center gap-2">
           Templates
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search employees..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0061E0]/20"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0061E0]" size={32} /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Employee</th>
                <th className="text-left px-4 py-4 font-semibold text-gray-600">Employee Code</th>
                <th className="text-left px-4 py-4 font-semibold text-gray-600">Designation</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{emp.name}</td>
                  <td className="px-4 py-4 text-gray-500">{emp.employeeCode}</td>
                  <td className="px-4 py-4 text-gray-500">{emp.designation || 'N/A'}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => navigate(`/admin/payroll/structures/${emp.id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0061E0]/10 text-[#0061E0] rounded-lg font-semibold hover:bg-[#0061E0] hover:text-white transition-all"
                    >
                      <Settings size={14} /> Configure
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">No employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
