import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SuperAdminSidebar from '../components/SuperAdminSidebar';
import Navbar from '../components/Navbar';

const SuperAdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const closeSidebarOnMobile = () => {
    if (window.innerWidth <= 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="h-screen bg-dashboard-bg flex overflow-hidden font-poppins">
      <SuperAdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main 
        className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20 ml-0'
        }`}
      >
        <Navbar onMenuClick={toggleSidebar} />
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth bg-[#F0F7FF]" onClick={closeSidebarOnMobile}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;
