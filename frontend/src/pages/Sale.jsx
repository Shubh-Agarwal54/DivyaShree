import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';
import { getSaleProducts } from '@/data/products';
import { ChevronRight, Tag, TrendingDown } from 'lucide-react';
import { useFadeUpScroll, useStaggerScroll } from '@/hooks/useScrollAnimations';

export default function Sale() {
  const [products, setProducts] = useState([]);
  const titleRef = useFadeUpScroll({ duration: 0.8 });
  const gridRef = useStaggerScroll({ stagger: 0.1, yOffset: 40 });

  useEffect(() => {
    window.scrollTo(0, 0);
    setProducts(getSaleProducts());
  }, []);

  const maxDiscount = products.length > 0 
    ? Math.max(...products.map(p => p.salePercentage))
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-destructive via-destructive/95 to-destructive/90 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-body mb-6 text-white/80">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-white">Sale</span>
          </div>

          <div ref={titleRef} className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Tag size={40} />
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl">
                SALE
              </h1>
            </div>
            <p className="font-body text-xl md:text-2xl mb-4">
              Upto {maxDiscount}% Off on Selected Items
            </p>
            <p className="font-body text-lg text-white/90 max-w-2xl mx-auto">
              Limited time offers on our most loved collections. Shop now and save big!
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <main className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Sale Stats */}
          <div ref={gridRef} className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card p-6 rounded-lg border border-border text-center">
              <TrendingDown size={32} className="mx-auto text-destructive mb-3" />
              <h3 className="font-display text-3xl text-destructive mb-2">Upto {maxDiscount}%</h3>
              <p className="font-body text-sm text-muted-foreground">Maximum Discount</p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border text-center">
              <Tag size={32} className="mx-auto text-primary mb-3" />
              <h3 className="font-display text-3xl text-primary mb-2">{products.length}+</h3>
              <p className="font-body text-sm text-muted-foreground">Products on Sale</p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-display text-3xl text-foreground mb-2">Limited Time</h3>
              <p className="font-body text-sm text-muted-foreground">Don't Miss Out!</p>
            </div>
          </div>

          {/* Products */}
          {products.length > 0 ? (
            <>
              <div className="mb-8">
                <h2 className="font-display text-3xl text-foreground text-center mb-2">
                  Sale Collection
                </h2>
                <p className="font-body text-muted-foreground text-center">
                  {products.length} products • Discount applied at checkout
                </p>
              </div>
              <ProductGrid products={products} />
            </>
          ) : (
            <div className="text-center py-16">
              <Tag size={64} className="mx-auto text-muted-foreground mb-4" />
              <p className="font-body text-xl text-muted-foreground mb-4">
                No sale items available right now
              </p>
              <Link
                to="/shop/sarees"
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-sm font-body hover:bg-primary/90 transition-colors"
              >
                Browse All Products
              </Link>
            </div>
          )}

          {/* Sale Banner */}
          <div className="mt-16 bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground p-8 md:p-12 rounded-lg text-center">
            <h3 className="font-display text-2xl md:text-4xl mb-4">
              Sign up for exclusive deals
            </h3>
            <p className="font-body text-lg mb-6 max-w-2xl mx-auto">
              Be the first to know about new sales, special offers, and promotions
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-sm text-foreground font-body focus:outline-none focus:ring-2 focus:ring-gold"
              />
              <button className="bg-gold text-foreground px-6 py-3 rounded-sm font-body font-semibold hover:bg-gold/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
