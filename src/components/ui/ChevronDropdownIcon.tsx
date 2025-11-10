import { ChevronDown } from 'lucide-react';

interface ChevronDropdownIconProps {
  isOpen?: boolean;
  className?: string;
}

export const ChevronDropdownIcon = ({ isOpen, className = '' }: ChevronDropdownIconProps) => {
  return (
    <ChevronDown 
      className={`pointer-events-none w-4 h-4 min-w-[1rem] min-h-[1rem] text-[var(--text-secondary)] transition-transform ${
        isOpen ? 'rotate-180' : ''
      } ${className}`}
    />
  );
};

export default ChevronDropdownIcon;