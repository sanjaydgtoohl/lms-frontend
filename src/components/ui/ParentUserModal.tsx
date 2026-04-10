import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ParentUser {
  id?: string | number;
  name: string;
  email?: string;
  status?: 'Active' | 'Inactive';
}

interface ParentUserModalProps {
  isOpen: boolean;
  parentUser: ParentUser[] | null;
  onClose: () => void;
  userName?: string;
  title?: string;
}

const ANIMATION_DURATION = 250;

const ParentUserModal: React.FC<ParentUserModalProps> = ({
  isOpen,
  parentUser,
  onClose,
  userName = 'User',
  title = 'Parent User',
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

  if (!shouldRender || !parentUser || parentUser.length === 0 || typeof document === 'undefined') return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 100);
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
          modal-body rounded-2xl shadow-2xl
           z-50 flex flex-col overflow-hidden
          border border-gray-200 dark:border-gray-700
          ${isClosing ? 'closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 ">
          <div>
            <h3 className="modal-title font-bold text-lg md:text-xl text-gray-900 dark:text-white">{title}</h3>
            <p className="modal-subtitle text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Associated with {userName} ({parentUser.length}{' '}
              {parentUser.length === 1 ? 'parent' : 'parents'})
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
          <div className="p-3 rounded-xl bg-gray-100">
            <p className="m-0 text-xs text-gray-600  font-semibold uppercase tracking-wide">PARENT USERS</p>

            <div className="mt-2 flex gap-3 flex-wrap">
              {parentUser.map((p) => (
                <div
                  key={String(p.id)}
                  className="flex flex-col px-4 py-3 rounded-lg bg-white border border-gray-200 min-w-[200px] transition-all duration-200"
                >
                  <div className="modal-text text-sm font-semibold text-gray-900 dark:text-white">
                    {p.name}
                  </div>
                  {p.email && (
                    <div className="modal-text-muted mt-1 text-xs text-gray-600 dark:text-gray-400 break-all">
                      {p.email}
                    </div>
                  )}
                  {p.status && (
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        p.status === 'Active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default ParentUserModal;