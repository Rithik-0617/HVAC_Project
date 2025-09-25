import React from 'react';
import { Power, Fan, Snowflake, Flame, Settings } from 'lucide-react';

interface SystemStatusProps {
  isOn: boolean;
  mode: 'heating' | 'cooling' | 'fan' | 'off';
  fanSpeed: number;
  onModeChange: (mode: 'heating' | 'cooling' | 'fan' | 'off') => void;
  onTogglePower: () => void;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({
  isOn,
  mode,
  fanSpeed,
  onModeChange,
  onTogglePower
}) => {
  const getModeIcon = (currentMode: string) => {
    switch (currentMode) {
      case 'heating': return <Flame className="h-5 w-5" />;
      case 'cooling': return <Snowflake className="h-5 w-5" />;
      case 'fan': return <Fan className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  const modes = [
    { key: 'off', label: 'Off', color: 'gray' },
    { key: 'fan', label: 'Fan', color: 'green' },
    { key: 'cooling', label: 'Cool', color: 'blue' },
    { key: 'heating', label: 'Heat', color: 'orange' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
        <button
          onClick={onTogglePower}
          className={`p-2 rounded-lg transition-colors ${
            isOn 
              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
        >
          <Power className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {modes.map((modeItem) => (
            <button
              key={modeItem.key}
              onClick={() => onModeChange(modeItem.key as any)}
              disabled={!isOn && modeItem.key !== 'off'}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                mode === modeItem.key
                  ? `border-${modeItem.color}-500 bg-${modeItem.color}-50 text-${modeItem.color}-700`
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
              } ${!isOn && modeItem.key !== 'off' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-center space-x-2">
                {getModeIcon(modeItem.key)}
                <span className="font-medium">{modeItem.label}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Fan Speed</span>
            <span className="text-sm text-gray-500">{fanSpeed}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${fanSpeed}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};