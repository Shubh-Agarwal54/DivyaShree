import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, IndianRupee, ShoppingBag, Users, Package,
  Calendar, Download, RefreshCw, ArrowUp, ArrowDown, Minus,
  BarChart2, Tag, UserCircle, FileText,
} from 'lucide-react';
import { adminReviewAPI } from '@/services/review.api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

const PERIODS = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
];

const PRESETS = [
  { label: 'Today', today: true },
  { label: 'Yesterday', yesterday: true },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
  { label: 'This Year', year: true },
];

const TABS = [
  { id: 'overview',    label: 'Overview',       icon: BarChart2   },
  { id: 'sales-date',  label: 'Sales by Date',  icon: Calendar    },
  { id: 'category',    label: 'Category Sales', icon: Tag         },
  { id: 'products',    label: 'Products',       icon: Package     },
  { id: 'customers',   label: 'Customers',      icon: UserCircle  },
  { id: 'gst',         label: 'GST Report',     icon: FileText    },
];

function formatINR(amount) {
  if (amount === undefined || amount === null) return '₹0';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

function formatINRFull(amount) {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
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
  const [activeTab, setActiveTab] = useState('overview');
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
    const today = new Date();
    if (preset.today) {
      const d = today.toISOString().split('T')[0];
      setStartDate(d); setEndDate(d);
    } else if (preset.yesterday) {
      const y = new Date(today); y.setDate(y.getDate() - 1);
      const d = y.toISOString().split('T')[0];
      setStartDate(d); setEndDate(d);
    } else if (preset.year) {
      setStartDate(new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } else {
      const s = new Date(); s.setDate(today.getDate() - preset.days + 1);
      setStartDate(s.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    }
  };

  const handleExportCSV = () => {
    if (!report) return;
    const rows = [
      ['DivyaShree Sales Report', `${startDate} to ${endDate}`],
      [], ['=== OVERVIEW ==='],
      ['Total Revenue', report.overview.totalRevenue], ['Net Revenue', report.overview.netRevenue],
      ['Total Orders', report.overview.totalOrders], ['Avg Order Value', report.overview.avgOrderValue],
      ['Total Discounts', report.overview.totalDiscount], ['New Customers', report.overview.newCustomers],
      [], ['=== SALES BY DATE ==='],
      ['Date', 'Orders', 'Products Sold', 'Total Sales', 'Discount', 'Tax', 'Net Sale'],
      ...(report.salesByDate || []).map((r) => [r._id, r.orders, r.productsSold, r.totalSales, r.totalDiscount, r.totalTax, r.netSale]),
      [], ['=== CATEGORY SALES ==='],
      ['Category', 'Products', 'Orders', 'Qty Sold', 'Revenue'],
      ...(report.categoryRevenue || []).map((c) => [c._id || 'Uncategorized', c.totalProducts || 0, c.orders, c.quantity, c.revenue]),
      [], ['=== PRODUCT WISE ==='],
      ['Product', 'SKU', 'Category', 'Qty', 'Revenue', 'Orders', 'Avg Price', 'Stock'],
      ...(report.productReport || []).map((p) => [p.name, p.sku || '-', p.resolvedCategory || p.category || '-', p.totalQuantity, p.totalRevenue, p.totalOrders, Math.round(p.avgPrice), p.stockRemaining ?? '-']),
      [], ['=== CUSTOMERS ==='],
      ['Name', 'Email', 'Phone', 'Orders', 'Total Spend', 'Avg Order', 'Last Order'],
      ...(report.customerReport || []).map((c) => [c.name, c.email, c.phone || '-', c.totalOrders, c.totalSpend, Math.round(c.avgOrderValue), c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString('en-IN') : '-']),
      [], ['=== GST REPORT ==='],
      ['Date', 'Orders', 'Taxable Amount', 'CGST', 'SGST', 'IGST', 'Total Tax'],
      ...(report.gstByDate || []).map((g) => [g._id, g.orders, g.taxableAmount, (g.cgst||0).toFixed(2), (g.sgst||0).toFixed(2), (g.igst||0).toFixed(2), (g.totalTax||0).toFixed(2)]),
      [], ['=== ORDER STATUS ==='], ['Status', 'Count', 'Revenue'],
      ...(report.orderStatusBreakdown || []).map((s) => [s._id, s.count, s.revenue]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `sales-report-${startDate}-to-${endDate}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (!report) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFontSize(16); doc.setFont('helvetica', 'bold'); doc.setTextColor(107, 30, 30);
    doc.text('DivyaShree — Sales Report', 40, 40);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100);
    doc.text(`Period: ${startDate} to ${endDate}  |  Generated: ${new Date().toLocaleDateString('en-IN')}`, 40, 56);
    let sy = 72;
    const hdr = { fillColor: [107, 30, 30], textColor: [255, 255, 255], fontSize: 8 };
    const mg  = { left: 40, right: 40 };
    autoTable(doc, { startY: sy, margin: mg, theme: 'grid', headStyles: hdr, bodyStyles: { fontSize: 9, fontStyle: 'bold' },
      head: [['Total Revenue', 'Net Revenue', 'Total Orders', 'Avg Order', 'New Customers']],
      body: [[`₹${(report.overview.totalRevenue||0).toLocaleString('en-IN')}`, `₹${(report.overview.netRevenue||0).toLocaleString('en-IN')}`, report.overview.totalOrders||0, `₹${(report.overview.avgOrderValue||0).toLocaleString('en-IN')}`, report.overview.newCustomers||0]] });
    sy = doc.lastAutoTable.finalY + 12;
    if (report.salesByDate?.length) {
      doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(0); doc.text('Sales by Date', 40, sy); sy += 5;
      autoTable(doc, { startY: sy, margin: mg, theme: 'striped', headStyles: hdr, bodyStyles: { fontSize: 7 },
        head: [['Date', 'Orders', 'Products Sold', 'Total Sales', 'Discount', 'Tax', 'Net Sale']],
        body: report.salesByDate.map((r) => [r._id, r.orders, r.productsSold, `₹${(r.totalSales||0).toLocaleString('en-IN')}`, `₹${(r.totalDiscount||0).toLocaleString('en-IN')}`, `₹${(r.totalTax||0).toLocaleString('en-IN')}`, `₹${(r.netSale||0).toLocaleString('en-IN')}`]) });
      sy = doc.lastAutoTable.finalY + 12;
    }
    if (report.categoryRevenue?.length) {
      if (sy > 580) { doc.addPage(); sy = 40; }
      doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(0); doc.text('Category Sales', 40, sy); sy += 5;
      const catT = report.categoryRevenue.reduce((s, c) => s + c.revenue, 0);
      autoTable(doc, { startY: sy, margin: mg, theme: 'striped', headStyles: hdr, bodyStyles: { fontSize: 7 },
        head: [['Category', 'Products', 'Orders', 'Qty', 'Revenue', '%']],
        body: report.categoryRevenue.map((c) => [c._id||'Uncategorized', c.totalProducts||0, c.orders, c.quantity, `₹${(c.revenue||0).toLocaleString('en-IN')}`, `${catT>0?Math.round((c.revenue/catT)*100):0}%`]) });
      sy = doc.lastAutoTable.finalY + 12;
    }
    if (report.productReport?.length) {
      doc.addPage(); sy = 40;
      doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(0); doc.text('Product-wise Sales', 40, sy); sy += 5;
      autoTable(doc, { startY: sy, margin: mg, theme: 'striped', headStyles: hdr, bodyStyles: { fontSize: 7 }, columnStyles: { 0: { cellWidth: 110 } },
        head: [['Product', 'Category', 'Qty', 'Revenue', 'Orders', 'Avg Price', 'Stock']],
        body: report.productReport.slice(0, 40).map((p) => [p.name||'-', p.resolvedCategory||p.category||'-', p.totalQuantity, `₹${(p.totalRevenue||0).toLocaleString('en-IN')}`, p.totalOrders, `₹${Math.round(p.avgPrice||0).toLocaleString('en-IN')}`, p.stockRemaining??'N/A']) });
      sy = doc.lastAutoTable.finalY + 12;
    }
    if (report.customerReport?.length) {
      if (sy > 500) { doc.addPage(); sy = 40; }
      doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(0); doc.text('Customer-wise Sales', 40, sy); sy += 5;
      autoTable(doc, { startY: sy, margin: mg, theme: 'striped', headStyles: hdr, bodyStyles: { fontSize: 7 },
        head: [['Customer', 'Email', 'Phone', 'Orders', 'Total Spend', 'Avg Order', 'Last Order']],
        body: report.customerReport.slice(0, 40).map((c) => [c.name||'-', c.email||'-', c.phone||'-', c.totalOrders, `₹${(c.totalSpend||0).toLocaleString('en-IN')}`, `₹${Math.round(c.avgOrderValue||0).toLocaleString('en-IN')}`, c.lastOrderDate?new Date(c.lastOrderDate).toLocaleDateString('en-IN'):'-']) });
      sy = doc.lastAutoTable.finalY + 12;
    }
    if (report.gstByDate?.length) {
      if (sy > 500) { doc.addPage(); sy = 40; }
      doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(0); doc.text('GST Report', 40, sy); sy += 5;
      autoTable(doc, { startY: sy, margin: mg, theme: 'striped', headStyles: hdr, bodyStyles: { fontSize: 7 },
        head: [['Date', 'Orders', 'Taxable Amount', 'CGST', 'SGST', 'IGST', 'Total Tax']],
        body: report.gstByDate.map((g) => [g._id, g.orders, `₹${(g.taxableAmount||0).toLocaleString('en-IN')}`, `₹${(g.cgst||0).toFixed(2)}`, `₹${(g.sgst||0).toFixed(2)}`, `₹${(g.igst||0).toFixed(2)}`, `₹${(g.totalTax||0).toFixed(2)}`]) });
    }
    doc.save(`sales-report-${startDate}-to-${endDate}.pdf`);
  };

  // Bar chart — uses pixel heights so bars are always visible
  const BarChart = ({ data, valueKey = 'revenue', labelKey = '_id', maxBars = 14 }) => {
    if (!data || data.length === 0) return <p className="text-center text-gray-400 font-body text-sm py-4">No data</p>;
    const sliced = data.slice(0, maxBars);
    const maxVal = Math.max(...sliced.map((d) => d[valueKey] || 0), 1);
    const BAR_MAX_H = 120;
    return (
      <div className="flex items-end gap-1 h-40 w-full overflow-x-auto pb-6">
        {sliced.map((d, i) => {
          const h = Math.max(((d[valueKey] || 0) / maxVal) * BAR_MAX_H, 2);
          const rawLabel = typeof d[labelKey] === 'object'
            ? `W${d[labelKey]?.week}`
            : String(d[labelKey] || 'Uncategorized');
          const label = rawLabel.length > 15 ? `${rawLabel.slice(0,15)}…` : rawLabel;
          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-[28px]">
              <div
                className="w-full bg-[#6B1E1E]/80 rounded-t hover:bg-[#8B2E2E] transition-colors cursor-default"
                style={{ height: `${h}px` }}
                title={`${label}: ${formatINR(d[valueKey])}`}
              />
              <span className="font-body text-[9px] text-gray-400 truncate w-full text-center leading-none">{label}</span>
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
          <p className="font-body text-gray-600 mt-1">Comprehensive sales analytics &amp; insights</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleExportCSV} disabled={!report} className="flex items-center gap-2 px-4 py-2 border border-[#6B1E1E] text-[#6B1E1E] rounded-lg hover:bg-[#6B1E1E]/5 transition-colors font-body text-sm disabled:opacity-40">
            <Download size={16} />Export CSV
          </button>
          <button onClick={handleExportPDF} disabled={!report} className="flex items-center gap-2 px-4 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-body text-sm disabled:opacity-40">
            <FileText size={16} />Export PDF
          </button>
          <button onClick={fetchReport} className="flex items-center gap-2 px-4 py-2 bg-[#6B1E1E] text-white rounded-lg hover:bg-[#8B2E2E] transition-colors font-body text-sm">
            <RefreshCw size={16} />Refresh
          </button>
        </div>
      </div>

      {/* Date + Period filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESETS.map((p) => (
            <button key={p.label} onClick={() => applyPreset(p)}
              className="px-3 py-1.5 rounded-full border border-gray-200 font-body text-xs hover:border-[#6B1E1E] hover:text-[#6B1E1E] transition-colors">
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block font-body text-xs text-gray-500 mb-1">Start Date</label>
            <input type="date" value={startDate} max={endDate} onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:border-[#6B1E1E]" />
          </div>
          <div>
            <label className="block font-body text-xs text-gray-500 mb-1">End Date</label>
            <input type="date" value={endDate} min={startDate} max={new Date().toISOString().split('T')[0]} onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:border-[#6B1E1E]" />
          </div>
          <div>
            <label className="block font-body text-xs text-gray-500 mb-1">Group By</label>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {PERIODS.map((p) => (
                <button key={p.value} onClick={() => setPeriod(p.value)}
                  className={`px-3 py-2 font-body text-xs transition-colors ${period === p.value ? 'bg-[#6B1E1E] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab strip + content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 font-body text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id ? 'border-[#6B1E1E] text-[#6B1E1E] bg-[#6B1E1E]/5' : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}>
                <Icon size={15} />{tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">

          {/* ══ OVERVIEW ══ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: IndianRupee, label: 'Total Sales',    value: formatINR(ov.totalRevenue), growth: ov.revenueGrowth,   color: 'from-[#6B1E1E] to-[#8B2E2E]' },
                  { icon: TrendingUp,  label: 'Net Revenue',    value: formatINR(ov.netRevenue),   growth: null,               color: 'from-emerald-600 to-emerald-700' },
                  { icon: ShoppingBag, label: 'Total Orders',   value: ov.totalOrders || 0,        growth: ov.ordersGrowth,    color: 'from-blue-600 to-blue-700' },
                  { icon: Users,       label: 'New Customers',  value: ov.newCustomers || 0,       growth: ov.customersGrowth, color: 'from-purple-600 to-purple-700' },
                ].map((card) => (
                  <div key={card.label} className={`bg-gradient-to-br ${card.color} text-white rounded-xl p-5`}>
                    <div className="flex items-center justify-between mb-3">
                      <card.icon size={22} className="opacity-80" />
                      {card.growth != null && <div className="bg-white/20 rounded-full px-2 py-0.5"><GrowthBadge pct={card.growth} /></div>}
                    </div>
                    <p className="font-display text-2xl font-bold">{card.value}</p>
                    <p className="font-body text-xs opacity-75 mt-0.5">{card.label}</p>
                    {card.growth != null && <p className="font-body text-xs opacity-60 mt-0.5">vs. previous period</p>}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center"><IndianRupee size={18} className="text-orange-600" /></div>
                  <div><p className="font-body text-xs text-gray-500">Avg Order Value</p><p className="font-display text-xl font-bold text-gray-800">{formatINR(ov.avgOrderValue)}</p></div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center"><Tag size={18} className="text-pink-600" /></div>
                  <div><p className="font-body text-xs text-gray-500">Total Discounts</p><p className="font-display text-xl font-bold text-gray-800">{formatINR(ov.totalDiscount)}</p></div>
                </div>
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-gray-900 mb-3">Revenue Over Time</h3>
                {report?.revenueOverTime?.length > 0 ? (
                  <><BarChart data={report.revenueOverTime} valueKey="revenue" maxBars={30} />
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {report.revenueOverTime.slice(-4).map((d, i) => {
                        const lbl = typeof d._id === 'object' ? `W${d._id.week}-${d._id.year}` : d._id;
                        return (<div key={i} className="bg-gray-50 rounded-lg p-3 text-center"><p className="font-body text-xs text-gray-500 truncate">{lbl}</p><p className="font-body font-bold text-[#6B1E1E]">{formatINR(d.revenue)}</p><p className="font-body text-xs text-gray-400">{d.orders} orders</p></div>);
                      })}
                    </div>
                  </>
                ) : <p className="text-center text-gray-400 font-body text-sm py-8">No revenue data for this period</p>}
              </div>
              {(report?.dailyTrend || []).length > 0 && (
                <div>
                  <h3 className="font-display text-base font-bold text-gray-900 mb-1">7-Day Revenue Trend</h3>
                  <p className="font-body text-xs text-gray-400 mb-3">Last 7 days of the selected period</p>
                  <BarChart data={report.dailyTrend} valueKey="revenue" labelKey="_id" maxBars={7} />
                  <div className="grid grid-cols-7 gap-1 mt-2">
                    {report.dailyTrend.map((d, i) => (<div key={i} className="text-center"><p className="font-body text-[10px] font-semibold text-[#6B1E1E]">{formatINR(d.revenue)}</p><p className="font-body text-[9px] text-gray-400">{d.orders} ord.</p></div>))}
                  </div>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-display text-base font-bold text-gray-900 mb-3">Top Products by Revenue</h3>
                  <div className="space-y-3">
                    {(report?.topProducts||[]).length === 0 ? <p className="text-center text-gray-400 font-body text-sm py-4">No data</p> :
                      report.topProducts.map((p, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#6B1E1E]/10 text-[#6B1E1E] flex items-center justify-center font-body text-xs font-bold flex-shrink-0">{i+1}</div>
                          <div className="flex-1 min-w-0"><p className="font-body text-sm font-medium text-gray-800 truncate">{p.name}</p><p className="font-body text-xs text-gray-400">{p.category||'Uncategorized'} · {p.totalQuantity} units</p></div>
                          <div className="text-right flex-shrink-0"><p className="font-body text-sm font-bold text-[#6B1E1E]">{formatINR(p.totalRevenue)}</p><p className="font-body text-xs text-gray-400">{p.ordersCount} orders</p></div>
                        </div>
                      ))
                    }
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-gray-900 mb-3">Payment Methods</h3>
                  {(report?.paymentBreakdown||[]).length === 0 ? <p className="text-center text-gray-400 font-body text-sm py-4">No data</p> : (
                    <div className="space-y-3">{(() => {
                      const tot = report.paymentBreakdown.reduce((s,p)=>s+p.count,0);
                      const colors = ['bg-[#6B1E1E]','bg-blue-500','bg-purple-500','bg-green-500'];
                      return report.paymentBreakdown.map((pm,i) => {
                        const pct = tot>0?Math.round((pm.count/tot)*100):0;
                        return (<div key={i} className="flex items-center gap-3"><div className={`w-3 h-3 rounded-full flex-shrink-0 ${colors[i%colors.length]}`}/><div className="flex-1"><div className="flex items-center justify-between mb-1"><span className="font-body text-sm text-gray-700">{PAYMENT_LABELS[pm._id]||pm._id}</span><div className="flex items-center gap-2"><span className="font-body text-xs text-gray-400">{pm.count} · {pct}%</span><span className="font-body text-sm font-bold text-gray-800">{formatINR(pm.revenue)}</span></div></div><div className="w-full bg-gray-100 rounded-full h-1.5"><div className={`${colors[i%colors.length]} h-1.5 rounded-full`} style={{width:`${pct}%`}}/></div></div></div>);
                      });
                    })()}</div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-gray-900 mb-3">Order Status Breakdown</h3>
                {(report?.orderStatusBreakdown||[]).length === 0 ? <p className="text-center text-gray-400 font-body text-sm py-4">No data</p> : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {report.orderStatusBreakdown.map((s,i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div><span className={`px-2 py-0.5 rounded-full font-body text-xs font-semibold capitalize ${STATUS_COLORS[s._id]||'bg-gray-200 text-gray-600'}`}>{s._id}</span><p className="font-body text-xs text-gray-400 mt-1">{formatINR(s.revenue)}</p></div>
                        <p className="font-display text-xl font-bold text-gray-700">{s.count}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {(report?.cityBreakdown||[]).length > 0 && (
                <div>
                  <h3 className="font-display text-base font-bold text-gray-900 mb-3">Top Delivery Cities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {report.cityBreakdown.map((city,i) => (
                      <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="font-body text-sm font-semibold text-gray-800 truncate">{city._id||'Unknown'}</p>
                        <p className="font-display text-xl font-bold text-[#6B1E1E]">{city.orders}</p>
                        <p className="font-body text-xs text-gray-400">orders</p>
                        <p className="font-body text-xs text-gray-500">{formatINR(city.revenue)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ SALES BY DATE ══ */}
          {activeTab === 'sales-date' && (
            <div>
              <h3 className="font-display text-base font-bold text-gray-900 mb-4">Sales by Date Report</h3>
              {(report?.salesByDate||[]).length === 0 ? <p className="text-center text-gray-400 font-body text-sm py-10">No data for selected period</p> : (() => {
                const tot = report.salesByDate.reduce((a,r) => ({ orders:a.orders+r.orders, productsSold:a.productsSold+r.productsSold, totalSales:a.totalSales+r.totalSales, totalDiscount:a.totalDiscount+r.totalDiscount, totalTax:a.totalTax+r.totalTax, netSale:a.netSale+r.netSale }), {orders:0,productsSold:0,totalSales:0,totalDiscount:0,totalTax:0,netSale:0});
                return (<>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-5">
                    {[{l:'Total Orders',v:tot.orders,raw:true},{l:'Products Sold',v:tot.productsSold,raw:true},{l:'Total Sales',v:formatINRFull(tot.totalSales)},{l:'Discount',v:formatINRFull(tot.totalDiscount)},{l:'Tax',v:formatINRFull(tot.totalTax)},{l:'Net Sale',v:formatINRFull(tot.netSale)}].map(item=>(
                      <div key={item.l} className="bg-[#6B1E1E]/5 rounded-lg p-3 text-center"><p className="font-body text-xs text-gray-500">{item.l}</p><p className="font-display text-lg font-bold text-[#6B1E1E]">{item.v}</p></div>
                    ))}
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-gray-100">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-50 border-b border-gray-200">{['Date','Orders','Products Sold','Total Sales','Discount','Tax','Net Sale'].map(h=>(<th key={h} className="text-left font-body font-semibold text-gray-600 py-3 px-4 text-xs">{h}</th>))}</tr></thead>
                      <tbody>{report.salesByDate.map((row,i)=>(
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2.5 px-4 font-body font-medium text-gray-700">{row._id}</td>
                          <td className="py-2.5 px-4 font-body text-gray-600">{row.orders}</td>
                          <td className="py-2.5 px-4 font-body text-gray-600">{row.productsSold}</td>
                          <td className="py-2.5 px-4 font-body font-semibold text-gray-800">{formatINRFull(row.totalSales)}</td>
                          <td className="py-2.5 px-4 font-body text-red-600">-{formatINRFull(row.totalDiscount)}</td>
                          <td className="py-2.5 px-4 font-body text-gray-500">{formatINRFull(row.totalTax)}</td>
                          <td className="py-2.5 px-4 font-body font-bold text-[#6B1E1E]">{formatINRFull(row.netSale)}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </>);
              })()}
            </div>
          )}

          {/* ══ CATEGORY SALES ══ */}
          {activeTab === 'category' && (
            <div>
              <h3 className="font-display text-base font-bold text-gray-900 mb-4">Category-wise Sales Report</h3>
              {(report?.categoryRevenue||[]).length === 0 ? <p className="text-center text-gray-400 font-body text-sm py-10">No data</p> : (
                <div className="space-y-5">
                  <BarChart data={report.categoryRevenue} valueKey="revenue" labelKey="_id" maxBars={15} />
                  <div className="overflow-x-auto rounded-lg border border-gray-100">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-50 border-b border-gray-200">{['#','Category Name','Total Products','Total Orders','Qty Sold','Total Revenue','% Contribution'].map(h=>(<th key={h} className="text-left font-body font-semibold text-gray-600 py-3 px-4 text-xs">{h}</th>))}</tr></thead>
                      <tbody>{(() => {
                        const catT = report.categoryRevenue.reduce((s,c)=>s+c.revenue,0);
                        return report.categoryRevenue.map((cat,i) => {
                          const pct = catT>0?((cat.revenue/catT)*100).toFixed(1):0;
                          return (<tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-2.5 px-4 font-body text-gray-400 text-xs">{i+1}</td>
                            <td className="py-2.5 px-4 font-body font-medium text-gray-800">{cat._id||'Uncategorized'}</td>
                            <td className="py-2.5 px-4 font-body text-gray-600">{cat.totalProducts||0}</td>
                            <td className="py-2.5 px-4 font-body text-gray-600">{cat.orders}</td>
                            <td className="py-2.5 px-4 font-body text-gray-600">{cat.quantity}</td>
                            <td className="py-2.5 px-4 font-body font-bold text-[#6B1E1E]">{formatINRFull(cat.revenue)}</td>
                            <td className="py-2.5 px-4"><div className="flex items-center gap-2"><div className="w-16 bg-gray-100 rounded-full h-2 flex-shrink-0"><div className="bg-[#6B1E1E] h-2 rounded-full" style={{width:`${pct}%`}}/></div><span className="font-body text-xs font-semibold text-gray-700">{pct}%</span></div></td>
                          </tr>);
                        });
                      })()}</tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ PRODUCTS ══ */}
          {activeTab === 'products' && (
            <div>
              <h3 className="font-display text-base font-bold text-gray-900 mb-4">Product-wise Sales Report</h3>
              {(report?.productReport||[]).length === 0 ? <p className="text-center text-gray-400 font-body text-sm py-10">No product data</p> : (
                <div className="overflow-x-auto rounded-lg border border-gray-100">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 border-b border-gray-200">{['#','Product Name','SKU','Category','Qty Sold','Total Revenue','Total Orders','Avg Price','Stock'].map(h=>(<th key={h} className="text-left font-body font-semibold text-gray-600 py-3 px-3 text-xs">{h}</th>))}</tr></thead>
                    <tbody>{report.productReport.map((p,i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-body text-gray-400 text-xs">{i+1}</td>
                        <td className="py-2.5 px-3 font-body font-medium text-gray-800 max-w-[160px] truncate">{p.name||'-'}</td>
                        <td className="py-2.5 px-3 font-body text-gray-500 text-xs">{p.sku||'-'}</td>
                        <td className="py-2.5 px-3 font-body text-gray-500">{p.resolvedCategory||p.category||'Uncategorized'}</td>
                        <td className="py-2.5 px-3 font-body font-medium text-gray-700">{p.totalQuantity}</td>
                        <td className="py-2.5 px-3 font-body font-bold text-[#6B1E1E]">{formatINRFull(p.totalRevenue)}</td>
                        <td className="py-2.5 px-3 font-body text-gray-600">{p.totalOrders}</td>
                        <td className="py-2.5 px-3 font-body text-gray-600">{formatINR(Math.round(p.avgPrice||0))}</td>
                        <td className="py-2.5 px-3">{p.stockRemaining!=null?<span className={`px-2 py-0.5 rounded-full font-body text-xs font-semibold ${p.stockRemaining===0?'bg-red-100 text-red-700':p.stockRemaining<10?'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700'}`}>{p.stockRemaining}</span>:<span className="font-body text-xs text-gray-400">—</span>}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══ CUSTOMERS ══ */}
          {activeTab === 'customers' && (
            <div>
              <h3 className="font-display text-base font-bold text-gray-900 mb-4">Customer-wise Sales Report</h3>
              {(report?.customerReport||[]).length === 0 ? <p className="text-center text-gray-400 font-body text-sm py-10">No customer data</p> : (
                <div className="overflow-x-auto rounded-lg border border-gray-100">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 border-b border-gray-200">{['#','Customer Name','Email','Phone','Total Orders','Total Spend','Avg Order Value','Last Order'].map(h=>(<th key={h} className="text-left font-body font-semibold text-gray-600 py-3 px-3 text-xs">{h}</th>))}</tr></thead>
                    <tbody>{report.customerReport.map((c,i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-body text-gray-400 text-xs">{i+1}</td>
                        <td className="py-2.5 px-3 font-body font-medium text-gray-800">{c.name||'Unknown'}</td>
                        <td className="py-2.5 px-3 font-body text-gray-500 text-xs">{c.email||'-'}</td>
                        <td className="py-2.5 px-3 font-body text-gray-500 text-xs">{c.phone||'-'}</td>
                        <td className="py-2.5 px-3 font-body font-medium text-gray-700">{c.totalOrders}</td>
                        <td className="py-2.5 px-3 font-body font-bold text-[#6B1E1E]">{formatINRFull(c.totalSpend)}</td>
                        <td className="py-2.5 px-3 font-body text-gray-600">{formatINR(Math.round(c.avgOrderValue||0))}</td>
                        <td className="py-2.5 px-3 font-body text-gray-500 text-xs">{c.lastOrderDate?new Date(c.lastOrderDate).toLocaleDateString('en-IN'):'-'}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══ GST REPORT ══ */}
          {activeTab === 'gst' && (
            <div>
              <h3 className="font-display text-base font-bold text-gray-900 mb-4">GST / Tax Report</h3>
              {report?.gstSummary?.totalOrders > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
                  {[
                    {l:'Taxable Amount', v:formatINRFull(report.gstSummary.taxableAmount)},
                    {l:'CGST (2.5%)',    v:`₹${(report.gstSummary.cgst||0).toFixed(2)}`},
                    {l:'SGST (2.5%)',    v:`₹${(report.gstSummary.sgst||0).toFixed(2)}`},
                    {l:'IGST (5%)',      v:`₹${(report.gstSummary.igst||0).toFixed(2)}`},
                    {l:'Total Tax',      v:`₹${(report.gstSummary.totalTax||0).toFixed(2)}`, hi:true},
                  ].map(item=>(
                    <div key={item.l} className={`rounded-xl p-4 text-center ${item.hi?'bg-[#6B1E1E] text-white':'bg-gray-50'}`}>
                      <p className={`font-body text-xs mb-1 ${item.hi?'text-white/70':'text-gray-500'}`}>{item.l}</p>
                      <p className={`font-display text-lg font-bold ${item.hi?'text-white':'text-gray-800'}`}>{item.v}</p>
                    </div>
                  ))}
                </div>
              )}
              <p className="font-body text-xs text-gray-400 mb-3">GST Rate: 5% IGST (inter-state) or 2.5% CGST + 2.5% SGST (intra-state).</p>
              {(report?.gstByDate||[]).length === 0 ? <p className="text-center text-gray-400 font-body text-sm py-10">No GST data</p> : (
                <div className="overflow-x-auto rounded-lg border border-gray-100">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 border-b border-gray-200">{['Date','Orders','Taxable Amount','CGST (2.5%)','SGST (2.5%)','IGST (5%)','Total Tax'].map(h=>(<th key={h} className="text-left font-body font-semibold text-gray-600 py-3 px-4 text-xs">{h}</th>))}</tr></thead>
                    <tbody>{report.gstByDate.map((row,i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2.5 px-4 font-body font-medium text-gray-700">{row._id}</td>
                        <td className="py-2.5 px-4 font-body text-gray-600">{row.orders}</td>
                        <td className="py-2.5 px-4 font-body text-gray-700">{formatINRFull(row.taxableAmount)}</td>
                        <td className="py-2.5 px-4 font-body text-gray-600">₹{(row.cgst||0).toFixed(2)}</td>
                        <td className="py-2.5 px-4 font-body text-gray-600">₹{(row.sgst||0).toFixed(2)}</td>
                        <td className="py-2.5 px-4 font-body text-gray-600">₹{(row.igst||0).toFixed(2)}</td>
                        <td className="py-2.5 px-4 font-body font-bold text-[#6B1E1E]">₹{(row.totalTax||0).toFixed(2)}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SalesReport;
