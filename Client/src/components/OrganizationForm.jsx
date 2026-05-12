import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OrganizationForm = ({ isOpen, onClose, onSubmit }) => {
  const initialFormState = {
    orgName: '',
    adminName: '',
    slug: '',
    startDate: new Date().toISOString().split('T')[0],
    duration: '1 Year',
    totalUsers: '',
    contactNumber: '',
    orgEmail: '',
    orgPassword: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      setShowPassword(false);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100"
      >
        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <div>
            <h2 className="text-2xl font-bold text-[#1E293B]">Add New Organization</h2>
            <p className="text-sm text-gray-500 font-medium">Register a new company on the platform</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Organization Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1E293B] ml-1">Organization Name</label>
              <input 
                required
                type="text" 
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all font-medium text-sm"
                value={formData.orgName}
                onChange={(e) => setFormData({...formData, orgName: e.target.value})}
                placeholder="e.g. Acme Corp"
              />
            </div>

            {/* Admin Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1E293B] ml-1">Admin Name</label>
              <input 
                required
                type="text" 
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all font-medium text-sm"
                value={formData.adminName}
                onChange={(e) => setFormData({...formData, adminName: e.target.value})}
                placeholder="Primary Admin Name"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1E293B] ml-1">Slug (URL Identifier)</label>
              <input 
                required
                type="text" 
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all font-medium text-sm"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                placeholder="acme-corp"
              />
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1E293B] ml-1">Start Date</label>
              <input 
                required
                type="date" 
                className="w-full bg-gray-100 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none text-gray-500 cursor-not-allowed font-bold text-sm"
                value={formData.startDate}
                disabled
              />
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1E293B] ml-1">Duration</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all font-medium text-sm"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
              >
                <option>6 Months</option>
                <option>1 Year</option>
                <option>2 Years</option>
                <option>3 Years</option>
              </select>
            </div>

            {/* Total User */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1E293B] ml-1">Total Users Allowed</label>
              <input 
                required
                type="number" 
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all font-medium text-sm"
                value={formData.totalUsers}
                onChange={(e) => setFormData({...formData, totalUsers: e.target.value})}
                placeholder="e.g. 100"
              />
            </div>

            {/* Contact Number */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1E293B] ml-1">Contact Number</label>
              <input 
                required
                type="tel" 
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all font-medium text-sm"
                value={formData.contactNumber}
                onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                placeholder="+1 234 567 890"
              />
            </div>

            {/* Org Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1E293B] ml-1">Organization Email</label>
              <input 
                required
                type="email" 
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all font-medium text-sm"
                value={formData.orgEmail}
                onChange={(e) => setFormData({...formData, orgEmail: e.target.value})}
                placeholder="admin@organization.com"
              />
            </div>

            {/* Org Password */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-bold text-[#1E293B] ml-1">Organization Admin Password</label>
              <div className="relative">
                <input 
                  required
                  type={showPassword ? "text" : "password"} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 pr-12 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all font-medium text-sm"
                  value={formData.orgPassword}
                  onChange={(e) => setFormData({...formData, orgPassword: e.target.value})}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3B82F6] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-4 bg-[#3B82F6] text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:bg-[#2563EB] transition-all text-sm"
            >
              Register Organization
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default OrganizationForm;
