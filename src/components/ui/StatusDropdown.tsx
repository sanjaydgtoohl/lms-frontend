import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Badge from './Badge';

interface StatusDropdownProps {
  value: string;
  options: string[];
  onChange: (newValue: string) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

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

  const handleToggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
    setOpen((o) => !o);
  };

  return (
    <div ref={ref} className="relative inline-block">
      <span onClick={handleToggle} className="inline-block cursor-pointer">
        <Badge status={value}>{value}</Badge>
      </span>

      {open && createPortal(
        <div
          ref={portalRef}
          className="fixed z-50 bg-white shadow-lg rounded-xl border border-gray-200"
          style={{
            top: `${dropdownPos.top + 8}px`,
            left: `${dropdownPos.left}px`,
            width: '176px',
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
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
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
    </div>
  );
};

export default StatusDropdown;
