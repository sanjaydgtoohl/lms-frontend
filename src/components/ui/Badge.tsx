import React from 'react';

type Props = {
  status?: string;
  children?: React.ReactNode;
};

const statusMap: Record<string, string> = {
  'not interested': 'bg-gray-100 text-gray-700',
  'not-interested': 'bg-gray-100 text-gray-700',
  'submission': 'bg-yellow-100 text-yellow-800',
  'negotiation': 'bg-orange-100 text-orange-800',
  'approve': 'bg-green-100 text-green-800',
  'approved': 'bg-green-100 text-green-800',
  'closed': 'bg-red-100 text-red-800',
};

const Badge: React.FC<Props> = ({ status, children }) => {
  const key = String(status || (children ?? '')).trim().toLowerCase();
  const classes = statusMap[key] || 'bg-gray-50 text-[var(--text-secondary)]';

  return (
    <span
      className={`inline-flex items-center justify-center h-7 w-28 border border-transparent rounded-full text-xs font-medium leading-tight whitespace-nowrap ${classes}`}
      aria-label={String(children ?? status)}
    >
      {children ?? status}
    </span>
  );
};

export default Badge;
