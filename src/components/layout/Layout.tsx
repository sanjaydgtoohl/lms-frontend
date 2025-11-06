import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumb from '../ui/Breadcrumb';

const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Sidebar */}
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      
  {/* Main Content Area (use padding to account for fixed Sidebar so total page width stays within viewport) */}
  <div className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ${sidebarCollapsed ? 'pl-16' : 'pl-64'} w-full`}>
        {/* Header */}
        <Header />

        {/* Breadcrumb directly below sticky Header — hide for master pages because they render their own header (MasterHeader) */}
        {(() => {
          const location = useLocation();
          // If the route is under /master (e.g. /master/brand) or specific pages like /miss-campaign
          // the pages render their own MasterHeader with breadcrumb + create button — hide the top breadcrumb.
          const shouldShowBreadcrumb = !location.pathname.startsWith('/master')
            && !location.pathname.startsWith('/miss-campaign');
          return shouldShowBreadcrumb ? (
            <div className="bg-transparent px-6" style={{ paddingTop: '21.5px', paddingBottom: '0px', paddingLeft:'41px' }}>
              <Breadcrumb />
            </div>
          ) : null;
        })()}

        {/* Main Content */}
        <main className="flex-1 overflow-auto w-full overflow-x-hidden" style={{ paddingLeft: '20px', paddingRight: '20px' }}>
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
