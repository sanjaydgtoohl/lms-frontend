import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AssignButton from './AssignButton';
import ConfirmDialog from './ConfirmDialog';

interface AssignDropdownProps {
  value: string;
  options: string[];
  onChange: (newValue: string) => void;
  onConfirm?: (newValue: string) => Promise<void>;
  context?: 'brief' | 'lead';
}

const AssignDropdown: React.FC<AssignDropdownProps> = ({ value, options, onChange, onConfirm, context = 'brief' }) => {
  const [open, setOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (ref.current && !ref.current.contains(target) && portalRef.current && !portalRef.current.contains(target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // compute placement (top or bottom) when opening based on viewport space
  const handleToggle = () => {
    if (open) {
      setOpen(false);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const DROPDOWN_EST_HEIGHT = 220; // estimate dropdown height

    // prefer top if not enough space below but there is space above
    const newPlacement = spaceBelow < DROPDOWN_EST_HEIGHT && spaceAbove > spaceBelow ? 'top' : 'bottom';

    // Calculate fixed positioning
    setPosition({
      top: newPlacement === 'bottom' ? rect.bottom + window.scrollY + 8 : rect.top + window.scrollY - DROPDOWN_EST_HEIGHT - 8,
      left: rect.left + window.scrollX,
    });

    setOpen(true);
  };

  const handleOptionSelect = (opt: string) => {
    if (onConfirm) {
      // Show confirmation dialog before making the change
      setSelectedOption(opt);
      setConfirmDialogOpen(true);
      setOpen(false);
    } else {
      // Direct change without confirmation
      onChange(opt);
      setOpen(false);
    }
  };

  const handleConfirmChange = async () => {
    if (!selectedOption) return;
    setConfirmLoading(true);
    try {
      if (onConfirm) {
        await onConfirm(selectedOption);
      }
      onChange(selectedOption);
      setConfirmDialogOpen(false);
      setSelectedOption(null);
    } catch (err) {
      console.error('Failed to confirm change:', err);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancelChange = () => {
    setConfirmDialogOpen(false);
    setSelectedOption(null);
  };

  return (
    <div ref={ref} className="relative inline-block w-full">
      <AssignButton
        value={value}
        onClick={handleToggle}
        isActive={open}
      />
      {open && createPortal(
        <div
          ref={portalRef}
          className="fixed z-50 bg-white shadow-lg rounded-xl border border-gray-200"
          style={{
            top: position.top,
            left: position.left,
            width: 'auto',
            minWidth: '180px',
          }}
        >
            <ul
              tabIndex={-1}
              role="listbox"
              className="max-h-56 overflow-y-auto focus:outline-none"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#e5e7eb #fff',
              }}
            >
              {options.map((opt) => (
                <li
                  key={opt}
                  role="option"
                  aria-selected={opt === value}
                  className={`px-4 py-2 cursor-pointer transition-all hover:bg-blue-50/60 ${
                    opt === value ? 'bg-blue-50/80 text-blue-700 font-semibold' : 'text-gray-700'
                  }`}
                  onClick={() => handleOptionSelect(opt)}
                >
                  {opt}
                </li>
              ))}
            </ul>
            {/* Custom minimal scrollbar */}
            <style>{`
              ul::-webkit-scrollbar {
                width: 6px;
              }
              ul::-webkit-scrollbar-thumb {
                background: #e5e7eb;
                border-radius: 4px;
              }
              ul::-webkit-scrollbar-track {
                background: #fff;
              }
            `}</style>
          </div>,
        document.body
      )}
      <ConfirmDialog
        isOpen={confirmDialogOpen}
        title={`Assign ${context === 'lead' ? 'Lead' : 'Brief'}`}
        message={`Assign this ${context === 'lead' ? 'lead' : 'brief'} to ${selectedOption ? `"${selectedOption}"` : 'this user'}?`}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        loading={confirmLoading}
        type="assign"
        onConfirm={handleConfirmChange}
        onCancel={handleCancelChange}
      />
    </div>
  );
};

export default AssignDropdown;
