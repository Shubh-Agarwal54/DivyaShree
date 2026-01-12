import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';
import { getNewArrivals } from '@/data/products';
import { ChevronRight, Sparkles, Clock, Gift } from 'lucide-react';
import { useFadeUpScroll, useStaggerScroll } from '@/hooks/useScrollAnimations';

export default function NewArrivals() {
  const [products, setProducts] = useState([]);
  const titleRef = useFadeUpScroll({ duration: 0.8 });
  const gridRef = useStaggerScroll({ stagger: 0.1, yOffset: 40 });

  useEffect(() => {
    window.scrollTo(0, 0);
    // Get products added in last 60 days
    setProducts(getNewArrivals(60));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-body mb-6 text-cream-dark/80">
            <Link to="/" className="hover:text-cream transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-cream">New Arrivals</span>
          </div>

          <div ref={titleRef} className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles size={40} />
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl">
                NEW ARRIVALS
              </h1>
            </div>
            <p className="font-body text-xl md:text-2xl mb-4">
              Fresh Styles Just In
            </p>
            <p className="font-body text-lg text-cream-dark/90 max-w-2xl mx-auto">
              Be the first to explore our latest collections. New designs added every week!
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <main className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* New Arrivals Features */}
          <div ref={gridRef} className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card p-6 rounded-lg border border-border text-center">
              <Sparkles size={32} className="mx-auto text-primary mb-3" />
              <h3 className="font-display text-3xl text-primary mb-2">{products.length}+</h3>
              <p className="font-body text-sm text-muted-foreground">Fresh Designs</p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border text-center">
              <Clock size={32} className="mx-auto text-gold mb-3" />
              <h3 className="font-display text-3xl text-foreground mb-2">This Week</h3>
              <p className="font-body text-sm text-muted-foreground">Latest Additions</p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border text-center">
              <Gift size={32} className="mx-auto text-primary mb-3" />
              <h3 className="font-display text-3xl text-foreground mb-2">Exclusive</h3>
              <p className="font-body text-sm text-muted-foreground">Limited Quantities</p>
            </div>
          </div>

          {/* Products */}
          {products.length > 0 ? (
            <>
              <div className="mb-8">
                <h2 className="font-display text-3xl text-foreground text-center mb-2">
                  Latest Collection
                </h2>
                <p className="font-body text-muted-foreground text-center">
                  {products.length} new products • Added in the last 60 days
                </p>
              </div>
              <ProductGrid products={products} />
            </>
          ) : (
            <div className="text-center py-16">
              <Sparkles size={64} className="mx-auto text-muted-foreground mb-4" />
              <p className="font-body text-xl text-muted-foreground mb-4">
                No new arrivals at the moment
              </p>
              <p className="font-body text-sm text-muted-foreground mb-6">
                Check back soon for fresh designs!
              </p>
              <Link
                to="/shop/sarees"
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-sm font-body hover:bg-primary/90 transition-colors"
              >
                Browse All Products
              </Link>
            </div>
          )}

          {/* Newsletter Banner */}
          <div className="mt-16 bg-gradient-to-r from-gold via-gold/95 to-gold/90 text-foreground p-8 md:p-12 rounded-lg text-center">
            <Sparkles size={48} className="mx-auto mb-4" />
            <h3 className="font-display text-2xl md:text-4xl mb-4">
              Never Miss a New Arrival
            </h3>
            <p className="font-body text-lg mb-6 max-w-2xl mx-auto">
              Subscribe to get notified when we add new products to our collection
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-sm text-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary border border-foreground/20"
              />
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-sm font-body font-semibold hover:bg-primary/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>

          {/* Why Shop New Arrivals */}
          <div className="mt-16">
            <h3 className="font-display text-2xl md:text-3xl text-center text-foreground mb-8">
              Why Shop New Arrivals?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={32} className="text-primary" />
                </div>
                <h4 className="font-display text-lg mb-2">Latest Trends</h4>
                <p className="font-body text-sm text-muted-foreground">
                  Stay ahead with the newest fashion trends
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift size={32} className="text-primary" />
                </div>
                <h4 className="font-display text-lg mb-2">Exclusive Pieces</h4>
                <p className="font-body text-sm text-muted-foreground">
                  Limited stock on unique designs
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock size={32} className="text-primary" />
                </div>
                <h4 className="font-display text-lg mb-2">Be First</h4>
                <p className="font-body text-sm text-muted-foreground">
                  Get them before everyone else
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
