import { useEffect } from 'react';
import { Package, Clock, RefreshCw, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ReturnsExchanges = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4">Returns & Exchanges</h1>
            <p className="font-body text-muted-foreground">We want you to love your purchase. Learn about our easy returns policy.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card p-6 rounded-lg border border-border text-center">
              <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-display text-lg mb-2">1 Days Return</h3>
              <p className="font-body text-sm text-muted-foreground">Return within 1 day of delivery</p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border text-center">
              <RefreshCw className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-display text-lg mb-2">Easy Exchange</h3>
              <p className="font-body text-sm text-muted-foreground">Size or color not right? Exchange easily</p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border text-center">
              <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-display text-lg mb-2">Quality Check</h3>
              <p className="font-body text-sm text-muted-foreground">Every return is carefully inspected</p>
            </div>
          </div>

          <div className="bg-card p-6 md:p-8 rounded-lg shadow-card border border-border space-y-8">
            <div>
              <h2 className="font-display text-2xl text-foreground mb-4">Return Policy</h2>
              <div className="space-y-4 font-body text-muted-foreground">
                <p>• Products can be returned within 1 day of delivery</p>
                <p>• Items must be unused, unwashed, and in original condition with all tags attached</p>
                <p>• Custom or personalized items cannot be returned</p>
                <p>• Sale items are eligible for exchange only, not returns</p>
                <p>• Refunds will be processed within 7-10 business days after quality check</p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl text-foreground mb-4">How to Return</h2>
              <ol className="space-y-3 font-body text-muted-foreground list-decimal list-inside">
                <li>Log into your account and go to "My Orders"</li>
                <li>Select the item you want to return</li>
                <li>Choose return reason and submit request</li>
                <li>Pack the item securely with invoice</li>
                <li>Our courier partner will pick up from your address</li>
              </ol>
            </div>

            <div>
              <h2 className="font-display text-2xl text-foreground mb-4">Exchange Process</h2>
              <p className="font-body text-muted-foreground mb-4">
                If you need a different size or color, exchanges are processed faster than returns:
              </p>
              <ol className="space-y-3 font-body text-muted-foreground list-decimal list-inside">
                <li>Request exchange through your account</li>
                <li>New item will be shipped immediately</li>
                <li>Original item pickup will be scheduled</li>
                <li>No additional charges for first exchange</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReturnsExchanges;
