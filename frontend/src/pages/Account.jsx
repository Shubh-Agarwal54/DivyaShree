import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, MapPin, Heart, LogOut, Edit2, ChevronRight, Plus, X, Trash2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useAddress } from '@/context/AddressContext';
import { orderAPI } from '@/services/api';
import { toast } from 'sonner';

const Account = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const { user, logout, refreshUser } = useAuth();
  const { addresses, addAddress, updateAddress, removeAddress, setDefaultAddress, fetchAddresses } = useAddress();

  const [addressForm, setAddressForm] = useState({
    type: 'Home',
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
  });

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      // Refresh data when user is available
      fetchAddresses();
      if (activeTab === 'orders') {
        fetchOrders();
      }
    }
  }, [user, navigate]);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders' && user) {
      fetchOrders();
    }
  }, [activeTab, user]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await orderAPI.getUserOrders();
      if (response.success) {
        setOrders(response.data || []);
      } else {
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  // Use real user data from auth context
  const userData = {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '',
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'text-yellow-600',
      confirmed: 'text-blue-600',
      processing: 'text-purple-600',
      shipped: 'text-blue-600',
      delivered: 'text-green-600',
      cancelled: 'text-red-600',
    };
    return statusColors[status] || 'text-gray-600';
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openAddressModal = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({ ...address });
    } else {
      setEditingAddress(null);
      setAddressForm({
        type: 'Home',
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
      });
    }
    setShowAddressModal(true);
  };

  const closeAddressModal = () => {
    setShowAddressModal(false);
    setEditingAddress(null);
    setAddressForm({
      type: 'Home',
      name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
    });
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (editingAddress) {
      await updateAddress(editingAddress.id, addressForm);
    } else {
      await addAddress(addressForm);
    }
    closeAddressModal();
  };

  const handleRemoveAddress = async (id) => {
    if (window.confirm('Are you sure you want to remove this address?')) {
      await removeAddress(id);
    }
  };

  const openProfileEditModal = () => {
    setProfileForm({
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
    });
    setShowProfileEditModal(true);
  };

  const closeProfileEditModal = () => {
    setShowProfileEditModal(false);
    setProfileForm({
      firstName: '',
      lastName: '',
      phone: '',
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('divyashree_token')}`,
        },
        body: JSON.stringify(profileForm),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Profile updated successfully');
        await refreshUser(); // Refresh user data
        closeProfileEditModal();
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (!user) {
    return null; // or loading spinner
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-4 sm:py-8 md:py-12">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Page Header */}
          <div className="mb-4 sm:mb-8">
            <h1 className="font-display text-2xl sm:text-3xl md:text-5xl text-foreground mb-2">My Account</h1>
            <p className="font-body text-sm sm:text-base text-muted-foreground">Welcome back, {userData.firstName}!</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-4 sm:gap-8 acc-mar">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card p-4 sm:p-6 rounded-lg shadow-card border border-border sticky top-24">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 pb-6 border-b border-border">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={24} className="text-primary sm:hidden" />
                    <User size={32} className="text-primary hidden sm:block" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-body font-semibold text-foreground text-sm sm:text-base truncate">
                      {userData.firstName} {userData.lastName}
                    </h3>
                    <p className="font-body text-xs sm:text-sm text-muted-foreground truncate break-all">{userData.email}</p>
                  </div>
                </div>

                <nav className="space-y-1 sm:space-y-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-sm font-body text-xs sm:text-sm transition-all ${
                      activeTab === 'profile'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <User size={16} className="sm:hidden" />
                    <User size={18} className="hidden sm:block" />
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-sm font-body text-xs sm:text-sm transition-all ${
                      activeTab === 'orders'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Package size={16} className="sm:hidden" />
                    <Package size={18} className="hidden sm:block" />
                    Orders
                  </button>
                  <button
                    onClick={() => setActiveTab('addresses')}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-sm font-body text-xs sm:text-sm transition-all ${
                      activeTab === 'addresses'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <MapPin size={16} className="sm:hidden" />
                    <MapPin size={18} className="hidden sm:block" />
                    Addresses
                  </button>
                  <Link
                    to="/wishlist"
                    className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-sm font-body text-xs sm:text-sm text-foreground hover:bg-muted transition-all"
                  >
                    <Heart size={16} className="sm:hidden" />
                    <Heart size={18} className="hidden sm:block" />
                    Wishlist
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-sm font-body text-xs sm:text-sm text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <LogOut size={16} className="sm:hidden" />
                    <LogOut size={18} className="hidden sm:block" />
                    Logout
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="bg-card p-4 sm:p-6 md:p-8 rounded-lg shadow-card border border-border">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="font-display text-2xl text-foreground">Profile Information</h2>
                    <button 
                      onClick={openProfileEditModal}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all rounded-sm font-body text-sm"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-body text-sm font-medium text-muted-foreground mb-2">
                          First Name
                        </label>
                        <p className="font-body text-foreground">{userData.firstName}</p>
                      </div>
                      <div>
                        <label className="block font-body text-sm font-medium text-muted-foreground mb-2">
                          Last Name
                        </label>
                        <p className="font-body text-foreground">{userData.lastName}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block font-body text-sm font-medium text-muted-foreground mb-2">
                        Email Address
                      </label>
                      <p className="font-body text-foreground">{userData.email}</p>
                    </div>

                    <div>
                      <label className="block font-body text-sm font-medium text-muted-foreground mb-2">
                        Phone Number
                      </label>
                      <p className="font-body text-foreground">{userData.phone}</p>
                    </div>

                    <div>
                      <label className="block font-body text-sm font-medium text-muted-foreground mb-2">
                        Member Since
                      </label>
                      <p className="font-body text-foreground">{userData.joinDate}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-2xl text-foreground">My Orders</h2>
                    <p className="font-body text-sm text-muted-foreground">{orders.length} Orders</p>
                  </div>

                  {loadingOrders ? (
                    <div className="bg-card p-12 rounded-lg shadow-card border border-border text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="font-body text-muted-foreground">Loading orders...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="bg-card p-12 rounded-lg shadow-card border border-border text-center">
                      <Package size={48} className="mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-body font-semibold text-foreground mb-2">No Orders Yet</h3>
                      <p className="font-body text-sm text-muted-foreground mb-4">
                        Start shopping to see your orders here
                      </p>
                      <Link
                        to="/"
                        className="inline-block px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-sm font-body text-sm"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div
                        key={order._id}
                        className="bg-card p-6 rounded-lg shadow-card border border-border hover:shadow-hover transition-all"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                          <div>
                            <h3 className="font-body font-semibold text-foreground mb-1">Order #{order.orderNumber}</h3>
                            <p className="font-body text-sm text-muted-foreground">
                              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-body text-sm font-semibold ${getStatusColor(order.status)} mb-1`}>
                              {formatStatus(order.status)}
                            </p>
                            <p className="font-body text-sm text-muted-foreground">
                              {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="font-display text-xl font-bold text-primary">{formatPrice(order.total)}</div>
                          <button className="flex items-center gap-2 px-4 py-2 border-2 border-border hover:border-primary transition-all rounded-sm font-body text-sm">
                            View Details
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-2xl text-foreground">Saved Addresses</h2>
                    <button 
                      onClick={() => openAddressModal()}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-sm font-body text-sm"
                    >
                      <Plus size={18} />
                      Add New Address
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="bg-card p-12 rounded-lg shadow-card border border-border text-center">
                      <MapPin size={48} className="mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-body font-semibold text-foreground mb-2">No Addresses Saved</h3>
                      <p className="font-body text-sm text-muted-foreground mb-4">
                        Add your first address to make checkout faster
                      </p>
                      <button 
                        onClick={() => openAddressModal()}
                        className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-sm font-body text-sm"
                      >
                        Add Address
                      </button>
                    </div>
                  ) : (
                    addresses.map((address) => (
                      <div
                        key={address.id}
                        className="bg-card p-6 rounded-lg shadow-card border border-border hover:shadow-hover transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <h3 className="font-body font-semibold text-foreground">{address.type}</h3>
                            {address.isDefault && (
                              <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-body rounded-sm">
                                Default
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={() => openAddressModal(address)}
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <p className="font-body text-foreground font-medium">{address.name}</p>
                          <p className="font-body text-sm text-muted-foreground">{address.address}</p>
                          <p className="font-body text-sm text-muted-foreground">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          <p className="font-body text-sm text-muted-foreground">Phone: {address.phone}</p>
                        </div>

                        <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                          {!address.isDefault && (
                            <button 
                              onClick={() => setDefaultAddress(address.id)}
                              className="font-body text-sm text-primary hover:text-primary/80 transition-colors"
                            >
                              Set as Default
                            </button>
                          )}
                          <button 
                            onClick={() => handleRemoveAddress(address.id)}
                            className="font-body text-sm text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-display text-2xl text-foreground">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button 
                onClick={closeAddressModal}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="p-6 space-y-4">
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-2">
                  Address Type
                </label>
                <div className="flex gap-4">
                  {['Home', 'Office', 'Other'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAddressForm({ ...addressForm, type })}
                      className={`px-4 py-2 rounded-sm font-body text-sm transition-all ${
                        addressForm.type === type
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.name}
                  onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-border rounded-sm font-body text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-2">
                  Address *
                </label>
                <textarea
                  required
                  rows="3"
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-border rounded-sm font-body text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="House No, Building Name, Street, Area"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-sm font-medium text-foreground mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-border rounded-sm font-body text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block font-body text-sm font-medium text-foreground mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-border rounded-sm font-body text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-sm font-medium text-foreground mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    pattern="\d{6}"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-border rounded-sm font-body text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="000000"
                  />
                </div>

                <div>
                  <label className="block font-body text-sm font-medium text-foreground mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="\+?[\d\s-]+"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-border rounded-sm font-body text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="+91 00000 00000"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-sm font-body text-sm uppercase tracking-wider"
                >
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </button>
                <button
                  type="button"
                  onClick={closeAddressModal}
                  className="px-6 py-3 border-2 border-border hover:border-primary transition-all rounded-sm font-body text-sm uppercase tracking-wider"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-display text-2xl text-foreground">Edit Profile</h2>
              <button 
                onClick={closeProfileEditModal}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-border rounded-sm font-body text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-border rounded-sm font-body text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="Enter last name"
                />
              </div>

              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-border rounded-sm font-body text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="+91 00000 00000"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-sm font-body text-sm uppercase tracking-wider"
                >
                  Update Profile
                </button>
                <button
                  type="button"
                  onClick={closeProfileEditModal}
                  className="px-6 py-3 border-2 border-border hover:border-primary transition-all rounded-sm font-body text-sm uppercase tracking-wider"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Account;
