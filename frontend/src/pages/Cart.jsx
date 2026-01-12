import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, getCartCount } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityChange = (id, type) => {
    const item = cartItems.find(item => item.id === id);
    if (!item) return;

    if (type === 'increase') {
      updateQuantity(id, item.quantity + 1);
    } else if (type === 'decrease' && item.quantity > 1) {
      updateQuantity(id, item.quantity - 1);
    }
  };

  const handleRemoveItem = (id) => {
    removeFromCart(id);
  };

  const calculateSubtotal = () => {
    return getCartTotal();
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 2999 ? 0 : 200;
  };

  const calculateDiscount = () => {
    return promoApplied ? calculateSubtotal() * 0.1 : 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() - calculateDiscount();
  };

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      setPromoApplied(true);
    }
  };

  const handleCheckout = () => {
    // Navigate to checkout with cart data
    navigate('/checkout');
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
              {getCartCount()} {getCartCount() === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-card p-4 md:p-6 rounded-lg shadow-card border border-border hover:shadow-hover transition-all"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link
                      to={`/product/${item.id}`}
                      className="relative w-24 h-32 md:w-32 md:h-40 flex-shrink-0 rounded-md overflow-hidden bg-muted"
                    >
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-4 mb-2">
                        <Link
                          to={`/product/${item.id}`}
                          className="font-body font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
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
                            onClick={() => handleQuantityChange(item.id, 'decrease')}
                            className="p-2 hover:bg-muted transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 font-body font-medium min-w-[40px] text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, 'increase')}
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
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Enter code"
                        className="w-full px-4 py-3 pl-10 border-2 border-border rounded-sm font-body text-sm focus:outline-none focus:border-primary transition-colors"
                        disabled={promoApplied}
                      />
                      <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoApplied}
                      className="px-4 bg-primary text-primary-foreground font-body text-sm uppercase tracking-wider hover:bg-primary/90 transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Apply
                    </button>
                  </div>
                  {promoApplied && (
                    <p className="mt-2 font-body text-sm text-green-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Promo code applied!
                    </p>
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
                  {promoApplied && (
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-muted-foreground">Discount (10%)</span>
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
