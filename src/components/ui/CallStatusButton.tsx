import React from 'react';

interface CallStatusButtonProps {
  value: string;
  onClick?: () => void;
  isActive?: boolean;
}

const CallStatusButton: React.FC<CallStatusButtonProps> = ({ value, onClick, isActive }) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className={`
       group w-full cursor-pointer
        font-medium text-blue-500 underline
        transition-colors duration-200
        ${isActive ? 'text-blue-700' : ''}
      `}
    >
      <span className="truncate">{value || '-'}</span>
    </div>
  );
};

export default CallStatusButton;