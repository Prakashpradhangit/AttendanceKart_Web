import React, { useState, useEffect } from 'react';
import { Bell, User, Menu } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
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

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-3 lg:gap-6">
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-3 lg:pl-6 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">
              {userRole === 'USER' ? 'Employee' : userName}
            </p>
            <p className="text-xs text-gray-500">
              {userRole === 'USER' ? `${userName} ${employeeCode ? `(${employeeCode})` : ''}` : userRole.replace('_', ' ')}
            </p>
          </div>
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary overflow-hidden border-2 border-primary/20">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt={userName} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
