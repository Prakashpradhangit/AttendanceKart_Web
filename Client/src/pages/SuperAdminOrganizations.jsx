import React, { useState } from 'react';
import { Plus, Search, Filter, Building2, MoreVertical, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OrganizationForm from '../components/OrganizationForm';

const SuperAdminOrganizations = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [organizations, setOrganizations] = useState([
    { id: 1, name: 'Global Tech Solutions', admin: 'John Doe', slug: 'global-tech', joined: '2024-05-10', users: 450, status: 'Active', email: 'admin@globaltech.com' },
    { id: 2, name: 'Creative Minds Agency', admin: 'Jane Smith', slug: 'creative-minds', joined: '2024-05-12', users: 120, status: 'Pending', email: 'jane@creativeminds.com' },
    { id: 3, name: 'HealthCare Plus', admin: 'Robert Brown', slug: 'healthcare-plus', joined: '2024-04-28', users: 890, status: 'Active', email: 'robert@healthcare.com' },
  ]);

  const handleAddOrganization = (newOrg) => {
    const orgEntry = {
      id: organizations.length + 1,
      name: newOrg.orgName,
      admin: newOrg.adminName,
      slug: newOrg.slug,
      joined: newOrg.startDate,
      users: newOrg.totalUsers,
      status: 'Active',
      email: newOrg.orgEmail
    };
    setOrganizations([orgEntry, ...organizations]);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Organization Management</h1>
          <p className="text-gray-500 mt-1 font-medium">Overview and control of all registered companies</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#3B82F6] text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:bg-[#2563EB] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={20} />
          <span>Add Organization</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3B82F6] transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search organizations, admins, or slugs..." 
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-4 outline-none focus:bg-white focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all border border-gray-100">
            <Filter size={18} />
            <span>Filter</span>
          </button>
          <select className="flex-1 md:flex-none px-4 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm outline-none border border-gray-100 focus:border-[#3B82F6] transition-all cursor-pointer">
            <option>All Status</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50 bg-gray-50/30">
                <th className="px-8 py-5">Organization Info</th>
                <th className="px-8 py-5">Primary Admin</th>
                <th className="px-8 py-5">Slug</th>
                <th className="px-8 py-5">Users</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#3B82F6] font-black border border-blue-100 shadow-sm group-hover:scale-110 transition-transform">
                        {org.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1E293B] group-hover:text-[#3B82F6] transition-colors">{org.name}</p>
                        <p className="text-xs text-gray-400 font-medium">{org.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-[#1E293B]">{org.admin}</p>
                    <p className="text-xs text-gray-400 font-medium">Joined {org.joined}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-black text-gray-400 bg-gray-100 px-2 py-1 rounded-md uppercase tracking-tighter">/{org.slug}</span>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-[#1E293B]">{org.users}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      org.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 
                      org.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {org.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-[#3B82F6] hover:bg-blue-50 rounded-lg transition-all">
                        <ExternalLink size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-[#3B82F6] hover:bg-blue-50 rounded-lg transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State (if no orgs) */}
      {organizations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Building2 className="text-gray-300" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-400">No Organizations Found</h3>
          <p className="text-gray-400 mt-1">Start by adding your first organization.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-6 text-[#3B82F6] font-bold hover:underline"
          >
            Add Organization Now
          </button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <OrganizationForm 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSubmit={handleAddOrganization}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuperAdminOrganizations;
