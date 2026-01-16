import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumb from '../ui/Breadcrumb';
import ErrorBoundary from '../ui/ErrorBoundary';
import NotificationPopup from '../ui/NotificationPopup';
import { useUiStore } from '../../store/ui';
import { debounce } from 'lodash';

const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const notification = useUiStore((s) => s.notification);
  const hideNotification = useUiStore((s) => s.hideNotification);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = debounce(() => {
      // Mobile breakpoint (max-width: 768px)
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      // Keep the existing desktop collapse behaviour for >= 1024px
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }

      // Close mobile sidebar when resizing to desktop/tablet
      if (!mobile) setMobileSidebarOpen(false);
    }, 200); // Debounce to limit executions

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen((v) => !v);
  };

  // Determine if breadcrumb should be shown
  const shouldShowBreadcrumb = !location.pathname.startsWith('/master')
    && !location.pathname.startsWith('/miss-campaign')
    && !location.pathname.startsWith('/lead-management')
    // The Meeting Schedule page renders its own breadcrumb with Lead Management context.
    && !location.pathname.startsWith('/meeting-schedule')
    && !location.pathname.startsWith('/brief')
    && !location.pathname.startsWith('/user-management')
    && !location.pathname.startsWith('/gmail')
    && !location.pathname.startsWith('/dashboard');

  return (
    <>
      <div className="min-h-screen bg-[var(--background)] flex">
        {/* Sidebar (desktop) and mobile variant */}
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          isMobile={isMobile}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        
        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'} w-full`}>
          {/* Header */}
          <Header showHamburger={isMobile} onHamburgerClick={toggleMobileSidebar} />

          {/* Breadcrumb */}
          {shouldShowBreadcrumb && (
            <div className="bg-transparent px-3 md:px-6 lg:px-8 pt-4 pb-3">
              <Breadcrumb />
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 overflow-auto w-full overflow-x-hidden px-3 md:px-6 lg:px-8 py-4">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>

        {/* Mobile transparent overlay (captures outside taps to close mobile sidebar). No blackout. */}
        {isMobile && mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-30"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden
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
