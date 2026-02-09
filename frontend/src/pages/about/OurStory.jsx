import { useEffect } from 'react';
import { Heart, Users, Award, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const OurStory = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4">
              <span className="text-gold">✦</span> Our Story <span className="text-gold">✦</span>
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
              A journey of passion, tradition, and timeless elegance
            </p>
          </div>

          {/* Story Content */}
          <div className="bg-card p-8 md:p-12 rounded-lg shadow-card border border-border mb-12">
            <div className="prose max-w-none">
              <p className="font-body text-muted-foreground text-lg leading-relaxed mb-6">
                Shree Divya began in 2025 with a simple vision: to celebrate the rich heritage of Indian ethnic wear 
                while embracing contemporary aesthetics. What started as a small boutique in Agra has grown into a 
                beloved destination for women seeking authentic, high-quality traditional attire.
              </p>
              <p className="font-body text-muted-foreground text-lg leading-relaxed mb-6">
                Our name, <span className="font-semibold text-primary">Shree Divya</span>, translates to "divine grace" – 
                a reflection of our commitment to helping every woman feel graceful, confident, and beautiful. We believe 
                that traditional Indian clothing is not just fashion; it's an art form, a cultural legacy, and a celebration 
                of femininity.
              </p>
              <p className="font-body text-muted-foreground text-lg leading-relaxed">
                Today, we curate the finest collection of sarees, lehengas, suits, and ethnic wear from skilled artisans 
                across India. Each piece in our collection tells a story – of craftsmanship, tradition, and timeless beauty.
              </p>
            </div>
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-card p-6 rounded-lg border border-border text-center">
              <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-display text-lg text-foreground mb-2">Quality First</h3>
              <p className="font-body text-sm text-muted-foreground">
                Handpicked fabrics and meticulous quality checks
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border text-center">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-display text-lg text-foreground mb-2">Artisan Support</h3>
              <p className="font-body text-sm text-muted-foreground">
                Empowering traditional craftsmen and weavers
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border text-center">
              <Award className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-display text-lg text-foreground mb-2">Authenticity</h3>
              <p className="font-body text-sm text-muted-foreground">
                Genuine ethnic wear, no compromises
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border text-center">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-display text-lg text-foreground mb-2">Customer Love</h3>
              <p className="font-body text-sm text-muted-foreground">
                50,000+ happy customers and counting
              </p>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="bg-primary/10 p-8 md:p-12 rounded-lg border border-primary/20 text-center">
            <h2 className="font-display text-2xl md:text-3xl text-primary mb-6">Our Mission</h2>
            <p className="font-body text-lg text-foreground max-w-3xl mx-auto">
              To preserve and promote the beauty of Indian ethnic wear by connecting traditional artisans 
              with modern women who appreciate timeless elegance, quality craftsmanship, and cultural heritage.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OurStory;
