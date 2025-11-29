import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DummyApiService from '@/services/dummyApiService';
import WordPressApiService from '@/services/wordpressApiService';

// Configuration for API service type
const API_SERVICE_TYPE = process.env.EXPO_PUBLIC_API_SERVICE_TYPE || 'dummy'; // 'dummy' or 'wordpress'

// WordPress configuration - these would typically come from environment variables
const WORDPRESS_CONFIG = {
  url: process.env.EXPO_PUBLIC_WORDPRESS_URL || 'https://yoursite.com',
  consumerKey: process.env.EXPO_PUBLIC_WORDPRESS_CONSUMER_KEY || '',
  consumerSecret: process.env.EXPO_PUBLIC_WORDPRESS_CONSUMER_SECRET || '',
};

interface ApiService {
  sessionToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (firstname: string, lastname: string, email: string, telephone: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  getProducts: (params?: Record<string, any>) => Promise<any>;
  getProduct: (product_id: number) => Promise<any>;
  searchProducts: (search: string, page?: number, limit?: number) => Promise<any>;
  getCategories: (params?: any) => Promise<any>;
  getCategory: (category_id: number | string) => Promise<any>;
  getCartContents: () => Promise<any>;
  addToCart: (product_id: number, quantity?: number) => Promise<any>;
  updateCart: (cart_id: number, quantity: number) => Promise<any>;
  removeFromCart: (key: number) => Promise<any>;
  getWishlist: () => Promise<any>;
  addToWishlist: (product_id: number) => Promise<any>;
  removeFromWishlist: (product_id: number) => Promise<any>;
  getPaymentMethods: () => Promise<any>;
  getShippingMethods: () => Promise<any>;
  createOrder: (orderData: any) => Promise<any>;
  getOrders: () => Promise<any>;
  getOrderInfo: (order_id: number) => Promise<any>;
  getAccountDetails: () => Promise<any>;
  updateAccountDetails: (details: Record<string, any>) => Promise<any>;
  getAddressBook: () => Promise<any>;
  getCarouselItems: () => Promise<any>;
  updatePushToken: (token: string) => Promise<any>;
  setSessionToken: (token: string | null) => void;
  validateToken?: (token: string) => Promise<boolean>;
  updateCustomerAddress?: (addressData: any) => Promise<any>;
}

interface AuthContextType {
  sessionToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (firstname: string, lastname: string, email: string, telephone: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  loadingAuth: boolean;
  apiService: ApiService;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Initialize the appropriate API service based on configuration
  const apiService = useMemo(() => {
    if (API_SERVICE_TYPE === 'wordpress') {
      return new WordPressApiService(
        WORDPRESS_CONFIG.url,
        WORDPRESS_CONFIG.consumerKey,
        WORDPRESS_CONFIG.consumerSecret,
        sessionToken
      );
    } else {
      return new DummyApiService(sessionToken);
    }
  }, [sessionToken]);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('sessionToken');
        if (storedToken) {
          // Validate token if service supports it
          if (apiService.validateToken) {
            const isValid = await apiService.validateToken(storedToken);
            if (isValid) {
              setSessionToken(storedToken);
              setIsAuthenticated(true);

              // Fetch user details
              try {
                const customerId = await AsyncStorage.getItem('customerId');
                if (customerId) {
                  // We need to fetch the user details to get the name
                  // This assumes apiService has a method to get user details by ID or current session
                  if (apiService.getAccountDetails) {
                    const userDetails = await apiService.getAccountDetails();
                    setUser(userDetails);
                  }
                }
              } catch (userError) {
                console.error("Error fetching user details:", userError);
              }

            } else {
              // Token invalid, clear it
              console.log('Stored token is invalid, clearing session');
              await AsyncStorage.removeItem('sessionToken');
              await AsyncStorage.removeItem('customerId');
              setSessionToken(null);
              setIsAuthenticated(false);
              setUser(null);
            }
          } else {
            // Fallback for services without validation (e.g. dummy)
            setSessionToken(storedToken);
            setIsAuthenticated(true);
            // Fetch user details for services without validation
            try {
              if (apiService.getAccountDetails) {
                const userDetails = await apiService.getAccountDetails();
                setUser(userDetails);
              }
            } catch (userError) {
              console.error("Error fetching user details for non-validating service:", userError);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load session token:", error);
      } finally {
        setLoadingAuth(false);
      }
    };
    loadSession();
  }, [apiService]);

  useEffect(() => {
    if (apiService) {
      apiService.setSessionToken(sessionToken);
    }
  }, [sessionToken, apiService]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login(email, password);
      if (response.token) {
        const token = response.token;
        await AsyncStorage.setItem('sessionToken', token);
        setSessionToken(token);
        setIsAuthenticated(true);

        // Fetch and set user details immediately after login
        try {
          if (apiService.getAccountDetails) {
            // We need to wait a bit for the token to be propagated or explicitly pass it if needed
            // But apiService.setSessionToken might be triggered by the effect. 
            // To be safe, we can manually set it on the service instance if possible, 
            // or just wait for the effect. 
            // Actually, the apiService instance is stable. We can just call getAccountDetails after a small delay or assume the effect runs fast.
            // Let's try fetching.

            // Note: We need to ensure the service has the token. 
            // The useEffect [sessionToken, apiService] will run.
            // But we want to return from this function with the user logged in.

            // Let's just set the user to a temporary object if we have the data, or fetch it.
            // The login response might contain user info?
            if (response.user_email) {
              // It's a partial user.
            }

            // We will let the UI trigger a fetch or do it here.
            // Let's try to fetch it.
            apiService.setSessionToken(token); // Force update service immediately
            const userDetails = await apiService.getAccountDetails();
            setUser(userDetails);
          }
        } catch (e) {
          console.error("Error fetching user details after login:", e);
        }

        return true;
      } else {
        console.error("Login failed:", response);
        return false;
      }
    } catch (error) {
      console.error("Login API error:", error);
      return false;
    }
  };

  const register = async (firstname: string, lastname: string, email: string, telephone: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.register(firstname, lastname, email, telephone, password);
      if (response.token) {
        const token = response.token;
        await AsyncStorage.setItem('sessionToken', token);
        setSessionToken(token);
        setIsAuthenticated(true);
        return true;
      } else {
        console.error("Registration failed:", response);
        return false;
      }
    } catch (error) {
      console.error("Registration API error:", error);
      return false;
    }
  };

  const signOut = async () => {
    try {
      await apiService.signOut();
      await AsyncStorage.removeItem('sessionToken');
      await AsyncStorage.removeItem('customerId');
      setSessionToken(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ sessionToken, isAuthenticated, login, register, signOut, loadingAuth, apiService }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};