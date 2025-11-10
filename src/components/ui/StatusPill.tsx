import React from 'react';

interface StatusPillProps {
  label: string;
  color?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ 
  label, 
  color = '#22c55e' // Default color if none provided
}) => {
  return (
    <div 
      className="inline-flex items-center px-3 py-1 bg-white border border-[#D1D5DB] rounded-full shadow-sm hover:bg-[#F9FAFB] transition-colors duration-150"
    >
      <div 
        className="w-2 h-2 rounded-full mr-2"
        style={{ backgroundColor: color }}
      />
      <span className="text-[#374151] font-medium">
        {label}
      </span>
    </div>
  );
};

export default StatusPill;