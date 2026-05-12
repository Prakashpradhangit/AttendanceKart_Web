import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  Wallet, 
  CalendarRange, 
  ChartBar, 
  Settings,
  Menu,
  ChevronLeft,
  LogOut,
  Clock
} from 'lucide-react';

const EmployeeSidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const menuItems = [
    { name: 'Home', icon: LayoutDashboard, path: '/employee/dashboard', comingSoon: false },
    { name: 'Attendance', icon: CalendarCheck, path: '/employee/attendance', comingSoon: false },
    { name: 'Leave', icon: CalendarRange, path: '/employee/leaves', comingSoon: false },
    { name: 'Salary', icon: Wallet, path: '#', comingSoon: true },
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
        className={`fixed top-0 left-0 h-screen bg-[#1E293B] transition-all duration-300 z-50 ${
          isOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        <div className="flex items-center justify-between p-6 mb-8 text-white">
          {isOpen && <h1 className="text-xl font-bold tracking-tight">Employee Hub</h1>}
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                isActive && !item.comingSoon 
                  ? 'flex items-center gap-4 px-6 py-4 text-white bg-blue-600 font-semibold rounded-r-full mr-4' 
                  : 'flex items-center justify-between px-6 py-4 text-white/80 hover:text-white hover:bg-white/5 transition-all cursor-pointer rounded-r-full mr-4 group'
              }
            >
              <div className="flex items-center gap-4">
                <item.icon size={22} className="min-w-[22px]" />
                {isOpen && <span className="whitespace-nowrap">{item.name}</span>}
              </div>
              {isOpen && item.comingSoon && (
                <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
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
