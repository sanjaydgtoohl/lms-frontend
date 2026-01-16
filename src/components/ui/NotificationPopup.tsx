import React, { useEffect } from 'react';
import './NotificationPopup.css';

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  type?: 'success' | 'error' | 'info';
  title?: string;
  duration?: number; // Auto-dismiss duration in ms (0 = no auto-dismiss)
  customStyle?: {
    bg?: string;
    border?: string;
    text?: string;
    icon?: string;
  };
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ 
  isOpen, 
  onClose, 
  message = "", 
  type = "info",
  title = type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Notification',
  duration = 5000, // Default 5 seconds
  customStyle
}) => {
  // Auto-dismiss functionality
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const styles = {
    error: {
      bg: 'bg-gradient-to-r from-red-50 to-red-100',
      border: 'border-l-4 border-red-500',
      text: 'text-red-800',
      icon: 'text-red-500',
      shadow: 'shadow-red-100'
    },
    success: {
      bg: 'bg-gradient-to-r from-emerald-50 to-emerald-100',
      border: 'border-l-4 border-emerald-500',
      text: 'text-emerald-800',
      icon: 'text-emerald-500',
      shadow: 'shadow-emerald-100'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
      border: 'border-l-4 border-blue-500',
      text: 'text-blue-800',
      icon: 'text-blue-500',
      shadow: 'shadow-blue-100'
    }
  };

  const currentStyle = styles[type];

  // apply custom overrides when provided
  const mergedStyle = {
    bg: customStyle?.bg ?? currentStyle.bg,
    border: customStyle?.border ?? currentStyle.border,
    text: customStyle?.text ?? currentStyle.text,
    icon: customStyle?.icon ?? currentStyle.icon,
    shadow: currentStyle.shadow,
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-30 bg-black/10 backdrop-blur-[2px]" 
        onClick={onClose}
      />

      {/* Popup */}
      <div 
        className={`
          fixed top-4 right-4 w-96 bg-white z-40 
          ${mergedStyle.border}
          rounded-lg shadow-lg shadow-black/5 
          transform transition-all duration-300 ease-out
          animate-slideIn
        `}
      >
        <div className={`relative p-4 ${mergedStyle.bg}`}>
          <div className="flex items-center space-x-3">
            {/* Icon based on type */}
            <div className={`${mergedStyle.icon}`}>
              {type === 'error' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {type === 'success' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {type === 'info' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>

            <div className="flex-1">
              <h3 className={`font-semibold ${mergedStyle.text} text-base`}>{title}</h3>
            </div>

            {/* Close button intentionally removed to match desired UX */}
          </div>
          
          {/* Message Content */}
          {message && (
            <div className="mt-2 ml-9">
              <p className={`text-sm ${mergedStyle.text} opacity-90`}>{message}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPopup;