import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  loading = false,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/20 transition-opacity duration-200" />

      <div
        className="fixed inset-0 z-40 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          if (!loading && e.target === e.currentTarget) onCancel();
        }}
      >
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-100">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {message && <p className="text-sm text-gray-600 mt-1">{message}</p>}

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    disabled={loading}
                    onClick={onCancel}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-60"
                  >
                    {cancelLabel}
                  </button>

                  <button
                    disabled={loading}
                    onClick={onConfirm}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {loading ? 'Deleting...' : confirmLabel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialog;
