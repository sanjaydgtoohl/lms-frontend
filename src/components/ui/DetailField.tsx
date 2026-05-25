import React from 'react';

interface DetailFieldProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

/** Label/value cell for RBAC and master detail grids */
const DetailField: React.FC<DetailFieldProps> = ({ label, value, className = '' }) => (
  <div
    className={`flex gap-x-3 items-center bg-gray-50 border border-gray-200 rounded-lg py-3 px-3 ${className}`}
  >
    <div className="text-sm text-gray-800 font-semibold shrink-0">{label}</div>
    <div className="text-sm text-gray-600 break-words">{value ?? '-'}</div>
  </div>
);

export default DetailField;
