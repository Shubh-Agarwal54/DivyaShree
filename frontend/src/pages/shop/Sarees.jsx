import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, ChevronDown, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';

const Sarees = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    price: 'all',
    fabric: 'all',
    occasion: 'all',
    sortBy: 'featured',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const products = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Elegant Saree ${i + 1}`,
    price: 2999 + (i * 500),
    originalPrice: 4999 + (i * 500),
    image: `https://placehold.co/400x600/8B0000/FFF?text=Saree+${i + 1}`,
    rating: 4.5,
    reviews: 120 + i,
    badge: i % 3 === 0 ? 'New Arrival' : i % 3 === 1 ? 'Bestseller' : '',
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4">
              Sarees Collection
            </h1>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              Discover our exquisite collection of traditional and contemporary sarees, 
              handpicked for every occasion and celebration.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-sm font-body text-sm hover:bg-muted transition-all lg:hidden"
              >
                <Filter size={18} />
                Filters
              </button>
              <span className="font-body text-sm text-muted-foreground">
                {products.length} Products
              </span>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <label className="font-body text-sm text-muted-foreground">Sort by:</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="px-4 py-2 border border-border rounded-sm font-body text-sm focus:outline-none focus:border-primary bg-background"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Filters - Desktop */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-card p-6 rounded-lg shadow-card border border-border sticky top-24">
                <h3 className="font-display text-lg text-foreground mb-6 flex items-center justify-between">
                  Filters
                  <button
                    onClick={() => setFilters({ price: 'all', fabric: 'all', occasion: 'all', sortBy: 'featured' })}
                    className="font-body text-xs text-primary hover:text-primary/80"
                  >
                    Clear All
                  </button>
                </h3>

                {/* Price Filter */}
                <div className="mb-6 pb-6 border-b border-border">
                  <h4 className="font-body font-semibold text-sm text-foreground mb-3">Price Range</h4>
                  <div className="space-y-2">
                    {['all', 'under-3000', '3000-5000', '5000-10000', 'above-10000'].map((range) => (
                      <label key={range} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="price"
                          value={range}
                          checked={filters.price === range}
                          onChange={(e) => setFilters({ ...filters, price: e.target.value })}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="font-body text-sm text-foreground">
                          {range === 'all' ? 'All Prices' :
                           range === 'under-3000' ? 'Under ₹3,000' :
                           range === '3000-5000' ? '₹3,000 - ₹5,000' :
                           range === '5000-10000' ? '₹5,000 - ₹10,000' :
                           'Above ₹10,000'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Fabric Filter */}
                <div className="mb-6 pb-6 border-b border-border">
                  <h4 className="font-body font-semibold text-sm text-foreground mb-3">Fabric</h4>
                  <div className="space-y-2">
                    {['all', 'silk', 'cotton', 'georgette', 'chiffon', 'banarasi'].map((fabric) => (
                      <label key={fabric} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="fabric"
                          value={fabric}
                          checked={filters.fabric === fabric}
                          onChange={(e) => setFilters({ ...filters, fabric: e.target.value })}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="font-body text-sm text-foreground capitalize">{fabric === 'all' ? 'All Fabrics' : fabric}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Occasion Filter */}
                <div>
                  <h4 className="font-body font-semibold text-sm text-foreground mb-3">Occasion</h4>
                  <div className="space-y-2">
                    {['all', 'wedding', 'party', 'festive', 'casual', 'formal'].map((occasion) => (
                      <label key={occasion} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="occasion"
                          value={occasion}
                          checked={filters.occasion === occasion}
                          onChange={(e) => setFilters({ ...filters, occasion: e.target.value })}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="font-body text-sm text-foreground capitalize">{occasion === 'all' ? 'All Occasions' : occasion}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <ProductGrid products={products} />
            </div>
          </div>

          {/* Mobile Filters Modal */}
          {showFilters && (
            <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
              <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-xl text-foreground">Filters</h3>
                    <button onClick={() => setShowFilters(false)}>
                      <X size={24} />
                    </button>
                  </div>

                  {/* Mobile filter content - same as desktop */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-body font-semibold text-sm text-foreground mb-3">Price Range</h4>
                      <div className="space-y-2">
                        {['all', 'under-3000', '3000-5000', '5000-10000', 'above-10000'].map((range) => (
                          <label key={range} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="price-mobile"
                              value={range}
                              checked={filters.price === range}
                              onChange={(e) => setFilters({ ...filters, price: e.target.value })}
                              className="text-primary focus:ring-primary"
                            />
                            <span className="font-body text-sm text-foreground">
                              {range === 'all' ? 'All Prices' :
                               range === 'under-3000' ? 'Under ₹3,000' :
                               range === '3000-5000' ? '₹3,000 - ₹5,000' :
                               range === '5000-10000' ? '₹5,000 - ₹10,000' :
                               'Above ₹10,000'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setShowFilters(false)}
                      className="w-full bg-primary text-primary-foreground py-3 rounded-sm font-body text-sm hover:bg-primary/90 transition-all"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Sarees;
