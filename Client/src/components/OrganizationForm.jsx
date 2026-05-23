import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OrganizationForm = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const initialFormState = {
    orgName: '',
    shortForm: '',
    adminName: '',
    slug: '',
    startDate: new Date().toISOString().split('T')[0],
    duration: '1 Year',
    totalUsers: '',
    contactNumber: '',
    orgEmail: '',
    orgPassword: '',
    status: 'Active'
  };

  const [formData, setFormData] = useState(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          orgName: initialData.organisation_name || '',
          shortForm: initialData.short_form || '',
          adminName: initialData.name || '',
          slug: initialData.slug || '',
          startDate: initialData.starting_date || new Date().toISOString().split('T')[0],
          duration: initialData.subscription_year === 'ONE_YEAR' ? '1 Year' : 
                    initialData.subscription_year === 'TWO_YEAR' ? '2 Years' : 
                    initialData.subscription_year === 'THREE_YEAR' ? '3 Years' : '1 Year',
          totalUsers: initialData.maxUsers || '',
          contactNumber: initialData.phone_number || '',
          orgEmail: initialData.email || '',
          orgPassword: '' // Keep password empty for security during edit
        });
      } else {
        setFormData(initialFormState);
      }
      setShowPassword(false);
      setOtp('');
      setVerificationToken('');
      setOtpMessage('');
    }
  }, [isOpen, initialData]);

  const requestOtp = async () => {
    if (!formData.orgEmail) {
      setOtpMessage('Enter organization email first.');
      return;
    }

    setIsSendingOtp(true);
    setOtpMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/email-otp/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: formData.orgEmail, purpose: 'ADMIN_REGISTRATION' })
      });
      if (!res.ok) throw new Error(await res.text());
      setOtpMessage('OTP sent to organization email.');
    } catch (err) {
      setOtpMessage(err.message || 'Failed to send OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      setOtpMessage('Enter OTP first.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/email-otp/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: formData.orgEmail, purpose: 'ADMIN_REGISTRATION', otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP.');
      setVerificationToken(data.verificationToken);
      setOtpMessage('Email verified.');
    } catch (err) {
      setVerificationToken('');
      setOtpMessage(err.message || 'Failed to verify OTP.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!initialData && !verificationToken) {
      setOtpMessage('Verify email OTP before registering organization.');
      return;
    }
    onSubmit({ ...formData, emailVerificationToken: verificationToken });
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
            <h2 className="text-2xl font-semibold text-[#1E293B]">{initialData ? 'Edit Organization' : 'Add New Organization'}</h2>
            <p className="text-sm text-gray-500 font-medium">{initialData ? 'Update organizational details' : 'Register a new company on the platform'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Organization Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#1E293B] ml-1">Organization Name</label>
              <input 
                required
                type="text" 
                disabled={!!initialData}
                className={`w-full border border-gray-200 rounded-2xl py-3.5 px-4 outline-none transition-all font-medium text-sm ${
                  initialData ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6]'
                }`}
                value={formData.orgName}
                onChange={(e) => setFormData({...formData, orgName: e.target.value})}
                placeholder="e.g. Acme Corp"
              />
            </div>

            {/* Organization Short Form */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#1E293B] ml-1">Organization Short Form (e.g. SVT)</label>
              <input 
                required
                type="text" 
                disabled={!!initialData}
                className={`w-full border border-gray-200 rounded-2xl py-3.5 px-4 outline-none transition-all font-medium text-sm ${
                  initialData ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6]'
                }`}
                value={formData.shortForm}
                onChange={(e) => setFormData({...formData, shortForm: e.target.value.trim().toUpperCase()})}
                placeholder="e.g. SVT"
              />
            </div>

            {/* Admin Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#1E293B] ml-1">Admin Name</label>
              <input 
                required
                type="text" 
                disabled={!!initialData}
                className={`w-full border border-gray-200 rounded-2xl py-3.5 px-4 outline-none transition-all font-medium text-sm ${
                  initialData ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6]'
                }`}
                value={formData.adminName}
                onChange={(e) => setFormData({...formData, adminName: e.target.value})}
                placeholder="Primary Admin Name"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#1E293B] ml-1">Slug (URL Identifier)</label>
              <input 
                required
                type="text" 
                disabled={!!initialData}
                className={`w-full border border-gray-200 rounded-2xl py-3.5 px-4 outline-none transition-all font-medium text-sm ${
                  initialData ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6]'
                }`}
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                placeholder="acme-corp"
              />
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#1E293B] ml-1">Start Date</label>
              <input 
                required
                type="date" 
                className="w-full bg-gray-100 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none text-gray-500 cursor-not-allowed font-semibold text-sm"
                value={formData.startDate}
                disabled
              />
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#1E293B] ml-1">Duration</label>
              <select 
                disabled={!!initialData}
                className={`w-full border border-gray-200 rounded-2xl py-3.5 px-4 outline-none transition-all font-medium text-sm ${
                  initialData ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6]'
                }`}
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
              <label className="text-sm font-semibold text-[#1E293B] ml-1">Total Users Allowed</label>
              <input 
                required
                type="number" 
                className="w-full border border-gray-200 rounded-2xl py-3.5 px-4 outline-none transition-all font-medium text-sm bg-gray-50 focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6]"
                value={formData.totalUsers}
                onChange={(e) => setFormData({...formData, totalUsers: e.target.value})}
                placeholder="e.g. 100"
              />
            </div>

            {/* Contact Number */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#1E293B] ml-1">Contact Number</label>
              <input 
                required
                type="tel" 
                disabled={!!initialData}
                className={`w-full border border-gray-200 rounded-2xl py-3.5 px-4 outline-none transition-all font-medium text-sm ${
                  initialData ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6]'
                }`}
                value={formData.contactNumber}
                onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                placeholder="+1 234 567 890"
              />
            </div>

            {/* Org Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#1E293B] ml-1">Organization Email</label>
              <input 
                required
                type="email" 
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all font-medium text-sm"
                value={formData.orgEmail}
                onChange={(e) => {
                  setFormData({...formData, orgEmail: e.target.value});
                  if (!initialData) {
                    setVerificationToken('');
                    setOtp('');
                    setOtpMessage('');
                  }
                }}
                placeholder="admin@organization.com"
              />
            </div>

            {!initialData && (
              <div className="space-y-2 md:col-span-2 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                <label className="text-sm font-semibold text-[#1E293B] ml-1">Email OTP Verification</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className="min-w-0 flex-1 bg-white border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all font-medium text-sm"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="6 digit OTP"
                  />
                  <button
                    type="button"
                    onClick={requestOtp}
                    disabled={isSendingOtp || !!verificationToken}
                    className="px-4 py-3 bg-white border border-blue-200 text-blue-600 rounded-2xl text-xs font-bold disabled:opacity-50"
                  >
                    {isSendingOtp ? 'Sending' : 'Send OTP'}
                  </button>
                  <button
                    type="button"
                    onClick={verifyOtp}
                    disabled={isVerifyingOtp || !!verificationToken}
                    className="px-4 py-3 bg-[#3B82F6] text-white rounded-2xl text-xs font-bold disabled:opacity-50"
                  >
                    {verificationToken ? 'Verified' : isVerifyingOtp ? 'Checking' : 'Verify'}
                  </button>
                </div>
                {otpMessage && <p className="text-xs font-semibold text-gray-500 ml-1">{otpMessage}</p>}
              </div>
            )}

            {/* Org Password */}
            <div className={`space-y-1.5 ${initialData ? 'md:col-span-1' : 'md:col-span-2'}`}>
              <label className="text-sm font-semibold text-[#1E293B] ml-1">
                Organization Admin Password {initialData && <span className="text-gray-400 font-medium">(Optional)</span>}
              </label>
              <div className="relative">
                <input 
                  required={!initialData}
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

            {/* Status (Only show when editing) */}
            {initialData && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#1E293B] ml-1">Account Status</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all font-medium text-sm cursor-pointer"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-gray-200 rounded-2xl font-semibold text-gray-500 hover:bg-gray-50 transition-all text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-4 bg-[#3B82F6] text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/20 hover:bg-[#2563EB] transition-all text-sm"
            >
              {initialData ? 'Update Organization' : 'Register Organization'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default OrganizationForm;
