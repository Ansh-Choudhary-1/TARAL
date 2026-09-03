import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Factory,
  Leaf,
  TrendingUp,
  MapPin,
  Zap,
  Users,
  Package,
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { computeEsg } from '../../lib/esg';

const regionalDemand = [
  { region: 'Western Maharashtra', demand: 'High', growth: '+18%', units: 8 },
  { region: 'Mumbai Metropolitan', demand: 'Medium', growth: '+12%', units: 6 },
  { region: 'Pune Belt', demand: 'High', growth: '+25%', units: 10 },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { fleetUnits, orders } = useData();

  const stats = useMemo(() => {
    const activeUnits = fleetUnits.filter((u) => u.status === 'Active').length;
    const totalProduction = fleetUnits.reduce((sum, u) => sum + u.outputPerDay, 0);
    const activeOrders = fleetUnits.reduce((sum, u) => sum + u.activeOrders, 0);
    const esg = computeEsg(orders);
    const revenue = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);
    return { activeUnits, totalProduction, activeOrders, esg, revenue };
  }, [fleetUnits, orders]);

  const fleetMetrics = [
    {
      title: 'Active TARAL Units',
      value: `${stats.activeUnits}/${fleetUnits.length}`,
      change: `${stats.activeOrders} orders`,
      icon: Truck,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Total Production',
      value: `${Math.round(stats.totalProduction * 10) / 10} MT/day`,
      change: '+8%',
      icon: Factory,
      color: 'text-green-600 bg-green-50',
    },
    {
      title: 'CO₂ Savings (Total)',
      value: `${stats.esg.co2ReducedTons} Tons`,
      change: `${stats.esg.ordersCount} orders`,
      icon: Leaf,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Revenue',
      value: `₹${stats.revenue.toLocaleString()}`,
      change: '+22%',
      icon: TrendingUp,
      color: 'text-indigo-600 bg-indigo-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet Command Center</h1>
          <p className="text-gray-600 mt-1">
            Real-time monitoring and control of TARAL fleet operations
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <div className="flex items-center bg-green-50 px-3 py-1 rounded-full">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-green-800">All Systems Operational</span>
          </div>
        </div>
      </div>

      {/* Fleet Metrics */}
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
        {/* Live TARAL Status */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Live TARAL Status</h2>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">Real-time monitoring</span>
            </div>
          </div>

          <div className="space-y-4">
            {fleetUnits.map((unit) => (
              <div key={unit.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 mr-3">{unit.id}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      unit.status === 'Active' ? 'bg-green-100 text-green-800' :
                      unit.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {unit.status}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{unit.location}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Production Capacity</p>
                    <p className={`font-medium ${
                      unit.production > 80 ? 'text-green-600' :
                      unit.production > 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {unit.production}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Active Orders</p>
                    <p className="font-medium text-gray-900">{unit.activeOrders}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Action</p>
                    <button
                      onClick={() => navigate(`/monitoring/${unit.id}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer"
                    >
                      Monitor →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Demand */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Regional Demand</h2>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {regionalDemand.map((region) => (
              <div key={region.region} className="border-l-4 border-blue-400 pl-4 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{region.region}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    region.demand === 'High' ? 'bg-red-100 text-red-800' :
                    region.demand === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {region.demand}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600 font-medium">{region.growth}</span>
                  <span className="text-xs text-gray-500">{region.units} TARAL units</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate('/reports')}
          className="text-left bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-6 hover:from-blue-700 hover:to-blue-800 transition-colors"
        >
          <Users className="h-8 w-8 mb-4 opacity-80" />
          <h3 className="text-lg font-semibold mb-2">Active MSMEs</h3>
          <p className="text-3xl font-bold mb-1">1,247</p>
          <p className="text-blue-200 text-sm">+89 this month</p>
        </button>

        <button
          onClick={() => navigate('/orders')}
          className="text-left bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl p-6 hover:from-green-700 hover:to-green-800 transition-colors"
        >
          <Package className="h-8 w-8 mb-4 opacity-80" />
          <h3 className="text-lg font-semibold mb-2">Orders Today</h3>
          <p className="text-3xl font-bold mb-1">{stats.esg.ordersCount}</p>
          <p className="text-green-200 text-sm">{stats.esg.totalQuantity} MT total</p>
        </button>

        <button
          onClick={() => navigate('/reports')}
          className="text-left bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl p-6 hover:from-purple-700 hover:to-purple-800 transition-colors"
        >
          <Leaf className="h-8 w-8 mb-4 opacity-80" />
          <h3 className="text-lg font-semibold mb-2">Carbon Offset</h3>
          <p className="text-3xl font-bold mb-1">{stats.esg.co2ReducedTons}</p>
          <p className="text-purple-200 text-sm">tons CO₂ tracked</p>
        </button>
      </div>

      {/* System Alerts */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h2>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="h-2 w-2 bg-yellow-500 rounded-full mr-3"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">TR-003 scheduled for maintenance</p>
              <p className="text-xs text-yellow-600">Maintenance window: Tomorrow 2:00 AM - 6:00 AM</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">New carbon credit batch ready</p>
              <p className="text-xs text-green-600">₹2.4L credits available for distribution</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
