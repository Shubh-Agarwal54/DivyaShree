import { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const RefundPolicy = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8 text-center">
            <RotateCcw className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4">Refund Policy</h1>
            <p className="font-body text-sm text-muted-foreground">Last updated: January 2026</p>
          </div>

          <div className="bg-card p-6 md:p-8 rounded-lg shadow-card border border-border space-y-8 font-body text-muted-foreground">
            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Refund Eligibility</h2>
              <p className="leading-relaxed mb-3">Refunds are available under the following conditions:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Product returned within 7 days of delivery</li>
                <li>Item is unused, unwashed, and in original condition</li>
                <li>All original tags and packaging are intact</li>
                <li>Invoice or proof of purchase is provided</li>
                <li>Product is not on the non-returnable list</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Non-Returnable Items</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Custom-made or personalized items</li>
                <li>Intimate apparel and lingerie</li>
                <li>Items marked as "Final Sale"</li>
                <li>Products purchased during special clearance sales</li>
                <li>Items damaged due to misuse or negligence</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Refund Process</h2>
              <ol className="list-decimal list-inside space-y-3 ml-4">
                <li className="leading-relaxed">
                  <strong>Initiate Return:</strong> Log into your account and request a return for the item
                </li>
                <li className="leading-relaxed">
                  <strong>Quality Check:</strong> Our team will inspect the returned item within 2-3 business days
                </li>
                <li className="leading-relaxed">
                  <strong>Approval:</strong> Once approved, refund will be initiated to your original payment method
                </li>
                <li className="leading-relaxed">
                  <strong>Processing Time:</strong> Refunds typically reflect in 7-10 business days
                </li>
              </ol>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Refund Methods</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  <strong>Online Payments:</strong> Refunds will be credited to the original payment method 
                  (credit/debit card, UPI, net banking)
                </p>
                <p className="leading-relaxed">
                  <strong>Cash on Delivery:</strong> Refund will be processed via bank transfer. Please provide 
                  your bank details when initiating the return.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Partial Refunds</h2>
              <p className="leading-relaxed mb-3">Partial refunds may be granted in cases of:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Item with obvious signs of use or wear</li>
                <li>Missing accessories or parts</li>
                <li>Damaged original packaging</li>
                <li>Return initiated after 7 days but within 15 days</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Defective or Damaged Items</h2>
              <p className="leading-relaxed">
                If you receive a defective or damaged product, please contact us within 48 hours of delivery with 
                photos of the issue. We will arrange for immediate replacement or full refund, including shipping charges.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Cancellations</h2>
              <p className="leading-relaxed">
                Orders can be cancelled before shipping at no charge. Once shipped, standard return policy applies. 
                For prepaid orders, refund will be processed to the original payment method.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Contact for Refunds</h2>
              <p className="leading-relaxed">
                For refund-related queries, contact us at:<br />
                Email: refunds@divyashree.com<br />
                Phone: +91 98765 43210<br />
                Available: Mon-Sat, 10 AM - 7 PM
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
