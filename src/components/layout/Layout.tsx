import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'lodash';
import Sidebar from './Sidebar';
import Header from './Header';
import ErrorBoundary from '../ui/ErrorBoundary';
import NotificationPopup from '../ui/NotificationPopup';
import { useUiStore, useUiActions } from '../../store/ui';
import type { AppDispatch, RootState } from '../../redux/store';
import { setCollapsed, toggleSidebar } from '../../redux/slices/sidebarSlice';

const Layout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isCollapsed = useSelector((state: RootState) => state.sidebar.isCollapsed);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const notification = useUiStore((s) => s.notification);
  const { hideNotification } = useUiActions();

  useEffect(() => {
    const handleResize = debounce(() => {
      const mobile = window.innerWidth <= 1023;
      setIsMobile(mobile);

      if (window.innerWidth < 1024) {
        dispatch(setCollapsed(true));
      } else {
        dispatch(setCollapsed(false));
      }

      if (!mobile) setMobileSidebarOpen(false);
    }, 200);

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  const handleSidebarToggle = () => {
    if (isMobile) {
      setMobileSidebarOpen((v) => !v);
    } else {
      dispatch(toggleSidebar());
    }
  };

  const mainOffset = isMobile ? '' : isCollapsed ? 'lg:pl-[4rem]' : 'lg:pl-64';

  return (
    <div className="app-shell flex min-h-screen">
      <Sidebar
        isMobile={isMobile}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className={`flex flex-1 flex-col min-h-0 w-full transition-[padding] duration-300 ease-in-out ${mainOffset}`}>
        <Header
          onSidebarToggle={handleSidebarToggle}
          sidebarCollapsed={isCollapsed}
          isMobileLayout={isMobile}
        />

        <main className="app-main-content">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {isMobile && mobileSidebarOpen && (
        <button
          type="button"
          className="app-mobile-overlay"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close menu"
        />
      )}

      <NotificationPopup
        isOpen={notification.isOpen}
        onClose={hideNotification}
        message={notification.message}
        type={notification.type}
        title={notification.title}
        duration={notification.type === 'error' ? 7000 : 5000}
      />
    </div>
  );
};

export default Layout;
