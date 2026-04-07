import React, { useState } from 'react';
import { Search } from 'lucide-react';

type Props = {
  onSearch: (q: string) => void;
  placeholder?: string;
  className?: string;
  delay?: number;
  /** Renders inside the left segment of a unified search bar (e.g. filter trigger) */
  filterSlot?: React.ReactNode;
};

const SearchBar: React.FC<Props> = ({
  onSearch,
  placeholder = 'Search Brand',
  className = '',
  delay = 300,
  filterSlot,
}) => {
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

  const inputArea = (
    <div className="relative min-w-0 flex-1">
      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
        <Search className="w-4 h-4" aria-hidden />
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={
          filterSlot
            ? 'w-full sm:w-70 md:w-90 min-w-0 px-3 pl-9 py-2 border-0 rounded-r-lg bg-white text-gray-800 focus:outline-none focus:ring-0'
            : 'w-full sm:w-70 md:w-90 px-3 pl-9 py-2 border border-gray-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-black'
        }
      />
    </div>
  );

  if (filterSlot) {
    return (
      <div
        className={`flex items-stretch overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm focus-within:ring-1 focus-within:ring-black ${className}`}
      >
        <div className="flex shrink-0 items-stretch border-r border-gray-200">{filterSlot}</div>
        {inputArea}
      </div>
    );
  }

  return <div className={`flex items-center relative ${className}`}>{inputArea}</div>;
};

export default SearchBar;
