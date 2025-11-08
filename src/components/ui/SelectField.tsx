import React, { useEffect, useRef, useState } from 'react';

type Option = { value: string; label: string } | string;

type SelectFieldProps = {
  name?: string;
  value?: string;
  placeholder?: string;
  options: Option[];
  onChange: (val: string) => void;
  searchable?: boolean;
  className?: string;
  inputClassName?: string;
};

const normalize = (opt: Option): { value: string; label: string } => {
  return typeof opt === 'string' ? { value: opt, label: opt } : opt;
};

const SelectField: React.FC<SelectFieldProps> = ({ name, value = '', placeholder = '', options, onChange, searchable = true, className = '', inputClassName }) => {
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
    // reset query when opening/closing so the list shows full options
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
            // allow click events inside dropdown; close shortly after
            setTimeout(() => {
              if (ref.current && !ref.current.contains(document.activeElement as Node)) setOpen(false);
            }, 0);
          }}
          placeholder={placeholder}
          className={`w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] ${inputClassName ?? 'border border-[var(--border-color)]'}`}
          autoComplete="off"
        />
        <input type="hidden" name={name ? name : undefined} value={value} />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div
        role="listbox"
        aria-hidden={!open}
        className={`absolute z-50 left-0 right-0 mt-1 bg-white border border-[var(--border-color)] rounded-lg shadow-lg max-h-56 overflow-y-auto transition-all duration-150 ${open ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
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

export default SelectField;
