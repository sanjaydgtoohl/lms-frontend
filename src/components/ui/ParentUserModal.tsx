import React, { useEffect } from 'react';

interface ParentUser {
  id?: string | number;
  name: string;
  email?: string;
  status?: 'Active' | 'Inactive';
}

interface ParentUserModalProps {
  isOpen: boolean;
  // support multiple parents
  parentUser: ParentUser[] | null;
  onClose: () => void;
  userName?: string;
  title?: string;
}

const ParentUserModal: React.FC<ParentUserModalProps> = ({
  isOpen,
  parentUser,
  onClose,
  userName = 'User',
  title = 'Parent User',
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

  if (!isOpen || !parentUser || parentUser.length === 0) return null;

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
              Associated with {userName}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: 'white',
              cursor: 'pointer',
              fontSize: 20,
              color: '#6b7280',
              transition: 'all 0.2s',
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as any).style.background = 'white';
              (e.currentTarget as any).style.color = '#6b7280';
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as any).style.background = '#f3f4f6';
              (e.currentTarget as any).style.color = '#1f2937';
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
          }}
        >
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
            }}
          >
            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>
              PARENT USERS
            </p>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {parentUser.map((p) => (
                <div
                  key={String(p.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '8px 12px',
                    borderRadius: 12,
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    minWidth: 160,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>{p.name}</div>
                  {p.email && (
                    <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280', wordBreak: 'break-all' }}>{p.email}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translate(-50%, -45%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default ParentUserModal;
