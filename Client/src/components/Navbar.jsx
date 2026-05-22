import React, { useState, useEffect } from 'react';
import { Bell, User, Menu, Users, UserCircle, Paperclip, Send, X, ChevronRight, Megaphone, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '../context/EmployeeContext';
import { useAlert } from '../context/AlertContext';

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
  const navigate = useNavigate();
  const { showToast } = useAlert();
  const { activeChat, setActiveChat, selectedEmployee, setSelectedEmployee } = useEmployees();
  const [showNotifications, setShowNotifications] = useState(false);
  const [message, setMessage] = useState('');
  const notificationRef = React.useRef(null);
  
  const [profile, setProfile] = useState({
    name: localStorage.getItem('name') || 'User',
    role: localStorage.getItem('role') || 'Guest',
    employeeCode: localStorage.getItem('employeeCode') || ''
  });

  const [notices, setNotices] = useState([]);
  const [activeNotification, setActiveNotification] = useState(null);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [unseenCount, setUnseenCount] = useState(0);

  const updateUnseenCount = (noticeList) => {
    try {
      const stored = localStorage.getItem('seenNoticeIds');
      const seenIds = stored ? JSON.parse(stored) : [];
      const unseen = noticeList.filter(n => !seenIds.includes(n.id));
      setUnseenCount(unseen.length);
    } catch (e) {
      setUnseenCount(0);
    }
  };

  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/notices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotices(data);
        updateUnseenCount(data);
      }
    } catch (err) {
      console.error('Failed to fetch notices:', err);
    }
  };

  const acknowledgeNotice = (id) => {
    try {
      const stored = localStorage.getItem('seenNoticeIds');
      const seenIds = stored ? JSON.parse(stored) : [];
      if (!seenIds.includes(id)) {
        seenIds.push(id);
        localStorage.setItem('seenNoticeIds', JSON.stringify(seenIds));
      }
      setNotices(prev => {
        updateUnseenCount(prev);
        return prev;
      });
    } catch (e) {
      console.error(e);
    }
    setActiveNotification(null);
  };

  useEffect(() => {
    fetchNotices();

    const token = localStorage.getItem('token');
    if (!token) return;

    const eventSource = new EventSource(`/api/notices/stream?token=${encodeURIComponent(token)}`);

    eventSource.addEventListener('NEW_NOTICE', (event) => {
      try {
        const newNotice = JSON.parse(event.data);
        setNotices(prev => {
          const updated = [newNotice, ...prev];
          updateUnseenCount(updated);
          return updated;
        });
        setActiveNotification(newNotice);
      } catch (e) {
        console.error('Failed to parse SSE new notice:', e);
      }
    });

    eventSource.addEventListener('FORCE_LOGOUT', () => {
      eventSource.close();
      localStorage.clear();
      showToast('Your account has been deactivated. Please contact your administrator.', 'error');
      navigate('/login', { replace: true });
    });

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err);
    };

    return () => {
      eventSource.close();
    };
  }, [navigate, showToast]);

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
      </div>      <div className="flex items-center gap-3 lg:gap-6">
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
            {unseenCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] font-black border-2 border-white">
                {unseenCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute right-0 mt-3 w-[300px] sm:w-[340px] bg-white/95 backdrop-blur-2xl border border-white/50 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden z-[100] p-2"
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

                {notices.length > 0 && (
                  <>
                    <div className="p-4 border-t border-b border-gray-50/60 bg-gray-50/30 flex items-center justify-between">
                       <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Announcements</h3>
                    </div>
                    <div className="p-2 space-y-1.5 max-h-[220px] overflow-y-auto">
                       {notices.slice(0, 3).map(notice => {
                          const isUnseen = (() => {
                             try {
                               const stored = localStorage.getItem('seenNoticeIds');
                               const seenIds = stored ? JSON.parse(stored) : [];
                               return !seenIds.includes(notice.id);
                             } catch (e) {
                               return false;
                             }
                          })();
                          return (
                             <button
                               key={notice.id}
                               onClick={() => {
                                  setSelectedNotice(notice);
                                  acknowledgeNotice(notice.id);
                                  setShowNotifications(false);
                               }}
                               className={`w-full flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-all text-left relative group ${isUnseen ? 'bg-blue-50/40 border-l-2 border-primary' : ''}`}
                             >
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                   notice.category === 'Urgent' 
                                     ? 'bg-rose-50 text-rose-500' 
                                     : notice.category === 'Holiday'
                                     ? 'bg-violet-50 text-violet-500'
                                     : 'bg-blue-50 text-blue-500'
                                }`}>
                                   <Megaphone size={14} />
                                </div>
                                <div className="min-w-0 flex-1">
                                   <div className="flex justify-between items-baseline gap-2">
                                      <p className="text-xs font-black text-slate-800 truncate">{notice.title}</p>
                                      <span className="text-[8px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">
                                         {new Date(notice.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                      </span>
                                   </div>
                                   <p className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5">{notice.content}</p>
                                </div>
                             </button>
                          );
                       })}
                    </div>
                  </>
                )}

                <div className="bg-gray-50/50 p-3 flex justify-center">
                   <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                      View All Notifications
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div 
          onClick={() => {
            if (userRole === 'USER') {
              navigate('/employee/profile');
            }
          }}
          className={`flex items-center gap-3 pl-3 lg:pl-6 border-l border-gray-100 ${userRole === 'USER' ? 'cursor-pointer hover:opacity-80 transition-all' : ''}`}
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">
              {userRole === 'USER' ? 'Employee' : userName}
            </p>
            <p className="text-xs text-gray-500">
              {userRole === 'USER' ? `${userName} ${employeeCode ? `(${employeeCode})` : ''}` : userRole.replace('_', ' ')}
            </p>
          </div>
          {profile.profileImage ? (
            <img 
              src={profile.profileImage} 
              alt={userName}
              className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm shrink-0"
            />
          ) : (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border border-gray-100 shadow-sm shrink-0 ${getColorClass(userName)}`}>
               {getInitials(userName)}
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Floating Notification Toast */}
    <AnimatePresence>
      {activeNotification && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-[999] max-w-sm w-full bg-white/95 backdrop-blur-md rounded-3xl border border-gray-100 p-5 shadow-2xl shadow-primary/20 flex gap-4 items-start relative overflow-hidden text-left"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
            <Megaphone size={20} className="animate-bounce" />
          </div>
          
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${
                activeNotification.category === 'Urgent'
                  ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'
                  : activeNotification.category === 'Holiday'
                  ? 'bg-violet-50 text-violet-600 border-violet-100'
                  : activeNotification.category === 'Event'
                  ? 'bg-blue-50 text-blue-600 border-blue-100'
                  : 'bg-teal-50 text-teal-600 border-teal-100'
              }`}>
                {activeNotification.category}
              </span>
              <button
                onClick={() => acknowledgeNotice(activeNotification.id)}
                className="p-1 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
            <h4 className="text-xs font-extrabold text-slate-800 tracking-tight leading-snug line-clamp-1">
              {activeNotification.title}
            </h4>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed line-clamp-2 pb-2">
              {activeNotification.content}
            </p>
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => {
                  setSelectedNotice(activeNotification);
                  acknowledgeNotice(activeNotification.id);
                }}
                className="px-4 py-1.5 bg-primary text-white text-[9px] font-black uppercase tracking-wider rounded-lg shadow-md shadow-primary/20 hover:opacity-90 transition-all cursor-pointer"
              >
                View Detail
              </button>
              <button
                onClick={() => acknowledgeNotice(activeNotification.id)}
                className="px-3 py-1.5 border border-slate-200 text-slate-500 text-[9px] font-black uppercase tracking-wider rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Notice Detail Modal */}
    <AnimatePresence>
      {selectedNotice && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNotice(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl overflow-hidden z-10 text-left"
          >
            {/* Decorative background gradient */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  selectedNotice.category === 'Urgent'
                    ? 'bg-rose-50 text-rose-600 border-rose-100'
                    : selectedNotice.category === 'Holiday'
                    ? 'bg-violet-50 text-violet-600 border-violet-100'
                    : selectedNotice.category === 'Event'
                    ? 'bg-blue-50 text-blue-600 border-blue-100'
                    : 'bg-teal-50 text-teal-600 border-teal-100'
                }`}>
                  {selectedNotice.category}
                </span>
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-snug">
                  {selectedNotice.title}
                </h3>
                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {(() => {
                      try {
                        return new Date(selectedNotice.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                      } catch (e) {
                        return '';
                      }
                    })()}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    By {selectedNotice.createdBy || 'Admin'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-slate-600 text-sm font-medium leading-relaxed max-h-[250px] overflow-y-auto whitespace-pre-wrap">
                {selectedNotice.content}
              </div>

              <button 
                onClick={() => setSelectedNotice(null)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-semibold hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 mt-2"
              >
                Understood
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
};

export default Navbar;
