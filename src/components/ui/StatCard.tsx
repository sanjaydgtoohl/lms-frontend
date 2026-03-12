import React from 'react';

interface StatCardProps {
  title: string | React.ReactNode;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white p-3 md:p-4 xl:p-5 xxl:p-6 rounded-2xl border border-gray-200 flex items-center gap-3 shadow-custom">
      <div className="icon-wrapper">
        <div className="bg-item w-16 h-16 rounded-xl bg-gray-100 flex justify-center items-center border border-gray-200">
          <div className="text-5xl text-black relative z-10">{icon}</div>
        </div>
      </div>

      <div>
        <div className="text-xs text-gray-500">{title}</div>
        <div className="flex items-center justify-between mt-1">
          <h3 className="text-xl lg:text-2xl font-semibold">{value}</h3>
        </div>
      </div>

    </div>
  );
};

export default StatCard;


