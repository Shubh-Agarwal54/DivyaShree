import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { wishlistAPI } from '@/services/api';
import { productAPI } from '@/services/product.api';
import { toast } from 'sonner';
import product1 from '@/assets/product-1.jpg';
import product2 from '@/assets/product-2.jpg';
import product3 from '@/assets/product-3.jpg';
import product4 from '@/assets/product-4.jpg';
import product5 from '@/assets/product-5.jpg';
import product6 from '@/assets/product-6.jpg';
import product7 from '@/assets/product-7.jpg';
import product8 from '@/assets/product-8.jpg';

const fallbackProducts = [
  {
    id: 1,
    name: 'Pink Silk Saree with Gold Embroidery',
    image: product1,
    price: 12999,
    originalPrice: 18999,
    rating: 4.5,
    reviews: 128,
  },
  {
    id: 2,
    name: 'Maroon Silk Saree with Gold Border',
    image: product2,
    price: 15999,
    originalPrice: 22999,
    rating: 4.8,
    reviews: 256,
  },
  {
    id: 3,
    name: 'Teal Georgette Saree with Embellishments',
    image: product3,
    price: 9999,
    originalPrice: 14999,
    rating: 4.3,
    reviews: 89,
  },
  {
    id: 4,
    name: 'Yellow Organza Lehenga with Floral Work',
    image: product4,
    price: 24999,
    originalPrice: 35999,
    rating: 4.9,
    reviews: 312,
  },
  {
    id: 5,
    name: 'Red Bridal Lehenga with Heavy Embroidery',
    image: product5,
    price: 45999,
    originalPrice: 65999,
    rating: 5.0,
    reviews: 456,
  },
  {
    id: 6,
    name: 'Green Silk Saree with Tissue Work',
    image: product6,
    price: 11999,
    originalPrice: 16999,
    rating: 4.4,
    reviews: 167,
  },
  {
    id: 7,
    name: 'Dusty Pink Organza Suit with Embroidery',
    image: product7,
    price: 18999,
    originalPrice: 27999,
    rating: 4.6,
    reviews: 198,
  },
  {
    id: 8,
    name: 'Black and Gold Tissue Saree',
    image: product8,
    price: 13999,
    originalPrice: 19999,
    rating: 4.7,
    reviews: 234,
  },
];

const ProductGrid = ({ title, subtitle, limit = 8 }) => {
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(limit);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await productAPI.getAllProducts({ limit: 50 });
        if (result.success && result.data && result.data.products && result.data.products.length > 0) {
          setProducts(result.data.products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Keep fallback products
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const displayProducts = products.slice(0, displayCount);
  
  const handleViewAll = () => {
    setDisplayCount(prevCount => prevCount + 8);
  };
  
  const handleAddToWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await wishlistAPI.addToWishlist(productId);
      if (response.success) {
        toast.success('Added to wishlist!');
      } else {
        toast.error(response.message || 'Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Please login to add items to wishlist');
    }
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  const calculateDiscount = (original, current) => {
    return Math.round(((original - current) / original) * 100);
  };

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        {subtitle && <p className="section-subtitle mb-2">{subtitle}</p>}
        {title && <h2 className="section-title mb-8">{title}</h2>}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {displayProducts.map((product, index) => {
            // Handle both API products (_id, images[]) and fallback products (id, image)
            const productId = product._id || product.id;
            const productImage = product.images?.[0] || product.image;
            const discount = product.salePercentage || calculateDiscount(product.originalPrice, product.price);
            
            return (
              <Link
                key={productId}
                to={`/product/${productId}`}
                className="group product-card animate-fade-up rounded-lg overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Image container */}
                <div className="relative overflow-hidden aspect-[3/4]">
                  <img
                    src={productImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500"
                  />
                  
                  {/* Wishlist button */}
                  <button 
                    onClick={(e) => handleAddToWishlist(e, productId)}
                    className="absolute top-3 right-3 w-8 h-8 bg-background/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground"
                  >
                    <Heart size={16} />
                  </button>
                  
                  {/* Discount badge */}
                  {discount > 0 && (
                    <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-1 text-xs font-body">
                      {discount}% OFF
                    </div>
                  )}
                </div>
                
                {/* Product info */}
                <div className="p-3 md:p-4">
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <Star size={12} className="fill-gold text-gold" />
                    <span className="text-xs font-body text-muted-foreground">
                      {product.rating || 4.5} ({product.reviews || 0})
                    </span>
                  </div>
                  
                  {/* Name */}
                  <h3 className="font-body text-xs md:text-sm text-foreground line-clamp-2 mb-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="font-body font-semibold text-sm md:text-base text-foreground">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="font-body text-xs text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* View All button */}
        {displayCount < products.length && (
          <div className="text-center mt-10">
            <button onClick={handleViewAll} className="btn-outline">
              VIEW ALL
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
