import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingDown,
  Leaf,
  Award,
  DollarSign,
  BarChart3,
  Target,
  Truck,
  AlertCircle,
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useData } from '../../contexts/DataContext';
import { computeEsg } from '../../lib/esg';
import { SEED_OWNER } from '../../lib/seedData';

const fuelRecommendations = [
  { fuel: 'Biomass Pellets', score: 92, savings: '₹35/GCal', co2Reduction: '85%', availability: 'High' },
  { fuel: 'RDF Pellets', score: 88, savings: '₹28/GCal', co2Reduction: '78%', availability: 'Medium' },
];

export default function MSMEDashboard() {
  const { user } = useUser();
  const { orders } = useData();
  const navigate = useNavigate();

  const myOrders = useMemo(
    () => orders.filter((o) => o.buyerEmail === user?.email || o.buyerEmail === SEED_OWNER),
    [orders, user],
  );
  const esg = useMemo(() => computeEsg(myOrders), [myOrders]);
  const recentOrders = useMemo(
    () => [...myOrders].sort((a, b) => b.orderDate.localeCompare(a.orderDate)).slice(0, 3),
    [myOrders],
  );

  const metrics = [
    {
      title: 'Monthly Fuel Savings',
      value: `₹${esg.monthlySavings.toLocaleString()}`,
      change: `${esg.ordersCount} orders`,
      icon: TrendingDown,
      color: 'text-green-600 bg-green-50',
    },
    {
      title: 'CO₂ Reduced',
      value: `${esg.co2ReducedTons} Tons`,
      change: `${esg.totalQuantity} MT`,
      icon: Leaf,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Carbon Credits Earned',
      value: `₹${esg.creditsEarned.toLocaleString()}`,
      change: `${esg.cleanEnergyPct}% clean`,
      icon: DollarSign,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Clean Fuel Stars',
      value: user?.cleanFuelStars ?? 12,
      change: `+${Math.min(9, esg.ordersCount)}`,
      icon: Award,
      color: 'text-yellow-600 bg-yellow-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.company} • {user?.industry?.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())} Industry
          </p>
        </div>
        <div className="flex items-center bg-green-50 px-4 py-2 rounded-full mt-4 sm:mt-0">
          <Target className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-sm font-medium text-green-800">
            Best Fuel: Biomass Pellets
          </span>
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
                <span className="text-green-600 text-sm font-medium">{metric.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
              <p className="text-gray-600 text-sm">{metric.title}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fuel Recommendations */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recommended Fuels</h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {fuelRecommendations.map((fuel) => (
              <div key={fuel.fuel} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{fuel.fuel}</h3>
                  <div className="flex items-center bg-green-50 px-2 py-1 rounded-full">
                    <span className="text-sm font-medium text-green-800">
                      Score: {fuel.score}/100
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Savings vs Coal</p>
                    <p className="font-medium text-green-600">{fuel.savings}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">CO₂ Reduction</p>
                    <p className="font-medium text-emerald-600">{fuel.co2Reduction}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Availability</p>
                    <p className={`font-medium ${
                      fuel.availability === 'High' ? 'text-green-600' :
                      fuel.availability === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {fuel.availability}
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

          <div className="space-y-4">
            {recentOrders.length === 0 && (
              <p className="text-sm text-gray-500">No orders yet — place one from the marketplace.</p>
            )}
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
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="mb-4 lg:mb-0">
            <h2 className="text-xl font-semibold mb-2">Ready to Switch to Cleaner Fuels?</h2>
            <p className="text-green-100">
              Compare fuel options, calculate savings, and place orders with just a few clicks.
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

      {/* Alerts */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              New TARAL Unit Available in Your Area
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              A mobile pellet production unit is now operating within 15km.
              Expect faster delivery times and lower transportation costs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
