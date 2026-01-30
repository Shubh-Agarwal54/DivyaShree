import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to get current user ID
  const getCurrentUserId = () => {
    const storedUser = localStorage.getItem('divyashree_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return user._id || user.id || null;
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  };

  // Function to load cart for specific user
  const loadCartForUser = (newUserId) => {
    const cartKey = newUserId ? `cart_${newUserId}` : 'cart_guest';
    const savedCart = localStorage.getItem(cartKey);
    
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  };

  // Initialize and listen for user changes
  useEffect(() => {
    const currentUserId = getCurrentUserId();
    setUserId(currentUserId);
    loadCartForUser(currentUserId);
    setIsInitialized(true);

    // Listen for storage changes (login/logout from another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'divyashree_user') {
        const newUserId = getCurrentUserId();
        if (newUserId !== userId) {
          setUserId(newUserId);
          loadCartForUser(newUserId);
        }
      }
    };

    // Listen for custom login/logout events
    const handleAuthChange = () => {
      const newUserId = getCurrentUserId();
      if (newUserId !== userId) {
        setUserId(newUserId);
        loadCartForUser(newUserId);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLoggedIn', handleAuthChange);
    window.addEventListener('userLoggedOut', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleAuthChange);
      window.removeEventListener('userLoggedOut', handleAuthChange);
    };
  }, []);

  // Check for user changes periodically (in case events are missed)
  useEffect(() => {
    if (!isInitialized) return;

    const checkUserChange = setInterval(() => {
      const currentUserId = getCurrentUserId();
      if (currentUserId !== userId) {
        setUserId(currentUserId);
        loadCartForUser(currentUserId);
      }
    }, 1000); // Check every second

    return () => clearInterval(checkUserChange);
  }, [userId, isInitialized]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length >= 0) {
      const cartKey = userId ? `cart_${userId}` : 'cart_guest';
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    }
  }, [cartItems, userId]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        // If product exists, add the new quantity to existing quantity
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      }
      // If new product, add it with its quantity (default to 1 if not provided)
      return [...prevItems, { ...product, quantity: product.quantity || 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    const cartKey = userId ? `cart_${userId}` : 'cart_guest';
    localStorage.removeItem(cartKey);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
