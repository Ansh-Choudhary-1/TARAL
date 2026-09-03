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
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { computeEsg } from '../../lib/esg';

function fmt(n: number, dp = 0) {
  return n.toLocaleString(undefined, { maximumFractionDigits: dp });
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { fleetUnits, orders } = useData();

  const stats = useMemo(() => {
    const activeUnits = fleetUnits.filter((u) => u.status === 'Active').length;
    const totalProduction = fleetUnits.reduce((s, u) => s + u.outputPerDay, 0);
    const activeFleetOrders = fleetUnits.reduce((s, u) => s + u.activeOrders, 0);
    const running = fleetUnits.filter((u) => u.efficiency > 0);
    const avgEfficiency = running.length
      ? running.reduce((s, u) => s + u.efficiency, 0) / running.length
      : 0;
    const esg = computeEsg(orders);
    const liveOrders = orders.filter((o) => o.status !== 'Cancelled');
    const revenue = liveOrders.reduce((s, o) => s + o.total, 0);
    const customers = new Set(orders.map((o) => o.buyerEmail).filter(Boolean)).size;
    return {
      activeUnits,
      totalProduction,
      activeFleetOrders,
      avgEfficiency,
      esg,
      revenue,
      customers,
      liveOrderCount: liveOrders.length,
    };
  }, [fleetUnits, orders]);

  const downUnits = useMemo(() => fleetUnits.filter((u) => u.status !== 'Active'), [fleetUnits]);

  const fleetMetrics = [
    {
      title: 'Active TARAL Units',
      value: `${stats.activeUnits}/${fleetUnits.length}`,
      sub: `${stats.activeFleetOrders} unit orders`,
      icon: Truck,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Daily Production',
      value: `${fmt(stats.totalProduction, 1)} MT`,
      sub: `${fmt(stats.avgEfficiency, 1)}% avg efficiency`,
      icon: Factory,
      color: 'text-green-600 bg-green-50',
    },
    {
      title: 'CO₂ Avoided (all orders)',
      value: `${fmt(stats.esg.co2ReducedTons, 1)} t`,
      sub: `${stats.esg.ordersCount} orders`,
      icon: Leaf,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Order Revenue',
      value: `₹${fmt(stats.revenue)}`,
      sub: `${stats.liveOrderCount} live orders`,
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
          <p className="text-gray-600 mt-1">Monitoring and control of TARAL fleet operations</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <div className={`flex items-center px-3 py-1 rounded-full ${
            downUnits.length === 0 ? 'bg-green-50' : 'bg-yellow-50'
          }`}>
            <div className={`h-2 w-2 rounded-full mr-2 ${
              downUnits.length === 0 ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <span className={`text-sm ${downUnits.length === 0 ? 'text-green-800' : 'text-yellow-800'}`}>
              {downUnits.length === 0
                ? 'All units operational'
                : `${downUnits.length} unit${downUnits.length > 1 ? 's' : ''} need attention`}
            </span>
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
                <span className="text-gray-400 text-xs font-medium text-right">{metric.sub}</span>
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
              <span className="text-sm text-gray-600">{fleetUnits.length} units</span>
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
                    <p className="text-gray-500">Production</p>
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
                      className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                    >
                      Monitor →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet Summary (derived) */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Fleet Summary</h2>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4 text-sm">
            {(['Active', 'Maintenance', 'Offline'] as const).map((status) => {
              const count = fleetUnits.filter((u) => u.status === status).length;
              return (
                <div key={status} className="flex items-center justify-between border-l-4 border-gray-200 pl-4 py-1">
                  <span className="font-medium text-gray-900">{status}</span>
                  <span className="text-gray-600">{count} unit{count === 1 ? '' : 's'}</span>
                </div>
              );
            })}
            <div className="flex items-center justify-between border-l-4 border-green-400 pl-4 py-1">
              <span className="font-medium text-gray-900">Daily output</span>
              <span className="text-gray-600">{fmt(stats.totalProduction, 1)} MT</span>
            </div>
            <div className="flex items-center justify-between border-l-4 border-blue-400 pl-4 py-1">
              <span className="font-medium text-gray-900">Avg efficiency</span>
              <span className="text-gray-600">{fmt(stats.avgEfficiency, 1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate('/orders')}
          className="text-left bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-6 hover:from-blue-700 hover:to-blue-800 transition-colors"
        >
          <Users className="h-8 w-8 mb-4 opacity-80" />
          <h3 className="text-lg font-semibold mb-2">Customers</h3>
          <p className="text-3xl font-bold mb-1">{stats.customers}</p>
          <p className="text-blue-200 text-sm">with at least one order</p>
        </button>

        <button
          onClick={() => navigate('/orders')}
          className="text-left bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl p-6 hover:from-green-700 hover:to-green-800 transition-colors"
        >
          <Package className="h-8 w-8 mb-4 opacity-80" />
          <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
          <p className="text-3xl font-bold mb-1">{stats.esg.ordersCount}</p>
          <p className="text-green-200 text-sm">{fmt(stats.esg.totalQuantity)} MT ordered</p>
        </button>

        <button
          onClick={() => navigate('/reports')}
          className="text-left bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl p-6 hover:from-purple-700 hover:to-purple-800 transition-colors"
        >
          <Leaf className="h-8 w-8 mb-4 opacity-80" />
          <h3 className="text-lg font-semibold mb-2">Carbon Offset</h3>
          <p className="text-3xl font-bold mb-1">{fmt(stats.esg.co2ReducedTons, 1)}</p>
          <p className="text-purple-200 text-sm">tonnes CO₂ avoided</p>
        </button>
      </div>

      {/* System Alerts (derived) */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h2>
        <div className="space-y-3">
          {downUnits.length === 0 && stats.esg.ordersCount === 0 && (
            <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-gray-400 mr-3" />
              <p className="text-sm text-gray-600">No active alerts.</p>
            </div>
          )}
          {downUnits.map((unit) => (
            <div key={unit.id} className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">{unit.id} is {unit.status.toLowerCase()}</p>
                <p className="text-xs text-yellow-600">{unit.location} • production at {unit.production}%</p>
              </div>
            </div>
          ))}
          {stats.esg.ordersCount > 0 && (
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  ₹{fmt(stats.esg.creditsEarned)} in carbon credits generated
                </p>
                <p className="text-xs text-green-600">
                  across {stats.esg.ordersCount} orders • {fmt(stats.esg.co2ReducedTons, 1)} t CO₂ avoided
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
