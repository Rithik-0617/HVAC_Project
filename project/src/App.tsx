import React, { useState, useEffect } from 'react';
import { TemperatureControl } from './components/TemperatureControl';
import { SystemStatus } from './components/SystemStatus';
import { AirQuality } from './components/AirQuality';
import { EnergyUsage } from './components/EnergyUsage';
import { ZoneControls } from './components/ZoneControls';
import { ScheduleControl } from './components/ScheduleControl';
import { Thermometer, Wifi, WifiOff } from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  currentTemp: number;
  targetTemp: number;
  isActive: boolean;
}

interface Schedule {
  id: string;
  name: string;
  time: string;
  temperature: number;
  days: string[];
  isActive: boolean;
}

function App() {
  const [currentTemp, setCurrentTemp] = useState(72);
  const [targetTemp, setTargetTemp] = useState(75);
  const [isSystemOn, setIsSystemOn] = useState(true);
  const [systemMode, setSystemMode] = useState<'heating' | 'cooling' | 'fan' | 'off'>('cooling');
  const [fanSpeed, setFanSpeed] = useState(65);
  const [humidity, setHumidity] = useState(45);
  const [airQuality, setAirQuality] = useState(78);
  const [filterLife, setFilterLife] = useState(67);
  const [isConnected, setIsConnected] = useState(true);

  const [zones, setZones] = useState<Zone[]>([
    { id: '1', name: 'Living Room', currentTemp: 72, targetTemp: 75, isActive: true },
    { id: '2', name: 'Master Bedroom', currentTemp: 70, targetTemp: 72, isActive: true },
    { id: '3', name: 'Kitchen', currentTemp: 74, targetTemp: 73, isActive: false },
    { id: '4', name: 'Guest Room', currentTemp: 69, targetTemp: 70, isActive: false }
  ]);

  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: '1',
      name: 'Morning Warmup',
      time: '6:00 AM',
      temperature: 72,
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      isActive: true
    },
    {
      id: '2',
      name: 'Energy Saver',
      time: '10:00 PM',
      temperature: 68,
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      isActive: false
    },
    {
      id: '3',
      name: 'Weekend Comfort',
      time: '8:00 AM',
      temperature: 74,
      days: ['Sat', 'Sun'],
      isActive: true
    }
  ]);

  // Simulate system responses and data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate temperature adjustment
      if (isSystemOn && systemMode !== 'off') {
        setCurrentTemp(prev => {
          const diff = targetTemp - prev;
          if (Math.abs(diff) > 0.5) {
            return prev + (diff > 0 ? 0.5 : -0.5);
          }
          return prev;
        });
      }

      // Simulate minor fluctuations in other readings
      setHumidity(prev => Math.max(30, Math.min(70, prev + (Math.random() - 0.5) * 2)));
      setAirQuality(prev => Math.max(40, Math.min(95, prev + (Math.random() - 0.5) * 3)));
    }, 5000);

    return () => clearInterval(interval);
  }, [targetTemp, isSystemOn, systemMode]);

  const handleTempChange = (temp: number) => {
    setTargetTemp(Math.max(60, Math.min(85, temp)));
  };

  const handleModeChange = (mode: 'heating' | 'cooling' | 'fan' | 'off') => {
    setSystemMode(mode);
    if (mode === 'off') {
      setIsSystemOn(false);
    } else {
      setIsSystemOn(true);
    }
  };

  const handleTogglePower = () => {
    setIsSystemOn(!isSystemOn);
    if (!isSystemOn) {
      setSystemMode('fan');
    } else {
      setSystemMode('off');
    }
  };

  const handleZoneToggle = (zoneId: string) => {
    setZones(zones.map(zone => 
      zone.id === zoneId ? { ...zone, isActive: !zone.isActive } : zone
    ));
  };

  const handleZoneTempChange = (zoneId: string, temp: number) => {
    setZones(zones.map(zone => 
      zone.id === zoneId ? { ...zone, targetTemp: Math.max(60, Math.min(85, temp)) } : zone
    ));
  };

  const handleScheduleToggle = (scheduleId: string) => {
    setSchedules(schedules.map(schedule => 
      schedule.id === scheduleId ? { ...schedule, isActive: !schedule.isActive } : schedule
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Thermometer className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HVAC Control</h1>
                <p className="text-sm text-gray-600">Smart Climate Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {isConnected ? (
                  <Wifi className="h-4 w-4" />
                ) : (
                  <WifiOff className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {isConnected ? 'Connected' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Temperature Control - Full Width */}
            <TemperatureControl
              currentTemp={currentTemp}
              targetTemp={targetTemp}
              onTempChange={handleTempChange}
              mode={systemMode}
            />

            {/* System Status and Air Quality Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SystemStatus
                isOn={isSystemOn}
                mode={systemMode}
                fanSpeed={fanSpeed}
                onModeChange={handleModeChange}
                onTogglePower={handleTogglePower}
              />
              <AirQuality
                humidity={humidity}
                airQuality={airQuality}
                filterLife={filterLife}
              />
            </div>

            {/* Energy Usage */}
            <EnergyUsage
              currentUsage={3.2}
              dailyUsage={28}
              monthlyCost={145}
              efficiency={82}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ZoneControls
              zones={zones}
              onZoneToggle={handleZoneToggle}
              onZoneTempChange={handleZoneTempChange}
            />
            <ScheduleControl
              schedules={schedules}
              onScheduleToggle={handleScheduleToggle}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;