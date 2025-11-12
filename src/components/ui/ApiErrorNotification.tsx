import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useUiStore } from '../../store/ui';

const ApiErrorNotification: React.FC = () => {
  const { errorList, clearErrors } = useUiStore();
  const [open, setOpen] = useState(false);
  const hasErrors = errorList.length > 0;

  // Icon color is orange (CSS variable) - blinking animation will be applied to the badge instead
  const iconAnimationClass = '';

  return (
    <div className="relative inline-block">
      <button
        type="button"
        aria-label="API Error Notification"
        className="api-notification-button bg-transparent"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className={`w-6 h-6 bell-icon`} />
        {hasErrors && (
          <span
            className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold animate-blink"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            title={`${errorList.length} API error(s)`}
          >
            {errorList.length}
          </span>
        )}
      </button>
      {open && hasErrors && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b font-semibold text-red-600">Notification Messange</div>
          <ul className="max-h-64 overflow-y-auto">
            {errorList.map((err, idx) => (
              <li key={err.time + idx} className="px-4 py-2 text-sm text-gray-800 border-b last:border-b-0">
                {err.message}
              </li>
            ))}
          </ul>
          <div className="p-2 flex justify-end">
            <button
              className="px-3 py-1 text-white rounded text-xs clear-all-btn hover:opacity-90"
              onClick={() => { clearErrors(); setOpen(false); }}
            >
              Clear All
            </button>
          </div>
        </div>
      )}
      {/* Blinking animation style, Clear All override and bell icon color */}
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .animate-blink { animation: blink 1s linear infinite; }
        /* Force Clear All button background to project orange variable */
        .clear-all-btn { background-color: var(--color-orange-400) !important; }
        .clear-all-btn:hover { background-color: var(--color-orange-500) !important; }
        /* Bell icon should use orange color and ensure svg stroke/fill inherit it */
        .bell-icon,
        .bell-icon * {
          color: var(--color-orange-400) !important;
          fill: currentColor !important;
          stroke: currentColor !important;
        }
      `}</style>
    </div>
  );
};

export default ApiErrorNotification;
