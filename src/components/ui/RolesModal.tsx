import React, { useEffect } from 'react';

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

const RolesModal: React.FC<RolesModalProps> = ({
  isOpen,
  roles,
  onClose,
  userName = 'User',
  title = 'User Roles',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getRoleBadgeColor = (roleName?: string) => {
    const roleColorMap: Record<string, { bg: string; text: string; border: string }> = {
      'Manager': { bg: '#dbeafe', text: '#2563eb', border: '#93c5fd' },
      'Super Admin': { bg: '#e9d5ff', text: '#9333ea', border: '#d8b4fe' },
      'Admin': { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' },
      'BDM': { bg: '#fed7aa', text: '#ea580c', border: '#fdba74' },
      'S-BDM': { bg: '#fef08a', text: '#ca8a04', border: '#fde047' },
      'Planner': { bg: '#fbcfe8', text: '#be185d', border: '#f472b6' },
    };
    return (roleName && roleColorMap[roleName]) || { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' };
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 40,
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          width: '90%',
          maxWidth: 520,
          maxHeight: '85vh',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 28px',
            borderBottom: '1px solid #e5e7eb',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: 22, color: '#1f2937' }}>
              {title}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#9ca3af' }}>
              {userName} • {roles.length} {roles.length === 1 ? 'role' : 'roles'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f3f4f6',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              color: '#6b7280',
              padding: '8px 12px',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e5e7eb';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 28px',
            maxHeight: '240px',
          }}
        >
          {roles.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#9ca3af',
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
              <p style={{ fontSize: 14, margin: 0 }}>No roles assigned.</p>
            </div>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {roles.map((role, idx) => {
                const colors = getRoleBadgeColor(role.display_name || role.name);
                return (
                  <li
                    key={role.id || idx}
                    style={{
                      padding: '16px',
                      marginBottom: idx < roles.length - 1 ? '8px' : '0',
                      background: '#f9fafb',
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f3f4f6';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        background: colors.bg,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.text,
                        fontWeight: 700,
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      {(role.display_name || role.name || 'R').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: '#1f2937',
                          fontSize: 15,
                          marginBottom: 4,
                        }}
                      >
                        {role.display_name || role.name || 'Unknown'}
                      </div>
                      {role.description && (
                        <div
                          style={{
                            color: '#6b7280',
                            fontSize: 13,
                            wordBreak: 'break-word',
                            lineHeight: 1.4,
                          }}
                        >
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

      {/* CSS Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translate(-50%, -40%);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }
        `}
      </style>
    </>
  );
};

export default RolesModal;
