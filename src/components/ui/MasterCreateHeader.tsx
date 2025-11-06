import React from 'react';
import { ChevronLeft } from 'lucide-react';
import Breadcrumb from './Breadcrumb';

interface MasterCreateHeaderProps {
  title: string;
  onClose?: () => void;
}

export const MasterCreateHeader: React.FC<MasterCreateHeaderProps> = ({
  title,
  onClose,
}) => {
  return (
    <div>
      <div className="mb-3">
        <Breadcrumb />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center space-x-2 btn-primary text-white px-3 py-1 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
          )}
          {title && (
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h1>
          )}
        </div>
      </div>
    </div>
  );
};
