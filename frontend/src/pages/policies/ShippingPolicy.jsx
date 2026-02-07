import { useEffect } from 'react';
import { Truck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ShippingPolicy = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8 text-center">
            <Truck className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4">Shipping Policy</h1>
            <p className="font-body text-sm text-muted-foreground">Last updated: January 2026</p>
          </div>

          <div className="bg-card p-6 md:p-8 rounded-lg shadow-card border border-border space-y-8 font-body text-muted-foreground">
            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Shipping Coverage</h2>
              <p className="leading-relaxed">
                We ship to all locations within India. Currently, we do not offer international shipping, 
                but we're working on expanding our services globally soon.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Shipping Charges</h2>
              <div className="bg-muted p-4 rounded-sm mb-4">
                <p className="font-semibold text-foreground mb-2">Free Shipping</p>
                <p>Orders above ₹2,999 qualify for FREE standard shipping across India</p>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-foreground">Order Value</th>
                    <th className="text-left py-3 text-foreground">Shipping Charge</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-3">Above ₹2,999</td>
                    <td className="py-3 text-green-600 font-semibold">FREE</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3">Below ₹2,999</td>
                    <td className="py-3">₹99</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3">COD Orders</td>
                    <td className="py-3">Standard charge + ₹50</td>
                  </tr>
                  <tr>
                    <td className="py-3">Express Delivery (Select cities)</td>
                    <td className="py-3">Additional ₹200</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Delivery Timeline</h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-foreground">Location Type</th>
                    <th className="text-left py-3 text-foreground">Delivery Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-3">Metro Cities (Delhi, Mumbai, Bangalore, etc.)</td>
                    <td className="py-3">3-5 business days</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3">Tier 2 Cities</td>
                    <td className="py-3">4-6 business days</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3">Other Cities and Towns</td>
                    <td className="py-3">5-7 business days</td>
                  </tr>
                  <tr>
                    <td className="py-3">Remote Areas</td>
                    <td className="py-3">7-10 business days</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-4 text-sm">
                *Business days exclude Sundays and public holidays. Delivery times are estimates and may vary during 
                festive seasons or due to unforeseen circumstances.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Order Processing</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Orders are processed within 1-2 business days</li>
                <li>Orders placed on weekends/holidays are processed the next business day</li>
                <li>You will receive a shipping confirmation email with tracking details</li>
                <li>Custom or made-to-order items may take 7-10 additional days</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Order Tracking</h2>
              <p className="leading-relaxed mb-3">Track your order in three ways:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Click the tracking link in your shipping confirmation email</li>
                <li>Log into your account and view order status in "My Orders"</li>
                <li>Visit our "Track Order" page and enter your order number</li>
              </ol>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Shipping Partners</h2>
              <p className="leading-relaxed">
                We partner with reliable courier services including Blue Dart, DTDC, Delhivery, and India Post to ensure 
                safe and timely delivery of your orders.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Delivery Attempts</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Our courier partner will make up to 3 delivery attempts</li>
                <li>Please ensure someone is available to receive the package</li>
                <li>If delivery fails after 3 attempts, the order will be returned</li>
                <li>Return shipping charges may apply for re-shipment</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Address Changes</h2>
              <p className="leading-relaxed">
                Address changes can only be made before the order is shipped. Once shipped, please contact our courier 
                partner directly using the tracking details. Additional charges may apply for address modifications.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Damaged or Lost Shipments</h2>
              <p className="leading-relaxed">
                If your package arrives damaged or is lost in transit, please contact us within 48 hours with photos 
                and order details. We will arrange a replacement or full refund immediately.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Contact for Shipping Queries</h2>
              <p className="leading-relaxed">
                For shipping-related questions, contact us at:<br />
                Email: divyashreefashion2025@gmail.com<br />
                Phone: +91 89798 93427<br />
                WhatsApp: +91 89798 93427
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShippingPolicy;
