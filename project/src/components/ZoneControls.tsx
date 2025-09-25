import React from 'react';
import { Home, MapPin, Thermometer } from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  currentTemp: number;
  targetTemp: number;
  isActive: boolean;
}

interface ZoneControlsProps {
  zones: Zone[];
  onZoneToggle: (zoneId: string) => void;
  onZoneTempChange: (zoneId: string, temp: number) => void;
}

export const ZoneControls: React.FC<ZoneControlsProps> = ({
  zones,
  onZoneToggle,
  onZoneTempChange
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Home className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Zone Controls</h3>
      </div>
      
      <div className="space-y-3">
        {zones.map((zone) => (
          <div 
            key={zone.id}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              zone.isActive 
                ? 'border-blue-200 bg-blue-50' 
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <MapPin className={`h-4 w-4 ${zone.isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${zone.isActive ? 'text-blue-900' : 'text-gray-600'}`}>
                  {zone.name}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={zone.isActive}
                  onChange={() => onZoneToggle(zone.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {zone.isActive && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Thermometer className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Current: {zone.currentTemp}°</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Target:</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onZoneTempChange(zone.id, zone.targetTemp - 1)}
                        className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{zone.targetTemp}°</span>
                      <button
                        onClick={() => onZoneTempChange(zone.id, zone.targetTemp + 1)}
                        className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};