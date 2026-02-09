import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, Truck, X } from 'lucide-react';
import api from '@/services/axios';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [showReturnExchangeModal, setShowReturnExchangeModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [processingAction, setProcessingAction] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/orders/${id}`);
      setOrder(response.data.data);
      setNewStatus(response.data.data.status);
    } catch (err) {
      console.error('Failed to fetch order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (newStatus === order.status) {
      alert('Please select a different status');
      return;
    }

    try {
      setUpdating(true);
      await api.patch(`/admin/orders/${id}/status`, { status: newStatus });
      await fetchOrderDetails();
      alert('Order status updated successfully');
    } catch (err) {
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await api.patch(`/admin/orders/${id}/cancel`);
        await fetchOrderDetails();
        alert('Order cancelled successfully');
      } catch (err) {
        alert('Failed to cancel order');
      }
    }
  };

  const handleProcessReturnExchange = async (action) => {
    try {
      setProcessingAction(action);
      await api.patch(`/admin/orders/${id}/return-exchange`, {
        action,
        adminNotes
      });
      await fetchOrderDetails();
      setShowReturnExchangeModal(false);
      setAdminNotes('');
      alert(`Return/Exchange request ${action} successfully`);
    } catch (err) {
      alert(`Failed to ${action} return/exchange request`);
    } finally {
      setProcessingAction(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-yellow-100 text-yellow-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E1E]"></div>
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-12">Order not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="font-display text-3xl font-bold text-[#6B1E1E]">Order #{order.orderNumber}</h1>
            <p className="font-body text-gray-600 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <button
            onClick={handleCancelOrder}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <X size={18} />
            Cancel Order
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                  <img
                    src={item.image || 'https://placehold.co/80x80'}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-body text-sm font-medium text-gray-900">{item.name}</p>
                    {item.size && (
                      <p className="font-body text-xs text-gray-600">Size: {item.size}</p>
                    )}
                    <p className="font-body text-xs text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-body text-sm font-medium text-gray-900">
                      ₹{item.price?.toLocaleString('en-IN')}
                    </p>
                    <p className="font-body text-xs text-gray-600">
                      Total: ₹{(item.price * item.quantity)?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <div className="flex justify-between font-body text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">₹{order.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-body text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">₹{order.shipping?.toLocaleString('en-IN')}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between font-body text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">-₹{order.discount?.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between font-body text-base font-semibold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-[#6B1E1E]">₹{order.total?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={20} className="text-gray-600" />
              <h3 className="font-display text-lg font-semibold">Shipping Address</h3>
            </div>
            {order.shippingAddress && (
              <div className="font-body text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
              </div>
            )}
          </div>

          {/* Tracking Info */}
          {order.trackingNumber && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck size={20} className="text-gray-600" />
                <h3 className="font-display text-lg font-semibold">Tracking Information</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="font-body text-xs text-gray-600">Tracking Number</p>
                  <p className="font-body text-sm font-medium text-gray-900">{order.trackingNumber}</p>
                </div>
                {order.carrier && (
                  <div>
                    <p className="font-body text-xs text-gray-600">Carrier</p>
                    <p className="font-body text-sm font-medium text-gray-900">{order.carrier}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Return/Exchange Request */}
          {order.returnExchange && order.returnExchange.status && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold">
                  {order.returnExchange.type === 'return' ? 'Return' : 'Exchange'} Request
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.returnExchange.status === 'approved' ? 'bg-green-100 text-green-800' :
                  order.returnExchange.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  order.returnExchange.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.returnExchange.status.charAt(0).toUpperCase() + order.returnExchange.status.slice(1)}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="font-body text-xs text-gray-600">Request Type</p>
                  <p className="font-body text-sm font-medium text-gray-900 capitalize">
                    {order.returnExchange.type}
                  </p>
                </div>
                <div>
                  <p className="font-body text-xs text-gray-600">Customer Reason</p>
                  <p className="font-body text-sm text-gray-900">{order.returnExchange.reason}</p>
                </div>
                <div>
                  <p className="font-body text-xs text-gray-600">Requested On</p>
                  <p className="font-body text-sm text-gray-900">
                    {new Date(order.returnExchange.requestedAt).toLocaleDateString()} at{' '}
                    {new Date(order.returnExchange.requestedAt).toLocaleTimeString()}
                  </p>
                </div>
                {order.returnExchange.processedAt && (
                  <div>
                    <p className="font-body text-xs text-gray-600">Processed On</p>
                    <p className="font-body text-sm text-gray-900">
                      {new Date(order.returnExchange.processedAt).toLocaleDateString()} at{' '}
                      {new Date(order.returnExchange.processedAt).toLocaleTimeString()}
                    </p>
                  </div>
                )}
                {order.returnExchange.adminNotes && (
                  <div>
                    <p className="font-body text-xs text-gray-600">Admin Notes</p>
                    <p className="font-body text-sm text-gray-900">{order.returnExchange.adminNotes}</p>
                  </div>
                )}

                {order.returnExchange.status === 'requested' && (
                  <button
                    onClick={() => setShowReturnExchangeModal(true)}
                    className="w-full mt-4 px-4 py-2 bg-[#6B1E1E] text-white rounded-lg hover:bg-[#8B2E2E] transition-colors"
                  >
                    Review Request
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Customer</h3>
            <div className="space-y-3">
              <div>
                <p className="font-body text-sm font-medium text-gray-900">
                  {order.userId?.firstName} {order.userId?.lastName}
                </p>
                <p className="font-body text-xs text-gray-600">{order.userId?.email}</p>
                {order.userId?.phoneNumber && (
                  <p className="font-body text-xs text-gray-600">{order.userId.phoneNumber}</p>
                )}
              </div>
              <button
                onClick={() => navigate(`/admin/users/${order.userId?._id}`)}
                className="w-full px-4 py-2 text-sm font-body text-[#6B1E1E] border border-[#6B1E1E] rounded-lg hover:bg-[#6B1E1E] hover:text-white transition-colors"
              >
                View Customer Profile
              </button>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={20} className="text-gray-600" />
              <h3 className="font-display text-lg font-semibold">Payment</h3>
            </div>
            <div className="space-y-2">
              <div>
                <p className="font-body text-xs text-gray-600">Payment Method</p>
                <p className="font-body text-sm font-medium text-gray-900 capitalize">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="font-body text-xs text-gray-600">Payment Status</p>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                  order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.transactionId && (
                <div>
                  <p className="font-body text-xs text-gray-600">Transaction ID</p>
                  <p className="font-body text-sm font-medium text-gray-900">{order.transactionId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package size={20} className="text-gray-600" />
              <h3 className="font-display text-lg font-semibold">Order Status</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-body text-xs text-gray-600 mb-2">Current Status</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                <div>
                  <label className="font-body text-xs text-gray-600">Update Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B1E1E] focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updating || newStatus === order.status}
                    className="w-full mt-2 px-4 py-2 bg-[#6B1E1E] text-white rounded-lg hover:bg-[#8B2E2E] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Return/Exchange Review Modal */}
      {showReturnExchangeModal && order.returnExchange && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="font-display text-2xl font-bold text-gray-900">
                Review {order.returnExchange.type === 'return' ? 'Return' : 'Exchange'} Request
              </h2>
              <button 
                onClick={() => setShowReturnExchangeModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="font-body text-sm text-gray-600 mb-1">Order Number</p>
                <p className="font-body text-base font-medium text-gray-900">#{order.orderNumber}</p>
              </div>

              <div>
                <p className="font-body text-sm text-gray-600 mb-1">Request Type</p>
                <p className="font-body text-base font-medium text-gray-900 capitalize">
                  {order.returnExchange.type}
                </p>
              </div>

              <div>
                <p className="font-body text-sm text-gray-600 mb-1">Customer Reason</p>
                <p className="font-body text-base text-gray-900">{order.returnExchange.reason}</p>
              </div>

              <div>
                <p className="font-body text-sm text-gray-600 mb-1">Requested On</p>
                <p className="font-body text-base text-gray-900">
                  {new Date(order.returnExchange.requestedAt).toLocaleDateString()} at{' '}
                  {new Date(order.returnExchange.requestedAt).toLocaleTimeString()}
                </p>
              </div>

              <div>
                <label className="block font-body text-sm font-medium text-gray-900 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-body text-sm focus:outline-none focus:border-[#6B1E1E] transition-colors resize-none"
                  rows="4"
                  placeholder="Add notes about your decision..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleProcessReturnExchange('rejected')}
                  disabled={processingAction !== null}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingAction === 'rejected' ? 'Rejecting...' : 'Reject'}
                </button>
                <button
                  onClick={() => handleProcessReturnExchange('approved')}
                  disabled={processingAction !== null}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingAction === 'approved' ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}    </div>
  );
};

export default OrderDetail;
