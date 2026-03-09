import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, X, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { promoAPI } from '@/services/api';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, getCartItemCount } = useCart();
  const { user } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoData, setPromoData] = useState(null); // { code, discountAmount, description }
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [availablePromos, setAvailablePromos] = useState([]);
  const [showAvailablePromos, setShowAvailablePromos] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    // Fetch available active promos for display
    promoAPI.getActivePromos()
      .then((res) => { if (res.success) setAvailablePromos(res.data || []); })
      .catch(() => {});
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityChange = (productId, type) => {
    const item = cartItems.find(item => item.productId === productId);
    if (!item) return;

    if (type === 'increase') {
      updateQuantity(productId, item.quantity + 1);
    } else if (type === 'decrease' && item.quantity > 1) {
      updateQuantity(productId, item.quantity - 1);
    }
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const calculateSubtotal = () => {
    return getCartTotal();
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 2999 ? 0 : 99;
  };

  const calculateDiscount = () => {
    return promoData ? promoData.discountAmount : 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() - calculateDiscount();
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await promoAPI.validatePromo(promoCode.trim(), calculateSubtotal());
      if (res.success) {
        setPromoData(res.data);
        setPromoApplied(true);
        setPromoError('');
      } else {
        setPromoError(res.message || 'Invalid promo code');
        setPromoApplied(false);
        setPromoData(null);
      }
    } catch {
      setPromoError('Failed to validate promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoApplied(false);
    setPromoData(null);
    setPromoCode('');
    setPromoError('');
  };

  const handleCheckout = () => {
    // If not logged in, send user to login and preserve intended destination
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    // Navigate to checkout with cart data and promo
    navigate('/checkout', { state: promoData ? { promoCode: promoData.code, discount: promoData.discountAmount } : undefined });
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-cream-dark rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={48} className="text-primary" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">Your Cart is Empty</h1>
              <p className="font-body text-muted-foreground mb-8">
                Looks like you haven't added anything to your cart yet. Explore our beautiful collection and find
                something you love!
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 font-body text-sm tracking-widest uppercase hover:bg-primary/90 transition-all duration-300 rounded-sm hover:shadow-lg"
              >
                Continue Shopping
                <ArrowRight size={18} />
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
          <div className="text-center mb-8 md:mb-12">
            <h1 className="font-display text-3xl md:text-5xl text-foreground mb-2">Shopping Cart</h1>
            <p className="font-body text-muted-foreground">
              {getCartItemCount()} {getCartItemCount() === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="bg-card p-4 md:p-6 rounded-lg shadow-card border border-border hover:shadow-hover transition-all"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link
                      to={`/product/${item.productId}`}
                      className="relative w-24 h-32 md:w-32 md:h-40 flex-shrink-0 rounded-md overflow-hidden bg-muted"
                    >
                      <img src={item.images} alt={item.name} className="w-full h-full object-cover" />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-4 mb-2">
                        <Link
                          to={`/product/${item.productId}`}
                          className="font-body font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => handleRemoveItem(item.productId)}
                          className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="space-y-1 mb-4">
                        <p className="font-body text-sm text-muted-foreground">
                          Size: <span className="text-foreground">{item.size || 'Free Size'}</span>
                        </p>
                        <p className="font-body text-sm text-muted-foreground">
                          Color: <span className="text-foreground">{item.color || 'As shown'}</span>
                        </p>
                        <p className="font-body text-sm">
                          <span className="text-green-600">In Stock</span>
                        </p>
                      </div>

                      {/* Price & Quantity */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="font-display text-xl font-bold text-primary">{formatPrice(item.price)}</div>

                        {/* Quantity Controls */}
                        <div className="flex items-center border-2 border-border rounded-sm">
                          <button
                            onClick={() => handleQuantityChange(item.productId, 'decrease')}
                            className="p-2 hover:bg-muted transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 font-body font-medium min-w-[40px] text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.productId, 'increase')}
                            className="p-2 hover:bg-muted transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Item Total (Mobile) */}
                      <div className="mt-3 md:hidden">
                        <p className="font-body text-sm text-muted-foreground">
                          Total: <span className="font-bold text-foreground">{formatPrice(item.price * item.quantity)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Item Total (Desktop) */}
                    <div className="hidden md:flex flex-col items-end justify-between">
                      <div className="font-display text-xl font-bold text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Continue Shopping Link */}
              <div className="pt-4">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 font-body text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card p-6 rounded-lg shadow-card border border-border sticky top-24">
                <h2 className="font-display text-2xl text-foreground mb-6">Order Summary</h2>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block font-body text-sm font-medium text-foreground mb-2">Promo Code</label>
                  {promoApplied && promoData ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border-2 border-green-200 rounded-sm">
                      <div className="flex items-center gap-2">
                        <Tag size={16} className="text-green-600" />
                        <div>
                          <p className="font-body text-sm font-bold text-green-700">{promoData.code}</p>
                          {promoData.description && (
                            <p className="font-body text-xs text-green-600">{promoData.description}</p>
                          )}
                        </div>
                      </div>
                      <button onClick={handleRemovePromo} className="p-1 hover:bg-green-100 rounded" aria-label="Remove promo">
                        <X size={16} className="text-green-600" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                            placeholder="Enter code"
                            className={`w-full px-4 py-3 pl-10 border-2 rounded-sm font-body text-sm focus:outline-none transition-colors ${promoError ? 'border-destructive' : 'border-border focus:border-primary'}`}
                          />
                          <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        </div>
                        <button
                          onClick={handleApplyPromo}
                          disabled={promoLoading || !promoCode.trim()}
                          className="px-4 bg-primary text-primary-foreground font-body text-sm uppercase tracking-wider hover:bg-primary/90 transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px]"
                        >
                          {promoLoading ? '...' : 'Apply'}
                        </button>
                      </div>
                      {promoError && (
                        <p className="mt-1 font-body text-xs text-destructive">{promoError}</p>
                      )}
                    </>
                  )}

                  {/* Available coupons toggle */}
                  {availablePromos.length > 0 && !promoApplied && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => setShowAvailablePromos((p) => !p)}
                        className="flex items-center gap-1 font-body text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        {showAvailablePromos ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {showAvailablePromos ? 'Hide' : 'View'} available coupons ({availablePromos.length})
                      </button>
                      {showAvailablePromos && (
                        <div className="mt-2 space-y-2">
                          {availablePromos.map((p) => (
                            <button
                              key={p.code}
                              type="button"
                              onClick={() => { setPromoCode(p.code); setPromoError(''); setShowAvailablePromos(false); }}
                              className="w-full flex items-start justify-between p-3 border border-dashed border-primary/40 rounded-sm hover:bg-primary/5 transition-all text-left"
                            >
                              <div>
                                <span className="font-mono font-bold text-primary text-sm">{p.code}</span>
                                <p className="font-body text-xs text-muted-foreground mt-0.5">
                                  {p.discountType === 'percentage'
                                    ? `${p.discountValue}% off${p.maxDiscountAmount ? ` (max ₹${p.maxDiscountAmount})` : ''}`
                                    : `₹${p.discountValue} off`}
                                  {p.minOrderAmount > 0 ? ` · Min ₹${p.minOrderAmount}` : ''}
                                </p>
                                {p.description && <p className="font-body text-xs text-muted-foreground">{p.description}</p>}
                              </div>
                              <span className="font-body text-xs text-primary font-medium ml-2 whitespace-nowrap">Tap to apply</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground font-medium">{formatPrice(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground font-medium">
                      {calculateShipping() === 0 ? 'FREE' : formatPrice(calculateShipping())}
                    </span>
                  </div>
                  {promoApplied && promoData && (
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-muted-foreground">Discount ({promoData.code})</span>
                      <span className="text-green-600 font-medium">-{formatPrice(calculateDiscount())}</span>
                    </div>
                  )}
                  {calculateShipping() > 0 && (
                    <p className="font-body text-xs text-muted-foreground">
                      Add {formatPrice(2999 - calculateSubtotal())} more for FREE shipping
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-6">
                  <span className="font-display text-xl text-foreground">Total</span>
                  <span className="font-display text-2xl font-bold text-primary">{formatPrice(calculateTotal())}</span>
                </div>

                {/* Checkout Button */}
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-primary text-primary-foreground py-4 font-body text-sm tracking-widest uppercase hover:bg-primary/90 transition-all duration-300 rounded-sm hover:shadow-lg mb-4"
                >
                  Proceed to Checkout
                </button>

                {/* Security Info */}
                <div className="space-y-2 pt-4 border-t border-border">
                  <p className="font-body text-xs text-muted-foreground flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Secure Checkout
                  </p>
                  <p className="font-body text-xs text-muted-foreground">
                    Tax included. Shipping calculated at checkout.
                  </p>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 p-6 bg-cream-dark rounded-lg">
                <h3 className="font-body font-medium text-foreground mb-4">We Accept</h3>
                <div className="grid grid-cols-4 gap-3">
                  {['Visa', 'Master', 'UPI', 'COD'].map((method) => (
                    <div
                      key={method}
                      className="aspect-video bg-background rounded border border-border flex items-center justify-center"
                    >
                      <span className="font-body text-xs text-muted-foreground">{method}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
