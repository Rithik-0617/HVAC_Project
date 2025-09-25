import React from 'react';
import { Clock, Calendar, Plus } from 'lucide-react';

interface Schedule {
  id: string;
  name: string;
  time: string;
  temperature: number;
  days: string[];
  isActive: boolean;
}

interface ScheduleControlProps {
  schedules: Schedule[];
  onScheduleToggle: (scheduleId: string) => void;
}

export const ScheduleControl: React.FC<ScheduleControlProps> = ({
  schedules,
  onScheduleToggle
}) => {
  const formatDays = (days: string[]) => {
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes('Sat') && !days.includes('Sun')) return 'Weekdays';
    if (days.length === 2 && days.includes('Sat') && days.includes('Sun')) return 'Weekends';
    return days.join(', ');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
        </div>
        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        {schedules.map((schedule) => (
          <div 
            key={schedule.id}
            className={`p-4 rounded-lg border transition-all duration-200 ${
              schedule.isActive 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <Clock className={`h-4 w-4 ${schedule.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${schedule.isActive ? 'text-green-900' : 'text-gray-600'}`}>
                    {schedule.name}
                  </span>
                </div>
                <div className="ml-7 text-sm text-gray-600">
                  <p>{schedule.time} • {schedule.temperature}° • {formatDays(schedule.days)}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={schedule.isActive}
                  onChange={() => onScheduleToggle(schedule.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        ))}
      </div>
      
      {schedules.filter(s => s.isActive).length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">No active schedules</p>
          <p className="text-xs">Enable schedules to automate your HVAC system</p>
        </div>
      )}
    </div>
  );
};