import { icons } from 'lucide-react';
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
    <div className="bg-gray-100 p-6 rounded-2xl border border-gray-200 flex items-center gap-3 shadow-custom">
      <div className="icon-wrapper">
        <div className="bg-item w-16 h-16 rounded-full bg-gray-900 flex justify-center items-center">
          <div className="text-5xl text-white relative z-10">{icon}</div>
        </div>
      </div>

      <div>
        <div className="text-xs text-gray-500">{title}</div>
        <div className="flex items-center justify-between mt-1">
          <h3 className="text-2xl lg:text-3xl font-semibold">{value}</h3>
        </div>
      </div>


    </div>
  );
};

export default StatCard;


