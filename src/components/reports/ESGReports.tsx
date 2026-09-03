import { useMemo, useState } from 'react';
import {
  FileText,
  Download,
  Leaf,
  TrendingUp,
  Calendar,
  BarChart3,
  Award,
  Target,
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../common/Toast';
import Modal from '../common/Modal';
import { computeEsg } from '../../lib/esg';
import { SEED_OWNER, type SavedReport } from '../../lib/seedData';

const reportTypes = [
  { value: 'sustainability', label: 'Sustainability Report' },
  { value: 'carbon', label: 'Carbon Footprint Analysis' },
  { value: 'compliance', label: 'Compliance Summary' },
  { value: 'esg', label: 'ESG Performance' },
];

const periods = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annual', label: 'Annual' },
];

const complianceStatus = [
  { standard: 'ISO 14001', status: 'Compliant', expiry: '2025-12-31', color: 'green' },
  { standard: 'Carbon Disclosure Project', status: 'Submitted', expiry: '2025-03-31', color: 'blue' },
  { standard: 'GRI Standards', status: 'In Progress', expiry: '2025-06-30', color: 'yellow' },
  { standard: 'TCFD Recommendations', status: 'Compliant', expiry: '2025-09-30', color: 'green' },
];

export default function ESGReports() {
  const { orders, reports, addReport, addCreditTrade } = useData();
  const { user } = useUser();
  const { toast } = useToast();

  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedReport, setSelectedReport] = useState('sustainability');
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [tradeAmount, setTradeAmount] = useState(5000);

  const scopedOrders = useMemo(
    () =>
      user?.type === 'admin'
        ? orders
        : orders.filter((o) => o.buyerEmail === user?.email || o.buyerEmail === SEED_OWNER),
    [orders, user],
  );
  const esg = useMemo(() => computeEsg(scopedOrders), [scopedOrders]);

  const sustainabilityMetrics = [
    {
      title: 'CO₂ Emissions Reduced',
      value: `${esg.co2ReducedTons} Tons`,
      change: `${esg.ordersCount} orders`,
      icon: Leaf,
      color: 'text-green-600 bg-green-50',
    },
    {
      title: 'Carbon Credits Earned',
      value: `₹${esg.creditsEarned.toLocaleString()}`,
      change: `₹${esg.totalSavings.toLocaleString()} saved`,
      icon: Award,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Clean Energy Usage',
      value: `${esg.cleanEnergyPct}%`,
      change: `${esg.totalQuantity} MT`,
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Waste Reduction',
      value: `${esg.wasteReducedMt} MT`,
      change: '+8%',
      icon: Target,
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  const generateReport = () => {
    const typeLabel = reportTypes.find((t) => t.value === selectedReport)?.label ?? 'Report';
    const periodLabel = periods.find((p) => p.value === selectedPeriod)?.label ?? '';
    addReport({
      name: `${periodLabel} ${typeLabel}`,
      date: new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      type: 'PDF',
      size: '— KB',
      description: `Auto-generated ${typeLabel.toLowerCase()} covering ${esg.ordersCount} orders and ${esg.co2ReducedTons} tons of CO₂ avoided.`,
    });
    toast(`${periodLabel} ${typeLabel} generated`);
  };

  const downloadReport = (report: SavedReport) => {
    const rows: [string, string | number][] = [
      ['Report', report.name],
      ['Generated', report.date],
      ['Orders counted', esg.ordersCount],
      ['Total quantity (MT)', esg.totalQuantity],
      ['CO2 reduced (tons)', esg.co2ReducedTons],
      ['Carbon credits earned (INR)', esg.creditsEarned],
      ['Fuel cost saved (INR)', esg.totalSavings],
      ['Clean energy usage (%)', esg.cleanEnergyPct],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.name.replace(/\s+/g, '-').toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast(`Downloaded ${report.name}`);
  };

  const confirmTrade = () => {
    if (tradeAmount < 1) {
      toast('Enter an amount to trade', 'error');
      return;
    }
    if (tradeAmount > esg.creditsEarned) {
      toast(`You only have ₹${esg.creditsEarned.toLocaleString()} in credits`, 'error');
      return;
    }
    addCreditTrade(tradeAmount);
    setTradeOpen(false);
    toast(`Traded ₹${tradeAmount.toLocaleString()} of carbon credits`);
  };

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
              {reportTypes.map((type) => (
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
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={generateReport}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
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
            {reports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{report.name}</h3>
                  <button
                    onClick={() => downloadReport(report)}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label={`Download ${report.name}`}
                  >
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
                                item.color === 'blue' ? '#3b82f6' : '#f59e0b',
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
        <div className="flex flex-col lg:flex-row items-start justify-between">
          <div className="mb-4 lg:mb-0">
            <h2 className="text-xl font-semibold mb-2">Carbon Credits Portfolio</h2>
            <p className="text-green-100">
              Your sustainability efforts have generated significant carbon credits
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold">₹{esg.creditsEarned.toLocaleString()}</p>
                <p className="text-green-200 text-sm">Credits Earned</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{esg.co2ReducedTons} T</p>
                <p className="text-green-200 text-sm">CO₂ Offset</p>
              </div>
            </div>

            {showPortfolio && (
              <div className="mt-4 bg-white/10 rounded-lg p-4 space-y-2">
                {esg.byFuel.length === 0 && (
                  <p className="text-sm text-green-100">No orders yet — place an order to build your portfolio.</p>
                )}
                {esg.byFuel.map((row) => (
                  <div key={row.fuel} className="flex justify-between text-sm">
                    <span className="text-green-100">{row.fuel} • {row.quantity} MT</span>
                    <span className="font-medium">
                      {row.co2ReducedTons} T • ₹{row.creditsEarned.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => setShowPortfolio((v) => !v)}
              className="bg-white text-green-700 px-6 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium"
            >
              {showPortfolio ? 'Hide Portfolio' : 'View Portfolio'}
            </button>
            <button
              onClick={() => {
                setTradeAmount(Math.min(5000, esg.creditsEarned));
                setTradeOpen(true);
              }}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-400 transition-colors font-medium"
            >
              Trade Credits
            </button>
          </div>
        </div>
      </div>

      {/* Trade modal */}
      <Modal open={tradeOpen} title="Trade Carbon Credits" onClose={() => setTradeOpen(false)}>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Available</span>
            <span className="font-medium">₹{esg.creditsEarned.toLocaleString()}</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount to trade (₹)</label>
            <input
              type="number"
              min={1}
              max={esg.creditsEarned}
              value={tradeAmount}
              onChange={(e) => setTradeAmount(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <button
            onClick={confirmTrade}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Confirm Trade
          </button>
        </div>
      </Modal>
    </div>
  );
}
