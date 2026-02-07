import { useEffect } from 'react';
import { Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8 text-center">
            <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4">Privacy Policy</h1>
            <p className="font-body text-sm text-muted-foreground">Last updated: January 2026</p>
          </div>

          <div className="bg-card p-6 md:p-8 rounded-lg shadow-card border border-border space-y-8 font-body text-muted-foreground">
            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Introduction</h2>
              <p className="leading-relaxed">
                At Shree Divya, we are committed to protecting your privacy. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you visit our website or make a purchase from us.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Information We Collect</h2>
              <p className="leading-relaxed mb-3">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Name, email address, phone number, and shipping address</li>
                <li>Payment information (processed securely through payment gateways)</li>
                <li>Purchase history and preferences</li>
                <li>Communications with customer service</li>
                <li>Device information and browsing behavior</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Process and fulfill your orders</li>
                <li>Communicate about your orders and account</li>
                <li>Send promotional emails (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Prevent fraud and enhance security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Information Sharing</h2>
              <p className="leading-relaxed mb-3">We do not sell your personal information. We may share your data with:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Service providers (payment processors, shipping partners)</li>
                <li>Legal authorities when required by law</li>
                <li>Business partners with your explicit consent</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Data Security</h2>
              <p className="leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information. 
                However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Your Rights</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Cookies</h2>
              <p className="leading-relaxed">
                We use cookies and similar technologies to enhance your experience, analyze site usage, and assist in 
                marketing efforts. You can manage cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-foreground mb-4">Contact Us</h2>
              <p className="leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at:<br />
                Email: divyashreefashion2025@gmail.com<br />
                Phone: +91 89798 93427
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
