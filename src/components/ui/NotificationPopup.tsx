import React from 'react';

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-30" 
        onClick={onClose}
      />

      {/* Popup */}
      <div className="absolute right-0 mt-2 w-80 rounded-lg bg-white shadow-lg z-40 border border-[var(--border-color)]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Notifications</h3>
            <button 
              onClick={onClose}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Notification List */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {/* Example notifications - replace with your actual notifications */}
            <div className="p-3 bg-[var(--hover-bg)] rounded-md">
              <div className="flex items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">New Course Added</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">React Advanced Course has been added to your learning path.</p>
                  <span className="text-xs text-[var(--text-secondary)] mt-2 block">2 hours ago</span>
                </div>
                <div className="ml-3">
                  <div className="h-2 w-2 bg-[#FE5C73] rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="p-3 hover:bg-[var(--hover-bg)] rounded-md transition-colors">
              <div className="flex items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">Assignment Due</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">TypeScript Fundamentals assignment is due tomorrow.</p>
                  <span className="text-xs text-[var(--text-secondary)] mt-2 block">5 hours ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* View All Link */}
          <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
            <button className="text-sm text-[var(--primary)] hover:text-[#005A61] font-medium w-full text-center">
              View All Notifications
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationPopup;