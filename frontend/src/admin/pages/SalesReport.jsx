import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, IndianRupee, ShoppingBag, Users, Package,
  Calendar, Download, RefreshCw, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { adminReviewAPI } from '@/services/review.api';
import { toast } from 'sonner';

const PERIODS = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
];

const PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This year', year: true },
];

function formatINR(amount) {
  if (amount === undefined || amount === null) return '₹0';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

function GrowthBadge({ pct }) {
  if (pct === 0) return <span className="flex items-center gap-0.5 text-xs text-gray-500"><Minus size={10} />0%</span>;
  if (pct > 0)
    return <span className="flex items-center gap-0.5 text-xs text-green-600 font-semibold"><ArrowUp size={10} />{pct}%</span>;
  return <span className="flex items-center gap-0.5 text-xs text-red-500 font-semibold"><ArrowDown size={10} />{Math.abs(pct)}%</span>;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const PAYMENT_LABELS = { cod: 'Cash on Delivery', upi: 'UPI', card: 'Card', netbanking: 'Net Banking' };

const SalesReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('day');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminReviewAPI.getSalesReport({ startDate, endDate, period });
      if (res.success) {
        setReport(res.data);
      } else {
        toast.error(res.message || 'Failed to load report');
      }
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, period]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const applyPreset = (preset) => {
    const end = new Date();
    let start;
    if (preset.year) {
      start = new Date(end.getFullYear(), 0, 1);
    } else {
      start = new Date();
      start.setDate(end.getDate() - preset.days + 1);
    }
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const handleExportCSV = () => {
    if (!report) return;
    const rows = [
      ['Sales Report', `${report.dateRange.start.split('T')[0]} to ${report.dateRange.end.split('T')[0]}`],
      [],
      ['Overview'],
      ['Total Revenue', report.overview.totalRevenue],
      ['Total Orders', report.overview.totalOrders],
      ['Avg Order Value', report.overview.avgOrderValue],
      ['New Customers', report.overview.newCustomers],
      [],
      ['Revenue Over Time'],
      ['Period', 'Revenue', 'Orders'],
      ...(report.revenueOverTime || []).map((r) => [
        typeof r._id === 'object' ? `W${r._id.week}-${r._id.year}` : r._id,
        r.revenue,
        r.orders,
      ]),
      [],
      ['Top Products'],
      ['Product', 'Category', 'Quantity Sold', 'Revenue'],
      ...(report.topProducts || []).map((p) => [p.name, p.category || '-', p.totalQuantity, p.totalRevenue]),
      [],
      ['Category Revenue'],
      ['Category', 'Revenue', 'Quantity'],
      ...(report.categoryRevenue || []).map((c) => [c._id || 'Unknown', c.revenue, c.quantity]),
      [],
      ['Payment Methods'],
      ['Method', 'Orders', 'Revenue'],
      ...(report.paymentBreakdown || []).map((p) => [PAYMENT_LABELS[p._id] || p._id, p.count, p.revenue]),
      [],
      ['Order Status'],
      ['Status', 'Count'],
      ...(report.orderStatusBreakdown || []).map((s) => [s._id, s.count]),
    ];

    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${startDate}-to-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Simple bar chart using divs
  const BarChart = ({ data, valueKey = 'revenue', labelKey = '_id', maxBars = 14 }) => {
    if (!data || data.length === 0) return <p className="text-center text-gray-400 font-body text-sm py-4">No data</p>;
    const sliced = data.slice(0, maxBars);
    const maxVal = Math.max(...sliced.map((d) => d[valueKey] || 0), 1);
    return (
      <div className="flex items-end gap-1 h-40 w-full overflow-x-auto pb-6 pt-2">
        {sliced.map((d, i) => {
          const pct = ((d[valueKey] || 0) / maxVal) * 100;
          const label = typeof d[labelKey] === 'object'
            ? `W${d[labelKey]?.week}`
            : String(d[labelKey] || '').slice(-5);
          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-[28px]">
              <div
                className="w-full bg-[#6B1E1E]/80 rounded-t hover:bg-[#8B2E2E] transition-colors cursor-default"
                style={{ height: `${Math.max(pct, 2)}%` }}
                title={`${label}: ${formatINR(d[valueKey])}`}
              />
              <span className="font-body text-[9px] text-gray-400 rotate-0 truncate w-full text-center">{label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E1E]" />
      </div>
    );
  }

  const ov = report?.overview || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#6B1E1E]">Sales Report</h1>
          <p className="font-body text-gray-600 mt-1">Comprehensive sales analytics</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={!report}
            className="flex items-center gap-2 px-4 py-2 border border-[#6B1E1E] text-[#6B1E1E] rounded-lg hover:bg-[#6B1E1E]/5 transition-colors font-body text-sm disabled:opacity-40"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            onClick={fetchReport}
            className="flex items-center gap-2 px-4 py-2 bg-[#6B1E1E] text-white rounded-lg hover:bg-[#8B2E2E] transition-colors font-body text-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Date range & period controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        {/* Presets */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="px-3 py-1.5 rounded-full border border-gray-200 font-body text-xs hover:border-[#6B1E1E] hover:text-[#6B1E1E] transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block font-body text-xs text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:border-[#6B1E1E]"
            />
          </div>
          <div>
            <label className="block font-body text-xs text-gray-500 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:border-[#6B1E1E]"
            />
          </div>
          <div>
            <label className="block font-body text-xs text-gray-500 mb-1">Group By</label>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-3 py-2 font-body text-xs transition-colors ${
                    period === p.value
                      ? 'bg-[#6B1E1E] text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: IndianRupee,
            label: 'Total Revenue',
            value: formatINR(ov.totalRevenue),
            growth: ov.revenueGrowth,
            color: 'from-[#6B1E1E] to-[#8B2E2E]',
          },
          {
            icon: ShoppingBag,
            label: 'Total Orders',
            value: ov.totalOrders || 0,
            growth: ov.ordersGrowth,
            color: 'from-blue-600 to-blue-700',
          },
          {
            icon: TrendingUp,
            label: 'Avg Order Value',
            value: formatINR(ov.avgOrderValue),
            growth: null,
            color: 'from-purple-600 to-purple-700',
          },
          {
            icon: Users,
            label: 'New Customers',
            value: ov.newCustomers || 0,
            growth: ov.customersGrowth,
            color: 'from-green-600 to-green-700',
          },
        ].map((card) => (
          <div key={card.label} className={`bg-gradient-to-br ${card.color} text-white rounded-xl p-5`}>
            <div className="flex items-center justify-between mb-3">
              <card.icon size={22} className="opacity-80" />
              {card.growth !== null && card.growth !== undefined && (
                <div className="bg-white/20 rounded-full px-2 py-0.5">
                  <GrowthBadge pct={card.growth} />
                </div>
              )}
            </div>
            <p className="font-display text-2xl font-bold">{card.value}</p>
            <p className="font-body text-xs opacity-75 mt-0.5">{card.label}</p>
            {card.growth !== null && card.growth !== undefined && (
              <p className="font-body text-xs opacity-60 mt-0.5">vs. previous period</p>
            )}
          </div>
        ))}
      </div>

      {/* Revenue Over Time Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-display text-lg font-bold text-gray-900 mb-4">Revenue Over Time</h2>
        {report?.revenueOverTime?.length > 0 ? (
          <>
            <BarChart data={report.revenueOverTime} valueKey="revenue" maxBars={30} />
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {report.revenueOverTime.slice(-4).map((d, i) => {
                const label = typeof d._id === 'object'
                  ? `W${d._id.week}-${d._id.year}`
                  : d._id;
                return (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="font-body text-xs text-gray-500 truncate">{label}</p>
                    <p className="font-body font-bold text-[#6B1E1E]">{formatINR(d.revenue)}</p>
                    <p className="font-body text-xs text-gray-400">{d.orders} orders</p>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-center text-gray-400 font-body text-sm py-8">No revenue data for this period</p>
        )}
      </div>

      {/* Two columns: Top Products + Category Revenue */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-display text-lg font-bold text-gray-900 mb-4">Top Products by Revenue</h2>
          <div className="space-y-3">
            {(report?.topProducts || []).length === 0 ? (
              <p className="text-center text-gray-400 font-body text-sm py-4">No data</p>
            ) : (
              report.topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#6B1E1E]/10 text-[#6B1E1E] flex items-center justify-center font-body text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="font-body text-xs text-gray-400">
                      {p.category || 'Uncategorized'} · {p.totalQuantity} units
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-body text-sm font-bold text-[#6B1E1E]">{formatINR(p.totalRevenue)}</p>
                    <p className="font-body text-xs text-gray-400">{p.ordersCount} orders</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-display text-lg font-bold text-gray-900 mb-4">Revenue by Category</h2>
          {(report?.categoryRevenue || []).length === 0 ? (
            <p className="text-center text-gray-400 font-body text-sm py-4">No data</p>
          ) : (
            <div className="space-y-3">
              {(() => {
                const total = report.categoryRevenue.reduce((s, c) => s + c.revenue, 0);
                return report.categoryRevenue.map((cat, i) => {
                  const pct = total > 0 ? Math.round((cat.revenue / total) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-body text-sm text-gray-700">{cat._id || 'Unknown'}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-body text-xs text-gray-400">{cat.quantity} units</span>
                          <span className="font-body text-sm font-bold text-[#6B1E1E]">{formatINR(cat.revenue)}</span>
                          <span className="font-body text-xs text-gray-400 w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-[#6B1E1E] h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Payment Methods + Order Status */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-display text-lg font-bold text-gray-900 mb-4">Payment Methods</h2>
          {(report?.paymentBreakdown || []).length === 0 ? (
            <p className="text-center text-gray-400 font-body text-sm py-4">No data</p>
          ) : (
            <div className="space-y-4">
              {(() => {
                const total = report.paymentBreakdown.reduce((s, p) => s + p.count, 0);
                return report.paymentBreakdown.map((pm, i) => {
                  const pct = total > 0 ? Math.round((pm.count / total) * 100) : 0;
                  const colors = ['bg-[#6B1E1E]', 'bg-blue-500', 'bg-purple-500', 'bg-green-500'];
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${colors[i % colors.length]}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-body text-sm text-gray-700">
                            {PAYMENT_LABELS[pm._id] || pm._id}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="font-body text-xs text-gray-400">{pm.count} orders · {pct}%</span>
                            <span className="font-body text-sm font-bold text-gray-800">{formatINR(pm.revenue)}</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`${colors[i % colors.length]} h-1.5 rounded-full transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-display text-lg font-bold text-gray-900 mb-4">Order Status Breakdown</h2>
          {(report?.orderStatusBreakdown || []).length === 0 ? (
            <p className="text-center text-gray-400 font-body text-sm py-4">No data</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {report.orderStatusBreakdown.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span
                      className={`px-2 py-0.5 rounded-full font-body text-xs font-semibold capitalize ${
                        STATUS_COLORS[s._id] || 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {s._id}
                    </span>
                    <p className="font-body text-xs text-gray-400 mt-1">{formatINR(s.revenue)}</p>
                  </div>
                  <p className="font-display text-xl font-bold text-gray-700">{s.count}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Cities */}
      {(report?.cityBreakdown || []).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-display text-lg font-bold text-gray-900 mb-4">Top Delivery Cities</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {report.cityBreakdown.map((city, i) => (
              <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="font-body text-sm font-semibold text-gray-800 truncate">{city._id || 'Unknown'}</p>
                <p className="font-display text-xl font-bold text-[#6B1E1E]">{city.orders}</p>
                <p className="font-body text-xs text-gray-400">orders</p>
                <p className="font-body text-xs text-gray-500">{formatINR(city.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily 7-day Trend */}
      {(report?.dailyTrend || []).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-display text-lg font-bold text-gray-900 mb-1">7-Day Revenue Trend (within selected range)</h2>
          <p className="font-body text-xs text-gray-400 mb-4">Last 7 days of the selected period</p>
          <BarChart data={report.dailyTrend} valueKey="revenue" labelKey="_id" maxBars={7} />
          <div className="grid grid-cols-7 gap-2 mt-2">
            {report.dailyTrend.map((d, i) => (
              <div key={i} className="text-center">
                <p className="font-body text-xs font-semibold text-[#6B1E1E]">{formatINR(d.revenue)}</p>
                <p className="font-body text-xs text-gray-400">{d.orders} orders</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesReport;
