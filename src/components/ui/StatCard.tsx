import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
            {icon}
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-gray-500 tracking-wide">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;


