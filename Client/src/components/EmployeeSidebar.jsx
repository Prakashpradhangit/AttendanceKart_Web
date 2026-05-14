import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  Wallet, 
  CalendarRange, 
  ChartBar, 
  Settings,
  LogOut,
  Clock
} from 'lucide-react';

const EmployeeSidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/employee/login');
  };

  const menuItems = [
    { name: 'Home', icon: LayoutDashboard, path: '/employee/dashboard', comingSoon: false },
    { name: 'Attendance', icon: CalendarCheck, path: '/employee/attendance', comingSoon: false },
    { name: 'Leave', icon: CalendarRange, path: '/employee/leaves', comingSoon: false },
    { name: 'Salary', icon: Wallet, path: '/employee/salary', comingSoon: false },
    { name: 'Profile', icon: Users, path: '#', comingSoon: true },
    { name: 'Settings', icon: Settings, path: '#', comingSoon: true },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
      />

      <aside 
        className={`fixed top-0 left-0 h-screen bg-[#0061e0] transition-all duration-300 z-50 shadow-2xl ${
          isOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        <div className={`flex items-center ${isOpen ? 'p-6' : 'py-8 px-4'} mb-8 text-white transition-all duration-300 ${isOpen ? 'justify-start gap-3' : 'justify-center'}`}>
          <button 
            onClick={toggleSidebar}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none group"
          >
            <div className={`${isOpen ? 'w-10 h-10' : 'w-12 h-12'} bg-white p-1.5 rounded-xl flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3`}>
              <img 
                src="/favicon.png" 
                alt="AttendanceKart" 
                className="w-full h-full object-contain"
              />
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col"
                >
                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/60 -mb-1 text-left">
                    AttendanceKart
                  </span>
                  <h1 className="text-xl font-semibold tracking-tight whitespace-nowrap text-white">
                    EmployeeHub
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                isActive && !item.comingSoon 
                  ? 'flex items-center gap-4 px-6 py-4 text-white bg-white/20 font-semibold rounded-r-full mr-4' 
                  : 'flex items-center justify-between px-6 py-4 text-white/80 hover:text-white hover:bg-white/5 transition-all cursor-pointer rounded-r-full mr-4 group'
              }
            >
              <div className="flex items-center gap-4">
                <item.icon size={22} className="min-w-[22px]" />
                {isOpen && <span className="whitespace-nowrap">{item.name}</span>}
              </div>
              {isOpen && item.comingSoon && (
                <span className="text-[9px] font-bold uppercase tracking-widest bg-white/10 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  Soon
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto mb-6">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-6 py-4 text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer rounded-r-full mr-4 w-full"
          >
            <LogOut size={22} className="min-w-[22px]" />
            {isOpen && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default EmployeeSidebar;
