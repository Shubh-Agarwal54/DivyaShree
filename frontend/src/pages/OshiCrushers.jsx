import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, SlidersHorizontal, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import product1 from '@/assets/product-1.jpg';
import product2 from '@/assets/product-2.jpg';
import product3 from '@/assets/product-3.jpg';
import product4 from '@/assets/product-4.jpg';
import product5 from '@/assets/product-5.jpg';
import product6 from '@/assets/product-6.jpg';
import product7 from '@/assets/product-7.jpg';
import product8 from '@/assets/product-8.jpg';

const products = [
  { id: 1, name: 'Trending: Pink Silk Saree', image: product1, price: 12999, originalPrice: 18999, rating: 4.5, reviews: 128, trending: true },
  { id: 2, name: 'Hot Pick: Maroon Lehenga', image: product2, price: 15999, originalPrice: 22999, rating: 4.8, reviews: 256, trending: true },
  { id: 3, name: 'Must-Have: Teal Georgette Set', image: product3, price: 9999, originalPrice: 14999, rating: 4.3, reviews: 89, trending: true },
  { id: 4, name: 'Favorite: Yellow Lehenga', image: product4, price: 24999, originalPrice: 35999, rating: 4.9, reviews: 312, trending: true },
  { id: 5, name: 'Popular: Red Bridal Ensemble', image: product5, price: 45999, originalPrice: 65999, rating: 5.0, reviews: 456, trending: true },
  { id: 6, name: 'Trending: Green Silk Saree', image: product6, price: 11999, originalPrice: 16999, rating: 4.4, reviews: 167, trending: true },
  { id: 7, name: 'Hot: Pink Anarkali Set', image: product7, price: 18999, originalPrice: 27999, rating: 4.6, reviews: 198, trending: true },
  { id: 8, name: 'Must-Have: Black Tissue Saree', image: product8, price: 13999, originalPrice: 19999, rating: 4.7, reviews: 234, trending: true },
];

const OshiCrushers = () => {
  const [sortBy, setSortBy] = useState('featured');
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  const calculateDiscount = (original, current) => Math.round(((original - current) / original) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="relative h-[300px] md:h-[400px] bg-gradient-to-r from-rose-200/40 to-orange-200/40">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <TrendingUp className="text-primary" size={32} />
              <h1 className="font-display text-4xl md:text-6xl text-foreground">Oshi Crushers</h1>
            </div>
            <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
              Trending styles that everyone's crushing on
            </p>
          </div>
        </div>
      </div>

      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 border-2 border-border hover:border-primary transition-all rounded-sm font-body text-sm">
                <SlidersHorizontal size={18} /> Filters
              </button>
              <p className="font-body text-sm text-muted-foreground">{products.length} Products</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="font-body text-sm text-muted-foreground">Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 border-2 border-border rounded-sm font-body text-sm focus:outline-none focus:border-primary bg-background">
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <Link key={product.id} to={`/product/${product.id}`} className="group product-card animate-fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="relative overflow-hidden aspect-[3/4]">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <button className="absolute top-3 right-3 w-8 h-8 bg-background/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground">
                    <Heart size={16} />
                  </button>
                  {product.trending && (
                    <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 text-xs font-body font-semibold rounded-sm flex items-center gap-1">
                      <TrendingUp size={12} /> TRENDING
                    </div>
                  )}
                  <div className="absolute top-12 left-3 bg-primary text-primary-foreground px-2 py-1 text-xs font-body">
                    {calculateDiscount(product.originalPrice, product.price)}% OFF
                  </div>
                </div>
                <div className="p-3 md:p-4">
                  <div className="flex items-center gap-1 mb-2">
                    <Star size={12} className="fill-gold text-gold" />
                    <span className="text-xs font-body text-muted-foreground">{product.rating} ({product.reviews})</span>
                  </div>
                  <h3 className="font-body text-xs md:text-sm text-foreground line-clamp-2 mb-2 min-h-[2.5rem]">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="font-body font-semibold text-sm md:text-base text-foreground">{formatPrice(product.price)}</span>
                    <span className="font-body text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="btn-outline">Load More Products</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OshiCrushers;
