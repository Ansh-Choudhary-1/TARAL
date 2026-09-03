import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Filter,
  MapPin,
  Truck,
  Star,
  TrendingUp,
  Package,
  Clock,
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../common/Toast';
import Modal from '../common/Modal';
import type { Product } from '../../lib/seedData';

const filters = [
  { value: 'all', label: 'All Products' },
  { value: 'biomass', label: 'Biomass Pellets' },
  { value: 'briquettes', label: 'Briquettes' },
  { value: 'rdf', label: 'RDF Pellets' },
];

type ModalState =
  | { kind: 'order' | 'quote'; product: Product }
  | { kind: 'inquiry'; title: string }
  | null;

export default function Marketplace() {
  const navigate = useNavigate();
  const { products, addOrder, addQuote, addInquiry } = useData();
  const { user } = useUser();
  const { toast } = useToast();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('price');
  const [modal, setModal] = useState<ModalState>(null);
  const [quantity, setQuantity] = useState(5);
  const [inquiry, setInquiry] = useState({ name: '', company: '', message: '' });
  const [lastQuote, setLastQuote] = useState<{ total: number; delivery: string } | null>(null);

  const buyerEmail = user?.email ?? '';
  const company = user?.company ?? 'Sample Company';

  const sortedProducts = useMemo(() => {
    const filtered = products.filter((product) =>
      selectedFilter === 'all' ? true : product.name.toLowerCase().includes(selectedFilter),
    );
    return [...filtered].sort((a, b) => {
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
  }, [products, selectedFilter, sortBy]);

  const openOrder = (product: Product) => {
    setQuantity(5);
    setModal({ kind: 'order', product });
  };

  const openQuote = (product: Product) => {
    setQuantity(5);
    setLastQuote(null);
    setModal({ kind: 'quote', product });
  };

  const openInquiry = (title: string) => {
    setInquiry({ name: user?.name ?? '', company, message: '' });
    setModal({ kind: 'inquiry', title });
  };

  const confirmOrder = () => {
    if (modal?.kind !== 'order') return;
    const product = modal.product;
    if (quantity < 1) {
      toast('Enter a quantity of at least 1 MT', 'error');
      return;
    }
    if (quantity > product.inStock) {
      toast(`Only ${product.inStock} MT of ${product.name} in stock`, 'error');
      return;
    }
    const order = addOrder({
      fuel: product.name,
      quantity,
      unitPrice: product.price,
      buyerEmail,
      company,
      supplier: product.supplier,
      location: product.location,
    });
    setModal(null);
    toast(`Order ${order.id} placed for ${quantity} MT of ${product.name}`);
    navigate('/orders');
  };

  const generateQuote = () => {
    if (modal?.kind !== 'quote') return;
    const product = modal.product;
    const total = product.price * Math.max(1, quantity);
    addQuote({
      product: product.name,
      quantity: Math.max(1, quantity),
      unitPrice: product.price,
      total,
      estimatedDelivery: product.delivery,
    });
    setLastQuote({ total, delivery: product.delivery });
    toast(`Quote saved for ${product.name}`);
  };

  const submitInquiry = () => {
    if (!inquiry.name.trim() || !inquiry.message.trim()) {
      toast('Please add your name and a short message', 'error');
      return;
    }
    addInquiry({ name: inquiry.name.trim(), company: inquiry.company.trim(), message: inquiry.message.trim() });
    setModal(null);
    toast('Thanks! Our sales team will get back to you shortly.');
  };

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
              {filters.map((filter) => (
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
        {sortedProducts.map((product) => (
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
                <button
                  onClick={() => openOrder(product)}
                  disabled={product.inStock <= 0}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.inStock <= 0 ? 'Sold Out' : 'Order Now'}
                </button>
                <button
                  onClick={() => openQuote(product)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
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
            <button
              onClick={() => openInquiry('Contact Sales Team')}
              className="bg-white text-blue-700 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              Contact Sales Team
            </button>
            <button
              onClick={() => openInquiry('Request Custom Quote')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-400 transition-colors font-medium border border-blue-400"
            >
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

      {/* Order modal */}
      <Modal
        open={modal?.kind === 'order'}
        title={modal?.kind === 'order' ? `Order ${modal.product.name}` : ''}
        onClose={() => setModal(null)}
      >
        {modal?.kind === 'order' && (
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Unit price</span>
              <span className="font-medium">₹{modal.product.price.toLocaleString()} {modal.product.unit}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (MT)</label>
              <input
                type="number"
                min={1}
                max={modal.product.inStock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <p className="mt-1 text-xs text-gray-500">{modal.product.inStock} MT available</p>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-sm">
              <span className="text-gray-500">Order total</span>
              <span className="text-lg font-bold text-gray-900">
                ₹{(modal.product.price * Math.max(0, quantity)).toLocaleString()}
              </span>
            </div>
            <button
              onClick={confirmOrder}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Confirm Order
            </button>
          </div>
        )}
      </Modal>

      {/* Quote modal */}
      <Modal
        open={modal?.kind === 'quote'}
        title={modal?.kind === 'quote' ? `Quote — ${modal.product.name}` : ''}
        onClose={() => setModal(null)}
      >
        {modal?.kind === 'quote' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desired quantity (MT)</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button
              onClick={generateQuote}
              className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Generate Quote
            </button>
            {lastQuote && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Estimated total</span>
                  <span className="font-semibold text-green-900">₹{lastQuote.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Estimated delivery</span>
                  <span className="font-semibold text-green-900">{lastQuote.delivery}</span>
                </div>
                <p className="text-xs text-green-700 pt-1">Saved to your quotes.</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Inquiry modal */}
      <Modal
        open={modal?.kind === 'inquiry'}
        title={modal?.kind === 'inquiry' ? modal.title : ''}
        onClose={() => setModal(null)}
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Your name"
            value={inquiry.name}
            onChange={(e) => setInquiry({ ...inquiry, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="Company"
            value={inquiry.company}
            onChange={(e) => setInquiry({ ...inquiry, company: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <textarea
            placeholder="How can our team help?"
            rows={4}
            value={inquiry.message}
            onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={submitInquiry}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Send Inquiry
          </button>
        </div>
      </Modal>
    </div>
  );
}
