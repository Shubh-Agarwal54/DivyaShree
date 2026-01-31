import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Share2, Star, Truck, RefreshCw, Shield, ChevronRight, Minus, Plus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { productAPI } from '@/services/product.api';
import { wishlistAPI } from '@/services/api';
import { reviewAPI } from '@/services/review.api';
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
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('Free Size');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [productData, setProductData] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    email: '',
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Debug: Log user when it changes
  useEffect(() => {
    console.log('Current user in ProductView:', user);
  }, [user]);
  
  // Fetch reviews for product
  const fetchReviews = async (productId) => {
    try {
      const [reviewsResult, statsResult] = await Promise.all([
        reviewAPI.getProductReviews(productId, { limit: 50 }),
        reviewAPI.getReviewStats(productId)
      ]);

      console.log('Reviews result:', reviewsResult);
      console.log('Stats result:', statsResult);

      if (reviewsResult.success && reviewsResult.data) {
        setReviews(reviewsResult.data.reviews || []);
        console.log('Updated reviews:', reviewsResult.data.reviews?.length || 0);
      }

      if (statsResult.success && statsResult.data) {
        setReviewStats(statsResult.data);
        console.log('Updated stats:', statsResult.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

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
            
            // Fetch related products and reviews
            const relatedResult = await productAPI.getRelatedProducts(id);
            if (relatedResult.success && relatedResult.data) {
              setRelatedProducts(relatedResult.data || []);
            }
            
            // Fetch reviews
            fetchReviews(id);
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
      _id: productData._id || productData.id,
      name: productData.name,
      price: productData.price,
      quantity: quantity,
      image: productImages[0],
      images: productImages,
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    // Validate comment first
    if (!reviewForm.comment || reviewForm.comment.trim().length === 0) {
      toast.error('Please write a review comment');
      return;
    }

    if (reviewForm.comment.length < 10) {
      toast.error('Review comment must be at least 10 characters');
      return;
    }

    // Get name and email - construct name properly from user object
    let userName, userEmail;
    
    if (user) {
      // User is logged in - construct name from available fields
      if (user.googleProfile?.displayName) {
        userName = user.googleProfile.displayName;
      } else if (user.firstName || user.lastName) {
        userName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      } else {
        userName = user.email?.split('@')[0] || 'User';
      }
      userEmail = user.email || '';
    } else {
      // Guest user
      userName = reviewForm.name || '';
      userEmail = reviewForm.email || '';
      
      if (!userName) {
        toast.error('Please enter your name');
        return;
      }
    }

    // Debug log
    console.log('Submitting review with:', {
      user: user,
      userName,
      userEmail,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      isLoggedIn: !!user
    });

    setSubmittingReview(true);
    
    try {
      const result = await reviewAPI.createReview(id, {
        name: userName,
        email: userEmail,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });

      if (result.success) {
        toast.success('Review submitted successfully!');
        setReviewForm({ name: '', email: '', rating: 5, comment: '' });
        setShowReviewForm(false);
        // Refresh reviews and update product data
        await fetchReviews(id);
        // Update product data to reflect new review count
        if (productData) {
          setProductData({
            ...productData,
            reviews: (productData.reviews || 0) + 1
          });
        }
      } else {
        toast.error(result.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
                  {/* Review Stats */}
                  <div className="flex items-center justify-between gap-6 mb-6">
                    <div>
                      <div className="text-5xl font-bold text-primary">
                        {reviewStats?.averageRating || productData.rating || 0}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={16} 
                            className={i < Math.floor(reviewStats?.averageRating || productData.rating || 0) 
                              ? 'fill-gold text-gold' 
                              : 'text-muted'} 
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {reviewStats?.totalReviews || productData.reviews || 0} reviews
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-sm font-body text-sm hover:bg-primary/90 transition-colors"
                    >
                      {showReviewForm ? 'Cancel' : 'Write a Review'}
                    </button>
                  </div>

                  {/* Write Review Form */}
                  {showReviewForm && (
                    <form onSubmit={handleReviewSubmit} className="bg-cream-dark p-6 rounded-lg mb-6">
                      <h3 className="font-display text-xl mb-4">Write Your Review</h3>
                      
                      <div className="space-y-4">
                        {/* Rating */}
                        <div>
                          <label className="block font-body text-sm font-medium mb-2">
                            Rating <span className="text-primary">*</span>
                          </label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                className="transition-transform hover:scale-110"
                              >
                                <Star
                                  size={32}
                                  className={star <= reviewForm.rating 
                                    ? 'fill-gold text-gold' 
                                    : 'text-muted hover:text-gold'}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Name */}
                        {!user && (
                          <div>
                            <label className="block font-body text-sm font-medium mb-2">
                              Name <span className="text-primary">*</span>
                            </label>
                            <input
                              type="text"
                              value={reviewForm.name}
                              onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                              className="w-full px-4 py-2 border border-border rounded-sm font-body focus:outline-none focus:border-primary"
                              placeholder="Your name"
                              required
                            />
                          </div>
                        )}

                        {/* Email */}
                        {!user && (
                          <div>
                            <label className="block font-body text-sm font-medium mb-2">
                              Email (optional)
                            </label>
                            <input
                              type="email"
                              value={reviewForm.email}
                              onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                              className="w-full px-4 py-2 border border-border rounded-sm font-body focus:outline-none focus:border-primary"
                              placeholder="your@email.com"
                            />
                          </div>
                        )}

                        {/* Comment */}
                        <div>
                          <label className="block font-body text-sm font-medium mb-2">
                            Your Review <span className="text-primary">*</span>
                          </label>
                          <textarea
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                            className="w-full px-4 py-2 border border-border rounded-sm font-body focus:outline-none focus:border-primary min-h-[120px]"
                            placeholder="Share your experience with this product..."
                            required
                            maxLength={1000}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {reviewForm.comment.length}/1000 characters
                          </p>
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="w-full bg-primary text-primary-foreground py-3 rounded-sm font-body text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div key={review._id} className="border-b border-border pb-6 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={14} 
                                    className={i < review.rating ? 'fill-gold text-gold' : 'text-muted'} 
                                  />
                                ))}
                              </div>
                              <span className="font-body text-sm font-medium">{review.name}</span>
                              {review.isVerifiedPurchase && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                            <span className="font-body text-xs text-muted-foreground">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          <p className="font-body text-foreground">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="font-body text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                      </div>
                    )}
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
