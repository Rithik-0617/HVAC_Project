import React from 'react';
import { Droplets, Filter, Wind, AlertTriangle } from 'lucide-react';

interface AirQualityProps {
  humidity: number;
  airQuality: number;
  filterLife: number;
}

export const AirQuality: React.FC<AirQualityProps> = ({
  humidity,
  airQuality,
  filterLife
}) => {
  const getAirQualityStatus = (quality: number) => {
    if (quality >= 80) return { label: 'Excellent', color: 'text-green-600 bg-green-100' };
    if (quality >= 60) return { label: 'Good', color: 'text-blue-600 bg-blue-100' };
    if (quality >= 40) return { label: 'Fair', color: 'text-yellow-600 bg-yellow-100' };
    return { label: 'Poor', color: 'text-red-600 bg-red-100' };
  };

  const getHumidityStatus = (humidity: number) => {
    if (humidity >= 40 && humidity <= 60) return { label: 'Optimal', color: 'text-green-600' };
    if (humidity < 30 || humidity > 70) return { label: 'Poor', color: 'text-red-600' };
    return { label: 'Fair', color: 'text-yellow-600' };
  };

  const airQualityStatus = getAirQualityStatus(airQuality);
  const humidityStatus = getHumidityStatus(humidity);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Air Quality</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Droplets className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">Humidity</p>
              <p className={`text-sm ${humidityStatus.color}`}>{humidityStatus.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{humidity}%</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Wind className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium text-gray-900">Air Quality</p>
              <span className={`text-xs px-2 py-1 rounded-full ${airQualityStatus.color}`}>
                {airQualityStatus.label}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{airQuality}</p>
            <p className="text-xs text-gray-500">AQI</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {filterLife < 20 ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : (
              <Filter className="h-5 w-5 text-gray-500" />
            )}
            <div>
              <p className="font-medium text-gray-900">Filter Life</p>
              <p className={`text-sm ${filterLife < 20 ? 'text-red-600' : 'text-gray-600'}`}>
                {filterLife < 20 ? 'Replace Soon' : 'Good Condition'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{filterLife}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};