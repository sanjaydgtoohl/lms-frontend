import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useUiStore } from '../../store/ui';

const ApiErrorNotification: React.FC = () => {
  const { errorList, clearErrors } = useUiStore();
  const [open, setOpen] = useState(false);
  const hasErrors = errorList.length > 0;

  // Blinking animation only when errors exist
  const iconClass = hasErrors
    ? 'animate-blink text-red-600'
    : 'text-gray-400';

  return (
    <div className="relative inline-block">
      <button
        type="button"
        aria-label="API Error Notification"
        className="relative"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className={iconClass + ' w-6 h-6'} />
        {hasErrors && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold animate-pulse">
            {errorList.length}
          </span>
        )}
      </button>
      {open && hasErrors && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b font-semibold text-red-600">API Error(s)</div>
          <ul className="max-h-64 overflow-y-auto">
            {errorList.map((err, idx) => (
              <li key={err.time + idx} className="px-4 py-2 text-sm text-gray-800 border-b last:border-b-0">
                {err.message}
              </li>
            ))}
          </ul>
          <div className="p-2 flex justify-end">
            <button
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
              onClick={() => { clearErrors(); setOpen(false); }}
            >
              Clear All
            </button>
          </div>
        </div>
      )}
      {/* Blinking animation style */}
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .animate-blink { animation: blink 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default ApiErrorNotification;
