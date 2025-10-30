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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 p-4 bg-white rounded-2xl shadow-sm border border-[var(--border-color)]">
      <Breadcrumb />
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-[var(--text-secondary)] hover:text-black"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>
    </div>
  );
};

export default MasterFormHeader;