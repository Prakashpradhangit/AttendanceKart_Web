import React, { useState, useEffect } from 'react';
import { Bell, User, Menu, Users, UserCircle, Paperclip, Send, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmployees } from '../context/EmployeeContext';

const colors = [
  'bg-indigo-600 text-white shadow-indigo-100',
  'bg-emerald-600 text-white shadow-emerald-100',
  'bg-amber-600 text-white shadow-amber-100',
  'bg-rose-600 text-white shadow-rose-100',
  'bg-sky-600 text-white shadow-sky-100',
  'bg-purple-600 text-white shadow-purple-100',
  'bg-teal-600 text-white shadow-teal-100'
];

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
  return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
};

const getColorClass = (name) => {
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const Navbar = ({ onMenuClick }) => {
  const { activeChat, setActiveChat, selectedEmployee, setSelectedEmployee } = useEmployees();
  const [showNotifications, setShowNotifications] = useState(false);
  const [message, setMessage] = useState('');
  const notificationRef = React.useRef(null);
  
  const [profile, setProfile] = useState({
    name: localStorage.getItem('name') || 'User',
    role: localStorage.getItem('role') || 'Guest',
    employeeCode: localStorage.getItem('employeeCode') || ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          // Sync with localStorage for other components
          localStorage.setItem('name', data.name);
          localStorage.setItem('role', data.role);
          if (data.employeeCode) localStorage.setItem('employeeCode', data.employeeCode);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };

    fetchProfile();
  }, []);

  const { name: userName, role: userRole, employeeCode } = profile;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Floating Chat Bar - Moved outside header for better viewport positioning */}
      <AnimatePresence>
        {activeChat && (
          <motion.div
            initial={{ y: 50, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            exit={{ y: 50, opacity: 0, x: '-50%' }}
            className="fixed bottom-10 left-1/2 w-[95%] max-w-xl bg-white/90 backdrop-blur-3xl border border-white/50 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[100] p-2 flex items-center gap-2"
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${activeChat === 'team' ? 'bg-primary text-white shadow-primary/20' : 'bg-green-500 text-white shadow-green-500/20'}`}>
              {activeChat === 'team' ? <Users size={18} /> : <UserCircle size={18} />}
            </div>
            
            <div className="flex-1 min-w-0">
               <input 
                 type="text"
                 autoFocus
                 value={message}
                 onChange={(e) => setMessage(e.target.value)}
                 placeholder={activeChat === 'team' ? "Broadcast to team..." : `Message ${selectedEmployee?.name || 'employee'}...`}
                 className="w-full bg-transparent border-none outline-none px-2 py-2 text-sm font-bold text-gray-900 placeholder:text-gray-400"
                 onKeyPress={(e) => e.key === 'Enter' && (alert('Message sent!'), setMessage(''), setActiveChat(null), setSelectedEmployee(null))}
               />
            </div>

            <div className="flex items-center gap-1">
               <button className="p-2 text-gray-400 hover:text-primary transition-colors hidden sm:block">
                  <Paperclip size={18} />
               </button>
               <button 
                 onClick={() => {
                   if (message.trim()) {
                     alert('Message sent!');
                     setMessage('');
                     setActiveChat(null);
                     setSelectedEmployee(null);
                   }
                 }}
                 className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
               >
                  <Send size={18} />
               </button>
               <button 
                 onClick={() => {
                    setActiveChat(null);
                    setSelectedEmployee(null);
                 }}
                 className="p-2 text-gray-400 hover:text-red-500 transition-colors"
               >
                  <X size={20} />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="h-20 bg-white/40 backdrop-blur-md border-b border-white/20 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">

      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-3 lg:gap-6">
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2.5 transition-all duration-300 rounded-2xl ${
              showNotifications 
                ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                : 'text-gray-500 hover:bg-white/60'
            }`}
          >
            <Bell size={20} />
            <span className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full border-2 border-white ${showNotifications ? 'bg-white' : 'bg-red-500'}`}></span>
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute right-0 mt-3 w-[280px] sm:w-[320px] bg-white/95 backdrop-blur-2xl border border-white/50 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden z-[100] p-2"
              >
                <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                   <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Communications</h3>
                   <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                     <X size={16} />
                   </button>
                </div>
                
                <div className="p-2 space-y-2">
                   <button 
                     onClick={() => {
                        setActiveChat('team');
                        setShowNotifications(false);
                     }}
                     className="w-full flex items-center gap-4 p-4 rounded-3xl hover:bg-primary/5 transition-all group"
                   >
                     <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Users size={20} />
                     </div>
                     <div className="text-left flex-1">
                        <p className="text-sm font-black text-gray-900">Chat with Team</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Broadcast</p>
                     </div>
                     <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
                   </button>

                   <button 
                     onClick={() => {
                        setActiveChat('employee');
                        setShowNotifications(false);
                     }}
                     className="w-full flex items-center gap-4 p-4 rounded-3xl hover:bg-primary/5 transition-all group"
                   >
                     <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                        <UserCircle size={20} />
                     </div>
                     <div className="text-left flex-1">
                        <p className="text-sm font-black text-gray-900">Direct Message</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Separate Employee</p>
                     </div>
                     <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
                   </button>
                </div>

                <div className="bg-gray-50/50 p-3 flex justify-center">
                   <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                      View All Notifications
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex items-center gap-3 pl-3 lg:pl-6 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">
              {userRole === 'USER' ? 'Employee' : userName}
            </p>
            <p className="text-xs text-gray-500">
              {userRole === 'USER' ? `${userName} ${employeeCode ? `(${employeeCode})` : ''}` : userRole.replace('_', ' ')}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border border-gray-100 shadow-sm shrink-0 ${getColorClass(userName)}`}>
             {getInitials(userName)}
          </div>
        </div>
      </div>
    </header>
    </>
  );
};

export default Navbar;
