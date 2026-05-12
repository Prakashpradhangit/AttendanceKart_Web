import React, { useState } from 'react';
import { Mail, Lock, LogIn, ShieldAlert, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SuperAdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.role === 'SUPER_ADMIN') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/superadmin/dashboard');
      } else {
        setError(data.error || 'Invalid credentials or unauthorized access.');
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#F0F7FF] flex items-center justify-center p-4 lg:p-8 font-poppins overflow-hidden">
      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-8 items-center h-full">
        
        {/* Left Side - Hero Section */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col gap-4 items-center h-full justify-center"
        >
          <div className="flex flex-col items-center mb-1">
            <img src="/logo-removebg-preview.png" alt="AttendanceKart Logo" className="h-44 w-auto object-contain" />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-[#1E293B] leading-tight text-center">
              AttendanceKart <br />
              <span className="text-[#3B82F6]">Super Admin Portal.</span>
            </h1>
          </div>

          <div className="flex flex-row items-center gap-4">
            {[
              "Multi-Tenant Support",
              "Payment Processing",
              "Global Settings"
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-blue-100 whitespace-nowrap">
                <CheckCircle2 size={16} className="text-[#3B82F6]" />
                <span className="text-[#1E293B] font-bold text-xs">{feature}</span>
              </div>
            ))}
          </div>

          <div className="relative mt-2 w-full max-w-lg">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-[2.5rem] blur-xl opacity-50"></div>
            <img 
              src="/register_ui.jpeg" 
              alt="Super Admin Dashboard Preview" 
              className="relative w-full rounded-[2rem] shadow-2xl border-4 border-white object-cover max-h-[350px]"
            />
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="bg-white w-full max-w-[420px] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-7 lg:p-9 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 opacity-50"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col items-center mb-8 text-center">
                <div className="relative mb-5">
                  <div className="w-16 h-16 bg-[#F0F7FF] rounded-full flex items-center justify-center border border-blue-100 shadow-inner">
                    <ShieldAlert size={32} className="text-[#3B82F6]" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#3B82F6] rounded-full border-[3px] border-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-[#1E293B] mb-1.5">
                  Super Admin <span className="text-[#3B82F6]">Access</span>
                </h2>
                <p className="text-[#64748B] text-sm font-medium">
                  Secure login for platform administrators
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs font-medium text-center">
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-[#1E293B] ml-1">Admin Email</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#3B82F6] transition-colors">
                      <Mail size={18} />
                    </div>
                    <input 
                      type="email" 
                      placeholder="admin@attendancekart.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-50 transition-all font-medium text-[#1E293B] text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-[#1E293B] ml-1">Master Password</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#3B82F6] transition-colors">
                      <Lock size={18} />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-50 transition-all font-medium text-[#1E293B] text-sm"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#3B82F6] transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                      />
                      <div className={`w-4.5 h-4.5 rounded border transition-all flex items-center justify-center ${rememberMe ? 'bg-[#3B82F6] border-[#3B82F6]' : 'bg-white border-[#CBD5E1] group-hover:border-[#3B82F6]'}`}>
                        {rememberMe && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                    </div>
                    <span className="text-xs font-medium text-[#64748B]">Trusted device</span>
                  </label>
                  <a href="#" className="text-xs font-bold text-[#3B82F6] hover:underline">Forgot Access Key?</a>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2563EB] text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2.5 hover:bg-[#1D4ED8] transition-all shadow-[0_10px_25px_rgba(37,99,235,0.25)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.3)] transform hover:-translate-y-0.5 active:translate-y-0 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <ShieldAlert size={16} />
                  <span>{loading ? 'Authenticating...' : 'Enter Super Admin Dashboard'}</span>
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>

              {/* Footer text */}
              <p className="text-center mt-8 text-[#64748B] text-xs font-medium">
                Authorized Personnel Only. <a href="/" className="text-[#3B82F6] font-bold hover:underline">Back to Main</a>
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default SuperAdminLogin;
