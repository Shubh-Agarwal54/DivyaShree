import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';
import { getProductsByFabric } from '@/data/products';
import { ChevronRight } from 'lucide-react';

export default function OrganzaSuits() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setProducts(getProductsByFabric('Organza'));
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
            <span className="text-cream">Organza Suits</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4">
            Organza Suits
          </h1>
          <p className="font-body text-lg md:text-xl text-cream-dark/90 max-w-2xl">
            Delicate, sheer, and absolutely stunning. Discover our collection of organza suits.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <main className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Description */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <p className="font-body text-muted-foreground text-lg leading-relaxed">
              Organza is a thin, sheer fabric with a crisp texture that adds a touch of sophistication to any outfit. 
              Our organza suits feature intricate embroidery, delicate threadwork, and contemporary designs perfect for 
              festive occasions, cocktail parties, and special events.
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className="font-display text-xl mb-2">Delicate Beauty</h3>
              <p className="font-body text-sm text-muted-foreground">
                Sheer elegance with refined craftsmanship
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="font-display text-xl mb-2">Modern Designs</h3>
              <p className="font-body text-sm text-muted-foreground">
                Contemporary styles with traditional touch
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="font-display text-xl mb-2">Festive Perfect</h3>
              <p className="font-body text-sm text-muted-foreground">
                Ideal for celebrations and special occasions
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
