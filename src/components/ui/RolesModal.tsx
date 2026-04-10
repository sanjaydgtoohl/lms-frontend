import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface Role {
  id?: string | number;
  name: string;
  display_name?: string;
  description?: string;
}

interface RolesModalProps {
  isOpen: boolean;
  roles: Role[];
  onClose: () => void;
  userName?: string;
  title?: string;
}

const ANIMATION_DURATION = 250;

const RolesModal: React.FC<RolesModalProps> = ({
  isOpen,
  roles,
  onClose,
  userName = 'User',
  title = 'User Roles',
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
    } else {
      setIsClosing(true);
      document.body.style.overflow = 'auto';
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, ANIMATION_DURATION);
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!shouldRender || typeof document === 'undefined') return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 100);
  };

  const getRoleBadgeColor = (roleName?: string) => {
    const roleColorMap: Record<string, { bgLight: string; bgDark: string; text: string; textDark: string }> = {
      'Manager': { bgLight: '#dbeafe', bgDark: '#1e3a8a', text: '#2563eb', textDark: '#93c5fd' },
      'Super Admin': { bgLight: '#e9d5ff', bgDark: '#581c87', text: '#9333ea', textDark: '#d8b4fe' },
      'Admin': { bgLight: '#dcfce7', bgDark: '#15803d', text: '#16a34a', textDark: '#86efac' },
      'BDM': { bgLight: '#fed7aa', bgDark: '#7c2d12', text: '#ea580c', textDark: '#fdba74' },
      'S-BDM': { bgLight: '#fef08a', bgDark: '#713f12', text: '#ca8a04', textDark: '#fde047' },
      'Planner': { bgLight: '#fbcfe8', bgDark: '#831843', text: '#be185d', textDark: '#f472b6' },
    };
    return (roleName && roleColorMap[roleName]) || { bgLight: '#f3f4f6', bgDark: '#374151', text: '#6b7280', textDark: '#d1d5db' };
  };

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className={`modal-overlay fixed inset-0 bg-black/50 z-40 backdrop-blur-sm ${
          isClosing ? 'closing' : ''
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`modal-content
          modal-body rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden
          border border-gray-200
          ${isClosing ? 'closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h3 className="modal-title font-bold text-lg md:text-xl text-gray-900 dark:text-white">{title}</h3>
            <p className="modal-subtitle text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {userName} • {roles.length} {roles.length === 1 ? 'role' : 'roles'}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="modal-close-btn bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xl md:text-2xl w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-200 active:scale-95"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="modal-scrollable flex-1 overflow-y-auto px-4 py-4 max-h-[450px]">
          {roles.length === 0 ? (
            <div className="modal-empty-state">
              <div className="modal-empty-state-icon">👤</div>
              <p className="modal-empty-state-text font-medium">No roles assigned.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {roles.map((role, idx) => {
                const colors = getRoleBadgeColor(role.display_name || role.name);

                return (
                  <li
                    key={role.id || idx}
                    className="modal-item p-2 rounded-xl flex items-start gap-4 border border-gray-200 dark:border-gray-600 transition-all duration-200 
                      hover:bg-gray-100/50"
                  >
                    <div
                      className="modal-avatar font-bold text-base shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${colors.bgLight}, ${colors.bgLight}dd)`,
                        color: colors.text,
                      }}
                    >
                      {(role.display_name || role.name || 'R').charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="modal-text font-semibold text-gray-900 dark:text-white text-sm md:text-base mb-1">
                        {role.display_name || role.name || 'Unknown'}
                      </div>
                      {role.description && (
                        <div className="modal-text-muted text-xs sm:text-sm break-words leading-relaxed text-gray-600 dark:text-gray-400">
                          {role.description}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

export default RolesModal;