import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';
import { productAPI } from '@/services/product.api';
import { getProductsByCategory } from '@/data/products';

const SuitsSets = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');
  
  useEffect(() => { 
    window.scrollTo(0, 0); 
    fetchProducts();
  }, [sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { category: 'suits', limit: 50 };
      if (sortBy === 'price-low') {
        params.sortBy = 'price';
        params.order = 'asc';
      } else if (sortBy === 'price-high') {
        params.sortBy = 'price';
        params.order = 'desc';
      }
      const result = await productAPI.getAllProducts(params);
      if (result.success && result.data && result.data.products && result.data.products.length > 0) {
        setProducts(result.data.products);
      } else {
        setProducts(getProductsByCategory('suits'));
      }
    } catch (error) {
      console.error('Error fetching suits:', error);
      setProducts(getProductsByCategory('suits'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4">Suits & Sets</h1>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              Elegant salwar suits and kurta sets for every occasion.
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

export default SuitsSets;
