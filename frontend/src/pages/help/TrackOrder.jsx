import { useState, useEffect } from 'react';
import { Search, Package, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleTrack = (e) => {
    e.preventDefault();
    // Mock tracking result
    setTrackingResult({
      orderNumber,
      status: 'In Transit',
      date: '15 Jan 2026',
      estimatedDelivery: '18 Jan 2026',
      timeline: [
        { status: 'Order Placed', date: '15 Jan 2026, 10:30 AM', completed: true },
        { status: 'Order Confirmed', date: '15 Jan 2026, 11:00 AM', completed: true },
        { status: 'Shipped', date: '16 Jan 2026, 09:00 AM', completed: true },
        { status: 'Out for Delivery', date: 'Expected 18 Jan 2026', completed: false },
        { status: 'Delivered', date: 'Pending', completed: false },
      ],
    });
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
              <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-sm font-body text-sm hover:bg-primary/90 transition-all">
                <Search className="inline mr-2" size={18} />
                Track Order
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
                <span className="px-4 py-2 bg-blue-100 text-blue-600 rounded-sm font-body text-sm font-semibold">
                  {trackingResult.status}
                </span>
              </div>

              <div className="mb-8">
                <p className="font-body text-sm text-muted-foreground mb-2">Estimated Delivery</p>
                <p className="font-body text-lg font-semibold text-foreground">{trackingResult.estimatedDelivery}</p>
              </div>

              <div className="space-y-4">
                {trackingResult.timeline.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
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

export default TrackOrder;
