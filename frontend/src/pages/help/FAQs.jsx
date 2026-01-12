import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const faqs = [
    { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards, UPI, net banking, and COD (Cash on Delivery) for orders below ₹50,000." },
    { q: "How long does delivery take?", a: "Delivery typically takes 3-7 business days depending on your location. Metro cities receive orders faster." },
    { q: "Do you offer international shipping?", a: "Currently, we only ship within India. International shipping will be available soon." },
    { q: "Can I cancel my order?", a: "Yes, orders can be cancelled before they are shipped. Once shipped, you can return the item as per our return policy." },
    { q: "Are the colors accurate in photos?", a: "We try our best to display accurate colors. However, actual colors may vary slightly due to screen settings." },
    { q: "Do you offer custom stitching?", a: "Yes, we offer custom stitching services. Please contact customer support for details." },
    { q: "How do I track my order?", a: "You'll receive a tracking link via email and SMS once your order is shipped. You can also track from your account." },
    { q: "What is your return policy?", a: "Items can be returned within 7 days of delivery if unused and in original condition with tags attached." },
    { q: "Do you have a physical store?", a: "Yes, we have stores in major cities. Visit our 'Stores' page for locations and timings." },
    { q: "How do I contact customer support?", a: "You can reach us via email at care@divyashree.com, call +91 98765 43210, or use the contact form." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4">Frequently Asked Questions</h1>
            <p className="font-body text-muted-foreground">Find answers to common questions about our products and services</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-card rounded-lg shadow-card border border-border overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-muted transition-all"
                >
                  <h3 className="font-body font-semibold text-foreground pr-4">{faq.q}</h3>
                  <ChevronDown size={20} className={`text-primary flex-shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-6">
                    <p className="font-body text-muted-foreground">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 bg-card p-6 md:p-8 rounded-lg shadow-card border border-border text-center">
            <h2 className="font-display text-2xl text-foreground mb-4">Still have questions?</h2>
            <p className="font-body text-muted-foreground mb-6">
              Our customer support team is here to help you with any queries.
            </p>
            <a
              href="/help/contact"
              className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-sm font-body text-sm hover:bg-primary/90 transition-all"
            >
              Contact Us
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQs;
