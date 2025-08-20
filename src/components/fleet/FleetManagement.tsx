import React, { useState } from 'react';
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
  Users
} from 'lucide-react';

export default function FleetManagement() {
  const [selectedUnit, setSelectedUnit] = useState('TR-001');

  const taralUnits = [
    {
      id: 'TR-001',
      location: 'Pune Industrial Area',
      status: 'Active',
      production: 95,
      temperature: 850,
      pressure: 2.4,
      feedstock: 'Agricultural Waste',
      output: '12.5 MT/day',
      efficiency: 92,
      lastMaintenance: '2025-01-05',
      nextMaintenance: '2025-02-05',
      coordinates: { lat: 18.5204, lng: 73.8567 },
      activeOrders: 8,
      operator: 'Rajesh Patil'
    },
    {
      id: 'TR-002',
      location: 'Mumbai Port',
      status: 'Active',
      production: 87,
      temperature: 820,
      pressure: 2.2,
      feedstock: 'Wood Chips',
      output: '10.8 MT/day',
      efficiency: 89,
      lastMaintenance: '2025-01-08',
      nextMaintenance: '2025-02-08',
      coordinates: { lat: 19.0760, lng: 72.8777 },
      activeOrders: 6,
      operator: 'Priya Sharma'
    },
    {
      id: 'TR-003',
      location: 'Nashik Hub',
      status: 'Maintenance',
      production: 0,
      temperature: 25,
      pressure: 0,
      feedstock: 'N/A',
      output: '0 MT/day',
      efficiency: 0,
      lastMaintenance: '2025-01-14',
      nextMaintenance: '2025-01-16',
      coordinates: { lat: 19.9975, lng: 73.7898 },
      activeOrders: 0,
      operator: 'Amit Kumar'
    },
    {
      id: 'TR-004',
      location: 'Aurangabad Zone',
      status: 'Active',
      production: 78,
      temperature: 780,
      pressure: 2.0,
      feedstock: 'Rice Husk',
      output: '9.2 MT/day',
      efficiency: 85,
      lastMaintenance: '2025-01-02',
      nextMaintenance: '2025-02-02',
      coordinates: { lat: 19.8762, lng: 75.3433 },
      activeOrders: 12,
      operator: 'Sunita Desai'
    }
  ];

  const selectedUnitData = taralUnits.find(unit => unit.id === selectedUnit);

  const getStatusColor = (status: string) => {
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
  };

  const getProductionColor = (production: number) => {
    if (production >= 90) return 'text-green-600';
    if (production >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const fleetMetrics = [
    {
      title: 'Total Production Today',
      value: '32.5 MT',
      change: '+8%',
      icon: TrendingUp,
      color: 'text-green-600 bg-green-50'
    },
    {
      title: 'Active Units',
      value: '3/4',
      change: '75%',
      icon: Truck,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      title: 'Average Efficiency',
      value: '88.7%',
      change: '+2%',
      icon: Gauge,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      title: 'Active Orders',
      value: '26',
      change: '+15%',
      icon: Activity,
      color: 'text-orange-600 bg-orange-50'
    }
  ];

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
          <div className="flex items-center bg-green-50 px-3 py-1 rounded-full">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-green-800">All Systems Operational</span>
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
                <span className="text-green-600 text-sm font-medium">{metric.change}</span>
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
            {taralUnits.map((unit) => (
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
                    <p className="font-medium text-gray-900">{unit.output}</p>
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
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Remote Control Panel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alerts & Notifications */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h2>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">TR-003 scheduled for maintenance</p>
              <p className="text-xs text-yellow-600">Maintenance window: Tomorrow 2:00 AM - 6:00 AM</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Zap className="h-5 w-5 text-blue-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">TR-001 operating at peak efficiency</p>
              <p className="text-xs text-blue-600">95% production capacity achieved</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">Fleet performance improved by 8%</p>
              <p className="text-xs text-green-600">Compared to last month's average</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}