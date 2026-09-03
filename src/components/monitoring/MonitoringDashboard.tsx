import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Thermometer,
  Activity,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../common/Toast';
import type { MonitoringControlSettings } from '../../lib/seedData';

function getStatusColor(status: string) {
  switch (status) {
    case 'optimal':
      return 'text-green-600 bg-green-50';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50';
    case 'critical':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

function timestamp() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

export default function MonitoringDashboard() {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();
  const { monitoringUnits, updateMonitoringUnit, addMonitoringLog, addReport } = useData();
  const { toast } = useToast();

  const [selectedUnit, setSelectedUnit] = useState(unitId || monitoringUnits[0]?.id || 'TR-001');

  // Keep the selection in sync with the :unitId route param.
  useEffect(() => {
    if (unitId) setSelectedUnit(unitId);
  }, [unitId]);

  const unit = useMemo(
    () => monitoringUnits.find((u) => u.id === selectedUnit) ?? monitoringUnits[0],
    [monitoringUnits, selectedUnit],
  );

  const [draft, setDraft] = useState<MonitoringControlSettings>(unit.controlSettings);
  const [live, setLive] = useState({
    temperature: unit.temperature,
    pressure: unit.pressure,
    lastUpdate: new Date().toLocaleTimeString(),
  });

  // Resync editable/live values whenever the persisted unit changes.
  useEffect(() => {
    setDraft(unit.controlSettings);
    setLive({
      temperature: unit.temperature,
      pressure: unit.pressure,
      lastUpdate: new Date().toLocaleTimeString(),
    });
  }, [unit]);

  // Simulate real-time sensor drift (display only — not persisted).
  useEffect(() => {
    const interval = setInterval(() => {
      setLive((prev) => ({
        temperature: prev.temperature + (Math.random() - 0.5) * 10,
        pressure: prev.pressure + (Math.random() - 0.5) * 0.1,
        lastUpdate: new Date().toLocaleTimeString(),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUnitChange = (id: string) => {
    setSelectedUnit(id);
    navigate(`/monitoring/${id}`);
  };

  const updateDraft = <K extends keyof MonitoringControlSettings>(key: K, value: MonitoringControlSettings[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const applySettings = () => {
    updateMonitoringUnit(unit.id, {
      controlSettings: draft,
      temperature: draft.targetTemp,
      pressure: draft.targetPressure,
    });
    addMonitoringLog(unit.id, {
      timestamp: timestamp(),
      event: `Settings applied — ${draft.automationLevel} automation, target ${draft.targetTemp}°C / ${draft.targetPressure} MPa`,
      type: 'control',
    });
    toast(`Settings applied to ${unit.id}`);
  };

  const optimizeSettings = () => {
    const efficiency = Math.min(99, unit.efficiency + 3);
    const co2Emission = Math.max(0.05, Math.round((unit.co2Emission - 0.02) * 100) / 100);
    updateMonitoringUnit(unit.id, { efficiency, co2Emission, statusLevel: 'optimal' });
    addMonitoringLog(unit.id, {
      timestamp: timestamp(),
      event: `Auto-optimization run — efficiency now ${efficiency}%`,
      type: 'optimization',
    });
    toast(`${unit.id} optimized to ${efficiency}% efficiency`);
  };

  const emergencyStop = () => {
    updateMonitoringUnit(unit.id, {
      status: 'Offline',
      statusLevel: 'critical',
      production: 0,
      efficiency: 0,
      fuelConsumption: 0,
      temperature: 25,
      pressure: 0,
    });
    addMonitoringLog(unit.id, {
      timestamp: timestamp(),
      event: 'Emergency stop triggered — unit halted',
      type: 'control',
    });
    toast(`Emergency stop — ${unit.id} halted`, 'error');
  };

  const generateReport = () => {
    addReport({
      name: `${unit.id} Monitoring Report`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      type: 'CSV',
      size: '— KB',
      description: `Operational snapshot for ${unit.id} — ${unit.location} (efficiency ${unit.efficiency}%, CO₂ ${unit.co2Emission} kg/MT)`,
    });
    addMonitoringLog(unit.id, {
      timestamp: timestamp(),
      event: 'Compliance report generated',
      type: 'environmental',
    });
    toast(`Report generated for ${unit.id} — see ESG Reports`);
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
            <p className="text-gray-600">Real-time monitoring of {unit.id} - {unit.location}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(unit.statusLevel)}`}>
            {unit.statusLevel.charAt(0).toUpperCase() + unit.statusLevel.slice(1)}
          </div>
          <div className="text-sm text-gray-500">
            Last update: {live.lastUpdate}
          </div>
        </div>
      </div>

      {/* Unit Selector */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select TARAL Unit</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {monitoringUnits.map((u) => (
            <button
              key={u.id}
              onClick={() => handleUnitChange(u.id)}
              className={`p-3 rounded-lg border-2 transition-all ${
                unit.id === u.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="font-medium">{u.id}</div>
                <div className="text-xs text-gray-500">{u.location}</div>
                <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                  u.status === 'Active' ? 'bg-green-100 text-green-800' :
                  u.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {u.status}
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
                  <span className="text-2xl font-bold text-red-600">{live.temperature.toFixed(1)}°C</span>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Target Temperature</label>
                  <input
                    type="range"
                    min="800"
                    max="900"
                    value={draft.targetTemp}
                    onChange={(e) => updateDraft('targetTemp', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>800°C</span>
                    <span>{draft.targetTemp}°C</span>
                    <span>900°C</span>
                  </div>
                </div>
              </div>

              {/* Pressure Control */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Current Pressure</span>
                  <span className="text-2xl font-bold text-blue-600">{live.pressure.toFixed(2)} MPa</span>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Target Pressure</label>
                  <input
                    type="range"
                    min="2.0"
                    max="3.0"
                    step="0.1"
                    value={draft.targetPressure}
                    onChange={(e) => updateDraft('targetPressure', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>2.0 MPa</span>
                    <span>{draft.targetPressure} MPa</span>
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
                <div className="text-2xl font-bold text-green-600">{unit.efficiency}%</div>
                <div className="text-sm text-green-700">Efficiency</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{unit.production} MT</div>
                <div className="text-sm text-blue-700">Daily Production</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{unit.fuelConsumption} MT</div>
                <div className="text-sm text-purple-700">Fuel Consumption</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{unit.co2Emission} kg/MT</div>
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
                  value={draft.automationLevel}
                  onChange={(e) =>
                    updateDraft('automationLevel', e.target.value as MonitoringControlSettings['automationLevel'])
                  }
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
                    checked={draft.alerts}
                    onChange={(e) => updateDraft('alerts', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <button
                onClick={applySettings}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Settings
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={optimizeSettings}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Optimize Settings</span>
              </button>
              <button
                onClick={emergencyStop}
                className="w-full flex items-center justify-center space-x-2 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Emergency Stop</span>
              </button>
              <button
                onClick={generateReport}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
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
          {unit.logs.map((log, index) => (
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
