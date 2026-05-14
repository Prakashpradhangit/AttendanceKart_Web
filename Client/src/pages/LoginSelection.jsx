import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

const LoginSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center p-4 lg:p-8 font-poppins">
      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side - Hero Section */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col gap-8"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
               <img src="/logo-removebg-preview.png" alt="AttendanceKart Logo" className="h-16 w-auto" />
            </div>
            <h1 className="text-5xl font-semibold text-[#1E293B] leading-tight">
              AttendanceKart <br />
              <span className="text-[#3B82F6]">Smart HR Solutions.</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-4">
            {[
              "Bio-metric Sync",
              "One-Click Payroll",
              "Leave Management"
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-sm border border-blue-100">
                <CheckCircle2 size={18} className="text-[#3B82F6]" />
                <span className="text-[#1E293B] font-medium text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <div className="relative mt-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-[2.5rem] blur-xl opacity-50"></div>
            <img 
              src="/register_ui.jpeg" 
              alt="Dashboard Preview" 
              className="relative w-full rounded-[2rem] shadow-2xl border-4 border-white"
            />
          </div>
        </motion.div>

        {/* Right Side - Selection Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="bg-white w-full max-w-[420px] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-7 lg:p-9 relative overflow-hidden text-center">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 opacity-50"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col items-center mb-8">
                <div className="relative mb-5">
                  <div className="w-16 h-16 bg-[#F0F7FF] rounded-full flex items-center justify-center border border-blue-100 shadow-inner">
                    <ShieldCheck size={32} className="text-[#3B82F6]" />
                  </div>
                </div>
                <h2 className="text-2xl font-semibold text-[#1E293B] mb-2">
                  Select <span className="text-[#3B82F6]">Login Type</span>
                </h2>
                <p className="text-[#64748B] text-sm font-medium max-w-[280px]">
                  Please choose your account type to proceed to the login page.
                </p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => navigate('/admin/login')}
                  className="w-full flex items-center justify-between p-5 rounded-2xl border-2 border-[#E2E8F0] hover:border-[#3B82F6] bg-[#F8FAFC] hover:bg-blue-50/50 transition-all group"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="text-[#3B82F6]" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1E293B]">Admin Login</h3>
                      <p className="text-xs text-[#64748B] font-medium">Manage organization & payroll</p>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-[#94A3B8] group-hover:text-[#3B82F6] transition-colors" />
                </button>

                <button 
                  onClick={() => navigate('/employee/login')}
                  className="w-full flex items-center justify-between p-5 rounded-2xl border-2 border-[#E2E8F0] hover:border-[#3B82F6] bg-[#F8FAFC] hover:bg-blue-50/50 transition-all group"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                      <User className="text-[#3B82F6]" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1E293B]">Employee Login</h3>
                      <p className="text-xs text-[#64748B] font-medium">View attendance & profile</p>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-[#94A3B8] group-hover:text-[#3B82F6] transition-colors" />
                </button>

              </div>

              <p className="text-center mt-10 text-[#64748B] text-xs font-medium">
                Need help? <a href="#" className="text-[#3B82F6] font-semibold hover:underline">Support Center</a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginSelection;
