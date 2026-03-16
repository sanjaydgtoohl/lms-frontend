import React from 'react';
import Breadcrumb from './Breadcrumb';
import { IoIosArrowBack } from 'react-icons/io';

interface MasterCreateHeaderProps {
  title?: string;
  onClose?: () => void;
}

export const MasterCreateHeader: React.FC<MasterCreateHeaderProps> = ({
  title,
  onClose,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Breadcrumb />
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center space-x-2 btn-primary text-white px-3 py-1 rounded-lg"
          >
            <IoIosArrowBack className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
        )}
      </div>
      {title && (
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      )}
    </div>
  );
};
