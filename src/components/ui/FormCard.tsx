import React from 'react';

interface FormCardProps {
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

/** Standard white card shell for create/edit/detail forms */
const FormCard: React.FC<FormCardProps> = ({
  children,
  className = '',
  bodyClassName = 'p-6 bg-gray-50 rounded-2xl',
}) => (
  <div
    className={`w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${className}`}
  >
    <div className={bodyClassName}>{children}</div>
  </div>
);

export default FormCard;
