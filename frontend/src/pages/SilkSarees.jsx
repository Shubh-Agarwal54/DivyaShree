import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';
import { getProductsByFabric } from '@/data/products';
import { ChevronRight } from 'lucide-react';

export default function SilkSarees() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setProducts(getProductsByFabric('Silk'));
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
            <Link to="/fabrics" className="hover:text-cream transition-colors">
              Fabrics
            </Link>
            <ChevronRight size={16} />
            <span className="text-cream">Silk Sarees</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4">
            Silk Sarees
          </h1>
          <p className="font-body text-lg md:text-xl text-cream-dark/90 max-w-2xl">
            Experience timeless elegance with our exquisite collection of pure silk sarees.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <main className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Description */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <p className="font-body text-muted-foreground text-lg leading-relaxed">
              Silk sarees are the epitome of Indian tradition and elegance. Crafted from the finest silk threads, 
              these sarees feature intricate designs, rich colors, and luxurious textures. Perfect for weddings, 
              festivals, and special celebrations, our silk sarees are treasured heirlooms that never go out of style.
            </p>
          </div>

          {/* Products */}
          {products.length > 0 ? (
            <>
              <div className="text-center mb-8">
                <h2 className="font-display text-3xl text-foreground mb-2">
                  Explore Our Collection
                </h2>
                <p className="font-body text-muted-foreground">
                  {products.length} beautiful pieces
                </p>
              </div>
              <ProductGrid products={products} />
            </>
          ) : (
            <div className="text-center py-16">
              <p className="font-body text-xl text-muted-foreground">
                New collection coming soon...
              </p>
            </div>
          )}

          {/* Features */}
          <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="font-display text-xl mb-2">Premium Quality</h3>
              <p className="font-body text-sm text-muted-foreground">
                100% pure silk with authentic craftsmanship
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="font-display text-xl mb-2">Luxurious</h3>
              <p className="font-body text-sm text-muted-foreground">
                Rich textures and elegant sheen
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display text-xl mb-2">Timeless</h3>
              <p className="font-body text-sm text-muted-foreground">
                Classic designs that never go out of style
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
