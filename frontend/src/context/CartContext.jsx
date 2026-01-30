import React, { createContext, useState, useEffect, useContext } from 'react';
import { cartAPI } from '@/services/api';
import { useAuth } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Load cart from database for authenticated users, localStorage for guests
  const loadCartForUser = async () => {
    setLoading(true);
    try {
      if (isAuthenticated && user) {
        // Load from database for logged-in users
        const response = await cartAPI.getCart();
        if (response.success) {
          const dbCart = response.data || [];
          // Transform DB cart format to match frontend format
          const formattedCart = dbCart.map(item => ({
            productId: item.product._id || item.product,
            name: item.product.name,
            price: item.product.price,
            image: item.product.image,
            images: item.product.images,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            product: item.product
          }));
          setCartItems(formattedCart);
          // Sync to localStorage
          localStorage.setItem(`cart_${user._id}`, JSON.stringify(formattedCart));
        }
      } else {
        // Load from localStorage for guests
        const guestCart = JSON.parse(localStorage.getItem('cart_guest') || '[]');
        setCartItems(guestCart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      // Fallback to localStorage on error
      const storageKey = user ? `cart_${user._id}` : 'cart_guest';
      const localCart = JSON.parse(localStorage.getItem(storageKey) || '[]');
      setCartItems(localCart);
    } finally {
      setLoading(false);
    }
  };

  // Load cart on mount and when user changes
  useEffect(() => {
    loadCartForUser();
  }, [user?._id]); // Only re-run when user ID changes

  // Listen for login events to sync cart
  useEffect(() => {
    const handleUserLogin = async () => {
      await syncLocalCartToDatabase();
      await loadCartForUser();
    };

    window.addEventListener('userLoggedIn', handleUserLogin);
    
    return () => {
      window.removeEventListener('userLoggedIn', handleUserLogin);
    };
  }, []);

  // Sync localStorage cart to database on login
  const syncLocalCartToDatabase = async () => {
    if (!isAuthenticated || !user) return;

    try {
      const guestCart = JSON.parse(localStorage.getItem('cart_guest') || '[]');
      if (guestCart.length > 0) {
        // Transform to backend format
        const itemsToSync = guestCart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        }));

        await cartAPI.syncCart(itemsToSync);
        
        // Clear guest cart after sync
        localStorage.removeItem('cart_guest');
        
        // Reload cart from database
        await loadCartForUser();
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  };

  // Add product to cart
  const addToCart = async (product) => {
    try {
      const existingItem = cartItems.find(
        item => 
          item.productId === product._id && 
          item.size === product.size && 
          item.color === product.color
      );

      let updatedCart;
      if (existingItem) {
        updatedCart = cartItems.map(item =>
          item.productId === product._id && 
          item.size === product.size && 
          item.color === product.color
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      } else {
        const newItem = {
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image || product.images?.[0],
          images: product.images,
          quantity: product.quantity || 1,
          size: product.size,
          color: product.color,
          product: product
        };
        updatedCart = [...cartItems, newItem];
      }

      setCartItems(updatedCart);

      // Save to appropriate storage
      if (isAuthenticated && user) {
        // Save to database
        await cartAPI.addToCart(
          product._id,
          product.quantity || 1,
          product.size,
          product.color
        );
        // Also save to localStorage as backup
        localStorage.setItem(`cart_${user._id}`, JSON.stringify(updatedCart));
      } else {
        // Save to guest localStorage
        localStorage.setItem('cart_guest', JSON.stringify(updatedCart));
      }

      return { success: true };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, error: error.message };
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      const updatedCart = cartItems.filter(item => item.productId !== productId);
      setCartItems(updatedCart);

      // Remove from appropriate storage
      if (isAuthenticated && user) {
        await cartAPI.removeFromCart(productId);
        localStorage.setItem(`cart_${user._id}`, JSON.stringify(updatedCart));
      } else {
        localStorage.setItem('cart_guest', JSON.stringify(updatedCart));
      }

      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, error: error.message };
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      if (quantity <= 0) {
        return await removeFromCart(productId);
      }

      const updatedCart = cartItems.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      );
      setCartItems(updatedCart);

      // Update in appropriate storage
      if (isAuthenticated && user) {
        await cartAPI.updateCartItem(productId, quantity);
        localStorage.setItem(`cart_${user._id}`, JSON.stringify(updatedCart));
      } else {
        localStorage.setItem('cart_guest', JSON.stringify(updatedCart));
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating quantity:', error);
      return { success: false, error: error.message };
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      setCartItems([]);

      // Clear from appropriate storage
      if (isAuthenticated && user) {
        await cartAPI.clearCart();
        localStorage.removeItem(`cart_${user._id}`);
      } else {
        localStorage.removeItem('cart_guest');
      }

      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, error: error.message };
    }
  };

  // Get cart total
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  // Get cart item count
  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    syncLocalCartToDatabase,
    loadCartForUser
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
