import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CallStatusButton from './CallStatusButton';

interface CallStatusDropdownProps {
  value: string;
  options: string[];
  onChange: (newStatus: string) => void;
}

const CallStatusDropdown: React.FC<CallStatusDropdownProps> = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block w-full">
      <CallStatusButton
        value={value}
        onClick={() => setOpen((o) => !o)}
        isActive={open}
      />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute z-20 left-0 mt-2 w-44 bg-white shadow-lg rounded-xl border border-gray-200 transition-all"
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(opt);
                    setOpen(false);
                  }}
                >
                  {opt}
                </li>
              ))}
            </ul>
            <style>{`
              ul::-webkit-scrollbar { width: 6px; }
              ul::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
              ul::-webkit-scrollbar-track { background: #fff; }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CallStatusDropdown;
