import React from 'react';
import Breadcrumb from './Breadcrumb';
import { ChevronLeft } from 'lucide-react';

interface MasterFormHeaderProps {
  onBack: () => void;
  title: string;
}

const MasterFormHeader: React.FC<MasterFormHeaderProps> = ({ 
  onBack,
  title
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <Breadcrumb />
        {/* keep title available for accessibility/screen-readers but don't render visibly to avoid duplication */}
        <span style={{ display: 'none' }}>{title}</span>
      </div>
      <button
        onClick={onBack}
        className="flex items-center space-x-2 btn-primary text-white px-3 py-1 rounded-lg"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="text-sm">Go Back</span>
      </button>
    </div>
  );
};

export default MasterFormHeader;