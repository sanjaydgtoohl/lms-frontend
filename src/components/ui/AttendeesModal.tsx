import React, { useEffect } from 'react';
import type { Meeting as ApiMeeting } from '../../services/Meeting';

interface AttendeesModalProps {
  isOpen: boolean;
  attendees: ApiMeeting['attendees'];
  onClose: () => void;
  title?: string;
}

const AttendeesModal: React.FC<AttendeesModalProps> = ({
  isOpen,
  attendees,
  onClose,
  title = 'Meeting Attendees',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed top-0 left-0 w-screen h-screen bg-black/50 z-40 animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />

      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 !rounded-xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.3)] w-[90%] max-w-[520px] max-h-[85vh] z-50 flex flex-col animate-slideUp overflow-hidden" onClick={(e) => e.stopPropagation()} >

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-[linear-gradient(135deg,#f8fafc_0%,#f1f5f9_100%)]">

          <div>
            <h3 className="font-bold text-base md:text-lg xl:text-xl text-gray-800"> {title} </h3>
            <p className="text-xs sm:text-sm text-gray-400">
              {attendees.length} {attendees.length === 1 ? 'attendee' : 'attendees'}
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
        <div className="flex-1 overflow-y-auto px-5 py-5 max-h-sm">
          {attendees.length === 0 ? (
            <div className="text-center py-10 px-5 text-gray-400">
              <div className="text-5xl mb-3">👥</div>
              <p className="text-sm m-0">No attendees found.</p>
            </div>
          ) : (
            <ul className="m-0 p-0 list-none">
              {attendees.map((attendee, idx) => (
                <li
                  key={attendee.id}
                  className="p-2 rounded-lg bg-gray-100 flex items-center gap-3 transition-all duration-300 border border-gray-200"
                  style={{
                    marginBottom: idx < attendees.length - 1 ? '8px' : '0',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f3f4f6';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-base shrink-0">
                    {attendee.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 text-sm mb-0.5">
                      {attendee.name}
                    </div>
                    <div className="text-gray-500 text-xs break-words">
                      {attendee.email}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>


      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translate(-50%, -40%);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }
        `}
      </style>
    </>
  );
};

export default AttendeesModal;
