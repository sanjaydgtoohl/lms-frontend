import React, { useEffect, useState } from 'react';

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

const ANIMATION_DURATION = 200;

const AgenciesModal: React.FC<AgenciesModalProps> = ({
  isOpen,
  agencies,
  onClose,
  title = 'Agencies',
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [displayAgencies, setDisplayAgencies] = useState(agencies);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setDisplayAgencies(agencies);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';

      const timer = setTimeout(() => {
        setShouldRender(false);
      }, ANIMATION_DURATION);

      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, agencies]);

  if (!shouldRender) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40
          ${isOpen ? 'animate-fadeIn' : 'animate-fadeOut pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.3)]
          w-[90%] max-w-[520px] max-h-[85vh] z-50
          flex flex-col overflow-hidden
          ${isOpen ? 'animate-fadeIn' : 'animate-fadeOut pointer-events-none'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="font-bold text-base md:text-lg xl:text-xl text-gray-800">
              {title}
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              {displayAgencies.length}{' '}
              {displayAgencies.length === 1 ? 'agency' : 'agencies'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="bg-gray-100 text-gray-500 text-xl w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-gray-200 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 max-h-[400px]">
          {displayAgencies.length === 0 ? (
            <div className="text-center py-10 px-5 text-gray-400">
              <div className="text-5xl mb-3">🏢</div>
              <p className="text-sm">No agencies found.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {displayAgencies.map((agency, idx) => (
                <li
                  key={agency.id || idx}
                  className="p-3 rounded-lg flex items-start gap-3 
                    bg-gray-100 border border-gray-200
                    transition-all duration-200 
                    hover:bg-gray-200 hover:translate-x-1"
                >
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 font-bold text-base shrink-0">
                    {(agency.name || 'A').charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 text-sm mb-1">
                      {agency.name || 'Unknown'}
                    </div>

                    {agency.email && (
                      <div className="text-gray-500 text-xs break-words">
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
    </>
  );
};

export default AgenciesModal;