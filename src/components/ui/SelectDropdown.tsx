import React, { useEffect, useRef, useState } from 'react';

type Option = { value: string; label: string } | string;

type SelectDropdownProps = {
  name?: string;
  value?: string | string[];
  placeholder?: string;
  options: Option[];
  onChange: (val: string | string[]) => void;
  searchable?: boolean;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  isMulti?: boolean;
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
  isMulti = false,
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

  // Multi-select: value is array, show tags
  const selectedValues = isMulti ? (Array.isArray(value) ? value : []) : [String(value)];
  const selectedLabels = normalized.filter(n => selectedValues.includes(String(n.value)));

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="w-full relative">
        <div
          className={`flex flex-wrap items-center min-h-[40px] px-2 py-1 border border-[#DDE1E7] rounded-[10px] bg-white relative ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          style={{ gap: '6px', paddingRight: '32px' }}
          onClick={() => !disabled && setOpen(true)}
        >
          {/* Multi-select: show tags */}
          {isMulti && selectedLabels.length > 0 && selectedLabels.map((opt) => (
            <span key={opt.value} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center" style={{ marginBottom: '2px' }}>
              {opt.label}
              <button
                type="button"
                className="ml-1 text-blue-700 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  const newVals = selectedValues.filter((v) => v !== opt.value);
                  onChange(newVals);
                }}
                aria-label="Remove"
                style={{ fontSize: '14px', lineHeight: '1' }}
              >
                ×
              </button>
            </span>
          ))}
          <input
            name={name}
            value={open && searchable ? query : (!isMulti ? (selectedLabels[0]?.label || '') : '')}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              setTimeout(() => {
                if (ref.current && !ref.current.contains(document.activeElement as Node)) setOpen(false);
              }, 0);
            }}
            placeholder={isMulti && selectedLabels.length > 0 ? '' : placeholder}
            className={`flex-1 min-w-[120px] h-8 px-2 text-sm font-medium bg-transparent text-[var(--text-primary)] border-none focus:outline-none ${inputClassName}`}
            disabled={disabled}
            autoComplete="off"
            style={{ boxShadow: 'none', minWidth: '120px', marginBottom: '2px' }}
          />
          <input type="hidden" name={name ? name : undefined} value={isMulti ? selectedValues.join(',') : value} />
          {/* dropdown arrow */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      <div
        role="listbox"
        aria-hidden={!open}
        className={`absolute z-50 left-0 right-0 mt-2 bg-white border border-[var(--border-color)] rounded-lg shadow-lg max-h-[180px] overflow-y-auto transition-all duration-150 ${open ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      >
        {filtered.length === 0 ? (
          <div className="px-4 py-2 text-gray-500">No matches found</div>
        ) : (
          filtered.map((opt) => {
            const o = normalize(opt);
            const active = selectedValues.includes(String(o.value));
            return (
              <div
                key={o.value}
                role="option"
                aria-selected={active}
                tabIndex={0}
                className={`px-4 py-2 cursor-pointer ${active ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700'} hover:bg-blue-50`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (isMulti) {
                    let newVals;
                    if (active) {
                      newVals = selectedValues.filter((v) => v !== o.value);
                    } else {
                      newVals = [...selectedValues, o.value];
                    }
                    onChange(newVals);
                  } else {
                    onChange(o.value);
                    setOpen(false);
                  }
                  if (!isMulti) setOpen(false);
                }}
              >
                {o.label}
                {isMulti && active && <span className="ml-2 text-xs">✓</span>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SelectDropdown;
