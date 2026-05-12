import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import EmployeeSidebar from '../components/EmployeeSidebar';
import Navbar from '../components/Navbar';

const EmployeeLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const closeSidebarOnMobile = () => {
    if (window.innerWidth <= 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="h-screen bg-[#F8FAFC] flex overflow-hidden font-poppins">
      <EmployeeSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main 
        className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20 ml-0'
        }`}
      >
        <Navbar onMenuClick={toggleSidebar} />
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 scroll-smooth" onClick={closeSidebarOnMobile}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default EmployeeLayout;
