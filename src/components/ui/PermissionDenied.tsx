import React from 'react';
import loginService from '../../services/Login';

const PermissionDenied: React.FC = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: '#f8f8f8',
    zIndex: 9999,
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
  }}>
    <div style={{
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 2px 16px rgba(0,0,0,0.1)',
      padding: '40px 60px',
      textAlign: 'center',
      maxWidth: 420,
    }}>
      <div style={{ fontSize: 64, color: '#fbbd08', marginBottom: 16 }}>
        <span role="img" aria-label="lock">🔒</span>
      </div>
      <h2 style={{ color: '#d9534f', marginBottom: 12 }}>Permission Not Found</h2>
      <p style={{ color: '#555', marginBottom: 24 }}>
        This URL is valid but you are not authorized for this content.<br />
        Please contact your administrator.
      </p>
      <button
        style={{
          background: '#fbbd08',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '10px 24px',
          fontSize: 16,
          cursor: 'pointer',
          marginRight: 12,
        }}
        onClick={() => window.location.href = '/'}
      >
        Go back to site
      </button>
      <button
        style={{
          background: '#d9534f',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '10px 24px',
          fontSize: 16,
          cursor: 'pointer',
          marginLeft: 12,
        }}
        onClick={async () => {
          await loginService.logout();
          window.location.href = '/login';
        }}
      >
        Logout
      </button>
    </div>
  </div>
);

export default PermissionDenied;
