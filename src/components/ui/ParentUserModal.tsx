import React, { useEffect, useState } from 'react';

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

const ANIMATION_DURATION = 200; // match CSS

const ParentUserModal: React.FC<ParentUserModalProps> = ({
  isOpen,
  parentUser,
  onClose,
  userName = 'User',
  title = 'Parent User',
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      const timer = setTimeout(() => setShouldRender(false), ANIMATION_DURATION);
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!shouldRender || !parentUser || parentUser.length === 0) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 ${
          isOpen ? 'animate-fadeIn' : 'animate-fadeOut pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                    rounded-xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.3)] 
                    w-[90%] max-w-[520px] max-h-[85vh] z-50 flex flex-col overflow-hidden
                    ${isOpen ? 'animate-fadeIn' : 'animate-fadeOut pointer-events-none'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="font-bold text-base md:text-lg xl:text-xl text-gray-800">{title}</h3>
            <p className="text-xs sm:text-sm text-gray-400">
              Associated with {userName} ({parentUser.length}{' '}
              {parentUser.length === 1 ? 'parent' : 'parents'})
            </p>
          </div>

          <button
            onClick={onClose}
            className="bg-gray-100 text-gray-500 text-xl w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300 hover:bg-gray-200 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 max-h-[400px]">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
            <p className="m-0 text-xs text-gray-400 font-medium">PARENT USERS</p>

            <div className="mt-2 flex gap-2 flex-wrap">
              {parentUser.map((p) => (
                <div
                  key={String(p.id)}
                  className="flex flex-col px-3 py-2 rounded-xl bg-white border border-gray-200 min-w-[160px]"
                >
                  <div className="text-sm font-bold text-gray-800">{p.name}</div>
                  {p.email && <div className="mt-1 text-xs text-gray-500 break-all">{p.email}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div> 
    </>
  );
};

export default ParentUserModal;