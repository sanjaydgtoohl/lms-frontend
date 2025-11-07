import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumb from '../ui/Breadcrumb';
import ErrorBoundary from '../ui/ErrorBoundary';
import NotificationPopup from '../ui/NotificationPopup';
import { useUiStore } from '../../store/ui';

const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const notification = useUiStore((s) => s.notification);
  const hideNotification = useUiStore((s) => s.hideNotification);

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

  // Determine if breadcrumb should be shown
  const shouldShowBreadcrumb = !location.pathname.startsWith('/master')
    && !location.pathname.startsWith('/miss-campaign')
    && !location.pathname.startsWith('/lead-management')
    && !location.pathname.startsWith('/brief');

  return (
    <>
      <div className="min-h-screen bg-[var(--background)] flex">
        {/* Sidebar */}
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        
        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'} w-full`}>
          {/* Header */}
          <Header />

          {/* Breadcrumb */}
          {shouldShowBreadcrumb && (
            <div className="bg-transparent px-6 pt-6 pb-0">
              <Breadcrumb />
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 overflow-auto w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>

        {/* Mobile Overlay */}
        {!sidebarCollapsed && typeof window !== 'undefined' && window.innerWidth < 1024 && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
      </div>

      {/* Global Notification Popup */}
      <NotificationPopup
        isOpen={notification.isOpen}
        onClose={hideNotification}
        message={notification.message}
        type={notification.type}
        title={notification.title}
        duration={notification.type === 'error' ? 7000 : 5000}
      />
    </>
  );
};

export default Layout;
