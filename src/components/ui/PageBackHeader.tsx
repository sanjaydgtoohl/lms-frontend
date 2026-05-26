import React from 'react';
import Breadcrumb from './Breadcrumb';
import Button from './Button';
import { FaAngleLeft } from 'react-icons/fa';

interface PageBackHeaderProps {
  onBack: () => void;
  title?: string;
  backLabel?: string;
  showTitle?: boolean;
  className?: string;
}

/** Unified breadcrumb + back action for master/RBAC forms and views */
const PageBackHeader: React.FC<PageBackHeaderProps> = ({
  onBack,
  title,
  backLabel = 'Go Back',
  showTitle = false,
  className = 'mb-6',
}) => (
  <div
    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${className}`}
  >
    <div className="flex flex-col gap-2">
      <Breadcrumb />
      {showTitle && title ? (
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      ) : title ? (
        <span className="sr-only">{title}</span>
      ) : null}
    </div>
    <Button onClick={onBack} className="flex items-center space-x-2 px-4 py-2">
      <FaAngleLeft className="w-4 h-4" />
      <span className="text-sm text-white">{backLabel}</span>
    </Button>
  </div>
);

export default PageBackHeader;
