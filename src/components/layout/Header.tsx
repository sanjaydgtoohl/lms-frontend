import React from 'react';
import { Plus, User } from 'lucide-react';
import NotificationPopup from '../ui/NotificationPopup';
import ApiErrorNotification from '../ui/ApiErrorNotification';

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
          {/* API Error Notification Icon */}
          <ApiErrorNotification />
          {/* Profile Picture */}
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
