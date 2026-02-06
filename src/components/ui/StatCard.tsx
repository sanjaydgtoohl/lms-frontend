import React from 'react';

interface StatCardProps {
  title: string | React.ReactNode;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendValue }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Avoid <div> inside <p> for hydration safety */}
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
            {trendValue && (
              <span className={`text-xs font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;


