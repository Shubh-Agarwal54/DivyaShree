import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';
import { getProductsByFabric } from '@/data/products';
import { productAPI } from '@/services/product.api';
import { ChevronRight } from 'lucide-react';

export default function GeorgetteGlam() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const result = await productAPI.getAllProducts({ fabric: 'georgette', limit: 50 });
        if (result.success && result.data && result.data.products && result.data.products.length > 0) {
          setProducts(result.data.products);
        } else {
          setProducts(getProductsByFabric('Georgette'));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts(getProductsByFabric('Georgette'));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
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
            <span className="text-cream">Georgette Glam</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4">
            Georgette Glam
          </h1>
          <p className="font-body text-lg md:text-xl text-cream-dark/90 max-w-2xl">
            Discover the elegance and grace of georgette fabric. Lightweight, flowy, and perfect for every occasion.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <main className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Description */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <p className="font-body text-muted-foreground text-lg leading-relaxed">
              Georgette is a lightweight, slightly crinkled fabric known for its elegant drape and graceful flow. 
              Perfect for sarees, suits, and gowns, georgette offers a sophisticated look that's comfortable to wear 
              for both casual and formal occasions. Our collection features hand-embroidered designs and modern prints.
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-display text-xl mb-2">Lightweight</h3>
              <p className="font-body text-sm text-muted-foreground">
                Breathable and comfortable for all-day wear
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="font-display text-xl mb-2">Elegant Drape</h3>
              <p className="font-body text-sm text-muted-foreground">
                Beautiful flow that enhances every silhouette
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="font-display text-xl mb-2">Versatile</h3>
              <p className="font-body text-sm text-muted-foreground">
                Perfect for casual and formal occasions
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
