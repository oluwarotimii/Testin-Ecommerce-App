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

  // OPTIMIZED: Load cart count only once on mount, not every time apiService changes
  useEffect(() => {
    let isMounted = true;

    const loadCartCount = async () => {
      if (apiService && isMounted) {
        try {
          const cartResponse = await apiService.getCartContents();
          if (cartResponse && cartResponse.products && isMounted) {
            const count = cartResponse.products.reduce((total: any, item: any) => total + item.quantity, 0);
            setCartCount(count);
          }
        } catch (error) {
          console.error('Error loading cart count:', error);
          if (isMounted) {
            setCartCount(0);
          }
        }
      } else if (!apiService && isMounted) {
        setCartCount(0);
      }
    };

    loadCartCount();

    return () => {
      isMounted = false;
    };
  }, []); // OPTIMIZED: Run only once on mount

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