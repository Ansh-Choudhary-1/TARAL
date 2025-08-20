import React, { useState } from 'react';
import { 
  BarChart3, 
  Leaf, 
  DollarSign, 
  Flame,
  AlertTriangle,
  CheckCircle,
  Calculator
} from 'lucide-react';

export default function FuelComparison() {
  const [selectedIndustry, setSelectedIndustry] = useState('textiles');
  const [currentFuel, setCurrentFuel] = useState('coal');
  const [monthlyConsumption, setMonthlyConsumption] = useState(100);

  const industries = [
    { value: 'textiles', label: 'Textiles' },
    { value: 'pharmaceutical', label: 'Pharmaceutical' },
    { value: 'food-processing', label: 'Food Processing' },
    { value: 'chemicals', label: 'Chemicals' },
    { value: 'paper-pulp', label: 'Paper & Pulp' }
  ];

  const fuelData = [
    {
      name: 'Coal',
      costPerGCal: 2800,
      co2Emission: 94.6,
      sox: 1.2,
      nox: 0.8,
      ashContent: 25,
      disposalCost: 150,
      moistureLevel: 8,
      reliability: 'High',
      current: true
    },
    {
      name: 'Diesel',
      costPerGCal: 7200,
      co2Emission: 74.1,
      sox: 0.5,
      nox: 1.5,
      ashContent: 0,
      disposalCost: 0,
      moistureLevel: 0,
      reliability: 'High'
    },
    {
      name: 'Biomass Pellets',
      costPerGCal: 2400,
      co2Emission: 0,
      sox: 0.02,
      nox: 0.15,
      ashContent: 2,
      disposalCost: 20,
      moistureLevel: 8,
      reliability: 'High',
      recommended: true
    },
    {
      name: 'Briquettes',
      costPerGCal: 2600,
      co2Emission: 0,
      sox: 0.03,
      nox: 0.18,
      ashContent: 4,
      disposalCost: 30,
      moistureLevel: 12,
      reliability: 'Medium'
    },
    {
      name: 'RDF Pellets',
      costPerGCal: 2200,
      co2Emission: 15.2,
      sox: 0.8,
      nox: 0.6,
      ashContent: 15,
      disposalCost: 100,
      moistureLevel: 15,
      reliability: 'Medium'
    },
    {
      name: 'Natural Gas',
      costPerGCal: 3200,
      co2Emission: 56.1,
      sox: 0,
      nox: 0.3,
      ashContent: 0,
      disposalCost: 0,
      moistureLevel: 0,
      reliability: 'High'
    }
  ];

  const calculateSavings = (newFuel: any, currentFuelData: any) => {
    const currentCost = currentFuelData.costPerGCal * monthlyConsumption;
    const newCost = newFuel.costPerGCal * monthlyConsumption;
    const monthlySavings = currentCost - newCost;
    const annualSavings = monthlySavings * 12;
    const co2Reduction = (currentFuelData.co2Emission - newFuel.co2Emission) * monthlyConsumption;
    return { monthlySavings, annualSavings, co2Reduction };
  };

  const currentFuelData = fuelData.find(fuel => fuel.name.toLowerCase().includes(currentFuel));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fuel Comparison Engine</h1>
          <p className="text-gray-600 mt-1">
            Compare all available fuels and find the best option for your industry
          </p>
        </div>
        <div className="flex items-center bg-blue-50 px-4 py-2 rounded-full mt-4 lg:mt-0">
          <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
          <span className="text-sm font-medium text-blue-800">
            Real-time pricing data
          </span>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry Sector
            </label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {industries.map(industry => (
                <option key={industry.value} value={industry.value}>
                  {industry.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Fuel
            </label>
            <select
              value={currentFuel}
              onChange={(e) => setCurrentFuel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="coal">Coal</option>
              <option value="diesel">Diesel</option>
              <option value="natural">Natural Gas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Consumption (GCal)
            </label>
            <input
              type="number"
              value={monthlyConsumption}
              onChange={(e) => setMonthlyConsumption(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="100"
            />
          </div>
        </div>
      </div>

      {/* Fuel Comparison Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Detailed Fuel Comparison</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fuel Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost (₹/GCal)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CO₂ (kg/GCal)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SOx (kg/GCal)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NOx (kg/GCal)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ash Content (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reliability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Savings
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fuelData.map((fuel) => {
                const savings = currentFuelData ? calculateSavings(fuel, currentFuelData) : null;
                return (
                  <tr 
                    key={fuel.name}
                    className={`${fuel.recommended ? 'bg-green-50 border-l-4 border-green-400' : ''} ${
                      fuel.current ? 'bg-blue-50 border-l-4 border-blue-400' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{fuel.name}</span>
                        {fuel.recommended && (
                          <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                        )}
                        {fuel.current && (
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{fuel.costPerGCal.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={fuel.co2Emission === 0 ? 'text-green-600' : 'text-red-600'}>
                        {fuel.co2Emission}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {fuel.sox}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {fuel.nox}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {fuel.ashContent}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        fuel.reliability === 'High' ? 'bg-green-100 text-green-800' :
                        fuel.reliability === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {fuel.reliability}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {savings && !fuel.current && (
                        <span className={savings.monthlySavings > 0 ? 'text-green-600 font-medium' : 'text-red-600'}>
                          {savings.monthlySavings > 0 ? '+' : ''}₹{savings.monthlySavings.toLocaleString()}
                        </span>
                      )}
                      {fuel.current && (
                        <span className="text-gray-500">Baseline</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Savings Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center mb-4">
            <Calculator className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Savings Calculator</h2>
          </div>
          
          {currentFuelData && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Current Fuel: {currentFuelData.name}</h3>
                <p className="text-sm text-blue-700">
                  Monthly Cost: ₹{(currentFuelData.costPerGCal * monthlyConsumption).toLocaleString()}
                </p>
              </div>
              
              {fuelData
                .filter(fuel => fuel.name !== currentFuelData.name && fuel.recommended)
                .map(fuel => {
                  const savings = calculateSavings(fuel, currentFuelData);
                  return (
                    <div key={fuel.name} className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-medium text-green-900 mb-2">Switch to {fuel.name}</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-green-700">Monthly Savings:</p>
                          <p className="font-medium text-green-900">₹{savings.monthlySavings.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-green-700">Annual Savings:</p>
                          <p className="font-medium text-green-900">₹{savings.annualSavings.toLocaleString()}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-green-700">CO₂ Reduction:</p>
                          <p className="font-medium text-green-900">{savings.co2Reduction.toFixed(1)} kg/month</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          )}
        </div>

        {/* Decision Support */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center mb-4">
            <Flame className="h-5 w-5 text-orange-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Best Fuel Recommendation</h2>
          </div>
          
          <div className="space-y-4">
            {fuelData
              .filter(fuel => fuel.recommended)
              .map(fuel => (
                <div key={fuel.name} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-green-900">{fuel.name}</h3>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  
                  <div className="space-y-2 text-sm text-green-800">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>Most cost-effective for {selectedIndustry} industry</span>
                    </div>
                    <div className="flex items-center">
                      <Leaf className="h-4 w-4 mr-2" />
                      <span>Zero CO₂ emissions - Carbon neutral</span>
                    </div>
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span>Low ash content - Minimal disposal cost</span>
                    </div>
                  </div>
                  
                  <button className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium">
                    Order {fuel.name} Now
                  </button>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}