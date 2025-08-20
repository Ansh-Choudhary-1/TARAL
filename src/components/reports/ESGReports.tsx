import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Leaf, 
  TrendingUp,
  Calendar,
  BarChart3,
  Award,
  Target
} from 'lucide-react';

export default function ESGReports() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedReport, setSelectedReport] = useState('sustainability');

  const reportTypes = [
    { value: 'sustainability', label: 'Sustainability Report' },
    { value: 'carbon', label: 'Carbon Footprint Analysis' },
    { value: 'compliance', label: 'Compliance Summary' },
    { value: 'esg', label: 'ESG Performance' }
  ];

  const periods = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annual', label: 'Annual' }
  ];

  const sustainabilityMetrics = [
    {
      title: 'CO₂ Emissions Reduced',
      value: '245.8 Tons',
      change: '+18%',
      icon: Leaf,
      color: 'text-green-600 bg-green-50'
    },
    {
      title: 'Carbon Credits Earned',
      value: '₹2,45,000',
      change: '+25%',
      icon: Award,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      title: 'Clean Energy Usage',
      value: '78%',
      change: '+12%',
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50'
    },
    {
      title: 'Waste Reduction',
      value: '156 MT',
      change: '+8%',
      icon: Target,
      color: 'text-purple-600 bg-purple-50'
    }
  ];

  const availableReports = [
    {
      name: 'Monthly Sustainability Report',
      date: 'January 2025',
      type: 'PDF',
      size: '2.4 MB',
      description: 'Comprehensive overview of environmental impact and sustainability initiatives'
    },
    {
      name: 'Carbon Footprint Analysis',
      date: 'Q4 2024',
      type: 'PDF',
      size: '1.8 MB',
      description: 'Detailed analysis of carbon emissions and reduction strategies'
    },
    {
      name: 'ESG Performance Dashboard',
      date: 'December 2024',
      type: 'Excel',
      size: '856 KB',
      description: 'Environmental, Social, and Governance performance metrics'
    },
    {
      name: 'Compliance Summary',
      date: 'January 2025',
      type: 'PDF',
      size: '1.2 MB',
      description: 'Regulatory compliance status and certification updates'
    }
  ];

  const complianceStatus = [
    { standard: 'ISO 14001', status: 'Compliant', expiry: '2025-12-31', color: 'green' },
    { standard: 'Carbon Disclosure Project', status: 'Submitted', expiry: '2025-03-31', color: 'blue' },
    { standard: 'GRI Standards', status: 'In Progress', expiry: '2025-06-30', color: 'yellow' },
    { standard: 'TCFD Recommendations', status: 'Compliant', expiry: '2025-09-30', color: 'green' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ESG Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">
            Environmental, Social, and Governance reporting dashboard
          </p>
        </div>
        <div className="flex items-center bg-green-50 px-4 py-2 rounded-full mt-4 lg:mt-0">
          <FileText className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-sm font-medium text-green-800">
            Auto-generated reports
          </span>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Custom Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium">
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sustainabilityMetrics.map((metric) => {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Reports */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Available Reports</h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {availableReports.map((report, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{report.name}</h3>
                  <button className="text-blue-600 hover:text-blue-800">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {report.date}
                    </span>
                    <span>{report.type}</span>
                    <span>{report.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Status */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Compliance Status</h2>
            <Award className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {complianceStatus.map((item, index) => (
              <div key={index} className="border-l-4 border-gray-200 pl-4 py-2" style={{
                borderLeftColor: item.color === 'green' ? '#10b981' : 
                                item.color === 'blue' ? '#3b82f6' : '#f59e0b'
              }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{item.standard}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.color === 'green' ? 'bg-green-100 text-green-800' :
                    item.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Expires: {item.expiry}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Carbon Credits Summary */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="mb-4 lg:mb-0">
            <h2 className="text-xl font-semibold mb-2">Carbon Credits Portfolio</h2>
            <p className="text-green-100">
              Your sustainability efforts have generated significant carbon credits
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold">₹2,45,000</p>
                <p className="text-green-200 text-sm">Credits Earned</p>
              </div>
              <div>
                <p className="text-2xl font-bold">245.8 T</p>
                <p className="text-green-200 text-sm">CO₂ Offset</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <button className="bg-white text-green-700 px-6 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium">
              View Portfolio
            </button>
            <button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-400 transition-colors font-medium">
              Trade Credits
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}