import React from 'react';
import { Thermometer, Plus, Minus } from 'lucide-react';

interface TemperatureControlProps {
  currentTemp: number;
  targetTemp: number;
  onTempChange: (temp: number) => void;
  mode: 'heating' | 'cooling' | 'off';
}

export const TemperatureControl: React.FC<TemperatureControlProps> = ({
  currentTemp,
  targetTemp,
  onTempChange,
  mode
}) => {
  const getModeColor = () => {
    switch (mode) {
      case 'heating': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'cooling': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getProgressColor = () => {
    switch (mode) {
      case 'heating': return 'bg-orange-500';
      case 'cooling': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const progress = Math.abs(currentTemp - targetTemp) / 10 * 100;
  const isOnTarget = Math.abs(currentTemp - targetTemp) <= 1;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Temperature Control</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getModeColor()}`}>
          {mode.charAt(0).toUpperCase() + mode.slice(1)}
        </span>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Current</p>
          <div className="flex items-center">
            <Thermometer className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-3xl font-bold text-gray-900">{currentTemp}°</span>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Target</p>
          <div className="flex items-center">
            <button
              onClick={() => onTempChange(targetTemp - 1)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-3xl font-bold text-gray-900 mx-4">{targetTemp}°</span>
            <button
              onClick={() => onTempChange(targetTemp + 1)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: isOnTarget ? '100%' : `${Math.min(progress, 100)}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        {isOnTarget ? 'Target temperature reached' : `${Math.abs(currentTemp - targetTemp).toFixed(1)}° to target`}
      </p>
    </div>
  );
};