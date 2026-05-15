import React, { useState } from 'react';
import { 
  Lock, 
  Bell, 
  User, 
  Smartphone, 
  Shield, 
  Globe, 
  Moon, 
  Sun,
  ChevronRight,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const EmployeeSettings = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const tabs = [
    { id: 'account', label: 'Account & Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  const handleSave = () => {
    setSuccessMessage('Settings saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 font-medium mt-1">Manage your account preferences and security settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-72 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'text-gray-500 hover:bg-white hover:text-blue-600 border border-transparent hover:border-blue-100'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            {/* Tab Title */}
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                {tabs.find(t => t.id === activeTab).label}
              </h2>
              {successMessage && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-green-600 font-bold text-sm"
                >
                  <CheckCircle2 size={18} />
                  {successMessage}
                </motion.div>
              )}
            </div>

            {/* Account & Security */}
            {activeTab === 'account' && (
              <div className="p-8 space-y-10">
                <section>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Change Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 ml-1">Current Password</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? 'text' : 'password'} 
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-semibold transition-all"
                          placeholder="••••••••"
                        />
                        <button 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="hidden md:block"></div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 ml-1">New Password</label>
                      <input 
                        type="password" 
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-semibold transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 ml-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-semibold transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </section>

                <section className="pt-10 border-t border-gray-50">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-2xl">
                        <Smartphone className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">SMS Authentication</p>
                        <p className="text-xs text-gray-500 mt-1 font-medium">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </section>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="p-8 space-y-6">
                <NotificationToggle 
                  title="Attendance Reminders" 
                  desc="Get notified if you forget to check-in or check-out" 
                  defaultChecked={true}
                />
                <NotificationToggle 
                  title="Leave Status Updates" 
                  desc="Notifications for leave approval or rejection" 
                  defaultChecked={true}
                />
                <NotificationToggle 
                  title="Payroll Notifications" 
                  desc="Alert when your monthly payslip is generated" 
                  defaultChecked={false}
                />
                <NotificationToggle 
                  title="Company Announcements" 
                  desc="Important news and updates from HR" 
                  defaultChecked={true}
                />
              </div>
            )}

            {/* Privacy */}
            {activeTab === 'privacy' && (
              <div className="p-8 space-y-6">
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                  <h3 className="text-sm font-bold text-gray-900">Profile Visibility</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-md">
                      Show your mobile number and email to other employees in the organizational directory.
                    </p>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                
                <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl flex items-start gap-4">
                  <AlertCircle className="text-rose-600 shrink-0" size={24} />
                  <div>
                    <h3 className="text-sm font-bold text-rose-900">Data Export</h3>
                    <p className="text-xs text-rose-700 mt-1 font-medium leading-relaxed">
                      Request a full copy of all your data stored in AttendanceKart. This request will be processed by HR within 48 hours.
                    </p>
                    <button className="mt-4 px-6 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors">
                      Request Data Export
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences */}
            {activeTab === 'preferences' && (
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block ml-1">Language</label>
                    <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-semibold transition-all appearance-none">
                      <option>English (India)</option>
                      <option>English (US)</option>
                      <option>Hindi (India)</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block ml-1">Timezone</label>
                    <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-semibold transition-all appearance-none">
                      <option>(GMT+05:30) Mumbai, New Delhi</option>
                      <option>(GMT+00:00) London, UTC</option>
                      <option>(GMT-05:00) New York, EST</option>
                    </select>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-50">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Interface Theme</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="flex flex-col items-center gap-3 p-6 rounded-3xl border-2 border-blue-600 bg-blue-50/50">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md">
                        <Sun className="text-yellow-500" />
                      </div>
                      <span className="text-sm font-bold text-gray-900">Light Mode</span>
                    </button>
                    <button className="flex flex-col items-center gap-3 p-6 rounded-3xl border-2 border-gray-100 hover:border-gray-200 transition-all">
                      <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center shadow-md">
                        <Moon className="text-blue-400" />
                      </div>
                      <span className="text-sm font-bold text-gray-500">Dark Mode</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Save Bar */}
            <div className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500 font-medium italic">Last updated: 14 May 2026, 12:45 PM</p>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-[20px] font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
              >
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationToggle = ({ title, desc, defaultChecked }) => (
  <div className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl hover:border-blue-100 hover:bg-blue-50/10 transition-all">
    <div className="flex items-center gap-4">
      <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
      <div>
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-1 font-medium">{desc}</p>
      </div>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  </div>
);

export default EmployeeSettings;
