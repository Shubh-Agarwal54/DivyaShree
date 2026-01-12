import { useEffect } from 'react';
import { Truck, MapPin, Clock, Package } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ShippingInfo = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4">Shipping Information</h1>
            <p className="font-body text-muted-foreground">Fast and reliable delivery across India</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-card p-6 rounded-lg border border-border">
              <Truck className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-display text-lg mb-2">Free Shipping</h3>
              <p className="font-body text-sm text-muted-foreground">On orders above ₹2,999</p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
              <Clock className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-display text-lg mb-2">Fast Delivery</h3>
              <p className="font-body text-sm text-muted-foreground">3-7 business days</p>
            </div>
          </div>

          <div className="bg-card p-6 md:p-8 rounded-lg shadow-card border border-border space-y-8">
            <div>
              <h2 className="font-display text-2xl text-foreground mb-4">Delivery Timeline</h2>
              <table className="w-full font-body">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-foreground">Location</th>
                    <th className="text-left py-3 text-foreground">Delivery Time</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <td className="py-3">Metro Cities</td>
                    <td className="py-3">3-5 business days</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3">Tier 2 Cities</td>
                    <td className="py-3">4-6 business days</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3">Other Cities</td>
                    <td className="py-3">5-7 business days</td>
                  </tr>
                  <tr>
                    <td className="py-3">Remote Areas</td>
                    <td className="py-3">7-10 business days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h2 className="font-display text-2xl text-foreground mb-4">Shipping Charges</h2>
              <div className="space-y-3 font-body text-muted-foreground">
                <p>• <strong>FREE</strong> shipping on orders above ₹2,999</p>
                <p>• ₹99 flat shipping fee on orders below ₹2,999</p>
                <p>• COD available with ₹50 additional charge</p>
                <p>• Express delivery available in select cities (₹200 extra)</p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl text-foreground mb-4">International Shipping</h2>
              <p className="font-body text-muted-foreground">
                Currently, we only ship within India. International shipping will be available soon. 
                Subscribe to our newsletter to get notified when we start shipping globally.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShippingInfo;
