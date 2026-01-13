import { useEffect, useState } from 'react';
import { Users, ShoppingBag, Package, IndianRupee, TrendingUp, AlertCircle } from 'lucide-react';
import api from '@/services/axios';

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="font-body text-sm text-gray-600">{label}</p>
        <p className="font-display text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp size={16} className="text-green-600" />
            <span className="font-body text-sm text-green-600">{trend}</span>
          </div>
        )}
      </div>
      <div className={`p-4 rounded-full ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setDashboard(response.data.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
        <AlertCircle size={20} />
        <span className="font-body">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-[#6B1E1E]">Dashboard</h1>
        <p className="font-body text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Users"
          value={dashboard?.overview.totalUsers || 0}
          trend={`${dashboard?.overview.newUsers || 0} new this month`}
          color="bg-blue-600"
        />
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={dashboard?.overview.totalOrders || 0}
          trend={`${dashboard?.overview.pendingOrders || 0} pending`}
          color="bg-green-600"
        />
        <StatCard
          icon={Package}
          label="Total Products"
          value={dashboard?.overview.totalProducts || 0}
          trend={`${dashboard?.overview.outOfStockProducts || 0} out of stock`}
          color="bg-purple-600"
        />
        <StatCard
          icon={IndianRupee}
          label="Total Revenue"
          value={`₹${dashboard?.overview.totalRevenue?.toLocaleString('en-IN') || 0}`}
          trend="All time"
          color="bg-[#6B1E1E]"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-display text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
          <div className="space-y-3">
            {dashboard?.orderStatusStats?.map((stat) => (
              <div key={stat._id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    stat._id === 'delivered' ? 'bg-green-500' :
                    stat._id === 'shipped' ? 'bg-blue-500' :
                    stat._id === 'processing' ? 'bg-yellow-500' :
                    stat._id === 'cancelled' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`}></div>
                  <span className="font-body text-sm text-gray-700 capitalize">{stat._id}</span>
                </div>
                <span className="font-body text-sm font-semibold text-gray-900">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-display text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {dashboard?.topProducts?.map((product) => (
              <div key={product._id} className="flex items-center gap-3">
                <img
                  src={product.images?.[0] || 'https://placehold.co/48x48'}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-body text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="font-body text-xs text-gray-600">{product.soldCount} sold</p>
                </div>
                <p className="font-body text-sm font-semibold text-[#6B1E1E]">
                  ₹{product.price?.toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-display text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="font-body text-left text-sm font-semibold text-gray-700 pb-3">Order #</th>
                <th className="font-body text-left text-sm font-semibold text-gray-700 pb-3">Customer</th>
                <th className="font-body text-left text-sm font-semibold text-gray-700 pb-3">Amount</th>
                <th className="font-body text-left text-sm font-semibold text-gray-700 pb-3">Status</th>
                <th className="font-body text-left text-sm font-semibold text-gray-700 pb-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {dashboard?.recentOrders?.map((order) => (
                <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="font-body text-sm text-gray-900 py-3">{order.orderNumber}</td>
                  <td className="font-body text-sm text-gray-900 py-3">
                    {order.userId?.firstName} {order.userId?.lastName}
                  </td>
                  <td className="font-body text-sm text-gray-900 py-3">
                    ₹{order.total?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="font-body text-sm text-gray-600 py-3">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
