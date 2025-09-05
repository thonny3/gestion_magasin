import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ChartCardProps {
  title: string;
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  total: number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const ChartCard: React.FC<ChartCardProps> = ({ title, data, total, trend }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? (
              <TrendingUp size={16} />
            ) : (
              <TrendingDown size={16} />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      {/* Simple bar chart */}
      <div className="space-y-3">
        <div className="grid grid-cols-12 gap-2 items-end h-36">
          {data.map((item, idx) => (
            <div key={idx} className="col-span-1 flex flex-col items-center">
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{ height: `${(item.value / (maxValue || 1)) * 100}%`, backgroundColor: item.color }}
                title={`${item.label}: ${item.value}`}
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-12 gap-2">
          {data.map((item, idx) => (
            <div key={idx} className="col-span-1 text-center text-xs text-gray-600 truncate" title={item.label}>
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total</span>
          <span className="text-lg font-bold text-gray-900">{total}</span>
        </div>
      </div>
    </div>
  );
};

export default ChartCard;


