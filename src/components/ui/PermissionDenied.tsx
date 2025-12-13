import React from 'react';
import { authService } from '../../services';

const PermissionDenied: React.FC = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 z-50">
    <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full mx-4">
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-5xl">🔒</span>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3">
        Access Denied
      </h2>

      {/* Description */}
      <p className="text-gray-600 text-center mb-8 leading-relaxed">
        You don't have permission to access this content.
        <br />
        <span className="text-sm">Please contact your administrator for access.</span>
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          onClick={() => window.location.href = '/'}
        >
          Go Back to Home
        </button>
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-red-600 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          onClick={async () => {
            await authService.logout();
            window.location.href = '/login';
          }}
        >
          Logout
        </button>
      </div>
    </div>
  </div>
);

export default PermissionDenied;
