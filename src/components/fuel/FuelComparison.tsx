import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Leaf,
  DollarSign,
  Flame,
  AlertTriangle,
  CheckCircle,
  Calculator,
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../common/Toast';
import type { FuelData } from '../../lib/seedData';

const industries = [
  { value: 'textiles', label: 'Textiles' },
  { value: 'pharmaceutical', label: 'Pharmaceutical' },
  { value: 'food-processing', label: 'Food Processing' },
  { value: 'chemicals', label: 'Chemicals' },
  { value: 'paper-pulp', label: 'Paper & Pulp' },
];

function fmt(n: number, dp = 0) {
  return n.toLocaleString(undefined, { maximumFractionDigits: dp });
}

export default function FuelComparison() {
  const navigate = useNavigate();
  const { fuelData, addOrder } = useData();
  const { user } = useUser();
  const { toast } = useToast();

  const knownIndustry = industries.some((i) => i.value === user?.industry) ? user!.industry! : 'textiles';
  const [selectedIndustry, setSelectedIndustry] = useState(knownIndustry);
  const [currentFuel, setCurrentFuel] = useState('Coal');
  const [monthlyConsumption, setMonthlyConsumption] = useState(100);

  const industryLabel = industries.find((i) => i.value === selectedIndustry)?.label ?? 'your';

  const currentFuelData = useMemo(
    () => fuelData.find((f) => f.name === currentFuel) ?? fuelData[0],
    [fuelData, currentFuel],
  );

  const calculateSavings = useMemo(() => {
    return (newFuel: FuelData, baseline: FuelData) => {
      const monthlySavings = (baseline.costPerGCal - newFuel.costPerGCal) * monthlyConsumption;
      const annualSavings = monthlySavings * 12;
      const co2Reduction = (baseline.co2Emission - newFuel.co2Emission) * monthlyConsumption;
      return { monthlySavings, annualSavings, co2Reduction };
    };
  }, [monthlyConsumption]);

  const recommended = useMemo(() => fuelData.filter((f) => f.recommended), [fuelData]);

  const orderFuel = (fuel: FuelData) => {
    if (monthlyConsumption < 1) {
      toast('Set a monthly consumption of at least 1 before ordering', 'error');
      return;
    }
    const order = addOrder({
      fuel: fuel.name,
      quantity: monthlyConsumption,
      buyerEmail: user?.email ?? '',
      company: user?.company ?? '',
    });
    toast(`Order ${order.id} placed for ${fmt(monthlyConsumption)} MT of ${fuel.name}`);
    navigate('/orders');
  };

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
            {fuelData.length} fuels compared
          </span>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="fc-industry" className="block text-sm font-medium text-gray-700 mb-2">
              Industry Sector
            </label>
            <select
              id="fc-industry"
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {industries.map((industry) => (
                <option key={industry.value} value={industry.value}>
                  {industry.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="fc-current-fuel" className="block text-sm font-medium text-gray-700 mb-2">
              Current Fuel
            </label>
            <select
              id="fc-current-fuel"
              value={currentFuel}
              onChange={(e) => setCurrentFuel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {fuelData.map((fuel) => (
                <option key={fuel.name} value={fuel.name}>
                  {fuel.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="fc-consumption" className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Consumption (GCal)
            </label>
            <input
              id="fc-consumption"
              type="number"
              min={0}
              value={monthlyConsumption}
              onChange={(e) => setMonthlyConsumption(Math.max(0, parseInt(e.target.value) || 0))}
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
                {['Fuel Type', 'Cost (₹/GCal)', 'CO₂ (kg/GCal)', 'SOx (kg/GCal)', 'NOx (kg/GCal)', 'Ash Content (%)', 'Reliability', 'Monthly Savings'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fuelData.map((fuel) => {
                const isCurrent = fuel.name === currentFuelData.name;
                const savings = calculateSavings(fuel, currentFuelData);
                return (
                  <tr
                    key={fuel.name}
                    className={
                      isCurrent
                        ? 'bg-blue-50 border-l-4 border-blue-400'
                        : fuel.recommended
                        ? 'bg-green-50 border-l-4 border-green-400'
                        : ''
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{fuel.name}</span>
                        {fuel.recommended && !isCurrent && (
                          <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                        )}
                        {isCurrent && (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fuel.sox}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fuel.nox}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fuel.ashContent}%</td>
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
                      {isCurrent ? (
                        <span className="text-gray-500">Baseline</span>
                      ) : (
                        <span className={savings.monthlySavings >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {savings.monthlySavings >= 0 ? '+' : '−'}₹{fmt(Math.abs(savings.monthlySavings))}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Savings Calculator + Decision Support */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center mb-4">
            <Calculator className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Savings Calculator</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Current Fuel: {currentFuelData.name}</h3>
              <p className="text-sm text-blue-700">
                Monthly Cost: ₹{fmt(currentFuelData.costPerGCal * monthlyConsumption)}
              </p>
            </div>

            {fuelData
              .filter((fuel) => fuel.name !== currentFuelData.name && fuel.recommended)
              .map((fuel) => {
                const savings = calculateSavings(fuel, currentFuelData);
                return (
                  <div key={fuel.name} className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-2">Switch to {fuel.name}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-green-700">Monthly Savings</p>
                        <p className="font-medium text-green-900">₹{fmt(savings.monthlySavings)}</p>
                      </div>
                      <div>
                        <p className="text-green-700">Annual Savings</p>
                        <p className="font-medium text-green-900">₹{fmt(savings.annualSavings)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-green-700">CO₂ Reduction</p>
                        <p className="font-medium text-green-900">{fmt(savings.co2Reduction)} kg/month</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            {currentFuelData.recommended && (
              <p className="text-sm text-gray-500">
                {currentFuelData.name} is already a recommended clean fuel — you're on the best option.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center mb-4">
            <Flame className="h-5 w-5 text-orange-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Best Fuel Recommendation</h2>
          </div>

          <div className="space-y-4">
            {recommended.map((fuel) => {
              const savings = calculateSavings(fuel, currentFuelData);
              const isCurrent = fuel.name === currentFuelData.name;
              return (
                <div key={fuel.name} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-green-900">{fuel.name}</h3>
                      <p className="text-xs text-green-700">Recommended for {industryLabel} operations</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>

                  <div className="space-y-2 text-sm text-green-800">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>
                        {isCurrent
                          ? 'Currently in use'
                          : savings.monthlySavings >= 0
                          ? `Saves ₹${fmt(savings.monthlySavings)}/month vs ${currentFuelData.name}`
                          : `Costs ₹${fmt(Math.abs(savings.monthlySavings))}/month more than ${currentFuelData.name}`}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Leaf className="h-4 w-4 mr-2" />
                      <span>
                        {fuel.co2Emission === 0
                          ? 'Zero CO₂ emissions — carbon neutral'
                          : `${fuel.co2Emission} kg CO₂/GCal`}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span>{fuel.ashContent}% ash · {fuel.reliability.toLowerCase()} reliability</span>
                    </div>
                  </div>

                  <button
                    onClick={() => orderFuel(fuel)}
                    className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Order {fuel.name} Now
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
