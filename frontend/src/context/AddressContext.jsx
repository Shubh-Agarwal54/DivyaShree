import { createContext, useContext, useState, useEffect } from 'react';
import { addressAPI } from '@/services/api';
import { toast } from 'sonner';

const AddressContext = createContext();

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within AddressProvider');
  }
  return context;
};

export const AddressProvider = ({ children }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load addresses from backend on mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('divyashree_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await addressAPI.getAddresses();
      if (response.success) {
        // Map _id to id for frontend compatibility
        const mappedAddresses = response.data.map(addr => ({
          ...addr,
          id: addr._id,
        }));
        setAddresses(mappedAddresses);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (newAddress) => {
    try {
      const response = await addressAPI.addAddress(newAddress);
      if (response.success) {
        toast.success('Address added successfully');
        await fetchAddresses(); // Refresh addresses
        return { ...response.data, id: response.data._id };
      } else {
        toast.error(response.message || 'Failed to add address');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    }
  };

  const updateAddress = async (id, updatedAddress) => {
    try {
      const response = await addressAPI.updateAddress(id, updatedAddress);
      if (response.success) {
        toast.success('Address updated successfully');
        await fetchAddresses(); // Refresh addresses
      } else {
        toast.error(response.message || 'Failed to update address');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address');
    }
  };

  const removeAddress = async (id) => {
    try {
      const response = await addressAPI.deleteAddress(id);
      if (response.success) {
        toast.success('Address removed successfully');
        await fetchAddresses(); // Refresh addresses
      } else {
        toast.error(response.message || 'Failed to remove address');
      }
    } catch (error) {
      console.error('Error removing address:', error);
      toast.error('Failed to remove address');
    }
  };

  const setDefaultAddress = async (id) => {
    try {
      const response = await addressAPI.setDefaultAddress(id);
      if (response.success) {
        toast.success('Default address updated');
        await fetchAddresses(); // Refresh addresses
      } else {
        toast.error(response.message || 'Failed to set default address');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to set default address');
    }
  };

  const getDefaultAddress = () => {
    return addresses.find(addr => addr.isDefault) || addresses[0] || null;
  };

  return (
    <AddressContext.Provider
      value={{
        addresses,
        loading,
        addAddress,
        updateAddress,
        removeAddress,
        setDefaultAddress,
        getDefaultAddress,
        fetchAddresses,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};
