import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  Clock, 
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
  Filter
} from 'lucide-react';

export default function OrderTracking() {
  const [selectedStatus, setSelectedStatus] = useState('all');

  const orders = [
    {
      id: 'ORD-2025-001',
      fuel: 'Biomass Pellets',
      quantity: '5 MT',
      supplier: 'TARAL Unit TR-001',
      location: 'Pune Industrial Area',
      status: 'Delivered',
      orderDate: '2025-01-10',
      deliveryDate: '2025-01-12',
      amount: 12000,
      trackingSteps: [
        { step: 'Order Placed', completed: true, date: '2025-01-10 09:30' },
        { step: 'Production Started', completed: true, date: '2025-01-10 14:00' },
        { step: 'Quality Check', completed: true, date: '2025-01-11 10:15' },
        { step: 'Dispatched', completed: true, date: '2025-01-11 16:30' },
        { step: 'Delivered', completed: true, date: '2025-01-12 11:45' }
      ]
    },
    {
      id: 'ORD-2025-002',
      fuel: 'RDF Pellets',
      quantity: '3 MT',
      supplier: 'TARAL Unit TR-002',
      location: 'Mumbai Port',
      status: 'In Transit',
      orderDate: '2025-01-12',
      deliveryDate: '2025-01-15',
      amount: 6600,
      trackingSteps: [
        { step: 'Order Placed', completed: true, date: '2025-01-12 11:20' },
        { step: 'Production Started', completed: true, date: '2025-01-12 15:45' },
        { step: 'Quality Check', completed: true, date: '2025-01-13 09:30' },
        { step: 'Dispatched', completed: true, date: '2025-01-13 14:20' },
        { step: 'Delivered', completed: false, date: 'Expected: 2025-01-15' }
      ]
    },
    {
      id: 'ORD-2025-003',
      fuel: 'Briquettes',
      quantity: '2 MT',
      supplier: 'TARAL Unit TR-004',
      location: 'Aurangabad Zone',
      status: 'Processing',
      orderDate: '2025-01-14',
      deliveryDate: '2025-01-17',
      amount: 5200,
      trackingSteps: [
        { step: 'Order Placed', completed: true, date: '2025-01-14 10:15' },
        { step: 'Production Started', completed: true, date: '2025-01-14 16:00' },
        { step: 'Quality Check', completed: false, date: 'In Progress' },
        { step: 'Dispatched', completed: false, date: 'Pending' },
        { step: 'Delivered', completed: false, date: 'Expected: 2025-01-17' }
      ]
    }
  ];

  const statusFilters = [
    { value: 'all', label: 'All Orders' },
    { value: 'processing', label: 'Processing' },
    { value: 'in-transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' }
  ];

  const filteredOrders = orders.filter(order => {
    if (selectedStatus === 'all') return true;
    return order.status.toLowerCase().replace(' ', '-') === selectedStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'In Transit':
        return <Truck className="h-5 w-5 text-blue-600" />;
      case 'Processing':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
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
            {orders.length} Active Orders
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {statusFilters.map(filter => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Order Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{order.id}</h3>
                    <p className="text-gray-600">{order.fuel} • {order.quantity}</p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">₹{order.amount.toLocaleString()}</p>
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
            </div>

            {/* Tracking Timeline */}
            <div className="p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Order Progress</h4>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-4">
                  {order.trackingSteps.map((step, index) => (
                    <div key={index} className="relative flex items-center">
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
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Quantity</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.reduce((sum, order) => sum + parseInt(order.quantity), 0)} MT
              </p>
            </div>
            <Truck className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{orders.reduce((sum, order) => sum + order.amount, 0).toLocaleString()}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
}