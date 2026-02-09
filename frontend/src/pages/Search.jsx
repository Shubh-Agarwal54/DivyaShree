import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, SlidersHorizontal } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';
import { productAPI } from '@/services/product.api';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);
  const [filters, setFilters] = useState({
    category: 'all',
    sortBy: 'newest',
    minPrice: '',
    maxPrice: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setSearchInput(query);
    if (query) {
      fetchSearchResults();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [query, filters]);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      const params = {
        search: query,
        sortBy: filters.sortBy,
      };

      if (filters.category !== 'all') {
        params.category = filters.category;
      }
      if (filters.minPrice) {
        params.minPrice = filters.minPrice;
      }
      if (filters.maxPrice) {
        params.maxPrice = filters.maxPrice;
      }

      const response = await productAPI.getAllProducts(params);
      if (response.success) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4">Search Results</h1>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-2xl mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for Sarees, Lehengas..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-border rounded-sm bg-background text-base font-body focus:outline-none focus:border-primary"
                />
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-sm font-body text-sm"
                >
                  Search
                </button>
              </div>
            </form>

            {query && (
              <p className="font-body text-muted-foreground">
                {loading ? 'Searching...' : `${products.length} results for "${query}"`}
              </p>
            )}
          </div>

          {/* Filters & Sort */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-sm hover:border-primary transition-colors"
            >
              <SlidersHorizontal size={18} />
              <span className="font-body text-sm">Filters</span>
            </button>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="px-4 py-2 border border-border rounded-sm font-body text-sm focus:outline-none focus:border-primary"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mb-8 p-6 bg-card border border-border rounded-lg">
              <h3 className="font-display text-lg mb-4">Filters</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block font-body text-sm font-medium mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-sm font-body text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="all">All Categories</option>
                    <option value="sarees">Sarees</option>
                    <option value="lehengas">Lehengas</option>
                    <option value="suits">Suits & Sets</option>
                    <option value="gowns">Gowns</option>
                    <option value="kurtis">Kurtis</option>
                  </select>
                </div>

                <div>
                  <label className="block font-body text-sm font-medium mb-2">Min Price</label>
                  <input
                    type="number"
                    placeholder="₹0"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-sm font-body text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-body text-sm font-medium mb-2">Max Price</label>
                  <input
                    type="number"
                    placeholder="₹10000"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-sm font-body text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : products.length > 0 ? (
            <ProductGrid products={products} />
          ) : query ? (
            <div className="text-center py-20">
              <SearchIcon size={64} className="mx-auto text-muted-foreground mb-4" />
              <h2 className="font-display text-2xl text-foreground mb-2">No results found</h2>
              <p className="font-body text-muted-foreground mb-6">
                Try searching with different keywords
              </p>
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-sm font-body text-sm"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="text-center py-20">
              <SearchIcon size={64} className="mx-auto text-muted-foreground mb-4" />
              <h2 className="font-display text-2xl text-foreground mb-2">Start searching</h2>
              <p className="font-body text-muted-foreground">
                Enter a keyword to find products
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Search;
