import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Share2, Star, Truck, RefreshCw, Shield, ChevronRight, Minus, Plus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { productAPI } from '@/services/product.api';
import { wishlistAPI } from '@/services/api';
import { getProductById } from '@/data/products';
import { toast } from 'sonner';
import product1 from '@/assets/product-1.jpg';
import product2 from '@/assets/product-2.jpg';
import product3 from '@/assets/product-3.jpg';
import product4 from '@/assets/product-4.jpg';

// Fallback images for products without images
const fallbackImages = [product1, product2, product3, product4];

// Check if ID is a valid MongoDB ObjectID (24 hex characters)
const isValidMongoId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('Free Size');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [productData, setProductData] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch product data from API or fallback
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // If ID is a valid MongoDB ID, fetch from API
        if (isValidMongoId(id)) {
          const result = await productAPI.getProduct(id);
          console.log('Product API result:', result);
          if (result.success && result.data) {
            setProductData(result.data);
            if (result.data.color && !selectedColor) {
              setSelectedColor(result.data.color);
            }
            
            // Fetch related products
            const relatedResult = await productAPI.getRelatedProducts(id);
            if (relatedResult.success && relatedResult.data) {
              setRelatedProducts(relatedResult.data || []);
            }
          } else {
            console.error('Product not found or API failed:', result);
            setProductData(null);
          }
        } else {
          // Fallback to hardcoded products for numeric IDs
          const fallbackProduct = getProductById(id);
          if (fallbackProduct) {
            setProductData(fallbackProduct);
            if (fallbackProduct.color && !selectedColor) {
              setSelectedColor(fallbackProduct.color);
            }
          } else {
            setProductData(null);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        // Try fallback data
        const fallbackProduct = getProductById(id);
        if (fallbackProduct) {
          setProductData(fallbackProduct);
        } else {
          setProductData(null);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E1E]"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!productData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-[#6B1E1E] text-white rounded-lg hover:bg-[#8B2E2E]"
            >
              Go Back Home
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const discount = productData.originalPrice 
    ? Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100)
    : productData.salePercentage || 0;
  
  // Use product images or fallback
  const productImages = productData.images && productData.images.length > 0 
    ? productData.images 
    : fallbackImages;

  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setQuantity((prev) => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    // Create cart item with selected options
    const cartItem = {
      id: productData._id || productData.id,
      name: productData.name,
      price: productData.price,
      quantity: quantity,
      image: productImages[0],
      size: selectedSize,
      color: selectedColor,
      category: productData.category,
    };
    
    addToCart(cartItem);
    
    toast.success(`${quantity} x ${productData.name} added to your cart.`);
    
    // Navigate to cart page
    navigate('/cart');
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const productId = productData._id || productData.id;
    
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

  const handleShare = async () => {
    const shareData = {
      title: productData.name,
      text: `Check out ${productData.name} - ${formatPrice(productData.price)}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        // Fallback: Copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Product link copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        toast.error('Failed to share product');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-cream-dark py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm font-body">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight size={16} className="text-muted-foreground" />
            <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">
              {productData.category}
            </Link>
            <ChevronRight size={16} className="text-muted-foreground" />
            <span className="text-foreground">{productData.name}</span>
          </div>
        </div>
      </div>

      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Product Section */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                <img
                  src={productImages[selectedImage]}
                  alt={productData.name}
                  className="w-full h-full object-cover"
                />
                {productData.inStock && discount > 0 && (
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1.5 text-xs font-body font-semibold rounded-md">
                    {discount}% OFF
                  </div>
                )}
                <button
                  onClick={handleAddToWishlist}
                  className="absolute top-4 right-4 w-10 h-10 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all shadow-lg"
                >
                  <Heart size={20} />
                </button>
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-primary' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div>
              {/* Product Name & Rating */}
              <div className="mb-4">
                <h1 className="font-display text-3xl md:text-4xl text-foreground mb-3">{productData.name}</h1>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < Math.floor(productData.rating || 0) ? 'fill-gold text-gold' : 'text-muted'}
                      />
                    ))}
                  </div>
                  <span className="font-body text-sm text-muted-foreground">
                    {productData.rating || 0} ({productData.reviews || 0} reviews)
                  </span>
                </div>
                <p className="font-body text-sm text-muted-foreground">SKU: DS-{(productData._id || productData.id)?.toString().slice(-6).toUpperCase()}</p>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <span className="font-display text-4xl font-bold text-primary">{formatPrice(productData.price)}</span>
                {productData.originalPrice && (
                  <>
                    <span className="font-body text-xl text-muted-foreground line-through">
                      {formatPrice(productData.originalPrice)}
                    </span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-body text-sm font-semibold">
                      Save {discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <label className="block font-body text-sm font-medium text-foreground mb-3">
                  Color: <span className="text-primary">{selectedColor}</span>
                </label>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 border-2 border-primary bg-primary text-primary-foreground rounded-sm font-body text-sm"
                  >
                    {selectedColor}
                  </button>
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                <label className="block font-body text-sm font-medium text-foreground mb-3">
                  Size: <span className="text-primary">{selectedSize}</span>
                </label>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 border-2 border-primary bg-primary text-primary-foreground rounded-sm font-body text-sm"
                  >
                    {selectedSize}
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block font-body text-sm font-medium text-foreground mb-3">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-border rounded-sm">
                    <button
                      onClick={() => handleQuantityChange('decrease')}
                      className="p-3 hover:bg-muted transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="px-6 font-body font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange('increase')}
                      className="p-3 hover:bg-muted transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <span className="font-body text-sm text-muted-foreground">
                    {productData.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={!productData.inStock}
                  className="flex-1 bg-primary text-primary-foreground py-4 font-body text-sm tracking-widest uppercase hover:bg-primary/90 transition-all duration-300 rounded-sm text-center hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {productData.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
                <button
                  onClick={handleAddToWishlist}
                  className="px-6 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all rounded-sm"
                >
                  <Heart size={20} />
                </button>
                <button
                  onClick={handleShare}
                  className="px-6 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all rounded-sm"
                >
                  <Share2 size={20} />
                </button>
              </div>

              {/* Features */}
              <div className="space-y-3 p-6 bg-cream-dark rounded-lg">
                <div className="flex items-center gap-3 font-body text-sm">
                  <Truck size={20} className="text-primary" />
                  <span>Free Shipping on orders above ₹2999</span>
                </div>
                <div className="flex items-center gap-3 font-body text-sm">
                  <RefreshCw size={20} className="text-primary" />
                  <span>Easy 7-day return & exchange</span>
                </div>
                <div className="flex items-center gap-3 font-body text-sm">
                  <Shield size={20} className="text-primary" />
                  <span>100% Authentic Products</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Tabs */}
          <div className="mb-16">
            <div className="border-b border-border mb-6">
              <div className="flex gap-8">
                {['description', 'features', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 font-body text-sm uppercase tracking-wider transition-colors relative ${
                      activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="prose max-w-none">
              {activeTab === 'description' && (
                <div className="font-body text-foreground">
                  <p className="mb-4">{productData.description}</p>
                  <p className="text-muted-foreground">
                    This stunning saree is crafted from premium quality silk and features exquisite hand-embroidered gold
                    work. The intricate detailing and luxurious fabric make it perfect for weddings, festivals, and special
                    occasions. Pair it with traditional jewelry for a complete ethnic look.
                  </p>
                </div>
              )}

              {activeTab === 'features' && (
                <ul className="space-y-2 font-body">
                  {productData.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ChevronRight size={20} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-6 mb-6">
                    <div>
                      <div className="text-5xl font-bold text-primary">{productData.rating}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className="fill-gold text-gold" />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{productData.reviews} reviews</p>
                    </div>
                  </div>

                  {/* Sample Review */}
                  <div className="border-b border-border pb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className="fill-gold text-gold" />
                        ))}
                      </div>
                      <span className="font-body text-sm font-medium">Priya Sharma</span>
                    </div>
                    <p className="font-body text-sm text-muted-foreground mb-2">Verified Purchase</p>
                    <p className="font-body text-foreground">
                      Absolutely stunning saree! The quality exceeded my expectations. The embroidery work is beautiful
                      and the fabric is luxurious. Received many compliments at the wedding.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          <div>
            <h2 className="font-display text-2xl md:text-3xl text-center mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((product) => (
                <Link
                  key={product._id || product.id}
                  to={`/product/${product._id || product.id}`}
                  className="group bg-card rounded-lg overflow-hidden shadow-card hover:shadow-hover transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={product.images?.[0] || product.image || fallbackImages[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-body text-sm text-foreground mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="font-body font-bold text-primary">{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <span className="font-body text-xs text-muted-foreground line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductView;
