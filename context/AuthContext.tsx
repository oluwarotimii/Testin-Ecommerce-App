import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DummyApiService from '@/services/dummyApiService';
import WordPressApiService from '@/services/wordpressApiService';
import Constants from 'expo-constants';
import notificationService, { updatePushTokenForUser } from '@/services/notificationService';

// Configuration for API service type - using values from app.json extra section
const { expoPublicApiServiceType, expoPublicWordpressUrl, expoPublicWordpressConsumerKey, expoPublicWordpressConsumerSecret } = Constants.expoConfig?.extra || {};

// Fallback for when Constants.expoConfig?.extra is not available (e.g., during development builds)
// Try using process.env for development scenarios
const API_SERVICE_TYPE = expoPublicApiServiceType || process.env.EXPO_PUBLIC_API_SERVICE_TYPE || 'wordpress'; // 'dummy' or 'wordpress' - default to wordpress if not set

// WordPress configuration - using values from app.json extra section with fallbacks
const WORDPRESS_CONFIG = {
  url: expoPublicWordpressUrl || process.env.EXPO_PUBLIC_WORDPRESS_URL || 'https://femtech.ng/',
  consumerKey: expoPublicWordpressConsumerKey || process.env.EXPO_PUBLIC_WORDPRESS_CONSUMER_KEY || '',
  consumerSecret: expoPublicWordpressConsumerSecret || process.env.EXPO_PUBLIC_WORDPRESS_CONSUMER_SECRET || '',
};

// Log the configuration for debugging
console.log('WordPress API Configuration:', {
  apiServiceType: API_SERVICE_TYPE,
  wordpressUrl: WORDPRESS_CONFIG.url,
  hasConsumerKey: !!WORDPRESS_CONFIG.consumerKey,
  hasConsumerSecret: !!WORDPRESS_CONFIG.consumerSecret,
  consumerKeyLength: WORDPRESS_CONFIG.consumerKey ? WORDPRESS_CONFIG.consumerKey.length : 0,
  consumerSecretLength: WORDPRESS_CONFIG.consumerSecret ? WORDPRESS_CONFIG.consumerSecret.length : 0,
});

// Validate that we have the necessary credentials if using WordPress API
if (API_SERVICE_TYPE === 'wordpress') {
  if (!WORDPRESS_CONFIG.consumerKey || !WORDPRESS_CONFIG.consumerSecret) {
    console.error('WordPress API requires consumer key and secret. Please check your app.json configuration.');
  }
}

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
  addToCart: (product_id: number, quantity?: number, productData?: any) => Promise<any>;
  updateCart: (cart_id: number, quantity: number) => Promise<any>;
  removeFromCart: (key: number) => Promise<any>;
  emptyCart: () => Promise<any>;
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
  user: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Initialize the appropriate API service based on configuration
  const apiService: ApiService = useMemo(() => {
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
    setLoadingAuth(true);
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
            // Force update service immediately
            apiService.setSessionToken(token);
            const userDetails = await apiService.getAccountDetails();
            setUser(userDetails);
          }
        } catch (e) {
          console.error("Error fetching user details after login:", e);
        }

        // After successful login, register the push token if available
        try {
          const pushToken = await AsyncStorage.getItem('pushToken');
          if (pushToken && apiService.updatePushToken) {
            await updatePushTokenForUser(apiService, pushToken);
          }
        } catch (pushTokenError) {
          console.error("Error registering push token after login:", pushTokenError);
        }

        return true;
      } else {
        throw new Error('Login failed: No token received from server');
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  const register = async (firstname: string, lastname: string, email: string, telephone: string, password: string): Promise<boolean> => {
    setLoadingAuth(true);
    try {
      const response = await apiService.register(firstname, lastname, email, telephone, password);
      if (response.token) {
        const token = response.token;
        await AsyncStorage.setItem('sessionToken', token);
        setSessionToken(token);
        setIsAuthenticated(true);

        // After successful registration, register the push token if available
        try {
          const pushToken = await AsyncStorage.getItem('pushToken');
          if (pushToken && apiService.updatePushToken) {
            await updatePushTokenForUser(apiService, pushToken);
          }
        } catch (pushTokenError) {
          console.error("Error registering push token after registration:", pushTokenError);
        }

        return true;
      } else {
        throw new Error('Registration failed: No token received from server');
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  const signOut = async () => {
    try {
      await apiService.signOut();
      await AsyncStorage.removeItem('sessionToken');
      await AsyncStorage.removeItem('customerId');
      await AsyncStorage.removeItem('pushToken'); // Remove push token on logout
      setSessionToken(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ sessionToken, isAuthenticated, login, register, signOut, loadingAuth, apiService, user }}>
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