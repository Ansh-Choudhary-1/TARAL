import React, { useState } from 'react';
import { Award, Factory, Settings } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

export default function Login() {
  const { login } = useUser();
  const [userType, setUserType] = useState<'msme' | 'admin'>('msme');
  const [industry, setIndustry] = useState('textiles');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: ''
  });

  const industries = [
    'textiles', 'pharmaceutical', 'food-processing', 'chemicals', 
    'paper-pulp', 'ceramics', 'steel', 'cement', 'other'
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userData = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name || (userType === 'msme' ? 'Rajesh Kumar' : 'Admin User'),
      type: userType,
      email: formData.email || `${userType}@Taral.com`,
      company: formData.company || 'Sample Company',
      industry: userType === 'msme' ? industry : undefined,
      carbonCredits: userType === 'msme' ? 45000 : undefined,
      cleanFuelStars: userType === 'msme' ? 12 : undefined,
    };
    
    login(userData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
            <Award className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Taral™</h2>
          <p className="mt-2 text-sm text-gray-600">Clean Fuel Intelligence Platform</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Login As
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('msme')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    userType === 'msme'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Factory className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">MSME Owner</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('admin')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    userType === 'admin'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Settings className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Administrator</span>
                </button>
              </div>
            </div>

            {/* Industry Selection for MSME */}
            {userType === 'msme' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry Sector
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind.charAt(0).toUpperCase() + ind.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Optional form fields */}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name (optional)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <input
                type="text"
                placeholder="Company Name (optional)"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium transition-all"
            >
              Enter {userType === 'msme' ? 'MSME' : 'Admin'} Portal
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            Demo platform - No actual authentication required
          </div>
        </div>
      </div>
    </div>
  );
}