import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EmployeeForm = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const initialFormState = {
    empId: '',
    name: '',
    email: '',
    phone: '',
    department: 'Development',
    role: '',
    password: '',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Active'
  };

  const [formData, setFormData] = useState(initialData || initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowPassword(false);
      setOtp('');
      setVerificationToken('');
      setOtpMessage('');
      if (initialData) {
        setFormData({
          ...initialData,
          empId: initialData.empId || initialData.id || '',
          password: initialData.password || '',
          status: initialData.status || 'Active'
        });
      } else {
        setFormData(initialFormState);
      }
    }
  }, [isOpen, initialData]);

  const requestOtp = async () => {
    if (!formData.email) {
      setOtpMessage('Enter email first.');
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
        body: JSON.stringify({ email: formData.email, purpose: 'EMPLOYEE_REGISTRATION' })
      });
      if (!res.ok) throw new Error(await res.text());
      setOtpMessage('OTP sent to employee email.');
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
        body: JSON.stringify({ email: formData.email, purpose: 'EMPLOYEE_REGISTRATION', otp })
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
      setOtpMessage('Verify email OTP before adding employee.');
      return;
    }
    onSubmit({ ...formData, emailVerificationToken: verificationToken });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-semibold text-gray-900">{initialData ? 'Edit Employee' : 'Add New Employee'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <div className="relative">
              <input 
                required={!initialData}
                type={showPassword ? "text" : "password"} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 pr-12 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Full Name</label>
            <input 
              required
              type="text" 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="John Doe"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Email</label>
              <input 
                required
                type="email" 
                className={`w-full border border-gray-200 rounded-xl py-3 px-4 outline-none transition-all ${
                  initialData ? 'bg-gray-100 text-gray-500 cursor-not-allowed font-semibold' : 'bg-gray-50 focus:ring-2 focus:ring-primary/20'
                }`}
                value={formData.email}
                onChange={(e) => {
                  if (initialData) return;
                  setFormData({...formData, email: e.target.value});
                  setVerificationToken('');
                  setOtp('');
                  setOtpMessage('');
                }}
                placeholder="john@example.com"
                disabled={!!initialData}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Phone</label>
              <input 
                required
                type="tel" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+1 234 567 890"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Department</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              >
                <option>Development</option>
                <option>Design</option>
                <option>HR</option>
                <option>Marketing</option>
                <option>Sales</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Role</label>
              <input 
                required
                type="text" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                placeholder="Software Engineer"
              />
            </div>
          </div>

          {!initialData && (
            <div className="space-y-2 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
              <label className="text-sm font-semibold text-gray-700">Email OTP Verification</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="min-w-0 flex-1 bg-white border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="6 digit OTP"
                />
                <button
                  type="button"
                  onClick={requestOtp}
                  disabled={isSendingOtp || !!verificationToken}
                  className="px-3 py-2 bg-white border border-blue-200 text-blue-600 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {isSendingOtp ? 'Sending' : 'Send'}
                </button>
                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={isVerifyingOtp || !!verificationToken}
                  className="px-3 py-2 bg-primary text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {verificationToken ? 'Verified' : isVerifyingOtp ? 'Checking' : 'Verify'}
                </button>
              </div>
              {otpMessage && <p className="text-xs font-semibold text-gray-500">{otpMessage}</p>}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Joining Date</label>
            <input 
              required
              type="date" 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={formData.joiningDate}
              onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
            />
          </div>

          {initialData && (
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Status</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-colors"
            >
              {initialData ? 'Update' : 'Add Employee'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EmployeeForm;
