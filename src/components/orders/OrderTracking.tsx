import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MapPin,
  Calendar,
  Filter,
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../common/Toast';
import { SEED_OWNER, type Order, type OrderStatus } from '../../lib/seedData';

const statusFilters = [
  { value: 'all', label: 'All Orders' },
  { value: 'processing', label: 'Processing' },
  { value: 'in-transit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

function getStatusColor(status: OrderStatus) {
  switch (status) {
    case 'Delivered':
      return 'bg-green-100 text-green-800';
    case 'In Transit':
      return 'bg-blue-100 text-blue-800';
    case 'Processing':
      return 'bg-yellow-100 text-yellow-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusIcon(status: OrderStatus) {
  switch (status) {
    case 'Delivered':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'In Transit':
      return <Truck className="h-5 w-5 text-blue-600" />;
    case 'Processing':
      return <Clock className="h-5 w-5 text-yellow-600" />;
    case 'Cancelled':
      return <XCircle className="h-5 w-5 text-red-600" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-600" />;
  }
}

export default function OrderTracking() {
  const { orders, setOrderStatus } = useData();
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState('all');

  const visibleOrders = useMemo(() => {
    const scoped =
      user?.type === 'admin'
        ? orders
        : orders.filter((o) => o.buyerEmail === user?.email || o.buyerEmail === SEED_OWNER);
    return [...scoped].sort((a, b) => b.orderDate.localeCompare(a.orderDate));
  }, [orders, user]);

  const filteredOrders = useMemo(
    () =>
      visibleOrders.filter((order) => {
        if (selectedStatus === 'all') return true;
        return order.status.toLowerCase().replace(' ', '-') === selectedStatus;
      }),
    [visibleOrders, selectedStatus],
  );

  const summary = useMemo(() => {
    const live = visibleOrders.filter((o) => o.status !== 'Cancelled');
    return {
      total: visibleOrders.length,
      active: visibleOrders.filter((o) => o.status === 'Processing' || o.status === 'In Transit').length,
      quantity: live.reduce((s, o) => s + o.quantity, 0),
      value: live.reduce((s, o) => s + o.total, 0),
    };
  }, [visibleOrders]);

  const changeStatus = (order: Order, status: OrderStatus) => {
    setOrderStatus(order.id, status);
    toast(
      status === 'Cancelled'
        ? `Order ${order.id} cancelled`
        : `Order ${order.id} is now ${status}`,
      status === 'Cancelled' ? 'info' : 'success',
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
          <p className="text-gray-600 mt-1">
            Track your fuel orders in real-time from production to delivery
          </p>
        </div>
        <div className="flex items-center bg-blue-50 px-4 py-2 rounded-full mt-4 lg:mt-0">
          <Package className="h-5 w-5 text-blue-600 mr-2" />
          <span className="text-sm font-medium text-blue-800">
            {summary.active} active {summary.active === 1 ? 'order' : 'orders'}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <label htmlFor="ot-status" className="sr-only">Filter by status</label>
          <select
            id="ot-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {statusFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            {visibleOrders.length === 0 ? (
              <>
                <p className="text-gray-600 font-medium">No orders yet</p>
                <button
                  onClick={() => navigate('/marketplace')}
                  className="mt-3 text-sm font-medium text-green-600 hover:text-green-700"
                >
                  Place your first order →
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-600 font-medium">No {selectedStatus.replace('-', ' ')} orders</p>
                <button
                  onClick={() => setSelectedStatus('all')}
                  className="mt-3 text-sm font-medium text-green-600 hover:text-green-700"
                >
                  Show all orders
                </button>
              </>
            )}
          </div>
        )}
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Order Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{order.id}</h3>
                    <p className="text-gray-600">{order.fuel} • {order.quantity} MT</p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">₹{order.total.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Total Amount</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">{order.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm">Ordered: {order.orderDate}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Truck className="h-4 w-4 mr-2" />
                  <span className="text-sm">Expected: {order.deliveryDate}</span>
                </div>
              </div>

              {(order.status === 'Processing' || order.status === 'In Transit') && (
                <div className="flex flex-wrap gap-3 mt-5">
                  {order.status === 'Processing' && (
                    <button
                      onClick={() => changeStatus(order, 'In Transit')}
                      className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Mark In Transit
                    </button>
                  )}
                  {order.status === 'In Transit' && (
                    <button
                      onClick={() => changeStatus(order, 'Delivered')}
                      className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Mark as Received
                    </button>
                  )}
                  <button
                    onClick={() => changeStatus(order, 'Cancelled')}
                    className="px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel Order
                  </button>
                </div>
              )}
            </div>

            {/* Tracking Timeline */}
            <div className="p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Order Progress</h4>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-4">
                  {order.trackingSteps.map((step) => (
                    <div key={step.step} className="relative flex items-center">
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <p className={`text-sm font-medium ${
                          step.completed ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.step}
                        </p>
                        <p className="text-xs text-gray-500">{step.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Quantity</p>
              <p className="text-2xl font-bold text-gray-900">{summary.quantity.toLocaleString()} MT</p>
            </div>
            <Truck className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{summary.value.toLocaleString()}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
