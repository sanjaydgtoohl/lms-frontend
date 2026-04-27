import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Badge from './Badge';
import ConfirmDialog from './ConfirmDialog';

const DROPDOWN_WIDTH = 176;
const DROPDOWN_EST_HEIGHT = 220;
const VIEWPORT_GAP = 8;

interface StatusDropdownProps {
  value: string;
  options: string[];
  onChange: (newValue: string) => void;
  onConfirm?: (newValue: string) => Promise<void>;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ value, options, onChange, onConfirm }) => {
  const [open, setOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openAbove = spaceBelow < DROPDOWN_EST_HEIGHT && spaceAbove > spaceBelow;

    let left = rect.left;
    if (left + DROPDOWN_WIDTH > window.innerWidth - VIEWPORT_GAP) {
      left = Math.max(VIEWPORT_GAP, rect.right - DROPDOWN_WIDTH);
    }

    setDropdownPos({
      top: openAbove
        ? Math.max(VIEWPORT_GAP, rect.top - DROPDOWN_EST_HEIGHT - VIEWPORT_GAP)
        : Math.min(window.innerHeight - DROPDOWN_EST_HEIGHT - VIEWPORT_GAP, rect.bottom + VIEWPORT_GAP),
      left: Math.max(VIEWPORT_GAP, left),
    });
  }, []);

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

  useEffect(() => {
    if (!open) return;

    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, updatePosition]);

  const handleToggle = () => {
    if (!open) {
      updatePosition();
    }
    setOpen((o) => !o);
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
      // Always call onChange first to update parent state
      onChange(selectedOption);
      if (onConfirm) {
        await onConfirm(selectedOption);
      }
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
    <div ref={ref} className="relative inline-block">
      <span onClick={handleToggle} className="inline-block cursor-pointer text-blue-600 hover:text-blue-700 underline transition-colors">
        <Badge status={value}>{value}</Badge>
      </span>

      {open && createPortal(
        <div
          ref={portalRef}
          className="fixed z-50 bg-white shadow-lg rounded-xl border border-gray-200"
          style={{
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            width: `${DROPDOWN_WIDTH}px`,
          }}
        >
          <ul
            tabIndex={-1}
            role="listbox"
            className="max-h-56 overflow-y-auto focus:outline-none"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb #fff' }}
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
        title="Change Status"
        message={`Change status to ${selectedOption ? `"${selectedOption}"` : 'this status'}?`}
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

export default StatusDropdown;
