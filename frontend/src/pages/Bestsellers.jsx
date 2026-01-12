import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';
import { getBestsellerProducts } from '@/data/products';
import { ChevronRight, TrendingUp, Award, Star } from 'lucide-react';
import { useFadeUpScroll, useStaggerScroll } from '@/hooks/useScrollAnimations';

export default function Bestsellers() {
  const [products, setProducts] = useState([]);
  const titleRef = useFadeUpScroll({ duration: 0.8 });
  const gridRef = useStaggerScroll({ stagger: 0.1, yOffset: 40 });

  useEffect(() => {
    window.scrollTo(0, 0);
    setProducts(getBestsellerProducts());
  }, []);

  const totalSold = products.reduce((sum, product) => sum + product.soldCount, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gold via-gold/95 to-gold/90 text-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-body mb-6 text-foreground/70">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-foreground">Bestsellers</span>
          </div>

          <div ref={titleRef} className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award size={40} />
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl">
                BESTSELLERS
              </h1>
            </div>
            <p className="font-body text-xl md:text-2xl mb-4">
              Our Most Loved Collections
            </p>
            <p className="font-body text-lg text-foreground/80 max-w-2xl mx-auto">
              Discover what our customers can't stop talking about. These top-rated pieces are flying off the shelves!
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <main className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Bestseller Stats */}
          <div ref={gridRef} className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card p-6 rounded-lg border border-border text-center">
              <TrendingUp size={32} className="mx-auto text-gold mb-3" />
              <h3 className="font-display text-3xl text-primary mb-2">{products.length}+</h3>
              <p className="font-body text-sm text-muted-foreground">Bestselling Products</p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border text-center">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-display text-3xl text-primary mb-2">{totalSold.toLocaleString()}</h3>
              <p className="font-body text-sm text-muted-foreground">Happy Customers</p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border text-center">
              <Star size={32} className="mx-auto text-gold fill-gold mb-3" />
              <h3 className="font-display text-3xl text-primary mb-2">4.8+</h3>
              <p className="font-body text-sm text-muted-foreground">Average Rating</p>
            </div>
          </div>

          {/* Products */}
          {products.length > 0 ? (
            <>
              <div className="mb-8">
                <h2 className="font-display text-3xl text-foreground text-center mb-2">
                  Customer Favorites
                </h2>
                <p className="font-body text-muted-foreground text-center">
                  {products.length} bestselling products • Sorted by popularity
                </p>
              </div>
              <ProductGrid products={products} />
            </>
          ) : (
            <div className="text-center py-16">
              <Award size={64} className="mx-auto text-muted-foreground mb-4" />
              <p className="font-body text-xl text-muted-foreground mb-4">
                No bestsellers available right now
              </p>
              <Link
                to="/shop/sarees"
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-sm font-body hover:bg-primary/90 transition-colors"
              >
                Browse All Products
              </Link>
            </div>
          )}

          {/* Why Bestsellers Banner */}
          <div className="mt-16 bg-cream-dark p-8 md:p-12 rounded-lg">
            <h3 className="font-display text-2xl md:text-4xl text-center text-foreground mb-8">
              Why Our Customers Love These
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award size={32} className="text-primary" />
                </div>
                <h4 className="font-display text-lg mb-2">Premium Quality</h4>
                <p className="font-body text-sm text-muted-foreground">
                  Only the finest fabrics and craftsmanship
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp size={32} className="text-primary" />
                </div>
                <h4 className="font-display text-lg mb-2">Trending Designs</h4>
                <p className="font-body text-sm text-muted-foreground">
                  Fashion-forward styles loved by thousands
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star size={32} className="text-primary fill-primary" />
                </div>
                <h4 className="font-display text-lg mb-2">Top Rated</h4>
                <p className="font-body text-sm text-muted-foreground">
                  Consistently high customer ratings
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
