import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Thermometer, 
  Gauge, 
  Activity, 
  Settings, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Zap,
  Flame,
  Droplets,
  Wind
} from 'lucide-react';

interface MonitoringData {
  temperature: number;
  pressure: number;
  humidity: number;
  efficiency: number;
  production: number;
  fuelConsumption: number;
  co2Emission: number;
  status: 'optimal' | 'warning' | 'critical';
  lastUpdate: string;
}

interface ControlSettings {
  targetTemp: number;
  targetPressure: number;
  automationLevel: 'manual' | 'semi' | 'full';
  alerts: boolean;
}

export default function MonitoringDashboard() {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();
  const [selectedUnit, setSelectedUnit] = useState(unitId || 'TR-001');
  const [monitoringData, setMonitoringData] = useState<MonitoringData>({
    temperature: 850,
    pressure: 2.4,
    humidity: 45,
    efficiency: 92,
    production: 12.5,
    fuelConsumption: 8.2,
    co2Emission: 0.15,
    status: 'optimal',
    lastUpdate: new Date().toLocaleTimeString()
  });

  const [controlSettings, setControlSettings] = useState<ControlSettings>({
    targetTemp: 850,
    targetPressure: 2.4,
    automationLevel: 'semi',
    alerts: true
  });

  const [dataLogs, setDataLogs] = useState([
    { timestamp: '2025-01-15 14:30:00', event: 'Temperature adjusted to 850°C', type: 'control' },
    { timestamp: '2025-01-15 14:25:00', event: 'Pressure optimized to 2.4 MPa', type: 'control' },
    { timestamp: '2025-01-15 14:20:00', event: 'Fuel efficiency improved to 92%', type: 'optimization' },
    { timestamp: '2025-01-15 14:15:00', event: 'Production rate: 12.5 MT/day', type: 'production' },
    { timestamp: '2025-01-15 14:10:00', event: 'CO₂ emission: 0.15 kg/MT', type: 'environmental' }
  ]);

  const taralUnits = [
    { id: 'TR-001', location: 'Pune Industrial Area', status: 'Active' },
    { id: 'TR-002', location: 'Mumbai Port', status: 'Active' },
    { id: 'TR-003', location: 'Nashik Hub', status: 'Maintenance' },
    { id: 'TR-004', location: 'Aurangabad Zone', status: 'Active' }
  ];

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMonitoringData(prev => ({
        ...prev,
        temperature: prev.temperature + (Math.random() - 0.5) * 10,
        pressure: prev.pressure + (Math.random() - 0.5) * 0.1,
        lastUpdate: new Date().toLocaleTimeString()
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleUnitChange = (unitId: string) => {
    setSelectedUnit(unitId);
    navigate(`/monitoring/${unitId}`);
  };

  const updateControlSettings = (setting: keyof ControlSettings, value: any) => {
    setControlSettings(prev => ({ ...prev, [setting]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Integrated Monitoring & Controls</h1>
            <p className="text-gray-600">Real-time monitoring of {selectedUnit} - {taralUnits.find(u => u.id === selectedUnit)?.location}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(monitoringData.status)}`}>
            {monitoringData.status.charAt(0).toUpperCase() + monitoringData.status.slice(1)}
          </div>
          <div className="text-sm text-gray-500">
            Last update: {monitoringData.lastUpdate}
          </div>
        </div>
      </div>

      {/* Unit Selector */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select TARAL Unit</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {taralUnits.map((unit) => (
            <button
              key={unit.id}
              onClick={() => handleUnitChange(unit.id)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedUnit === unit.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="font-medium">{unit.id}</div>
                <div className="text-xs text-gray-500">{unit.location}</div>
                <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                  unit.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {unit.status}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Monitoring */}
        <div className="lg:col-span-2 space-y-6">
          {/* Temperature & Pressure Controls */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Thermometer className="h-5 w-5 text-red-500 mr-2" />
                Temperature & Pressure Controls
              </h2>
              <span className="text-sm text-gray-500">Real-time regulation</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Temperature Control */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Current Temperature</span>
                  <span className="text-2xl font-bold text-red-600">{monitoringData.temperature.toFixed(1)}°C</span>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Target Temperature</label>
                  <input
                    type="range"
                    min="800"
                    max="900"
                    value={controlSettings.targetTemp}
                    onChange={(e) => updateControlSettings('targetTemp', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>800°C</span>
                    <span>{controlSettings.targetTemp}°C</span>
                    <span>900°C</span>
                  </div>
                </div>
              </div>

              {/* Pressure Control */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Current Pressure</span>
                  <span className="text-2xl font-bold text-blue-600">{monitoringData.pressure.toFixed(2)} MPa</span>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Target Pressure</label>
                  <input
                    type="range"
                    min="2.0"
                    max="3.0"
                    step="0.1"
                    value={controlSettings.targetPressure}
                    onChange={(e) => updateControlSettings('targetPressure', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>2.0 MPa</span>
                    <span>{controlSettings.targetPressure} MPa</span>
                    <span>3.0 MPa</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Activity className="h-5 w-5 text-green-500 mr-2" />
              Performance Metrics
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{monitoringData.efficiency}%</div>
                <div className="text-sm text-green-700">Efficiency</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{monitoringData.production} MT</div>
                <div className="text-sm text-blue-700">Daily Production</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{monitoringData.fuelConsumption} MT</div>
                <div className="text-sm text-purple-700">Fuel Consumption</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{monitoringData.co2Emission} kg/MT</div>
                <div className="text-sm text-orange-700">CO₂ Emission</div>
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="space-y-6">
          {/* Automation Controls */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 text-blue-500 mr-2" />
              Automated Adjustments
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Automation Level</label>
                <select
                  value={controlSettings.automationLevel}
                  onChange={(e) => updateControlSettings('automationLevel', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="manual">Manual Control</option>
                  <option value="semi">Semi-Automated</option>
                  <option value="full">Fully Automated</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Alert System</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={controlSettings.alerts}
                    onChange={(e) => updateControlSettings('alerts', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Apply Settings
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                <CheckCircle className="h-4 w-4" />
                <span>Optimize Settings</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors">
                <AlertTriangle className="h-4 w-4" />
                <span>Emergency Stop</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                <FileText className="h-4 w-4" />
                <span>Generate Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Logs */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 text-indigo-500 mr-2" />
            Data Logs & ESG Compliance
          </h2>
          <span className="text-sm text-gray-500">All parameters stored for audits</span>
        </div>
        
        <div className="space-y-3">
          {dataLogs.map((log, index) => (
            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Clock className="h-4 w-4 text-gray-400 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{log.event}</p>
                <p className="text-xs text-gray-500">{log.timestamp}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                log.type === 'control' ? 'bg-blue-100 text-blue-800' :
                log.type === 'optimization' ? 'bg-green-100 text-green-800' :
                log.type === 'production' ? 'bg-purple-100 text-purple-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {log.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
