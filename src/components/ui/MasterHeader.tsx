import React from 'react';
import Breadcrumb, { type BreadcrumbItem } from './Breadcrumb';
import { Plus } from 'lucide-react';

interface MasterHeaderProps {
  onCreateClick: () => void;
  createButtonLabel?: string;
  breadcrumbItems?: BreadcrumbItem[];
  currentPageTitle?: string;
  showBreadcrumb?: boolean;
}

const MasterHeader: React.FC<MasterHeaderProps> = ({ 
  onCreateClick, 
  createButtonLabel = 'Create New',
  breadcrumbItems,
  currentPageTitle,
  showBreadcrumb = true,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      {/* Left Side - Breadcrumb */}
      <div className="flex-1 min-w-0">
        {showBreadcrumb && (
          <Breadcrumb 
            items={breadcrumbItems}
            currentPageTitle={currentPageTitle}
          />
        )}
      </div>

      {/* Right Side - Create Button */}
      <div className="flex-shrink-0">
        <button
          onClick={onCreateClick}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 btn-primary text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>{createButtonLabel}</span>
        </button>
      </div>
    </div>
  );
};

export default MasterHeader;
