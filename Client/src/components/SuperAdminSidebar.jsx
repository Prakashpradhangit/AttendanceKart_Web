import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  CreditCard, 
  Settings,
  Menu,
  ChevronLeft,
  LogOut,
  ShieldCheck
} from 'lucide-react';

const SuperAdminSidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/superadmin/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/superadmin/dashboard' },
    { name: 'Organizations', icon: Building2, path: '/superadmin/organizations' },
    { name: 'Payments', icon: CreditCard, path: '/superadmin/payments' },
    { name: 'Settings', icon: Settings, path: '/superadmin/settings' },
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
        className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-100 transition-all duration-300 z-50 ${
          isOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        <div className="flex items-center justify-between p-6 mb-8">
          {isOpen && (
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-[#3B82F6]" size={24} />
              <h1 className="text-xl font-bold tracking-tight text-[#1E293B]">Super Admin</h1>
            </div>
          )}
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-400"
          >
            {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex flex-col gap-2 px-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-600/20' 
                    : 'text-gray-500 hover:text-[#3B82F6] hover:bg-blue-50'
                }`
              }
            >
              <item.icon size={22} className="min-w-[22px]" />
              {isOpen && <span className="whitespace-nowrap font-bold text-sm">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto mb-6 px-3">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer rounded-xl w-full"
          >
            <LogOut size={22} className="min-w-[22px]" />
            {isOpen && <span className="whitespace-nowrap font-bold text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default SuperAdminSidebar;
