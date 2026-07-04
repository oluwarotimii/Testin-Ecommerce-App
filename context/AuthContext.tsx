import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DummyApiService from '@/services/dummyApiService';
import WordPressApiService from '@/services/wordpressApiService';
import { API_SERVICE_TYPE, WORDPRESS_URL } from '@/services/config';
import Constants from 'expo-constants';
import notificationService, { updatePushTokenForUser } from '@/services/notificationService';

// Configuration for API service type - using centralized config
const { expoPublicApiServiceType, expoPublicWordpressUrl, expoPublicWordpressConsumerKey, expoPublicWordpressConsumerSecret } = Constants.expoConfig?.extra || {};

// WordPress configuration - using centralized config with direct fallbacks for credentials only
const WORDPRESS_CONFIG = {
  url: WORDPRESS_URL, // Single source of truth from centralized config
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
  register: (firstname: string, lastname: string, email: string, telephone: string, password: string, referralCode?: string) => Promise<any>;
  signOut: () => Promise<any>;
  getProducts: (params?: Record<string, any>) => Promise<any>;
  getProduct: (product_id: number) => Promise<any>;
  searchProducts: (search: string, page?: number, limit?: number) => Promise<any>;
  searchProductsExtended: (search: string, page?: number, limit?: number) => Promise<any>;
  getProductBySlug: (slug: string) => Promise<any>;
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
  updateOrder: (order_id: number, orderData: Record<string, any>) => Promise<any>;
  getOrders: () => Promise<any>;
  getOrderInfo: (order_id: number) => Promise<any>;
  cancelOrder: (order_id: number) => Promise<any>;
  getAccountDetails: () => Promise<any>;
  updateAccountDetails: (details: Record<string, any>) => Promise<any>;
  getAddressBook: () => Promise<any>;
  getCarouselItems: () => Promise<any>;
  getCouponByCode?: (code: string) => Promise<any>;
  updatePushToken: (token: string) => Promise<any>;
  setSessionToken: (token: string | null) => void;
  validateToken?: (token: string) => Promise<boolean>;
  updateCustomerAddress?: (addressData: any) => Promise<any>;
  deleteAccount: (userId: number) => Promise<any>;
}

interface AuthContextType {
  sessionToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (firstname: string, lastname: string, email: string, telephone: string, password: string, referralCode?: string) => Promise<boolean>;
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
          apiService.setSessionToken(storedToken);

          // Check 6-month expiry from stored login timestamp
          const loginTimestamp = await AsyncStorage.getItem('loginTimestamp');
          const sixMonthsMs = 6 * 30 * 24 * 60 * 60 * 1000;
          const tokenAge = loginTimestamp ? Date.now() - parseInt(loginTimestamp, 10) : 0;

          if (loginTimestamp && tokenAge > sixMonthsMs) {
            console.log('Session expired (6 months), clearing');
            await AsyncStorage.removeItem('sessionToken');
            await AsyncStorage.removeItem('customerId');
            await AsyncStorage.removeItem('loginTimestamp');
            setSessionToken(null);
            setIsAuthenticated(false);
            setUser(null);
            apiService.setSessionToken(null);
          } else {
            setSessionToken(storedToken);
            setIsAuthenticated(true);

            // Try to load user details - don't clear session if it fails
            try {
              if (apiService.getAccountDetails) {
                const userDetails = await apiService.getAccountDetails();
                setUser(userDetails);
              }
            } catch (userError) {
              console.warn("Could not fetch user details, session preserved:", userError);
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
        await AsyncStorage.setItem('loginTimestamp', Date.now().toString());
        setSessionToken(token);
        setIsAuthenticated(true);

        // Update API service with new token
        apiService.setSessionToken(token);

        // Fetch and set user details - do this after setting the session to return early
        const fetchUserDetails = async () => {
          try {
            if (apiService.getAccountDetails) {
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
        };

        // Call fetchUserDetails asynchronously so login completes immediately
        fetchUserDetails();

        return true;
      } else {
        throw new Error('Login failed: No token received from server');
      }
    } catch (error) {
      // Re-throw the error so the login screen can show appropriate message
      throw error;
    } finally {
      setLoadingAuth(false);
    }
  };

  const register = async (firstname: string, lastname: string, email: string, telephone: string, password: string, referralCode?: string): Promise<boolean> => {
    setLoadingAuth(true);
    try {
      const response = await apiService.register(firstname, lastname, email, telephone, password, referralCode);
      if (response.token) {
        const token = response.token;
        await AsyncStorage.setItem('sessionToken', token);
        await AsyncStorage.setItem('loginTimestamp', Date.now().toString());
        setSessionToken(token);
        setIsAuthenticated(true);

        // Update API service with new token
        apiService.setSessionToken(token);

        // Fetch and set user details - do this after setting the session to return early
        const fetchUserDetails = async () => {
          try {
            if (apiService.getAccountDetails) {
              const userDetails = await apiService.getAccountDetails();
              setUser(userDetails);
            }
          } catch (e) {
            console.error("Error fetching user details after registration:", e);
          }

          // After successful registration, register the push token if available
          try {
            const pushToken = await AsyncStorage.getItem('pushToken');
            if (pushToken && apiService.updatePushToken) {
              await updatePushTokenForUser(apiService, pushToken);
            }
          } catch (pushTokenError) {
            console.error("Error registering push token after registration:", pushTokenError);
          }
        };

        // Call fetchUserDetails asynchronously so registration completes immediately
        fetchUserDetails();

        return true;
      } else {
        throw new Error('Registration failed: No token received from server');
      }
    } catch (error) {
      // Re-throw the error so the registration screen can show appropriate message
      throw error;
    } finally {
      setLoadingAuth(false);
    }
  };

  const signOut = async () => {
    try {
      await apiService.signOut();
      await AsyncStorage.removeItem('sessionToken');
      await AsyncStorage.removeItem('customerId');
      await AsyncStorage.removeItem('pushToken');
      await AsyncStorage.removeItem('loginTimestamp');
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
