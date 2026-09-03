import { useMemo, useState } from 'react';
import {
  Truck,
  MapPin,
  Zap,
  AlertTriangle,
  Settings,
  TrendingUp,
  Gauge,
  Thermometer,
  Activity,
  Users,
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../common/Toast';
import type { FleetUnit } from '../../lib/seedData';

function getStatusColor(status: string) {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800';
    case 'Maintenance':
      return 'bg-yellow-100 text-yellow-800';
    case 'Offline':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getProductionColor(production: number) {
  if (production >= 90) return 'text-green-600';
  if (production >= 70) return 'text-yellow-600';
  return 'text-red-600';
}

export default function FleetManagement() {
  const { fleetUnits, updateFleetUnit } = useData();
  const { toast } = useToast();
  const [selectedUnit, setSelectedUnit] = useState(fleetUnits[0]?.id ?? 'TR-001');

  const selectedUnitData = fleetUnits.find((unit) => unit.id === selectedUnit) ?? fleetUnits[0];

  const downUnits = useMemo(() => fleetUnits.filter((u) => u.status !== 'Active'), [fleetUnits]);
  const topUnit = useMemo(
    () => fleetUnits.filter((u) => u.status === 'Active').sort((a, b) => b.efficiency - a.efficiency)[0],
    [fleetUnits],
  );

  const fleetMetrics = useMemo(() => {
    const active = fleetUnits.filter((u) => u.status === 'Active').length;
    const totalProduction = Math.round(fleetUnits.reduce((s, u) => s + u.outputPerDay, 0) * 10) / 10;
    const runningUnits = fleetUnits.filter((u) => u.efficiency > 0);
    const avgEfficiency = runningUnits.length
      ? Math.round((runningUnits.reduce((s, u) => s + u.efficiency, 0) / runningUnits.length) * 10) / 10
      : 0;
    const activeOrders = fleetUnits.reduce((s, u) => s + u.activeOrders, 0);
    return [
      {
        title: 'Daily Production Capacity',
        value: `${totalProduction} MT`,
        sub: `${active} unit${active === 1 ? '' : 's'} producing`,
        icon: TrendingUp,
        color: 'text-green-600 bg-green-50',
      },
      {
        title: 'Active Units',
        value: `${active}/${fleetUnits.length}`,
        sub: `${fleetUnits.length ? Math.round((active / fleetUnits.length) * 100) : 0}% of fleet`,
        icon: Truck,
        color: 'text-blue-600 bg-blue-50',
      },
      {
        title: 'Average Efficiency',
        value: `${avgEfficiency}%`,
        sub: `${runningUnits.length} unit${runningUnits.length === 1 ? '' : 's'} online`,
        icon: Gauge,
        color: 'text-purple-600 bg-purple-50',
      },
      {
        title: 'Active Orders',
        value: `${activeOrders}`,
        sub: 'assigned across fleet',
        icon: Activity,
        color: 'text-orange-600 bg-orange-50',
      },
    ];
  }, [fleetUnits]);

  const toggleUnitStatus = (unit: FleetUnit) => {
    if (unit.status === 'Active') {
      updateFleetUnit(unit.id, {
        status: 'Maintenance',
        production: 0,
        temperature: 25,
        pressure: 0,
        efficiency: 0,
        outputPerDay: 0,
      });
      toast(`${unit.id} paused for maintenance`, 'info');
    } else {
      updateFleetUnit(unit.id, {
        status: 'Active',
        production: 85,
        temperature: 820,
        pressure: 2.2,
        efficiency: 88,
        outputPerDay: 10,
      });
      toast(`${unit.id} brought back online`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
          <p className="text-gray-600 mt-1">
            Real-time monitoring and control of TARAL mobile units
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <div className={`flex items-center px-3 py-1 rounded-full ${
            downUnits.length === 0 ? 'bg-green-50' : 'bg-yellow-50'
          }`}>
            <div className={`h-2 w-2 rounded-full mr-2 ${
              downUnits.length === 0 ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <span className={`text-sm ${downUnits.length === 0 ? 'text-green-800' : 'text-yellow-800'}`}>
              {downUnits.length === 0
                ? 'All systems operational'
                : `${downUnits.length} unit${downUnits.length > 1 ? 's' : ''} need attention`}
            </span>
          </div>
        </div>
      </div>

      {/* Fleet Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {fleetMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-gray-400 text-xs font-medium text-right">{metric.sub}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
              <p className="text-gray-600 text-sm">{metric.title}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unit Selection & Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">TARAL Units Status</h2>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">Live monitoring</span>
            </div>
          </div>

          <div className="space-y-4">
            {fleetUnits.map((unit) => (
              <div
                key={unit.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedUnit === unit.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedUnit(unit.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">{unit.id}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(unit.status)}`}>
                      {unit.status}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{unit.location}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Production</p>
                    <p className={`font-medium ${getProductionColor(unit.production)}`}>
                      {unit.production}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Output</p>
                    <p className="font-medium text-gray-900">{unit.outputPerDay} MT/day</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Orders</p>
                    <p className="font-medium text-gray-900">{unit.activeOrders}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Operator</p>
                    <p className="font-medium text-gray-900">{unit.operator}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Unit Details */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Unit Details</h2>
            <Settings className="h-5 w-5 text-gray-400" />
          </div>

          {selectedUnitData && (
            <div className="space-y-4">
              <div className="text-center pb-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">{selectedUnitData.id}</h3>
                <p className="text-gray-600">{selectedUnitData.location}</p>
                <span className={`inline-block px-3 py-1 text-sm rounded-full mt-2 ${getStatusColor(selectedUnitData.status)}`}>
                  {selectedUnitData.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Thermometer className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm text-gray-600">Temperature</span>
                  </div>
                  <span className="font-medium">{selectedUnitData.temperature}°C</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Gauge className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-600">Pressure</span>
                  </div>
                  <span className="font-medium">{selectedUnitData.pressure} bar</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-600">Efficiency</span>
                  </div>
                  <span className="font-medium">{selectedUnitData.efficiency}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-purple-500 mr-2" />
                    <span className="text-sm text-gray-600">Operator</span>
                  </div>
                  <span className="font-medium">{selectedUnitData.operator}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Feedstock</h4>
                <p className="text-sm text-gray-600">{selectedUnitData.feedstock}</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Maintenance</h4>
                <div className="text-sm text-gray-600">
                  <p>Last: {selectedUnitData.lastMaintenance}</p>
                  <p>Next: {selectedUnitData.nextMaintenance}</p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => toggleUnitStatus(selectedUnitData)}
                  className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${
                    selectedUnitData.status === 'Active'
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {selectedUnitData.status === 'Active' ? 'Pause for Maintenance' : 'Bring Unit Online'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alerts & Notifications (derived from fleet state) */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h2>
        <div className="space-y-3">
          {downUnits.map((unit) => (
            <div key={unit.id} className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">{unit.id} is {unit.status.toLowerCase()}</p>
                <p className="text-xs text-yellow-600">
                  {unit.location} • next maintenance {unit.nextMaintenance}
                </p>
              </div>
            </div>
          ))}
          {topUnit && (
            <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Zap className="h-5 w-5 text-blue-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">
                  {topUnit.id} leads the fleet at {topUnit.efficiency}% efficiency
                </p>
                <p className="text-xs text-blue-600">{topUnit.production}% production capacity</p>
              </div>
            </div>
          )}
          {downUnits.length === 0 && (
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Every unit is active</p>
                <p className="text-xs text-green-600">No maintenance or downtime flagged</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
