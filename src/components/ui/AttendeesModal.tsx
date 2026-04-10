import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Meeting as ApiMeeting } from '../../services/Meeting';

interface AttendeesModalProps {
  isOpen: boolean;
  attendees: ApiMeeting['attendees'];
  onClose: () => void;
  title?: string;
}

const ANIMATION_DURATION = 250;

const AttendeesModal: React.FC<AttendeesModalProps> = ({
  isOpen,
  attendees,
  onClose,
  title = 'Meeting Attendees',
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [displayAttendees, setDisplayAttendees] = useState(attendees);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      setDisplayAttendees(attendees);
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
  }, [isOpen, attendees]);

  if (!shouldRender || typeof document === 'undefined' || !document.body) return null;

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
        className={`modal-content 
          modal-body rounded-2xl shadow-2xl
           z-50 flex flex-col overflow-hidden
          border border-gray-200 dark:border-gray-700
          ${isClosing ? 'closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 dark:to-gray-700">
          <div>
            <h3 className="modal-title font-bold text-lg md:text-xl text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="modal-subtitle text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {displayAttendees.length}{' '}
              {displayAttendees.length === 1 ? 'attendee' : 'attendees'}
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
          {displayAttendees.length === 0 ? (
            <div className="modal-empty-state">
              <div className="modal-empty-state-icon">👥</div>
              <p className="modal-empty-state-text font-medium">No attendees found.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {displayAttendees.map((attendee) => (
                <li
                  key={attendee.id}
                  className="modal-item p-2 rounded-xl flex items-center gap-4 border border-gray-200 dark:border-gray-600 transition-all duration-200 
                    hover:bg-gray-100/50 dark:hover:bg-gray-600/70 hover:translate-x-0.5 hover:shadow-md dark:hover:shadow-lg"
                >
                  <div className="modal-avatar bg-blue-100 text-gray-600 font-bold text-base shrink-0">
                    {attendee.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="modal-text font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                      {attendee.name}
                    </div>
                    <div className="modal-text-muted text-xs sm:text-sm break-words text-gray-600 dark:text-gray-400">
                      {attendee.email}
                    </div>
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

export default AttendeesModal;