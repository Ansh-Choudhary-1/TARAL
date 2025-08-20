import React from 'react';
import { Bell, Menu, User, LogOut, Award } from 'lucide-react';

interface HeaderProps {
  user: {
    name: string;
    type: 'msme' | 'admin';
    cleanFuelStars?: number;
    carbonCredits?: number;
  };
  onLogout: () => void;
  onMenuClick: () => void;
}

export default function Header({ user, onLogout, onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 right-0 left-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center ml-4 lg:ml-0">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-2 rounded-lg">
                <Award className="h-6 w-6" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">Taral™</h1>
                <p className="text-xs text-gray-500">Clean Fuel Intelligence</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user.type === 'msme' && (
              <div className="hidden sm:flex items-center space-x-4">
                {user.cleanFuelStars && (
                  <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                    <Award className="h-4 w-4 text-yellow-600 mr-1" />
                    <span className="text-sm font-medium text-yellow-800">
                      {user.cleanFuelStars} Stars
                    </span>
                  </div>
                )}
                {user.carbonCredits && (
                  <div className="flex items-center bg-green-50 px-3 py-1 rounded-full">
                    <span className="text-sm font-medium text-green-800">
                      ₹{user.carbonCredits.toLocaleString()} Credits
                    </span>
                  </div>
                )}
              </div>
            )}

            <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.type} Portal</p>
              </div>
              
              <div className="relative group">
                <button className="flex items-center p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg">
                  <User className="h-5 w-5" />
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={onLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}