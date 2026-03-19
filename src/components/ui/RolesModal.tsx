import React, { useEffect, useState } from 'react';

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

const ANIMATION_DURATION = 200;

const RolesModal: React.FC<RolesModalProps> = ({
  isOpen,
  roles,
  onClose,
  userName = 'User',
  title = 'User Roles',
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      const timer = setTimeout(() => setShouldRender(false), ANIMATION_DURATION);
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  const getRoleBadgeColor = (roleName?: string) => {
    const roleColorMap: Record<string, { bg: string; text: string }> = {
      'Manager': { bg: '#dbeafe', text: '#2563eb' },
      'Super Admin': { bg: '#e9d5ff', text: '#9333ea' },
      'Admin': { bg: '#dcfce7', text: '#16a34a' },
      'BDM': { bg: '#fed7aa', text: '#ea580c' },
      'S-BDM': { bg: '#fef08a', text: '#ca8a04' },
      'Planner': { bg: '#fbcfe8', text: '#be185d' },
    };
    return (roleName && roleColorMap[roleName]) || { bg: '#f3f4f6', text: '#6b7280' };
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 ${isOpen ? 'animate-fadeIn' : 'animate-fadeOut pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                    bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.3)]
                    w-[90%] max-w-[520px] max-h-[85vh] z-50 flex flex-col overflow-hidden
                    ${isOpen ? 'animate-fadeIn' : 'animate-fadeOut pointer-events-none'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="font-bold text-base md:text-lg xl:text-xl text-gray-800">{title}</h3>
            <p className="text-xs sm:text-sm text-gray-400">
              {userName} • {roles.length} {roles.length === 1 ? 'role' : 'roles'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="bg-gray-100 text-gray-500 text-xl w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300 hover:bg-gray-200 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 max-h-[400px]">
          {roles.length === 0 ? (
            <div className="text-center py-10 px-5 text-gray-400">
              <div className="text-5xl mb-3">👤</div>
              <p className="text-sm">No roles assigned.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {roles.map((role, idx) => {
                const colors = getRoleBadgeColor(role.display_name || role.name);

                return (
                  <li
                    key={role.id || idx}
                    className="p-3 rounded-lg flex items-start gap-3 bg-gray-50 transition-all duration-200 hover:bg-gray-100 hover:translate-x-1"
                  >
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-base shrink-0"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      {(role.display_name || role.name || 'R').charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-sm mb-1">
                        {role.display_name || role.name || 'Unknown'}
                      </div>
                      {role.description && (
                        <div className="text-gray-500 text-xs break-words leading-[1.4]">
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
 
    </>
  );
};

export default RolesModal;