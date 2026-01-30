import { createContext, useContext, useState, useEffect } from 'react';
import { userAPI } from '@/services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user and token on mount
    const storedUser = localStorage.getItem('divyashree_user');
    const storedToken = localStorage.getItem('divyashree_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      // Optionally verify token by fetching profile
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await userAPI.getProfile();
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('divyashree_user', JSON.stringify(response.data));
        window.dispatchEvent(new Event('userLoggedIn'));
      } else {
        // Token invalid, clear storage
        localStorage.removeItem('divyashree_user');
        localStorage.removeItem('divyashree_token');
        setUser(null);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('divyashree_user');
      localStorage.removeItem('divyashree_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await userAPI.login(email, password);
      
      if (response.success) {
        const { user, token } = response.data;
        localStorage.setItem('divyashree_user', JSON.stringify(user));
        localStorage.setItem('divyashree_token', token);
        setUser(user);
        // Dispatch event to notify other components
        window.dispatchEvent(new Event('userLoggedIn'));
        return { success: true };
      } else if (response.requiresVerification) {
        // Return verification requirement info
        return {
          success: false,
          requiresVerification: true,
          userId: response.userId,
          message: response.message
        };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const signup = async (firstName, lastName, email, password, phone = '') => {
    try {
      const response = await userAPI.register({ firstName, lastName, email, password, phone });
      
      if (response.success) {
        // Registration successful, return data for OTP verification
        return {
          success: true,
          data: response.data // Contains userId, email, phone, requiresPhoneVerification
        };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Signup failed. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('divyashree_user');
    localStorage.removeItem('divyashree_token');
    setUser(null);
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('userLoggedOut'));
  };

  const refreshUser = async () => {
    try {
      const response = await userAPI.getProfile();
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('divyashree_user', JSON.stringify(response.data));
        return response.data;
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
