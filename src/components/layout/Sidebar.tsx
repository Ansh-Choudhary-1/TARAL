import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Fuel, 
  Package, 
  FileText, 
  Truck,
  X,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  userType: 'msme' | 'admin';
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ userType, isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  const msmeMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Fuel, label: 'Fuel Comparison', path: '/fuel-comparison' },
    { icon: ShoppingCart, label: 'Marketplace', path: '/marketplace' },
    { icon: Package, label: 'Order Tracking', path: '/orders' },
    { icon: FileText, label: 'ESG Reports', path: '/reports' },
  ];

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Truck, label: 'Fleet Management', path: '/fleet' },
    { icon: ShoppingCart, label: 'Marketplace', path: '/marketplace' },
    { icon: Package, label: 'Orders', path: '/orders' },
    { icon: TrendingUp, label: 'Analytics', path: '/reports' },
  ];

  const menuItems = userType === 'msme' ? msmeMenuItems : adminMenuItems;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 lg:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-40 w-64 h-full bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 pt-16 lg:pt-20">
          <div className="px-3 py-4">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                        isActive
                          ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>
    </>
  );
}