import React, { useEffect, useState } from 'react';
import type { Meeting as ApiMeeting } from '../../services/Meeting';

interface AttendeesModalProps {
  isOpen: boolean;
  attendees: ApiMeeting['attendees'];
  onClose: () => void;
  title?: string;
}

const ANIMATION_DURATION = 200; // must match CSS

const AttendeesModal: React.FC<AttendeesModalProps> = ({
  isOpen,
  attendees,
  onClose,
  title = 'Meeting Attendees',
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [displayAttendees, setDisplayAttendees] = useState(attendees);

  // Handle mount/unmount + body scroll
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setDisplayAttendees(attendees);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';

      const timer = setTimeout(() => {
        setShouldRender(false);
      }, ANIMATION_DURATION);

      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, attendees]);

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
          rounded-xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.3)] 
          w-[90%] max-w-[520px] max-h-[85vh] z-50 flex flex-col overflow-hidden
          ${isOpen ? 'animate-fadeIn' : 'animate-fadeOut pointer-events-none'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="font-bold text-base md:text-lg xl:text-xl text-gray-800">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-400">
              {displayAttendees.length}{' '}
              {displayAttendees.length === 1 ? 'attendee' : 'attendees'}
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
          {displayAttendees.length === 0 ? (
            <div className="text-center py-10 px-5 text-gray-400">
              <div className="text-5xl mb-3">👥</div>
              <p className="text-sm">No attendees found.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {displayAttendees.map((attendee) => (
                <li
                  key={attendee.id}
                  className="p-2 rounded-lg bg-gray-100 flex items-center gap-3 border border-gray-200 transition-all duration-200 hover:bg-gray-200 hover:translate-x-1"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-base shrink-0">
                    {attendee.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 text-sm">
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
    </>
  );
};

export default AttendeesModal;