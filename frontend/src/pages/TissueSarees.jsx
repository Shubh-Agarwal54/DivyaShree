import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';
import { getProductsByFabric } from '@/data/products';
import { ChevronRight } from 'lucide-react';

export default function TissueSarees() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setProducts(getProductsByFabric('Tissue'));
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
            <span className="text-cream">Tissue Sarees</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4">
            Tissue Sarees
          </h1>
          <p className="font-body text-lg md:text-xl text-cream-dark/90 max-w-2xl">
            Shimmering elegance that catches every eye. Explore our stunning tissue saree collection.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <main className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Description */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <p className="font-body text-muted-foreground text-lg leading-relaxed">
              Tissue sarees are woven with metallic threads that create a stunning shimmer and luxurious appearance. 
              Lightweight yet glamorous, these sarees are perfect for weddings, receptions, and grand celebrations. 
              The fabric's natural sheen and elegant drape make it a favorite among fashion-forward women.
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="font-display text-xl mb-2">Metallic Shimmer</h3>
              <p className="font-body text-sm text-muted-foreground">
                Lustrous finish with golden/silver threads
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
              </div>
              <h3 className="font-display text-xl mb-2">Lightweight</h3>
              <p className="font-body text-sm text-muted-foreground">
                Easy to drape with comfortable wear
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-display text-xl mb-2">Grand Occasions</h3>
              <p className="font-body text-sm text-muted-foreground">
                Perfect for weddings and celebrations
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
