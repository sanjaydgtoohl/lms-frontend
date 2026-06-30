import React from 'react';

type LoadingModalProps = {
  isOpen: boolean;
  title?: string;
  message?: string;
  /** 0–100 when known; omit for indeterminate spinner only. */
  progress?: number;
};

const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  title = 'Please wait',
  message = 'Loading…',
  progress,
}) => {
  if (!isOpen) return null;

  const idBase = `${title}-${message}`.toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
  const idTitle = `${idBase}-loading-modal-title`;
  const idDesc = `${idBase}-loading-modal-description`;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" aria-hidden="true" />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitle}
        aria-describedby={idDesc}
      >
        <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/10">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
              <svg
                className="h-8 w-8 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                <path
                  d="M22 12a10 10 0 0 1-10 10"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="w-full">
              <h2 id={idTitle} className="text-lg font-semibold text-gray-900">{title}</h2>
              <p id={idDesc} className="mt-2 text-sm leading-6 text-gray-600">{message}</p>
              {typeof progress === 'number' && (
                <div className="mt-4 w-full">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-[width] duration-300 ease-out"
                      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(progress)}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{Math.round(progress)}%</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoadingModal;
