import React from 'react';

interface StatCardProps {
  title: string | React.ReactNode;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <div className="bg-[var(--hover-bg)] p-4 rounded-lg border border-gray-200">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="flex items-center justify-between mt-2">
        <h3 className="text-2xl font-semibold">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;


