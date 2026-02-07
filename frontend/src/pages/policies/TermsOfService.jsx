import { useEffect } from 'react';
import { FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TermsOfService = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8 text-center">
            <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4">Terms of Service</h1>
            <p className="font-body text-sm text-muted-foreground">Last updated: January 2026</p>
          </div>

          <div className="bg-card p-6 md:p-8 rounded-lg shadow-card border border-border space-y-8 font-body text-muted-foreground">
            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Agreement to Terms</h2>
              <p className="leading-relaxed">
                By accessing or using Shree Divya's website and services, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Use of Website</h2>
              <p className="leading-relaxed mb-3">You agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Not use the website for illegal or unauthorized purposes</li>
                <li>Not interfere with the proper working of the website</li>
                <li>Not attempt to access unauthorized areas</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Orders and Payments</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All orders are subject to acceptance and availability</li>
                <li>We reserve the right to refuse or cancel any order</li>
                <li>Prices are subject to change without notice</li>
                <li>Payment must be received before order processing</li>
                <li>We accept major credit/debit cards, UPI, and COD</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Product Information</h2>
              <p className="leading-relaxed">
                We strive to display product colors and details accurately. However, actual colors may vary due to 
                monitor settings and photography. Product descriptions are for general information and may not be 
                entirely accurate.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Intellectual Property</h2>
              <p className="leading-relaxed">
                All content on this website, including text, graphics, logos, images, and software, is the property 
                of Shree Divya and protected by copyright and trademark laws. Unauthorized use is prohibited.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Limitation of Liability</h2>
              <p className="leading-relaxed">
                Shree Divya shall not be liable for any indirect, incidental, special, or consequential damages arising 
                from your use of our website or products. Our total liability is limited to the amount you paid for the product.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Governing Law</h2>
              <p className="leading-relaxed">
                These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction 
                of courts in Agra, Uttar Pradesh.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Changes to Terms</h2>
              <p className="leading-relaxed">
                We reserve the right to modify these terms at any time. Continued use of the website after changes 
                constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Contact Information</h2>
              <p className="leading-relaxed">
                For questions about these Terms of Service, contact us at:<br />
                Email: legal@divyashree.com<br />
                Phone: +91 98765 43210
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
