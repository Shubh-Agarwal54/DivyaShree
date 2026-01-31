import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for contacting us! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4">Contact Us</h1>
            <p className="font-body text-muted-foreground">We'd love to hear from you. Get in touch with us!</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card p-6 rounded-lg border border-border">
                <Phone className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-display text-lg mb-2">Phone</h3>
                <p className="font-body text-muted-foreground">+91  8979893427</p>
                <p className="font-body text-sm text-muted-foreground mt-1">Mon-Sat, 10 AM - 7 PM</p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <Mail className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-display text-lg mb-2">Email</h3>
                <p className="font-body text-muted-foreground">divyashreefashion2025@gmail.com</p>
                <p className="font-body text-sm text-muted-foreground mt-1">We reply within 24 hours</p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <MapPin className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-display text-lg mb-2">Visit Us</h3>
                <p className="font-body text-muted-foreground">Sanjay Place Agra, Uttar Pradesh 282002</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-card p-6 md:p-8 rounded-lg shadow-card border border-border">
                <h2 className="font-display text-2xl text-foreground mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-body text-sm font-medium text-foreground mb-2">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-primary"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block font-body text-sm font-medium text-foreground mb-2">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-primary"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-body text-sm font-medium text-foreground mb-2">Subject *</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-primary"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label className="block font-body text-sm font-medium text-foreground mb-2">Message *</label>
                    <textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-primary"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-sm font-body text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                    <Send size={18} />
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactUs;
