import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface Agency {
  id?: string | number;
  name?: string;
  email?: string;
}

interface AgenciesModalProps {
  isOpen: boolean;
  agencies: Agency[];
  onClose: () => void;
  title?: string;
}

const ANIMATION_DURATION = 250;

const AgenciesModal: React.FC<AgenciesModalProps> = ({
  isOpen,
  agencies,
  onClose,
  title = 'Agencies',
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [displayAgencies, setDisplayAgencies] = useState(agencies);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      setDisplayAgencies(agencies);
      document.body.style.overflow = 'hidden';
    } else {
      setIsClosing(true);
      document.body.style.overflow = 'unset';

      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, ANIMATION_DURATION);

      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, agencies]);

  if (!shouldRender || typeof document === 'undefined') return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 100);
  };

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className={`modal-overlay fixed inset-0 bg-black/50 z-40 backdrop-blur-sm
          ${isClosing ? 'closing' : ''}`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`modal-content modal-body rounded-2xl shadow-2xl z-50 flex flex-col verflow-hidden border border-gray-200 dark:border-gray-700 overflow-hidden
          ${isClosing ? 'closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header flex items-center justify-between px-4 py-5 border-b border-gray-200 dark:border-gray-700 dark:from-gray-750 dark:to-gray-700">
          <div>
            <h3 className="modal-title font-bold text-lg md:text-xl text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="modal-subtitle mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {displayAgencies.length}{' '}
              {displayAgencies.length === 1 ? 'agency' : 'agencies'}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="modal-close-btn bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xl md:text-2xl w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-200 active:scale-95"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="modal-scrollable flex-1 overflow-y-auto px-4 py-4 max-h-[450px]">
          {displayAgencies.length === 0 ? (
            <div className="modal-empty-state">
              <div className="modal-empty-state-icon">🏢</div>
              <p className="modal-empty-state-text font-medium">No agencies found.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {displayAgencies.map((agency, idx) => (
                <li
                  key={agency.id || idx}
                  className="modal-item p-2 rounded-xl flex items-start gap-4 
                    bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600
                    transition-all duration-200 
                    hover:bg-gray-100/50 dark:hover:bg-gray-600/70 hover:translate-x-0.3
                    hover:shadow-md dark:hover:shadow-lg"
                >
                  <div className="modal-avatar bg-blue-100 text-gray-600 font-bold text-base shrink-0">
                    {(agency.name || 'A').charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="modal-text font-semibold text-gray-900 dark:text-white text-sm md:text-base mb-1">
                      {agency.name || 'Unknown'}
                    </div>

                    {agency.email && (
                      <div className="modal-text-muted text-xs sm:text-sm break-all text-gray-600 dark:text-gray-400">
                        {agency.email}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

export default AgenciesModal;