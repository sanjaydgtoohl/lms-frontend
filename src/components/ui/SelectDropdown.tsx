import React, { useEffect, useRef, useState } from 'react';

type Option = { value: string; label: string } | string;

type SelectDropdownProps = {
  name?: string;
  value?: string;
  placeholder?: string;
  options: Option[];
  onChange: (val: string) => void;
  searchable?: boolean;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
};

const normalize = (opt: Option): { value: string; label: string } => {
  return typeof opt === 'string' ? { value: opt, label: opt } : opt;
};

// Reusable SelectDropdown: matches Contact Person field styles and behavior
const SelectDropdown: React.FC<SelectDropdownProps> = ({
  name,
  value = '',
  placeholder = 'Search or select option',
  options,
  onChange,
  searchable = true,
  className = '',
  inputClassName = '',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement | null>(null);

  const normalized = options.map(normalize);
  const filtered = query ? normalized.filter(o => o.label.toLowerCase().includes(query.toLowerCase())) : normalized;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const selectedLabel = normalized.find(n => String(n.value) === String(value))?.label ?? '';

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="w-full relative">
        <input
          name={name}
          value={open && searchable ? query : (selectedLabel || '')}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // allow clicks inside dropdown; close after event loop so clicks register
            setTimeout(() => {
              if (ref.current && !ref.current.contains(document.activeElement as Node)) setOpen(false);
            }, 0);
          }}
          placeholder={placeholder}
          className={`w-full h-10 px-4 text-sm rounded-[10px] bg-white text-[var(--text-primary)] border border-[#DDE1E7] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1570EF] ${inputClassName} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          disabled={disabled}
          autoComplete="off"
        />
        <input type="hidden" name={name ? name : undefined} value={value} />

        {/* dropdown arrow - same visual as Contact Person field */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div
        role="listbox"
        aria-hidden={!open}
    className={`absolute z-50 left-0 right-0 mt-2 bg-white border border-[var(--border-color)] rounded-lg shadow-lg max-h-[72px] overflow-y-auto transition-all duration-150 ${open ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      >
        {filtered.length === 0 ? (
          <div className="px-4 py-2 text-gray-500">No matches found</div>
        ) : (
          filtered.map((opt) => {
            const o = normalize(opt);
            const active = String(o.value) === String(value);
            return (
              <div
                key={o.value}
                role="option"
                aria-selected={active}
                tabIndex={0}
                className={`px-4 py-2 cursor-pointer ${active ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700'} hover:bg-blue-50`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(o.value);
                  setOpen(false);
                }}
              >
                {o.label}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SelectDropdown;
