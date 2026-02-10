import React, { useState } from 'react';
import { Search } from 'lucide-react';

type Props = {
  onSearch: (q: string) => void;
  placeholder?: string;
  className?: string;
  delay?: number;
};

const SearchBar: React.FC<Props> = ({ onSearch, placeholder = 'Search Brand', className = '', delay = 300 }) => {
  const [value, setValue] = useState('');
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | undefined>();

  const handleChange = (v: string) => {
    setValue(v);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (delay === 0) {
      onSearch(v.trim());
    } else {
      const newTimeoutId = setTimeout(() => {
        onSearch(v.trim());
      }, delay);
      setTimeoutId(newTimeoutId);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
          <Search className="w-4 h-4" />
        </span>
        <input
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="w-full sm:w-56 md:w-64 px-3 pl-9 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
      </div>
    </div>
  );
};

export default SearchBar;
