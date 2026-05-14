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
  LogOut
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login');
  };
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Employees', icon: Users, path: '/admin/employees' },
    { name: 'Attendance', icon: CalendarCheck, path: '/admin/attendance' },
    { name: 'Payroll', icon: Wallet, path: '/admin/payroll' },
    { name: 'Leave Request', icon: CalendarRange, path: '/admin/leaves' },
    { name: 'Reports', icon: ChartBar, path: '/admin/reports' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
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
        className={`fixed top-0 left-0 h-screen bg-sidebar-bg transition-all duration-300 z-50 ${
          isOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
      <div className="flex items-center justify-between p-6 mb-8 text-white">
        {isOpen && <h1 className="text-xl font-bold tracking-tight">Admin panel</h1>}
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
              isActive ? 'flex items-center gap-4 px-6 py-4 text-white bg-white/20 font-semibold rounded-r-full mr-4' : 'flex items-center gap-4 px-6 py-4 text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer rounded-r-full mr-4'
            }
          >
            <item.icon size={22} className="min-w-[22px]" />
            {isOpen && <span className="whitespace-nowrap">{item.name}</span>}
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

export default Sidebar;
