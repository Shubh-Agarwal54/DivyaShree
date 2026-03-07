import { useState, useEffect } from 'react';
import { Search, Package, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/services/api';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const STEP_LABELS = {
  pending: 'Order Placed',
  confirmed: 'Order Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
};

const STATUS_BADGE = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-600',
  processing: 'bg-blue-100 text-blue-600',
  shipped:   'bg-purple-100 text-purple-600',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

const RE_BADGE = {
  requested: 'bg-orange-100 text-orange-600',
  approved:  'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-600',
  completed: 'bg-gray-100 text-gray-600',
};

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function buildTimeline(order) {
  const statusIndex = STATUS_STEPS.indexOf(order.status);
  if (order.status === 'cancelled') {
    return [
      { status: 'Order Placed', date: formatDate(order.createdAt), completed: true },
      { status: 'Order Cancelled', date: formatDate(order.cancellation?.cancelledAt || order.updatedAt), completed: true, cancelled: true },
    ];
  }
  return STATUS_STEPS.map((step, i) => ({
    status: STEP_LABELS[step],
    date: i === 0
      ? formatDate(order.createdAt)
      : i < statusIndex
        ? 'Completed'
        : i === statusIndex
          ? step === 'delivered' ? formatDate(order.deliveredAt) : 'In progress'
          : 'Pending',
    completed: i <= statusIndex,
  }));
}

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleTrack = async (e) => {
    e.preventDefault();
    setError('');
    setTrackingResult(null);
    setLoading(true);
    try {
      const res = await api.trackOrder(orderNumber.trim(), email.trim());
      if (!res.success) {
        setError(res.message || 'Order not found. Please check your order number and email.');
        return;
      }
      const order = res.data;
      setTrackingResult({
        orderNumber: order.orderNumber,
        status: order.status,
        date: formatDate(order.createdAt),
        estimatedDelivery: order.deliveredAt
          ? formatDate(order.deliveredAt)
          : order.status === 'cancelled'
            ? 'Order Cancelled'
            : 'To be updated',
        timeline: buildTimeline(order),
        returnExchange: order.returnExchange?.status ? order.returnExchange : null,
      });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4">Track Your Order</h1>
            <p className="font-body text-muted-foreground">Enter your order details to track your shipment</p>
          </div>

          <div className="bg-card p-6 md:p-8 rounded-lg shadow-card border border-border mb-8">
            <form onSubmit={handleTrack} className="space-y-6">
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-2">Order Number</label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                  placeholder="e.g., DS2025001"
                  className="w-full px-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-primary"
                />
              </div>
              {error && (
                <p className="font-body text-sm text-red-600">{error}</p>
              )}
              <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-3 rounded-sm font-body text-sm hover:bg-primary/90 transition-all disabled:opacity-60">
                <Search className="inline mr-2" size={18} />
                {loading ? 'Tracking...' : 'Track Order'}
              </button>
            </form>
          </div>

          {trackingResult && (
            <div className="bg-card p-6 md:p-8 rounded-lg shadow-card border border-border">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                <div>
                  <h2 className="font-display text-2xl text-foreground">Order #{trackingResult.orderNumber}</h2>
                  <p className="font-body text-sm text-muted-foreground">Placed on {trackingResult.date}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-4 py-2 rounded-sm font-body text-sm font-semibold capitalize ${STATUS_BADGE[trackingResult.status] || 'bg-blue-100 text-blue-600'}`}>
                    {trackingResult.status}
                  </span>
                  {trackingResult.returnExchange && (
                    <span className={`px-3 py-1 rounded-sm font-body text-xs font-semibold capitalize ${RE_BADGE[trackingResult.returnExchange.status] || 'bg-gray-100 text-gray-600'}`}>
                      {trackingResult.returnExchange.type === 'return' ? 'Return' : 'Exchange'}: {trackingResult.returnExchange.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <p className="font-body text-sm text-muted-foreground mb-2">
                  {trackingResult.status === 'delivered' ? 'Delivered On' : 'Estimated Delivery'}
                </p>
                <p className="font-body text-lg font-semibold text-foreground">{trackingResult.estimatedDelivery}</p>
              </div>

              <div className="space-y-4">
                {trackingResult.timeline.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.cancelled ? 'bg-red-500 text-white' :
                      item.completed ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {item.completed ? '✓' : index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-body font-semibold ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {item.status}
                      </h3>
                      <p className="font-body text-sm text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

// export default TrackOrder;

//                       <p className="font-body text-sm text-muted-foreground">{item.date}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </main>
//       <Footer />
//     </div>
//   );
// };

export default TrackOrder;
