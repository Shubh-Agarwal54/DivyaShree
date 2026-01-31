import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { wishlistAPI } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistAPI.getWishlist();
      if (response.success) {
        setWishlistItems(response.data || []);
      } else {
        toast.error('Failed to fetch wishlist');
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      // If not authenticated, just show empty wishlist
      setWishlistItems([]);
    } finally {
      setLoading(false);
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

  const handleRemoveItem = async (id) => {
    try {
      const response = await wishlistAPI.removeFromWishlist(id);
      if (response.success) {
        toast.success('Removed from wishlist');
        setWishlistItems((prevItems) => prevItems.filter((item) => item._id !== id));
      } else {
        toast.error('Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = async (item) => {
    try {
      const cartItem = {
        _id: item._id,
        name: item.name,
        price: item.price,
        image: item.images?.[0] || '/placeholder-product.jpg',
        images: item.images,
        quantity: 1,
        size: item.sizes?.[0] || null,
        color: item.colors?.[0] || null,
      };
      
      const result = await addToCart(cartItem);
      if (result.success) {
        toast.success(`${item.name} added to cart`);
      } else {
        toast.error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="font-body text-muted-foreground">Loading wishlist...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-cream-dark rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart size={48} className="text-primary" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">Your Wishlist is Empty</h1>
              <p className="font-body text-muted-foreground mb-8">
                Save your favorite items to your wishlist and shop them later!
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 font-body text-sm tracking-widest uppercase hover:bg-primary/90 transition-all duration-300 rounded-sm hover:shadow-lg"
              >
                Explore Products
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <div>
              <h1 className="font-display text-3xl md:text-5xl text-foreground mb-2">My Wishlist</h1>
              <p className="font-body text-muted-foreground">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            <Link
              to="/account"
              className="hidden md:inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all rounded-sm font-body text-sm"
            >
              Back to Account
            </Link>
          </div>

          {/* Wishlist Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlistItems.map((item) => (
              <div key={item._id} className="group bg-card rounded-lg overflow-hidden shadow-card border border-border hover:shadow-hover transition-all">
                {/* Image Container */}
                <Link to={`/product/${item._id}`} className="relative block aspect-[3/4] overflow-hidden">
                  <img
                    src={item.images?.[0] || '/placeholder-product.jpg'}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Discount Badge */}
                  {item.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-1 text-xs font-body font-semibold rounded-sm">
                      {item.discount}% OFF
                    </div>
                  )}

                  {/* Stock Status */}
                  {!item.inStock && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 text-xs font-body font-semibold rounded-sm">
                      Out of Stock
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveItem(item._id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-all shadow-lg opacity-0 group-hover:opacity-100"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  <Link to={`/product/${item._id}`}>
                    <h3 className="font-body text-sm text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-body font-bold text-base text-primary">{formatPrice(item.price)}</span>
                    {item.discount > 0 && (
                      <span className="font-body text-xs text-muted-foreground line-through">
                        {formatPrice(item.price / (1 - item.discount / 100))}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  {item.inStock ? (
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 px-4 font-body text-xs uppercase tracking-wider hover:bg-primary/90 transition-all rounded-sm"
                    >
                      <ShoppingBag size={14} />
                      Add to Cart
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2 px-4 bg-muted text-muted-foreground font-body text-xs uppercase tracking-wider rounded-sm cursor-not-allowed"
                    >
                      Out of Stock
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Continue Shopping */}
          <div className="text-center mt-12">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all rounded-sm font-body text-sm tracking-widest uppercase"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
