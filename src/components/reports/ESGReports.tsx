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
  PieChart,
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

function fmt(n: number, dp = 0) {
  return n.toLocaleString(undefined, { maximumFractionDigits: dp });
}

export default function ESGReports() {
  const { orders, reports, addReport, addCreditTrade } = useData();
  const { user } = useUser();
  const { toast } = useToast();

  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedReport, setSelectedReport] = useState('sustainability');
  const [tradeOpen, setTradeOpen] = useState(false);
  const [tradeAmount, setTradeAmount] = useState(0);
  const [tradeError, setTradeError] = useState('');

  const scopedOrders = useMemo(
    () =>
      user?.type === 'admin'
        ? orders
        : orders.filter((o) => o.buyerEmail === user?.email || o.buyerEmail === SEED_OWNER),
    [orders, user],
  );
  const esg = useMemo(() => computeEsg(scopedOrders), [scopedOrders]);

  const metrics = [
    {
      title: 'CO₂ Emissions Reduced',
      value: `${fmt(esg.co2ReducedTons, 1)} t`,
      sub: `across ${esg.ordersCount} orders`,
      icon: Leaf,
      color: 'text-green-600 bg-green-50',
    },
    {
      title: 'Carbon Credits Earned',
      value: `₹${fmt(esg.creditsEarned)}`,
      sub: `₹${fmt(esg.totalSavings)} fuel cost saved`,
      icon: Award,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Clean Energy Share',
      value: `${esg.cleanEnergyPct}%`,
      sub: `${fmt(esg.totalQuantity)} MT switched`,
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Waste Diverted',
      value: `${fmt(esg.wasteReducedMt, 1)} MT`,
      sub: `${esg.byFuel.length} fuel type${esg.byFuel.length === 1 ? '' : 's'}`,
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
      size: `${fmt(120 + esg.ordersCount * 8)} KB`,
      description: `${typeLabel} covering ${esg.ordersCount} orders, ${fmt(esg.co2ReducedTons, 1)} t CO₂ avoided and ₹${fmt(esg.creditsEarned)} in carbon credits.`,
    });
    toast(`${periodLabel} ${typeLabel} generated`);
  };

  const downloadReport = (report: SavedReport) => {
    const rows: [string, string | number][] = [
      ['Report', report.name],
      ['Generated', report.date],
      ['Orders counted', esg.ordersCount],
      ['Total quantity (MT)', esg.totalQuantity],
      ['CO2 reduced (tonnes)', esg.co2ReducedTons],
      ['Carbon credits earned (INR)', esg.creditsEarned],
      ['Fuel cost saved (INR)', esg.totalSavings],
      ['Clean energy share (%)', esg.cleanEnergyPct],
      ...esg.byFuel.map((f): [string, string | number] => [
        `  ${f.fuel} (MT / t CO2 / INR credits)`,
        `${f.quantity} / ${f.co2ReducedTons} / ${f.creditsEarned}`,
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.name.replace(/\s+/g, '-').toLowerCase()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    toast(`Downloaded ${report.name}`);
  };

  const openTrade = () => {
    setTradeAmount(Math.min(5000, esg.creditsEarned));
    setTradeError('');
    setTradeOpen(true);
  };

  const confirmTrade = () => {
    if (tradeAmount < 1) {
      setTradeError('Enter an amount of at least ₹1.');
      return;
    }
    if (tradeAmount > esg.creditsEarned) {
      setTradeError(`You only have ₹${fmt(esg.creditsEarned)} in credits.`);
      return;
    }
    addCreditTrade(tradeAmount);
    setTradeOpen(false);
    toast(`Traded ₹${fmt(tradeAmount)} of carbon credits`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ESG Reports &amp; Analytics</h1>
          <p className="text-gray-600 mt-1">
            Environmental impact derived from your order history
          </p>
        </div>
        <div className="flex items-center bg-green-50 px-4 py-2 rounded-full mt-4 lg:mt-0">
          <FileText className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-sm font-medium text-green-800">{reports.length} saved reports</span>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate a Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="esg-type" className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              id="esg-type"
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="esg-period" className="block text-sm font-medium text-gray-700 mb-2">Period</label>
            <select
              id="esg-period"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>{period.label}</option>
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
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-gray-400 text-xs font-medium text-right">{metric.sub}</span>
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
            <h2 className="text-lg font-semibold text-gray-900">Saved Reports</h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No reports yet — generate one above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{report.name}</h3>
                    <button
                      onClick={() => downloadReport(report)}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                      aria-label={`Download ${report.name}`}
                    >
                      <Download className="h-4 w-4 mr-1" /> CSV
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {report.date}
                    </span>
                    <span>{report.type}</span>
                    <span>{report.size}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Impact breakdown (derived) */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Impact by Fuel</h2>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>

          {esg.byFuel.length === 0 ? (
            <div className="text-center py-8">
              <Leaf className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No orders yet — place one to build your impact profile.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {esg.byFuel.map((row) => {
                const share = esg.co2ReducedTons > 0
                  ? Math.round((row.co2ReducedTons / esg.co2ReducedTons) * 100)
                  : 0;
                return (
                  <div key={row.fuel} className="border-l-4 border-green-400 pl-4 py-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{row.fuel}</span>
                      <span className="text-xs text-gray-500">{row.quantity} MT</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${share}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{fmt(row.co2ReducedTons, 1)} t CO₂ avoided</span>
                      <span>₹{fmt(row.creditsEarned)} credits</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Carbon Credits Portfolio */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Carbon Credits Portfolio</h2>
            <p className="text-green-100">
              Switching fuels converts avoided CO₂ into tradable carbon credits.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold">₹{fmt(esg.creditsEarned)}</p>
                <p className="text-green-200 text-sm">Credits earned</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{fmt(esg.co2ReducedTons, 1)} t</p>
                <p className="text-green-200 text-sm">CO₂ offset</p>
              </div>
            </div>
          </div>
          <button
            onClick={openTrade}
            disabled={esg.creditsEarned <= 0}
            className="bg-white text-green-700 px-6 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trade Credits
          </button>
        </div>
      </div>

      {/* Trade modal */}
      <Modal open={tradeOpen} title="Trade Carbon Credits" onClose={() => setTradeOpen(false)}>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Available</span>
            <span className="font-medium">₹{fmt(esg.creditsEarned)}</span>
          </div>
          <div>
            <label htmlFor="trade-amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount to trade (₹)
            </label>
            <input
              id="trade-amount"
              type="number"
              min={1}
              max={esg.creditsEarned}
              value={tradeAmount}
              onChange={(e) => {
                setTradeAmount(Math.max(0, parseInt(e.target.value) || 0));
                setTradeError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {tradeError && <p className="mt-1 text-xs text-red-600">{tradeError}</p>}
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
