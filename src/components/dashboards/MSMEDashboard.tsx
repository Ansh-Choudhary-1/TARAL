import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingDown,
  Leaf,
  DollarSign,
  Package,
  BarChart3,
  Target,
  Truck,
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useData } from '../../contexts/DataContext';
import { computeEsg } from '../../lib/esg';
import { SEED_OWNER } from '../../lib/seedData';

function fmt(n: number, dp = 0) {
  return n.toLocaleString(undefined, { maximumFractionDigits: dp });
}

export default function MSMEDashboard() {
  const { user } = useUser();
  const { orders, fuelData } = useData();
  const navigate = useNavigate();

  const myOrders = useMemo(
    () => orders.filter((o) => o.buyerEmail === user?.email || o.buyerEmail === SEED_OWNER),
    [orders, user],
  );
  const esg = useMemo(() => computeEsg(myOrders), [myOrders]);
  const recentOrders = useMemo(
    () => [...myOrders].sort((a, b) => b.orderDate.localeCompare(a.orderDate)).slice(0, 4),
    [myOrders],
  );
  const activeOrders = useMemo(
    () => myOrders.filter((o) => o.status === 'Processing' || o.status === 'In Transit').length,
    [myOrders],
  );

  const baseline = useMemo(
    () => fuelData.find((f) => f.name === 'Coal') ?? fuelData[0],
    [fuelData],
  );
  const recommendations = useMemo(
    () =>
      fuelData
        .filter((f) => f.recommended)
        .map((f) => ({
          fuel: f.name,
          costPerGCal: f.costPerGCal,
          co2: f.co2Emission,
          savingPerGCal: baseline ? baseline.costPerGCal - f.costPerGCal : 0,
          co2CutPct: baseline && baseline.co2Emission > 0
            ? Math.round(((baseline.co2Emission - f.co2Emission) / baseline.co2Emission) * 100)
            : 0,
          reliability: f.reliability,
        })),
    [fuelData, baseline],
  );
  const bestFuel = recommendations[0]?.fuel ?? '—';

  const metrics = [
    {
      title: 'Fuel Cost Saved',
      value: `₹${fmt(esg.totalSavings)}`,
      sub: `₹${fmt(esg.monthlySavings)} this month`,
      icon: TrendingDown,
      color: 'text-green-600 bg-green-50',
    },
    {
      title: 'CO₂ Reduced',
      value: `${fmt(esg.co2ReducedTons, 1)} t`,
      sub: `${fmt(esg.totalQuantity)} MT switched`,
      icon: Leaf,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Carbon Credits Earned',
      value: `₹${fmt(esg.creditsEarned)}`,
      sub: `${esg.cleanEnergyPct}% clean fuel`,
      icon: DollarSign,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Active Orders',
      value: `${activeOrders}`,
      sub: `${esg.ordersCount} total`,
      icon: Package,
      color: 'text-yellow-600 bg-yellow-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
          <p className="text-gray-600 mt-1">
            {[user?.company, user?.industry?.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())]
              .filter(Boolean)
              .join(' • ')}
          </p>
        </div>
        <div className="flex items-center bg-green-50 px-4 py-2 rounded-full mt-4 sm:mt-0">
          <Target className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-sm font-medium text-green-800">Best fuel: {bestFuel}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
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
        {/* Recommended Fuels (derived from the fuel dataset) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recommended Fuels</h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {recommendations.map((fuel) => (
              <div key={fuel.fuel} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{fuel.fuel}</h3>
                  <div className="flex items-center bg-green-50 px-2 py-1 rounded-full">
                    <span className="text-sm font-medium text-green-800">₹{fmt(fuel.costPerGCal)}/GCal</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Saving vs Coal</p>
                    <p className={`font-medium ${fuel.savingPerGCal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{fmt(fuel.savingPerGCal)}/GCal
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">CO₂ reduction</p>
                    <p className="font-medium text-emerald-600">{fuel.co2CutPct}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Reliability</p>
                    <p className={`font-medium ${
                      fuel.reliability === 'High' ? 'text-green-600' :
                      fuel.reliability === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {fuel.reliability}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Truck className="h-5 w-5 text-gray-400" />
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-6">
              <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">No orders yet.</p>
              <button
                onClick={() => navigate('/marketplace')}
                className="text-sm font-medium text-green-600 hover:text-green-700"
              >
                Browse the marketplace →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="border-l-4 border-green-400 pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{order.id}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{order.fuel}</p>
                  <p className="text-xs text-gray-500">{order.quantity} MT • {order.orderDate}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="mb-4 lg:mb-0">
            <h2 className="text-xl font-semibold mb-2">Ready to switch to cleaner fuels?</h2>
            <p className="text-green-100">
              Compare fuel options, calculate savings, and place orders in a few clicks.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => navigate('/fuel-comparison')}
              className="bg-white text-green-700 px-6 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium"
            >
              Compare Fuels
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-400 transition-colors font-medium"
            >
              Visit Marketplace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
