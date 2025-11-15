import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface CartContextType {
  cartCount: number;
  setCartCount: React.Dispatch<React.SetStateAction<number>>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const { apiService, isAuthenticated } = useAuth();

  // Load cart count when user authenticates
  useEffect(() => {
    const loadCartCount = async () => {
      if (isAuthenticated && apiService) {
        try {
          const cartResponse = await apiService.getCartContents();
          if (cartResponse && cartResponse.products) {
            const count = cartResponse.products.reduce((total: any, item: any) => total + item.quantity, 0);
            setCartCount(count);
          }
        } catch (error) {
          console.error('Error loading cart count:', error);
          setCartCount(0);
        }
      } else {
        setCartCount(0); // Reset cart count when user logs out
      }
    };

    loadCartCount();
  }, [isAuthenticated, apiService]);

  return (
    <CartContext.Provider value={{ cartCount, setCartCount }}>
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