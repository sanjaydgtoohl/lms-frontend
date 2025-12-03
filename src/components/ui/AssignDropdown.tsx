import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AssignButton from './AssignButton';

interface AssignDropdownProps {
  value: string;
  options: string[];
  onChange: (newValue: string) => void;
}

const AssignDropdown: React.FC<AssignDropdownProps> = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<'top' | 'bottom'>('bottom');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // compute placement (top or bottom) when opening based on viewport space
  useEffect(() => {
    if (!open) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const DROPDOWN_EST_HEIGHT = 220; // estimate dropdown height
    // prefer top if not enough space below but there is space above
    if (spaceBelow < DROPDOWN_EST_HEIGHT && spaceAbove > spaceBelow) {
      setPlacement('top');
    } else {
      setPlacement('bottom');
    }
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block w-full">
      <AssignButton
        value={value}
        onClick={() => setOpen((o) => !o)}
        isActive={open}
      />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: placement === 'bottom' ? 8 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: placement === 'bottom' ? 8 : -8 }}
            transition={{ duration: 0.18 }}
            className={
              `absolute z-20 left-0 w-44 bg-white shadow-lg rounded-xl border border-gray-200 transition-all ` +
              (placement === 'bottom' ? 'mt-2 top-full' : 'mb-2 bottom-full')
            }
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
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssignDropdown;
