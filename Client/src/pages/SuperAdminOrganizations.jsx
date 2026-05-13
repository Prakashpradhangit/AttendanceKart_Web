import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Building2, MoreVertical, ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OrganizationForm from '../components/OrganizationForm';

const SuperAdminOrganizations = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOrg, setEditingOrg] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      }
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const mapDuration = (durationStr) => {
    if (durationStr === '1 Year') return 'ONE_YEAR';
    if (durationStr === '2 Years') return 'TWO_YEAR';
    if (durationStr === '3 Years') return 'THREE_YEAR';
    return 'ONE_YEAR';
  };

  const handleAddOrganization = async (newOrg) => {
    try {
      const token = localStorage.getItem('token');
      const adminData = {
        name: newOrg.adminName,
        email: newOrg.orgEmail,
        organisation_name: newOrg.orgName,
        slug: newOrg.slug,
        phone_number: newOrg.contactNumber,
        subscription_year: mapDuration(newOrg.duration),
        starting_date: newOrg.startDate,
        status: newOrg.status || 'Active'
      };

      if (newOrg.orgPassword) {
        adminData.password = newOrg.orgPassword;
      }

      const method = editingOrg ? 'PUT' : 'POST';
      const url = editingOrg ? `/api/admin/${editingOrg.id}` : '/api/admin';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminData)
      });

      if (response.ok) {
        fetchOrganizations();
        setIsModalOpen(false);
        setEditingOrg(null);
      } else {
        const errData = await response.text();
        console.error('Failed to save organization:', errData);
      }
    } catch (err) {
      console.error('Failed to save organization:', err);
    }
  };

  const handleDeleteOrganization = async (id) => {
    if (!window.confirm('Are you sure you want to delete this organization?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchOrganizations();
      } else {
        console.error('Failed to delete organization');
      }
    } catch (err) {
      console.error('Failed to delete organization:', err);
    }
  };

  const openEditModal = (org) => {
    setEditingOrg(org);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#1E293B] tracking-tight">Organization Management</h1>
          <p className="text-gray-500 mt-1 font-medium">Overview and control of all registered companies</p>
        </div>
        <button 
          onClick={() => {
            setEditingOrg(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-[#3B82F6] text-white px-6 py-3.5 rounded-2xl font-semibold shadow-lg shadow-blue-500/20 hover:bg-[#2563EB] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
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
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-all border border-gray-100">
            <Filter size={18} />
            <span>Filter</span>
          </button>
          <select className="flex-1 md:flex-none px-4 py-3 bg-gray-50 text-gray-600 rounded-xl font-semibold text-sm outline-none border border-gray-100 focus:border-[#3B82F6] transition-all cursor-pointer">
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
              <tr className="text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-50 bg-gray-50/30">
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
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#3B82F6] font-bold border border-blue-100 shadow-sm group-hover:scale-110 transition-transform">
                        {org.organisation_name ? org.organisation_name.charAt(0) : 'O'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1E293B] group-hover:text-[#3B82F6] transition-colors">{org.organisation_name}</p>
                        <p className="text-xs text-gray-400 font-medium">{org.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-semibold text-[#1E293B]">{org.name}</p>
                    <p className="text-xs text-gray-400 font-medium">Joined {org.starting_date}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md uppercase tracking-tighter">/{org.slug}</span>
                  </td>
                  <td className="px-8 py-5 text-sm font-semibold text-[#1E293B]">N/A</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      org.status === 'Inactive' 
                        ? 'bg-rose-100 text-rose-600' 
                        : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {org.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 relative">
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === org.id ? null : org.id)}
                        className="p-2 text-gray-400 hover:text-[#3B82F6] hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <MoreVertical size={18} />
                      </button>

                      <AnimatePresence>
                        {activeMenuId === org.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 z-20 flex items-center gap-1"
                            >
                              <button 
                                onClick={() => openEditModal(org)}
                                title="Edit Organization"
                                className="p-2 text-gray-600 hover:bg-blue-50 hover:text-[#3B82F6] rounded-lg transition-all flex items-center justify-center"
                              >
                                <Edit2 size={18} />
                              </button>
                              <div className="w-px h-4 bg-gray-100 mx-0.5" />
                              <button 
                                onClick={() => handleDeleteOrganization(org.id)}
                                title="Delete Organization"
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all flex items-center justify-center"
                              >
                                <Trash2 size={18} />
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
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
          <h3 className="text-xl font-semibold text-gray-400">No Organizations Found</h3>
          <p className="text-gray-400 mt-1">Start by adding your first organization.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-6 text-[#3B82F6] font-semibold hover:underline"
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
            onClose={() => {
              setIsModalOpen(false);
              setEditingOrg(null);
            }} 
            onSubmit={handleAddOrganization}
            initialData={editingOrg}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuperAdminOrganizations;
