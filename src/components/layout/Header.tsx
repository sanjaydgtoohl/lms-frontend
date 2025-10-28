import React from 'react';
import { Plus, User } from 'lucide-react';
import NotificationPopup from '../ui/NotificationPopup';

interface HeaderProps {
  onCreateClick?: () => void;
  createButtonText?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  onCreateClick, 
  createButtonText = "Create Source" 
}) => {
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  return (
  <header className="bg-white shadow-sm sticky top-0 z-20 border-b border-gray-200">
      <div className="flex items-center justify-between px-6" style={{ paddingBottom: '11px', paddingTop: '11px' }}>
        {/* Page Title (Breadcrumb moved to Layout) */}
        <div />

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={toggleNotifications}
              className="notification-btn"
            >
              <div className="notification-icon">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="notification-badge"></span>
              </div>
            </button>
            <NotificationPopup isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
          </div>          {/* Profile Picture */}
          <div className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>

          {/* Create Button */}
          {onCreateClick && createButtonText && (
            <button
              onClick={onCreateClick}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[var(--primary)] to-[#005A61] text-white text-sm font-medium rounded-lg hover:shadow-md transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>{createButtonText}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
