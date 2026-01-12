import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';

const Kurtis = () => {
  const [sortBy, setSortBy] = useState('featured');
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const products = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Designer Kurti ${i + 1}`,
    price: 1999 + (i * 300),
    originalPrice: 3999 + (i * 300),
    image: `https://placehold.co/400x600/8B0000/FFF?text=Kurti+${i + 1}`,
    rating: 4.5,
    reviews: 145 + i,
    badge: i % 3 === 0 ? 'New Arrival' : '',
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4">Kurtis Collection</h1>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              Comfortable and stylish kurtis for everyday elegance.
            </p>
          </div>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
            <span className="font-body text-sm text-muted-foreground">{products.length} Products</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 border border-border rounded-sm font-body text-sm bg-background">
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
          <ProductGrid products={products} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Kurtis;
