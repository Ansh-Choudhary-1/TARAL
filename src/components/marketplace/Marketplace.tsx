import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Filter, 
  MapPin, 
  Truck, 
  Star,
  TrendingUp,
  Package,
  Clock
} from 'lucide-react';

export default function Marketplace() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('price');

  const products = [
    {
      id: 1,
      name: 'Premium Biomass Pellets',
      supplier: 'TARAL Unit TR-001',
      location: 'Pune Industrial Area',
      price: 2400,
      unit: 'per MT',
      rating: 4.8,
      reviews: 156,
      availability: 'High',
      delivery: '2-3 days',
      moisture: '8%',
      ashContent: '2%',
      calorificValue: '4200 kcal/kg',
      inStock: 250,
      image: 'https://images.pexels.com/photos/5825528/pexels-photo-5825528.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      name: 'Agricultural Briquettes',
      supplier: 'TARAL Unit TR-002',
      location: 'Mumbai Port',
      price: 2600,
      unit: 'per MT',
      rating: 4.6,
      reviews: 89,
      availability: 'Medium',
      delivery: '3-4 days',
      moisture: '12%',
      ashContent: '4%',
      calorificValue: '3800 kcal/kg',
      inStock: 180,
      image: 'https://images.pexels.com/photos/6394951/pexels-photo-6394951.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 3,
      name: 'RDF Pellets (Industrial)',
      supplier: 'TARAL Unit TR-004',
      location: 'Aurangabad Zone',
      price: 2200,
      unit: 'per MT',
      rating: 4.4,
      reviews: 203,
      availability: 'High',
      delivery: '1-2 days',
      moisture: '15%',
      ashContent: '15%',
      calorificValue: '3600 kcal/kg',
      inStock: 320,
      image: 'https://images.pexels.com/photos/3735189/pexels-photo-3735189.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 4,
      name: 'Wood Chip Pellets',
      supplier: 'TARAL Unit TR-005',
      location: 'Nashik Hub',
      price: 2350,
      unit: 'per MT',
      rating: 4.9,
      reviews: 78,
      availability: 'Low',
      delivery: '4-5 days',
      moisture: '6%',
      ashContent: '1%',
      calorificValue: '4500 kcal/kg',
      inStock: 95,
      image: 'https://images.pexels.com/photos/5825442/pexels-photo-5825442.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const filters = [
    { value: 'all', label: 'All Products' },
    { value: 'biomass', label: 'Biomass Pellets' },
    { value: 'briquettes', label: 'Briquettes' },
    { value: 'rdf', label: 'RDF Pellets' }
  ];

  const filteredProducts = products.filter(product => {
    if (selectedFilter === 'all') return true;
    return product.name.toLowerCase().includes(selectedFilter);
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'rating':
        return b.rating - a.rating;
      case 'delivery':
        return a.delivery.localeCompare(b.delivery);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clean Fuel Marketplace</h1>
          <p className="text-gray-600 mt-1">
            Order biomass pellets directly from nearby TARAL units
          </p>
        </div>
        <div className="flex items-center bg-green-50 px-4 py-2 rounded-full mt-4 lg:mt-0">
          <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-sm font-medium text-green-800">
            Live pricing • Updated every hour
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {filters.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="price">Price (Low to High)</option>
              <option value="rating">Rating (High to Low)</option>
              <option value="delivery">Delivery Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProducts.map(product => (
          <div key={product.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  product.availability === 'High' ? 'bg-green-100 text-green-800' :
                  product.availability === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {product.availability} Stock
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{product.location}</span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Calorific Value:</span>
                  <span className="font-medium">{product.calorificValue}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Moisture:</span>
                  <span className="font-medium">{product.moisture}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ash Content:</span>
                  <span className="font-medium">{product.ashContent}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{product.unit}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-gray-600 mb-1">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">{product.delivery}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Package className="h-4 w-4 mr-1" />
                    <span className="text-sm">{product.inStock} MT available</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Order Now
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Get Quote
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Order Panel */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="mb-4 lg:mb-0">
            <h2 className="text-xl font-semibold mb-2">Need Bulk Orders?</h2>
            <p className="text-blue-100">
              Get customized pricing and priority delivery for orders above 50 MT
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button className="bg-white text-blue-700 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium">
              Contact Sales Team
            </button>
            <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-400 transition-colors font-medium border border-blue-400">
              Request Custom Quote
            </button>
          </div>
        </div>
      </div>

      {/* Supplier Information */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">About Our TARAL Network</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Truck className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">24 Active Units</h3>
            <p className="text-sm text-gray-600">Mobile production units across Maharashtra</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">1,250 MT/Month</h3>
            <p className="text-sm text-gray-600">Total production capacity</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">4.7/5 Rating</h3>
            <p className="text-sm text-gray-600">Average customer satisfaction</p>
          </div>
        </div>
      </div>
    </div>
  );
}