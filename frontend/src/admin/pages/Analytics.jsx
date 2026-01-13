import { useEffect, useState } from 'react';
import { TrendingUp, Users, ShoppingBag, Package, IndianRupee } from 'lucide-react';
import api from '@/services/axios';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/analytics?period=${timeRange}`);
      setAnalytics(response.data.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E1E]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#6B1E1E]">Analytics</h1>
          <p className="font-body text-gray-600 mt-1">Track your business performance</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B1E1E] focus:border-transparent"
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Sales Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-display text-lg font-semibold mb-6">Sales Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="inline-flex p-3 bg-blue-100 rounded-full mb-3">
              <ShoppingBag size={24} className="text-blue-600" />
            </div>
            <p className="font-body text-sm text-gray-600">Total Orders</p>
            <p className="font-display text-2xl font-bold text-gray-900 mt-1">
              {analytics?.salesData?.totalOrders || 0}
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex p-3 bg-green-100 rounded-full mb-3">
              <IndianRupee size={24} className="text-green-600" />
            </div>
            <p className="font-body text-sm text-gray-600">Total Revenue</p>
            <p className="font-display text-2xl font-bold text-gray-900 mt-1">
              ₹{analytics?.salesData?.totalRevenue?.toLocaleString('en-IN') || 0}
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex p-3 bg-purple-100 rounded-full mb-3">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
            <p className="font-body text-sm text-gray-600">Average Order Value</p>
            <p className="font-display text-2xl font-bold text-gray-900 mt-1">
              ₹{analytics?.salesData?.averageOrderValue?.toLocaleString('en-IN') || 0}
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex p-3 bg-yellow-100 rounded-full mb-3">
              <Package size={24} className="text-yellow-600" />
            </div>
            <p className="font-body text-sm text-gray-600">Conversion Rate</p>
            <p className="font-display text-2xl font-bold text-gray-900 mt-1">
              {analytics?.salesData?.conversionRate || 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Daily Sales Trend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-display text-lg font-semibold mb-6">Daily Sales Trend</h3>
        <div className="space-y-4">
          {analytics?.salesData?.dailySales?.map((day) => (
            <div key={day.date} className="flex items-center gap-4">
              <div className="w-24 font-body text-sm text-gray-600">
                {new Date(day.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#6B1E1E] h-2 rounded-full"
                      style={{
                        width: `${(day.revenue / Math.max(...(analytics?.salesData?.dailySales?.map(d => d.revenue) || [1])) * 100)}%`
                      }}
                    ></div>
                  </div>
                  <span className="font-body text-sm font-medium text-gray-900 w-32 text-right">
                    ₹{day.revenue?.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="font-body text-xs text-gray-600 mt-1">
                  {day.orders} orders
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-display text-lg font-semibold mb-6">User Growth</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users size={24} className="text-blue-600" />
                <div>
                  <p className="font-body text-sm text-gray-600">New Users</p>
                  <p className="font-display text-xl font-bold text-gray-900">
                    {analytics?.userGrowth?.newUsers || 0}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-body text-sm text-green-600 font-semibold">
                  +{analytics?.userGrowth?.growthRate || 0}%
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="font-body text-xs text-gray-600">Active Users</p>
                <p className="font-display text-lg font-bold text-gray-900 mt-1">
                  {analytics?.userGrowth?.activeUsers || 0}
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="font-body text-xs text-gray-600">Total Users</p>
                <p className="font-display text-lg font-bold text-gray-900 mt-1">
                  {analytics?.userGrowth?.totalUsers || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-display text-lg font-semibold mb-6">Top Performing Products</h3>
          <div className="space-y-4">
            {analytics?.productPerformance?.topProducts?.map((product, index) => (
              <div key={product._id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#6B1E1E] text-white flex items-center justify-center font-body text-sm font-semibold">
                  {index + 1}
                </div>
                <img
                  src={product.images?.[0] || 'https://placehold.co/40x40'}
                  alt={product.name}
                  className="w-10 h-10 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-body text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="font-body text-xs text-gray-600">{product.soldCount} sold</p>
                </div>
                <p className="font-body text-sm font-semibold text-[#6B1E1E]">
                  ₹{(product.revenue || 0).toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-display text-lg font-semibold mb-6">Category Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {analytics?.productPerformance?.categoryStats?.map((category) => (
            <div key={category._id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <p className="font-body text-sm text-gray-600 capitalize">{category._id}</p>
              <p className="font-display text-2xl font-bold text-gray-900 mt-1">
                {category.count}
              </p>
              <p className="font-body text-xs text-gray-600 mt-1">
                ₹{(category.revenue || 0).toLocaleString('en-IN')} revenue
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
