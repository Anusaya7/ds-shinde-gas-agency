import React from 'react';

export interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  isPositive?: boolean;
  color?: 'blue' | 'red' | 'amber' | 'emerald' | 'purple';
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon,
  change,
  isPositive,
  color = 'blue',
  onClick,
}) => {
  const colorMap = {
    blue: 'bg-blue-50 text-primary border-blue-100',
    red: 'bg-red-50 text-accent border-red-100',
    amber: 'bg-amber-50 text-warm-dark border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-100 p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
          <h3 className="text-2xl font-extrabold text-gray-900 mt-1.5 tracking-tight">{value}</h3>
          {change && (
            <p className="text-xs mt-1.5 flex items-center font-medium">
              <span className={isPositive ? 'text-emerald-600' : 'text-red-500'}>
                {isPositive ? '↑' : '↓'} {change}
              </span>
              <span className="text-gray-400 ml-1">vs last week</span>
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
