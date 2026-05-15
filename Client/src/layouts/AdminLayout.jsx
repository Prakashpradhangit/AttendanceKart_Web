import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Close sidebar on navigation (optional, but good for mobile)
  const closeSidebarOnMobile = () => {
    if (window.innerWidth <= 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="h-screen bg-[#F4F7FE] flex overflow-hidden relative">
      {/* Decorative background accents */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
      
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main 
        className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20 ml-0'
        }`}
      >
        <Navbar onMenuClick={toggleSidebar} />
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth" onClick={closeSidebarOnMobile}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
