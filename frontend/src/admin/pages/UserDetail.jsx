import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, ShoppingBag, Calendar, Shield, Ban, CheckCircle, Edit2 } from 'lucide-react';
import api from '@/services/axios';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const [userResponse, ordersResponse] = await Promise.all([
        api.get(`/admin/users/${id}`),
        api.get(`/admin/users/${id}/orders`)
      ]);
      setUser(userResponse.data.data);
      // Backend returns { data: { orders: [], pagination: {} } }
      const ordersData = ordersResponse.data.data?.orders || ordersResponse.data.data;
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async () => {
    if (window.confirm(`Are you sure you want to ${user.isBlocked ? 'unblock' : 'block'} this user?`)) {
      try {
        await api.patch(`/admin/users/${id}/block`);
        fetchUserDetails();
      } catch (err) {
        alert('Failed to update user status');
      }
    }
  };

  const handleVerifyUser = async () => {
    if (window.confirm('Are you sure you want to verify this user?')) {
      try {
        await api.patch(`/admin/users/${id}/verify`);
        fetchUserDetails();
      } catch (err) {
        alert('Failed to verify user');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E1E]"></div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-12">User not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="font-display text-3xl font-bold text-[#6B1E1E]">
              {user.firstName} {user.lastName}
            </h1>
            <p className="font-body text-gray-600 mt-1">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!user.isVerified && (
            <button
              onClick={handleVerifyUser}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <CheckCircle size={18} />
              Verify User
            </button>
          )}
          <button
            onClick={handleBlockUser}
            className={`px-4 py-2 ${user.isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg flex items-center gap-2`}
          >
            <Ban size={18} />
            {user.isBlocked ? 'Unblock User' : 'Block User'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-body font-medium border-b-2 ${
              activeTab === 'profile'
                ? 'border-[#6B1E1E] text-[#6B1E1E]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 font-body font-medium border-b-2 ${
              activeTab === 'orders'
                ? 'border-[#6B1E1E] text-[#6B1E1E]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-display text-lg font-semibold mb-4">User Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-gray-400" />
                  <div>
                    <p className="font-body text-xs text-gray-600">Email</p>
                    <p className="font-body text-sm text-gray-900">{user.email}</p>
                  </div>
                </div>
                {user.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone size={20} className="text-gray-400" />
                    <div>
                      <p className="font-body text-xs text-gray-600">Phone</p>
                      <p className="font-body text-sm text-gray-900">{user.phoneNumber}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-gray-400" />
                  <div>
                    <p className="font-body text-xs text-gray-600">Role</p>
                    <p className="font-body text-sm text-gray-900 capitalize">{user.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-gray-400" />
                  <div>
                    <p className="font-body text-xs text-gray-600">Joined</p>
                    <p className="font-body text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-body text-sm font-semibold mb-3">Status</h4>
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    user.isVerified ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.isVerified ? 'Verified' : 'Not Verified'}
                  </span>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    Email {user.emailVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Statistics</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-body text-xs text-gray-600">Total Orders</p>
                  <p className="font-body text-2xl font-bold text-gray-900">{Array.isArray(orders) ? orders.length : 0}</p>
                </div>
                <div>
                  <p className="font-body text-xs text-gray-600">Total Spent</p>
                  <p className="font-body text-2xl font-bold text-gray-900">
                    ₹{Array.isArray(orders) ? orders.reduce((sum, order) => sum + (order.total || 0), 0).toLocaleString('en-IN') : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Addresses</h3>
              {user.addresses && user.addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.addresses.map((address, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin size={18} className="text-gray-400" />
                          <p className="font-body text-sm font-semibold text-gray-900">{address.label}</p>
                        </div>
                        {address.isDefault && (
                          <span className="px-2 py-1 bg-[#6B1E1E] text-white text-xs rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="font-body text-sm text-gray-600 space-y-1 ml-6">
                        <p>{address.street}</p>
                        <p>{address.city}, {address.state} {address.pincode}</p>
                        <p>{address.country}</p>
                        {address.phone && <p>Phone: {address.phone}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-body text-gray-600">No addresses added</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {Array.isArray(orders) && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="font-body text-left text-sm font-semibold text-gray-700 px-6 py-3">Order #</th>
                    <th className="font-body text-left text-sm font-semibold text-gray-700 px-6 py-3">Date</th>
                    <th className="font-body text-left text-sm font-semibold text-gray-700 px-6 py-3">Items</th>
                    <th className="font-body text-left text-sm font-semibold text-gray-700 px-6 py-3">Amount</th>
                    <th className="font-body text-left text-sm font-semibold text-gray-700 px-6 py-3">Status</th>
                    <th className="font-body text-left text-sm font-semibold text-gray-700 px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-body text-sm font-medium text-gray-900">{order.orderNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-body text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-body text-sm text-gray-900">{order.items?.length || 0} items</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-body text-sm font-medium text-gray-900">
                          ₹{order.total?.toLocaleString('en-IN')}
                        </p>
                      </td>
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/admin/orders/${order._id}`)}
                          className="font-body text-sm text-[#6B1E1E] hover:underline"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="font-body text-gray-600">No orders yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDetail;
