import React from 'react';
import { Zap, TrendingUp, DollarSign } from 'lucide-react';

interface EnergyUsageProps {
  currentUsage: number;
  dailyUsage: number;
  monthlyCost: number;
  efficiency: number;
}

export const EnergyUsage: React.FC<EnergyUsageProps> = ({
  currentUsage,
  dailyUsage,
  monthlyCost,
  efficiency
}) => {
  const getEfficiencyColor = (eff: number) => {
    if (eff >= 85) return 'text-green-600';
    if (eff >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const weeklyData = [
    { day: 'Mon', usage: 24 },
    { day: 'Tue', usage: 28 },
    { day: 'Wed', usage: 22 },
    { day: 'Thu', usage: 26 },
    { day: 'Fri', usage: 30 },
    { day: 'Sat', usage: 35 },
    { day: 'Sun', usage: dailyUsage }
  ];

  const maxUsage = Math.max(...weeklyData.map(d => d.usage));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Energy Usage</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Current Usage</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{currentUsage} kW</p>
        </div>
        
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">Monthly Cost</span>
          </div>
          <p className="text-2xl font-bold text-green-900">${monthlyCost}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">System Efficiency</span>
          <span className={`text-sm font-semibold ${getEfficiencyColor(efficiency)}`}>
            {efficiency}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              efficiency >= 85 ? 'bg-green-500' : efficiency >= 70 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${efficiency}%` }}
          ></div>
        </div>
      </div>

      <div>
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Weekly Usage (kWh)</span>
        </div>
        <div className="flex items-end justify-between h-20">
          {weeklyData.map((data, index) => (
            <div key={index} className="flex flex-col items-center space-y-1">
              <div 
                className="w-6 bg-blue-500 rounded-t"
                style={{ height: `${(data.usage / maxUsage) * 60}px` }}
              ></div>
              <span className="text-xs text-gray-500">{data.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};