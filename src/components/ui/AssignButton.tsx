import React from 'react';

interface AssignButtonProps {
  value: string;
  onClick?: () => void;
  isActive?: boolean;
}

const AssignButton: React.FC<AssignButtonProps> = ({ value, onClick, isActive }) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className={`
        group flex items-center justify-center w-full cursor-pointer
        font-medium text-gray-600 hover:text-blue-600
        transition-colors duration-200
        ${isActive ? 'text-blue-600' : ''}
      `}
    >
      <span className="truncate">{value}</span>
    </div>
  );
};

export default AssignButton;
