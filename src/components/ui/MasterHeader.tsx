import React from 'react';
import Breadcrumb from './Breadcrumb';
import { Plus } from 'lucide-react';

interface MasterHeaderProps {
  onCreateClick: () => void;
  createButtonLabel?: string;
}

const MasterHeader: React.FC<MasterHeaderProps> = ({ 
  onCreateClick, 
  createButtonLabel = 'Create New'
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <Breadcrumb />
      <button
        onClick={onCreateClick}
        className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-black text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md sm:whitespace-nowrap"
      >
        <Plus className="w-4 h-4" />
        <span>{createButtonLabel}</span>
      </button>
    </div>
  );
};

export default MasterHeader;