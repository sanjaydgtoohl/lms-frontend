import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Get page title from current route
  const getPageTitle = () => {
    const path = location.pathname;
    const titleMap: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/lead-source': 'Lead Source',
      '/lead-management': 'Lead Management',
      '/master/brand': 'Brand Master',
      '/master/agency': 'Agency Master',
      '/master/department': 'Department Master',
      '/master/designation': 'Designation Master',
      '/master/industry': 'Industry Master',
      '/brief': 'Brief',
      '/miss-campaign': 'Miss Campaign',
      '/campaign-management': 'Campaign Management',
      '/finance': 'Finance',
      '/user-management': 'User Management',
      '/settings': 'Settings',
    };
    return titleMap[path] || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Sidebar */}
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} w-full`}>
        {/* Header */}
        <Header 
          pageTitle={getPageTitle()} 
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-hidden w-full">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && window.innerWidth < 1024 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </div>
  );
};

export default Layout;
