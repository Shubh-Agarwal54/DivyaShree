import { useEffect } from 'react';
import { MapPin, Clock, Phone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Stores = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const stores = [
    {
      city: 'Agra (Flagship Store)',
      address: '123 Sanjay Place, Near Taj Mahal, Agra, Uttar Pradesh 282003',
      phone: '+91 98765 43210',
      hours: 'Mon-Sun: 10:00 AM - 8:00 PM',
      mapLink: '#',
    },
    {
      city: 'Delhi',
      address: '456 Connaught Place, Central Delhi, New Delhi 110001',
      phone: '+91 98765 43211',
      hours: 'Mon-Sun: 10:00 AM - 9:00 PM',
      mapLink: '#',
    },
    {
      city: 'Mumbai',
      address: '789 Linking Road, Bandra West, Mumbai, Maharashtra 400050',
      phone: '+91 98765 43212',
      hours: 'Mon-Sun: 10:00 AM - 9:00 PM',
      mapLink: '#',
    },
    {
      city: 'Bangalore',
      address: '321 MG Road, Koramangala, Bangalore, Karnataka 560034',
      phone: '+91 98765 43213',
      hours: 'Mon-Sun: 10:00 AM - 8:30 PM',
      mapLink: '#',
    },
    {
      city: 'Jaipur',
      address: '654 MI Road, C-Scheme, Jaipur, Rajasthan 302001',
      phone: '+91 98765 43214',
      hours: 'Mon-Sun: 10:00 AM - 8:00 PM',
      mapLink: '#',
    },
    {
      city: 'Kolkata',
      address: '987 Park Street, Central Kolkata, Kolkata, West Bengal 700016',
      phone: '+91 98765 43215',
      hours: 'Mon-Sun: 10:00 AM - 8:30 PM',
      mapLink: '#',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="mb-12 text-center">
            <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4">Visit Our Stores</h1>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              Experience the elegance of our collections in person. Our friendly staff is ready to help you find your perfect outfit.
            </p>
          </div>

          {/* Stores Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {stores.map((store, index) => (
              <div key={index} className="bg-card p-6 md:p-8 rounded-lg shadow-card border border-border hover:shadow-hover transition-all">
                <h2 className="font-display text-2xl text-primary mb-6">{store.city}</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-body text-sm font-medium text-foreground mb-1">Address</p>
                      <p className="font-body text-sm text-muted-foreground">{store.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-body text-sm font-medium text-foreground mb-1">Phone</p>
                      <p className="font-body text-sm text-muted-foreground">{store.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-body text-sm font-medium text-foreground mb-1">Store Hours</p>
                      <p className="font-body text-sm text-muted-foreground">{store.hours}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border flex gap-3">
                  <a
                    href={store.mapLink}
                    className="flex-1 text-center px-4 py-2 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all rounded-sm font-body text-sm"
                  >
                    Get Directions
                  </a>
                  <a
                    href={`tel:${store.phone}`}
                    className="flex-1 text-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-sm font-body text-sm"
                  >
                    Call Store
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-12 bg-primary/10 p-8 md:p-12 rounded-lg border border-primary/20 text-center">
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4">Can't Visit a Store?</h2>
            <p className="font-body text-muted-foreground mb-6 max-w-2xl mx-auto">
              Shop our complete collection online with free shipping, easy returns, and virtual styling assistance.
            </p>
            <a
              href="/"
              className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-sm font-body text-sm hover:bg-primary/90 transition-all"
            >
              Shop Online
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Stores;
