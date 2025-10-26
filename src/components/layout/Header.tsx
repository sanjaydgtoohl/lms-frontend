import React from 'react';
import { Bell, Plus, User } from 'lucide-react';

interface HeaderProps {
  onCreateClick?: () => void;
  createButtonText?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  onCreateClick, 
  createButtonText = "Create Source" 
}) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="flex items-center justify-between px-6" style={{ paddingBottom: '11px', paddingTop: '11px' }}>
        {/* Page Title */}
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <button className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] rounded-lg transition-all duration-200">
            <Bell className="w-5 h-5" />
            {/* Notification Badge */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

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
