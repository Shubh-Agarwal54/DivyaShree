import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useAddress } from '@/context/AddressContext';
import { orderAPI } from '@/services/api';
import { toast } from 'sonner';
import { ChevronRight, Trash2, Plus, Minus, ShoppingBag, Lock, Truck, CreditCard, CheckCircle, X, MapPin, Wallet, Building2, Smartphone } from 'lucide-react';

export default function Checkout() {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { addresses, getDefaultAddress } = useAddress();
  
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [useNewAddress, setUseNewAddress] = useState(false);
  
  const [formData, setFormData] = useState({
    // Shipping Info
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    // Payment Info
    paymentMethod: 'cod', // cod, upi, card, netbanking
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // If cart is empty, redirect to cart page
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    // Pre-fill user data
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
      }));
    }

    // Load default address
    const defaultAddr = getDefaultAddress();
    if (defaultAddr) {
      setSelectedAddress(defaultAddr);
      setFormData(prev => ({
        ...prev,
        fullName: defaultAddr.name,
        phone: defaultAddr.phone,
        address: defaultAddr.address,
        city: defaultAddr.city,
        state: defaultAddr.state,
        pincode: defaultAddr.pincode,
      }));
    }
  }, [user, getDefaultAddress, cartItems, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const updateItemQuantity = (productId, action) => {
    const item = cartItems.find(item => item.productId === productId);
    if (!item) return;

    if (action === 'increase') {
      updateQuantity(productId, item.quantity + 1);
    } else {
      updateQuantity(productId, Math.max(1, item.quantity - 1));
    }
  };

  const removeItem = (productId) => {
    removeFromCart(productId);
    // If cart becomes empty, redirect to cart page
    if (cartItems.length === 1) {
      navigate('/cart');
    }
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 2999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 2) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
      else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
      else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Pincode must be 6 digits';
    }

    if (step === 3) {
      if (formData.paymentMethod === 'card') {
        if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
        else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) newErrors.cardNumber = 'Card number must be 16 digits';
        if (!formData.cardName.trim()) newErrors.cardName = 'Cardholder name is required';
        if (!formData.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
        else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) newErrors.expiryDate = 'Format: MM/YY';
        if (!formData.cvv.trim()) newErrors.cvv = 'CVV is required';
        else if (!/^\d{3,4}$/.test(formData.cvv)) newErrors.cvv = 'CVV must be 3-4 digits';
      } else if (formData.paymentMethod === 'upi') {
        if (!formData.upiId.trim()) newErrors.upiId = 'UPI ID is required';
        else if (!/^[\w.-]+@[\w.-]+$/.test(formData.upiId)) newErrors.upiId = 'Invalid UPI ID format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateStep(3)) {
      return;
    }

    try {
      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          size: item.size,
          color: item.color,
        })),
        shippingAddress: {
          name: formData.fullName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          phone: formData.phone,
        },
        paymentMethod: formData.paymentMethod,
        paymentDetails: {
          upiId: formData.paymentMethod === 'upi' ? formData.upiId : undefined,
          cardLastFour: formData.paymentMethod === 'card' ? formData.cardNumber.slice(-4) : undefined,
        },
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        total: total,
      };

      const response = await orderAPI.createOrder(orderData);
      
      if (response.success) {
        toast.success('Order placed successfully!');
        clearCart();
        setCurrentStep(4);
        window.scrollTo(0, 0);
      } else {
        toast.error(response.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    setUseNewAddress(false);
    setFormData(prev => ({
      ...prev,
      fullName: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    }));
    setShowAddressSelector(false);
  };

  const handleUseNewAddress = () => {
    setSelectedAddress(null);
    setUseNewAddress(true);
    setFormData(prev => ({
      ...prev,
      fullName: user?.name || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
    }));
    setShowAddressSelector(false);
  };

  const steps = [
    { number: 1, title: 'Cart Review', icon: ShoppingBag },
    { number: 2, title: 'Shipping Info', icon: Truck },
    { number: 3, title: 'Payment', icon: CreditCard },
    { number: 4, title: 'Confirmation', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Checkout Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4">Checkout</h1>
            
            {/* Step Indicator */}
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-body font-semibold mb-2 transition-all ${
                          currentStep >= step.number
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <step.icon size={24} />
                      </div>
                      <p
                        className={`font-body text-xs md:text-sm ${
                          currentStep >= step.number ? 'text-foreground font-medium' : 'text-muted-foreground'
                        }`}
                      >
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-1 flex-1 mx-2 mb-8 transition-all ${
                          currentStep > step.number ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className={currentStep === 4 ? "lg:col-span-3 flex justify-center" : "lg:col-span-2"}>
              {/* Step 1: Cart Review */}
              {currentStep === 1 && (
                <div className="bg-card p-6 rounded-lg shadow-card border border-border">
                  <h2 className="font-display text-2xl text-foreground mb-6">Review Your Items</h2>

                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.productId} className="flex gap-4 p-4 border border-border rounded-lg hover:shadow-card transition-all">
                        <img
                          src={item.images}
                          alt={item.name}
                          className="w-20 h-24 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <h3 className="font-body font-medium text-foreground mb-2">{item.name}</h3>
                          <p className="font-body text-sm text-muted-foreground mb-2">
                            Size: {item.size || 'Free Size'} | Color: {item.color || 'As shown'}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 border border-border rounded-sm">
                              <button
                                onClick={() => updateItemQuantity(item.productId, 'decrease')}
                                className="p-2 hover:bg-muted"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="px-3 font-body text-sm">{item.quantity}</span>
                              <button
                                onClick={() => updateItemQuantity(item.productId, 'increase')}
                                className="p-2 hover:bg-muted"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-display text-lg font-bold text-primary">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                              <button
                                onClick={() => removeItem(item.productId)}
                                className="text-destructive hover:text-destructive/80"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-border">
                    <Link
                      to="/cart"
                      className="font-body text-sm text-primary hover:text-primary/80"
                    >
                      ← Back to Cart
                    </Link>
                    <button
                      onClick={handleNext}
                      className="px-8 py-3 bg-primary text-primary-foreground rounded-sm font-body text-sm uppercase tracking-wider hover:bg-primary/90 transition-all"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Shipping Info */}
              {currentStep === 2 && (
                <div className="bg-card p-6 rounded-lg shadow-card border border-border">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-2xl text-foreground">Shipping Information</h2>
                    {addresses.length > 0 && (
                      <button
                        onClick={() => setShowAddressSelector(true)}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all rounded-sm font-body text-sm"
                      >
                        <MapPin size={16} />
                        Select Saved Address
                      </button>
                    )}
                  </div>

                  {selectedAddress && !useNewAddress && (
                    <div className="mb-6 p-4 bg-primary/5 border-2 border-primary rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-body font-semibold text-foreground">{selectedAddress.type}</h3>
                            <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-sm">
                              Selected
                            </span>
                          </div>
                          <p className="font-body text-sm text-foreground">{selectedAddress.name}</p>
                          <p className="font-body text-sm text-muted-foreground">{selectedAddress.address}</p>
                          <p className="font-body text-sm text-muted-foreground">
                            {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                          </p>
                          <p className="font-body text-sm text-muted-foreground">{selectedAddress.phone}</p>
                        </div>
                        <button
                          onClick={handleUseNewAddress}
                          className="text-primary hover:text-primary/80 font-body text-sm"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  )}

                  {(useNewAddress || !selectedAddress) && (
                    <form className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-body text-sm font-medium text-foreground mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border-2 rounded-sm font-body text-sm focus:outline-none transition-colors ${
                              errors.fullName ? 'border-destructive' : 'border-border focus:border-primary'
                            }`}
                          />
                          {errors.fullName && (
                            <p className="text-destructive text-xs mt-1">{errors.fullName}</p>
                          )}
                        </div>

                        <div>
                          <label className="block font-body text-sm font-medium text-foreground mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border-2 rounded-sm font-body text-sm focus:outline-none transition-colors ${
                              errors.email ? 'border-destructive' : 'border-border focus:border-primary'
                            }`}
                          />
                          {errors.email && (
                            <p className="text-destructive text-xs mt-1">{errors.email}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block font-body text-sm font-medium text-foreground mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border-2 rounded-sm font-body text-sm focus:outline-none transition-colors ${
                            errors.phone ? 'border-destructive' : 'border-border focus:border-primary'
                          }`}
                        />
                        {errors.phone && (
                          <p className="text-destructive text-xs mt-1">{errors.phone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block font-body text-sm font-medium text-foreground mb-2">
                          Address *
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows="3"
                          className={`w-full px-4 py-3 border-2 rounded-sm font-body text-sm focus:outline-none transition-colors resize-none ${
                            errors.address ? 'border-destructive' : 'border-border focus:border-primary'
                          }`}
                        />
                        {errors.address && (
                          <p className="text-destructive text-xs mt-1">{errors.address}</p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block font-body text-sm font-medium text-foreground mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border-2 rounded-sm font-body text-sm focus:outline-none transition-colors ${
                              errors.city ? 'border-destructive' : 'border-border focus:border-primary'
                            }`}
                          />
                          {errors.city && (
                            <p className="text-destructive text-xs mt-1">{errors.city}</p>
                          )}
                        </div>

                        <div>
                          <label className="block font-body text-sm font-medium text-foreground mb-2">
                            State *
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border-2 rounded-sm font-body text-sm focus:outline-none transition-colors ${
                              errors.state ? 'border-destructive' : 'border-border focus:border-primary'
                            }`}
                          />
                          {errors.state && (
                            <p className="text-destructive text-xs mt-1">{errors.state}</p>
                          )}
                        </div>

                        <div>
                          <label className="block font-body text-sm font-medium text-foreground mb-2">
                            Pincode *
                          </label>
                          <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            maxLength="6"
                            className={`w-full px-4 py-3 border-2 rounded-sm font-body text-sm focus:outline-none transition-colors ${
                              errors.pincode ? 'border-destructive' : 'border-border focus:border-primary'
                            }`}
                          />
                          {errors.pincode && (
                            <p className="text-destructive text-xs mt-1">{errors.pincode}</p>
                          )}
                        </div>
                      </div>
                    </form>
                  )}

                  <div className="flex justify-between items-center pt-6 border-t border-border mt-6">
                    <button
                      onClick={handleBack}
                      className="font-body text-sm text-primary hover:text-primary/80"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleNext}
                      className="px-8 py-3 bg-primary text-primary-foreground rounded-sm font-body text-sm uppercase tracking-wider hover:bg-primary/90 transition-all"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div className="bg-card p-6 rounded-lg shadow-card border border-border">
                  <h2 className="font-display text-2xl text-foreground mb-6">Payment Method</h2>

                  <div className="space-y-4 mb-6">
                    {/* COD Option */}
                    <div
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cod' }))}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.paymentMethod === 'cod'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.paymentMethod === 'cod' ? 'border-primary' : 'border-border'
                        }`}>
                          {formData.paymentMethod === 'cod' && (
                            <div className="w-3 h-3 rounded-full bg-primary" />
                          )}
                        </div>
                        <Wallet size={24} className="text-primary" />
                        <div>
                          <h3 className="font-body font-semibold text-foreground">Cash on Delivery</h3>
                          <p className="font-body text-sm text-muted-foreground">Pay when you receive</p>
                        </div>
                      </div>
                    </div>

                    {/* UPI Option */}
                    <div
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'upi' }))}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.paymentMethod === 'upi'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.paymentMethod === 'upi' ? 'border-primary' : 'border-border'
                        }`}>
                          {formData.paymentMethod === 'upi' && (
                            <div className="w-3 h-3 rounded-full bg-primary" />
                          )}
                        </div>
                        <Smartphone size={24} className="text-primary" />
                        <div>
                          <h3 className="font-body font-semibold text-foreground">UPI Payment</h3>
                          <p className="font-body text-sm text-muted-foreground">PhonePe, Google Pay, Paytm</p>
                        </div>
                      </div>
                      {formData.paymentMethod === 'upi' && (
                        <div className="ml-8 mt-3">
                          <label className="block font-body text-sm font-medium text-foreground mb-2">
                            UPI ID *
                          </label>
                          <input
                            type="text"
                            name="upiId"
                            value={formData.upiId}
                            onChange={handleInputChange}
                            placeholder="yourname@upi"
                            className={`w-full px-4 py-3 border-2 rounded-sm font-body text-sm focus:outline-none transition-colors ${
                              errors.upiId ? 'border-destructive' : 'border-border focus:border-primary'
                            }`}
                          />
                          {errors.upiId && (
                            <p className="text-destructive text-xs mt-1">{errors.upiId}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Option */}
                    <div
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.paymentMethod === 'card'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.paymentMethod === 'card' ? 'border-primary' : 'border-border'
                        }`}>
                          {formData.paymentMethod === 'card' && (
                            <div className="w-3 h-3 rounded-full bg-primary" />
                          )}
                        </div>
                        <CreditCard size={24} className="text-primary" />
                        <div>
                          <h3 className="font-body font-semibold text-foreground">Credit/Debit Card</h3>
                          <p className="font-body text-sm text-muted-foreground">Visa, Mastercard, RuPay</p>
                        </div>
                      </div>
                      {formData.paymentMethod === 'card' && (
                        <div className="ml-8 mt-3 space-y-4">
                          <div>
                            <label className="block font-body text-sm font-medium text-foreground mb-2">
                              Card Number *
                            </label>
                            <input
                              type="text"
                              name="cardNumber"
                              value={formData.cardNumber}
                              onChange={handleInputChange}
                              placeholder="1234 5678 9012 3456"
                              maxLength="19"
                              className={`w-full px-4 py-3 border-2 rounded-sm font-body text-sm focus:outline-none transition-colors ${
                                errors.cardNumber ? 'border-destructive' : 'border-border focus:border-primary'
                              }`}
                            />
                            {errors.cardNumber && (
                              <p className="text-destructive text-xs mt-1">{errors.cardNumber}</p>
                            )}
                          </div>

                          <div>
                            <label className="block font-body text-sm font-medium text-foreground mb-2">
                              Cardholder Name *
                            </label>
                            <input
                              type="text"
                              name="cardName"
                              value={formData.cardName}
                              onChange={handleInputChange}
                              placeholder="Name on card"
                              className={`w-full px-4 py-3 border-2 rounded-sm font-body text-sm focus:outline-none transition-colors ${
                                errors.cardName ? 'border-destructive' : 'border-border focus:border-primary'
                              }`}
                            />
                            {errors.cardName && (
                              <p className="text-destructive text-xs mt-1">{errors.cardName}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block font-body text-sm font-medium text-foreground mb-2">
                                Expiry Date *
                              </label>
                              <input
                                type="text"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                                placeholder="MM/YY"
                                maxLength="5"
                                className={`w-full px-4 py-3 border-2 rounded-sm font-body text-sm focus:outline-none transition-colors ${
                                  errors.expiryDate ? 'border-destructive' : 'border-border focus:border-primary'
                                }`}
                              />
                              {errors.expiryDate && (
                                <p className="text-destructive text-xs mt-1">{errors.expiryDate}</p>
                              )}
                            </div>

                            <div>
                              <label className="block font-body text-sm font-medium text-foreground mb-2">
                                CVV *
                              </label>
                              <input
                                type="text"
                                name="cvv"
                                value={formData.cvv}
                                onChange={handleInputChange}
                                placeholder="123"
                                maxLength="4"
                                className={`w-full px-4 py-3 border-2 rounded-sm font-body text-sm focus:outline-none transition-colors ${
                                  errors.cvv ? 'border-destructive' : 'border-border focus:border-primary'
                                }`}
                              />
                              {errors.cvv && (
                                <p className="text-destructive text-xs mt-1">{errors.cvv}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Net Banking Option */}
                    <div
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'netbanking' }))}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.paymentMethod === 'netbanking'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.paymentMethod === 'netbanking' ? 'border-primary' : 'border-border'
                        }`}>
                          {formData.paymentMethod === 'netbanking' && (
                            <div className="w-3 h-3 rounded-full bg-primary" />
                          )}
                        </div>
                        <Building2 size={24} className="text-primary" />
                        <div>
                          <h3 className="font-body font-semibold text-foreground">Net Banking</h3>
                          <p className="font-body text-sm text-muted-foreground">All major banks supported</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-border">
                    <button
                      onClick={handleBack}
                      className="font-body text-sm text-primary hover:text-primary/80"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      className="px-8 py-3 bg-primary text-primary-foreground rounded-sm font-body text-sm uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-2"
                    >
                      <Lock size={16} />
                      Place Order
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 4 && (
                <div className="w-full max-w-3xl">
                  <div className="bg-card p-8 rounded-lg shadow-card border border-border text-center mx-auto">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={48} className="text-green-600" />
                    </div>
                    <h2 className="font-display text-3xl text-foreground mb-4">Order Placed Successfully!</h2>
                    <p className="font-body text-muted-foreground mb-6">
                      Thank you for your purchase. Your order has been confirmed and will be delivered soon.
                    </p>
                    <div className="bg-muted p-4 rounded-lg mb-6">
                      <p className="font-body text-sm text-muted-foreground mb-2">Order ID</p>
                      <p className="font-display text-2xl font-bold text-primary">
                        DS{Date.now().toString().slice(-8)}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link
                        to="/account"
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-sm font-body text-sm uppercase tracking-wider hover:bg-primary/90 transition-all"
                      >
                        View Orders
                      </Link>
                      <Link
                        to="/"
                        className="px-6 py-3 border-2 border-border hover:border-primary rounded-sm font-body text-sm uppercase tracking-wider transition-all"
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            {currentStep < 4 && (
              <div className="lg:col-span-1">
                <div className="bg-card p-6 rounded-lg shadow-card border border-border sticky top-24">
                  <h3 className="font-display text-xl text-foreground mb-4">Order Summary</h3>

                  <div className="space-y-3 mb-6 pb-6 border-b border-border">
                    {cartItems.map((item) => (
                      <div key={item.productId} className="flex gap-3">
                        <img
                          src={item.images}
                          alt={item.name}
                          className="w-16 h-20 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm text-foreground line-clamp-2">{item.name}</p>
                          <p className="font-body text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          <p className="font-body text-sm font-semibold text-primary">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 mb-6 pb-6 border-b border-border">
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-foreground">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                    </div>
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-muted-foreground">Tax (5%)</span>
                      <span className="text-foreground">{formatPrice(tax)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <span className="font-display text-xl text-foreground">Total</span>
                    <span className="font-display text-2xl font-bold text-primary">{formatPrice(total)}</span>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-muted rounded-sm">
                    <Lock size={16} className="text-muted-foreground" />
                    <p className="font-body text-xs text-muted-foreground">Secure SSL Encrypted Payment</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Address Selector Modal */}
      {showAddressSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-display text-2xl text-foreground">Select Delivery Address</h2>
              <button
                onClick={() => setShowAddressSelector(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  onClick={() => handleSelectAddress(address)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedAddress?.id === address.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-body font-semibold text-foreground">{address.type}</h3>
                      {address.isDefault && (
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-sm">
                          Default
                        </span>
                      )}
                    </div>
                    {selectedAddress?.id === address.id && (
                      <CheckCircle size={20} className="text-primary" />
                    )}
                  </div>
                  <p className="font-body text-sm text-foreground">{address.name}</p>
                  <p className="font-body text-sm text-muted-foreground">{address.address}</p>
                  <p className="font-body text-sm text-muted-foreground">
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                  <p className="font-body text-sm text-muted-foreground">{address.phone}</p>
                </div>
              ))}

              <button
                onClick={handleUseNewAddress}
                className="w-full p-4 border-2 border-dashed border-border hover:border-primary rounded-lg transition-all flex items-center justify-center gap-2 text-primary hover:bg-primary/5"
              >
                <Plus size={20} />
                <span className="font-body font-medium">Add New Address</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
