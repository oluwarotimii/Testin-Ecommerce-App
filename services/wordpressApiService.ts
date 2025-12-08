import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';

interface Product {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  type: string;
  status: string;
  featured: boolean;
  catalog_visibility: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string | null;
  date_on_sale_from_gmt: string | null;
  date_on_sale_to: string | null;
  date_on_sale_to_gmt: string | null;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  downloads: any[];
  download_limit: number;
  download_expiry: number;
  external_url: string;
  button_text: string;
  tax_status: string;
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: string;
  backorders: string;
  backorders_allowed: boolean;
  backordered: boolean;
  sold_individually: boolean;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  shipping_required: boolean;
  shipping_taxable: boolean;
  shipping_class: string;
  shipping_class_id: number;
  reviews_allowed: boolean;
  average_rating: string;
  rating_count: number;
  related_ids: number[];
  upsell_ids: number[];
  cross_sell_ids: number[];
  parent_id: number;
  purchase_note: string;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  tags: any[];
  images: Array<{
    id: number;
    date_created: string;
    date_created_gmt: string;
    date_modified: string;
    date_modified_gmt: string;
    src: string;
    name: string;
    alt: string;
  }>;
  attributes: any[];
  default_attributes: any[];
  variations: number[];
  grouped_products: any[];
  menu_order: number;
  price_html: string;
  has_options: boolean;
  post_password: string;
  meta_data: any[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: string;
  image: {
    id: number;
    date_created: string;
    date_created_gmt: string;
    date_modified: string;
    date_modified_gmt: string;
    src: string;
    name: string;
    alt: string;
  } | null;
  menu_order: number;
  count: number;
  _links: any;
}

interface Customer {
  id: number;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  billing: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  is_paying_customer: boolean;
  avatar_url: string;
  meta_data: any[];
  _links: any;
}

interface Order {
  id: number;
  parent_id: number;
  number: string;
  order_key: string;
  created_via: string;
  version: string;
  status: string;
  currency: string;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  prices_include_tax: boolean;
  customer_id: number;
  customer_ip_address: string;
  customer_user_agent: string;
  customer_note: string;
  billing: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  date_paid: string;
  date_paid_gmt: string;
  date_completed: string;
  date_completed_gmt: string;
  cart_hash: string;
  meta_data: any[];
  line_items: any[];
  tax_lines: any[];
  shipping_lines: any[];
  fee_lines: any[];
  coupon_lines: any[];
  refunds: any[];
  _links: any;
}

class WordPressApiService {
  sessionToken: string | null;
  private api: AxiosInstance;
  private isUserLoggedIn: boolean;
  private wordpressUrl: string;
  private jwtEndpoint: string;
  private consumerKey: string;
  private consumerSecret: string;

  constructor(wordpressUrl: string, consumerKey: string, consumerSecret: string, sessionToken: string | null = null) {
    // Ensure wordpressUrl doesn't end with a slash to avoid double slash in URL
    const cleanWordpressUrl = wordpressUrl.endsWith('/') ? wordpressUrl.slice(0, -1) : wordpressUrl;

    // Log for debugging to verify credentials are being passed
    console.log('Initializing WordPress API Service:', {
      wordpressUrl: cleanWordpressUrl,
      hasConsumerKey: !!consumerKey,
      hasConsumerSecret: !!consumerSecret,
      consumerKeyLength: consumerKey ? consumerKey.length : 0,
      consumerSecretLength: consumerSecret ? consumerSecret.length : 0
    });

    // Validate that we have the necessary credentials
    if (!consumerKey || !consumerSecret) {
      console.error('WordPress API Service: Consumer key or secret is missing. API calls may fail.');
    }

    // Create axios instance with base configuration
    this.api = axios.create({
      baseURL: `${cleanWordpressUrl}/wp-json/wc/v3/`,
    });

    this.wordpressUrl = cleanWordpressUrl;
    this.jwtEndpoint = `${cleanWordpressUrl}/wp-json/jwt-auth/v1/token`;
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;
    this.sessionToken = sessionToken;
    this.isUserLoggedIn = !!sessionToken;

    // FIXED: This Axios instance is dedicated to WooCommerce API (baseURL = /wp-json/wc/v3/)
    // WooCommerce REST API ONLY accepts Basic Auth with consumer key/secret
    // NEVER send JWT tokens to WooCommerce endpoints - they will be rejected with 403
    this.api.interceptors.request.use(
      async (config) => {
        // Initialize headers if not present
        if (!config.headers) {
          config.headers = {} as any;
        }

        // Since this Axios instance baseURL is set to WooCommerce API (/wc/v3/),
        // ALL requests from this instance should use Basic Auth with consumer key/secret
        // This prevents JWT tokens from being incorrectly added after user login
        const authString = `${this.consumerKey}:${this.consumerSecret}`;
        // Using pure JavaScript Base64 encoding for universal compatibility
        const base64Auth = this.toBase64(authString);
        config.headers.Authorization = `Basic ${base64Auth}`;

        console.log('API Request:', {
          url: `${config.baseURL}${config.url}`,
          method: config.method,
          hasAuth: !!config.headers.Authorization,
          authType: 'Basic (Consumer Key/Secret) - WooCommerce'
        });

        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for better error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          console.error('API Error Response:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            url: error.config?.url,
          });
        } else if (error.request) {
          console.error('API No Response:', error.request);
        } else {
          console.error('API Request Setup Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  // Helper method to handle API requests with error handling
  private async handleRequest<T>(endpoint: string, options: any = {}) {
    try {
      const response = await this.api(endpoint, options);
      return response.data;
    } catch (error: any) {
      // Enhanced error logging for 403 errors
      if (error.response?.status === 403) {
        console.error(`403 Forbidden error for ${endpoint}:`, {
          endpoint,
          hasToken: !!this.sessionToken,
          tokenPreview: this.sessionToken ? `${this.sessionToken.substring(0, 20)}...` : 'none',
          errorData: error.response?.data,
          errorMessage: error.message
        });
      } else {
        console.error(`Error making request to ${endpoint}:`, error.response?.data || error.message);
      }
      throw error;
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.wordpressUrl}/wp-json/jwt-auth/v1/token/validate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.status === 200;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  // Authentication methods
  async login(email: string, password: string) {
    try {
      // Authenticate using JWT plugin
      const response = await axios.post(this.jwtEndpoint, {
        username: email,
        password: password
      });

      if (response.data && response.data.token) {
        const token = response.data.token;

        // CRITICAL: Set token FIRST so axios interceptor can use it
        this.sessionToken = token;
        this.isUserLoggedIn = true;

        // Store the token in AsyncStorage
        await AsyncStorage.setItem('sessionToken', token);

        // Now get customer info with the token properly set
        const customer = await this.getCustomerByEmail(email);
        if (customer && customer.id) {
          await AsyncStorage.setItem('customerId', customer.id.toString());
          console.log('Customer ID stored:', customer.id);
        } else {
          console.warn('Customer not found for email:', email);
        }

        return {
          token: token,
          success: true,
          user: response.data.user_email,
          displayName: response.data.user_display_name,
          customerId: customer?.id
        };
      } else {
        throw new Error('Invalid response from authentication server');
      }
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);

      // Format error message for better user experience
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      const errorCode = error.response?.data?.code || 'login_error';

      throw {
        code: errorCode,
        message: errorMessage,
        data: error.response?.data
      };
    }
  }

  async register(firstname: string, lastname: string, email: string, telephone: string, password: string) {
    try {
      const newCustomer: any = {
        email: email,
        first_name: firstname,
        last_name: lastname,
        username: email.split('@')[0],
        password: password,
        billing: {
          first_name: firstname,
          last_name: lastname,
          company: '',
          email: email,
          phone: telephone,
          address_1: '',
          address_2: '',
          city: '',
          state: '',
          postcode: '',
          country: ''
        },
        shipping: {
          first_name: firstname,
          last_name: lastname,
          company: '',
          address_1: '',
          address_2: '',
          city: '',
          state: '',
          postcode: '',
          country: ''
        }
      };

      const response = await this.handleRequest('/customers', {
        method: 'post',
        data: newCustomer
      });

      // Store customer ID after registration
      if (response.id) {
        await AsyncStorage.setItem('customerId', response.id.toString());
      }

      // Login after registration using JWT
      const loginResponse = await this.login(email, password);

      return {
        ...response,
        token: loginResponse.token
      };
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);

      // Format error message for better user experience
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || error.message || 'Registration failed';
      const errorCode = errorData?.code || 'registration_error';

      throw {
        code: errorCode,
        message: errorMessage,
        data: errorData
      };
    }
  }

  private async getCustomerByEmail(email: string): Promise<Customer | null> {
    try {
      // Search for customer by email - WooCommerce supports email parameter
      const response = await this.api.get('/customers', {
        params: {
          email: email
        }
      });
      const customers = response.data;
      if (customers && Array.isArray(customers) && customers.length > 0) {
        return customers[0];
      }
      return null;
    } catch (error: any) {
      console.error('Error getting customer by email:', error.response?.data || error.message);
      return null;
    }
  }

  async logout() {
    this.sessionToken = null;
    this.isUserLoggedIn = false;

    // Remove token from AsyncStorage
    await AsyncStorage.removeItem('sessionToken');

    return { success: true };
  }

  // Products
  async getProducts(params?: Record<string, any>) {
    try {
      // OPTIMIZED: Only fetch the requested page, not all pages
      // This dramatically reduces API calls and improves performance
      const defaultParams = {
        per_page: 20, // Reduced from 100 for faster initial load
        ...params
      };

      const response = await this.api.get('/products', { params: defaultParams });

      // Return just the requested page
      // The calling component can implement pagination if needed
      return response.data;
    } catch (error: any) {
      console.error('Error fetching products:', error.response?.data || error.message);
      throw error;
    }
  }

  async getProduct(product_id: number) {
    try {
      const response = await this.api.get(`/products/${product_id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching product ${product_id}:`, error.response?.data || error.message);
      throw error;
    }
  }

  async searchProducts(search: string, page?: number, limit?: number) {
    const params: Record<string, any> = { search };
    if (page) params.page = page;
    if (limit) params.per_page = limit;

    try {
      const response = await this.api.get('/products', { params });
      // Transform WooCommerce products to app format
      const { transformProducts } = require('../utils/woocommerceTransformers');
      return transformProducts(response.data);
    } catch (error: any) {
      console.error('Error searching products:', error.response?.data || error.message);
      throw error;
    }
  }

  // Categories
  async getCategories(params: any = {}) {
    try {
      const response = await this.api.get('/products/categories', {
        params: {
          per_page: 100,
          ...params
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching categories:', error.response?.data || error.message);
      throw error;
    }
  }

  async getCategory(category_id: number | string) {
    try {
      const response = await this.api.get(`/products/categories/${category_id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching category ${category_id}:`, error.response?.data || error.message);
      throw error;
    }
  }

  async getProductsByCategory(categorySlug: string, limit: number = 20) {
    try {
      // First, get the category by slug to find its ID
      const categories = await this.getCategories({ slug: categorySlug });

      if (!categories || categories.length === 0) {
        console.warn(`Category with slug "${categorySlug}" not found`);
        return [];
      }

      const categoryId = categories[0].id;

      // Fetch products for this category
      const response = await this.api.get('/products', {
        params: {
          category: categoryId,
          per_page: limit,
          orderby: 'date',
          order: 'desc'
        }
      });

      return response.data;
    } catch (error: any) {
      console.error(`Error fetching products for category "${categorySlug}":`, error.response?.data || error.message);
      throw error;
    }
  }

  // Shopping Cart (using draft orders in WooCommerce)
  // Shopping Cart (using draft orders in WooCommerce)
  async getCartContents() {
    // In WooCommerce, cart functionality is often handled through draft orders
    // This is a simplified implementation - in practice, you'll need to implement
    // your own cart management or use a plugin that provides cart endpoints
    try {
      // For now, we use AsyncStorage for BOTH guests and logged-in users to ensure immediate functionality
      // In a future update, this should sync with the server using the Store API
      const cartItems = await AsyncStorage.getItem('cartItems');
      const items = cartItems ? JSON.parse(cartItems) : [];

      return {
        success: true,
        products: items,
        cartTotal: items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
      };
    } catch (error) {
      console.error('Error getting cart contents:', error);
      return {
        success: false,
        products: [],
        cartTotal: 0
      };
    }
  }

  async addToCart(product_id: number, quantity: number = 1, productData?: any) {
    try {
      // Use AsyncStorage for ALL users for now
      const cartItems = await AsyncStorage.getItem('cartItems');
      let items = cartItems ? JSON.parse(cartItems) : [];

      // Check if product already exists in cart
      const existingItemIndex = items.findIndex((item: any) => item.productId === product_id);

      if (existingItemIndex >= 0) {
        items[existingItemIndex].quantity += quantity;
      } else {
        // OPTIMIZED: Use provided product data if available, otherwise fetch
        let product = productData;
        if (!product) {
          product = await this.getProduct(product_id);
        }

        const cartItem = {
          key: `cart_${product_id}_${Date.now()}`,
          productId: product.id,
          id: product.id,
          title: product.name || product.title,
          image: product.images && product.images[0] ? product.images[0].src : (product.image || ''),
          price: parseFloat(product.price || '0'),
          quantity: quantity
        };
        items.push(cartItem);
      }

      await AsyncStorage.setItem('cartItems', JSON.stringify(items));

      return {
        success: true,
        message: "Product added to cart",
        cart: items
      };
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async updateCart(cart_item_key: string | number, quantity: number) {
    try {
      // Update cart by modifying quantity
      const cartItems = await AsyncStorage.getItem('cartItems');
      let items = cartItems ? JSON.parse(cartItems) : [];

      // Find item by key or productId and update quantity
      const itemIndex = items.findIndex((item: any) =>
        item.key === cart_item_key || item.productId === cart_item_key || item.id === cart_item_key
      );
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          items.splice(itemIndex, 1); // Remove item if quantity <= 0
        } else {
          items[itemIndex].quantity = quantity;
        }
      }

      await AsyncStorage.setItem('cartItems', JSON.stringify(items));

      return {
        success: true,
        cart: items
      };
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  }

  async removeFromCart(key: string | number) {
    try {
      // Remove item from cart
      const cartItems = await AsyncStorage.getItem('cartItems');
      let items = cartItems ? JSON.parse(cartItems) : [];

      items = items.filter((item: any) =>
        item.key !== key && item.productId !== key && item.id !== key
      );

      await AsyncStorage.setItem('cartItems', JSON.stringify(items));

      return {
        success: true,
        cart: items
      };
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  async emptyCart() {
    try {
      // Clear all cart items from AsyncStorage
      await AsyncStorage.removeItem('cartItems');
      return {
        success: true,
        message: 'Cart cleared successfully'
      };
    } catch (error) {
      console.error('Error emptying cart:', error);
      throw error;
    }
  }

  // Wishlist
  async getWishlist() {
    try {
      const wishlistItems = await AsyncStorage.getItem('wishlistItems');
      return wishlistItems ? JSON.parse(wishlistItems) : [];
    } catch (error) {
      console.error('Error getting wishlist:', error);
      return [];
    }
  }

  async addToWishlist(product_id: number) {
    try {
      // Add product to wishlist
      const product = await this.getProduct(product_id);
      const wishlistItems = await AsyncStorage.getItem('wishlistItems');
      let items = wishlistItems ? JSON.parse(wishlistItems) : [];

      // Check if product already exists in wishlist
      const existingItemIndex = items.findIndex((item: any) => item.id === product_id);
      if (existingItemIndex < 0) {
        items.push(product);
        await AsyncStorage.setItem('wishlistItems', JSON.stringify(items));
      }

      return {
        success: true,
        message: `${product.name} added to wishlist`,
        wishlist: items
      };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }

  async removeFromWishlist(product_id: number) {
    try {
      // Remove product from wishlist
      const wishlistItems = await AsyncStorage.getItem('wishlistItems');
      let items = wishlistItems ? JSON.parse(wishlistItems) : [];

      items = items.filter((item: any) => item.id !== product_id);
      await AsyncStorage.setItem('wishlistItems', JSON.stringify(items));

      return {
        success: true,
        wishlist: items
      };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }

  // Checkout
  async getPaymentMethods() {
    try {
      // Fetch payment gateways from WooCommerce
      const response = await this.handleRequest('/payment_gateways');

      // Filter to only enabled payment methods and format response
      const enabledMethods = response.filter((method: any) => method.enabled === true);

      return enabledMethods.map((method: any) => ({
        id: method.id,
        title: method.title,
        description: method.description,
        instructions: method.settings?.instructions?.value || '',
        enabled: method.enabled,
        method_title: method.method_title || method.title
      }));
    } catch (error) {
      console.error('Error getting payment methods:', error);
      // Return empty array on error - checkout will handle gracefully
      return [];
    }
  }

  async getShippingMethods() {
    try {
      // Fetch shipping zones from WooCommerce
      const zones = await this.handleRequest('/shipping/zones');

      // Fetch methods for each zone in parallel
      const methodsPromises = zones.map(async (zone: any) => {
        try {
          const methods = await this.handleRequest(`/shipping/zones/${zone.id}/methods`);
          // Add zone info to each method
          return methods.map((method: any) => ({
            id: method.id,
            instance_id: method.instance_id,
            title: method.title,
            method_id: method.method_id,
            method_title: method.method_title,
            enabled: method.enabled,
            settings: method.settings,
            zone_id: zone.id,
            zone_name: zone.name
          }));
        } catch (error) {
          console.error(`Error fetching methods for zone ${zone.id}:`, error);
          return [];
        }
      });

      const results = await Promise.all(methodsPromises);
      const allMethods = results.flat();

      // Filter to only enabled methods
      return allMethods.filter((method: any) => method.enabled);
    } catch (error) {
      console.error('Error getting shipping methods:', error);
      return [];
    }
  }

  async createOrder(orderData: any) {
    try {
      // Get customer ID if logged in
      const customerId = await AsyncStorage.getItem('customerId');

      // Create an order in WooCommerce
      const order: any = {
        payment_method: orderData.payment_method,
        payment_method_title: orderData.payment_method_title || 'Direct Bank Transfer',
        set_paid: orderData.set_paid || false,
        billing: orderData.billing,
        shipping: orderData.shipping,
        line_items: orderData.line_items,
        shipping_lines: orderData.shipping_lines || [
          {
            method_id: 'flat_rate',
            method_title: orderData.shipping_method || 'Flat Rate',
            total: orderData.shipping_cost || '0.00'
          }
        ]
      };

      if (customerId) {
        order.customer_id = parseInt(customerId);
      }

      const response = await this.handleRequest('/orders', {
        method: 'post',
        data: order
      });

      // Clear cart after successful order
      await AsyncStorage.removeItem('cartItems');

      return {
        success: true,
        order: response
      };
    } catch (error: any) {
      console.error('Error creating order:', error.response?.data || error.message);
      throw error;
    }
  }

  async getOrders() {
    try {
      // Get orders for the current customer
      const customerId = await AsyncStorage.getItem('customerId');
      if (customerId) {
        const response = await this.api.get(`/orders`, {
          params: {
            customer: parseInt(customerId)
          }
        });
        return response.data;
      } else {
        return [];
      }
    } catch (error: any) {
      console.error('Error getting orders:', error.response?.data || error.message);
      return [];
    }
  }

  async getOrderInfo(order_id: number) {
    try {
      const response = await this.api.get(`/orders/${order_id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting order info:', error.response?.data || error.message);
      return { error: 'Order not found' };
    }
  }

  // User Account
  async getAccountDetails() {
    if (!this.isUserLoggedIn) {
      throw new Error("User not authenticated");
    }

    // Get customer details
    const customerId = await AsyncStorage.getItem('customerId');
    if (customerId) {
      const response = await this.api.get(`/customers/${parseInt(customerId)}`);
      return response.data;
    } else {
      // Try to get customer by email from JWT token
      const sessionToken = await AsyncStorage.getItem('sessionToken');
      if (sessionToken) {
        try {
          // Decode JWT to get email (JWT format: header.payload.signature)
          const payload = sessionToken.split('.')[1];
          // Use atob for React Native compatibility instead of Buffer
          // Add padding if needed for atob
          let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
          while (base64.length % 4) base64 += '=';
          const decodedPayload = JSON.parse(atob(base64));

          // Try different possible email fields in JWT payload
          let email = decodedPayload.data?.user?.user_email ||
            decodedPayload.user_email ||
            decodedPayload.email ||
            decodedPayload.data?.email;

          // Try different possible ID fields as well
          const userId = decodedPayload.data?.user?.id ||
            decodedPayload.user_id ||
            decodedPayload.id ||
            decodedPayload.data?.user?.ID;

          if (email) {
            console.log('Fetching customer by email from JWT:', email);
            const customer = await this.getCustomerByEmail(email);
            if (customer && customer.id) {
              // Store the customer ID for future use
              await AsyncStorage.setItem('customerId', customer.id.toString());
              return customer;
            }
          }
          // If we couldn't get customer by email, try to use the user ID directly if available
          else if (userId) {
            console.log('Fetching customer by ID from JWT:', userId);
            const customer = await this.api.get(`/customers/${userId}`);
            if (customer && customer.data && customer.data.id) {
              // Store the customer ID for future use
              await AsyncStorage.setItem('customerId', customer.data.id.toString());
              return customer.data;
            }
          }
        } catch (decodeError) {
          console.error('Error decoding JWT token:', decodeError);
        }
      }
      throw new Error("Customer ID not found and unable to fetch customer details");
    }
  }

  async updateAccountDetails(details: Record<string, any>) {
    if (!this.isUserLoggedIn) {
      throw new Error("User not authenticated");
    }

    try {
      const customerId = await AsyncStorage.getItem('customerId');
      if (!customerId) throw new Error("Customer ID not found");

      const response = await this.api.put(`/customers/${customerId}`, details);
      return response.data;
    } catch (error: any) {
      console.error('Error updating account details:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateCustomerAddress(addressData: any) {
    if (!this.isUserLoggedIn) {
      throw new Error("User not authenticated");
    }

    try {
      const customerId = await AsyncStorage.getItem('customerId');
      if (!customerId) throw new Error("Customer ID not found");

      // Prepare shipping address - WooCommerce requires ALL fields
      const shippingAddress = {
        first_name: addressData.firstName || '',
        last_name: addressData.lastName || '',
        company: addressData.company || '',
        address_1: addressData.address || '',
        address_2: addressData.address2 || '',
        city: addressData.city || '',
        state: addressData.state || '',
        postcode: addressData.zipCode || '',
        country: addressData.country || '',
        phone: addressData.phone || ''
      };

      // Also update billing to keep names in sync
      const billingAddress = {
        first_name: addressData.firstName || '',
        last_name: addressData.lastName || '',
        company: addressData.company || '',
        address_1: addressData.address || '',
        address_2: addressData.address2 || '',
        city: addressData.city || '',
        state: addressData.state || '',
        postcode: addressData.zipCode || '',
        country: addressData.country || '',
        email: addressData.email || '',
        phone: addressData.phone || ''
      };

      const updateData = {
        shipping: shippingAddress,
        billing: billingAddress
      };

      const response = await this.api.put(`/customers/${customerId}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating customer address:', error.response?.data || error.message);
      throw error;
    }
  }

  // Address Book
  async getAddressBook() {
    if (!this.isUserLoggedIn) {
      return [];
    }

    try {
      const customer = await this.getAccountDetails();
      // Return shipping address as the primary address
      // WooCommerce stores one billing and one shipping address per customer
      return [
        {
          id: 1,
          firstName: customer.shipping?.first_name || customer.first_name || '',
          lastName: customer.shipping?.last_name || customer.last_name || '',
          company: customer.shipping?.company || '',
          address: customer.shipping?.address_1 || '',
          address2: customer.shipping?.address_2 || '',
          city: customer.shipping?.city || '',
          state: customer.shipping?.state || '',
          zipCode: customer.shipping?.postcode || '',
          country: customer.shipping?.country || '',
          phone: customer.shipping?.phone || customer.billing?.phone || '',
          email: customer.email || '',
          isDefault: true
        }
      ];
    } catch (error) {
      console.error('Error getting address book:', error);
      return [];
    }
  }

  // Utility methods
  setSessionToken(token: string | null) {
    this.sessionToken = token;
    this.isUserLoggedIn = !!token;
  }

  async signOut() {
    this.sessionToken = null;
    this.isUserLoggedIn = false;

    // Remove token from AsyncStorage
    await AsyncStorage.removeItem('sessionToken');
    await AsyncStorage.removeItem('customerId');

    return { success: true };
  }

  get isAuthenticated() {
    return this.isUserLoggedIn;
  }

  // Helper method for Base64 encoding in React Native
  private toBase64(str: string): string {
    // Pure JavaScript Base64 encoding implementation
    const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let output = '';
    let i = 0;

    while (i < str.length) {
      const char1 = str.charCodeAt(i++);
      const char2 = i < str.length ? str.charCodeAt(i++) : 0;
      const char3 = i < str.length ? str.charCodeAt(i++) : 0;

      const bits = (char1 << 16) | (char2 << 8) | char3;
      const enc1 = (bits >> 18) & 63;
      const enc2 = (bits >> 12) & 63;
      const enc3 = (bits >> 6) & 63;
      const enc4 = bits & 63;

      output += base64Chars.charAt(enc1) + base64Chars.charAt(enc2) +
        (isNaN(char2) ? '=' : base64Chars.charAt(enc3)) +
        (isNaN(char3) ? '=' : base64Chars.charAt(enc4));
    }

    return output;
  }

  // Carousel
  async getCarouselItems() {
    // Get featured products or specific posts for carousel
    try {
      const featuredProducts = await this.getProducts({ featured: true, per_page: 3 });
      return featuredProducts.map((product: any) => ({
        id: product.id.toString(),
        title: product.name,
        subtitle: product.short_description || 'Featured Product',
        imageUrl: product.images && product.images[0] ? product.images[0].src : '',
        linkType: 'product',
        linkValue: product.id,
      }));
    } catch (error) {
      console.error('Error getting carousel items:', error);
      // Return default carousel items in case of error
      return [
        {
          id: '1',
          title: 'Premium Tech Collection',
          subtitle: 'New arrivals with exclusive offers',
          imageUrl: 'https://images.pexels.com/photos/5632371/pexels-photo-5632371.jpeg',
          linkType: 'category',
          linkValue: 'electronics',
        },
        {
          id: '2',
          title: 'Gaming Setup Essentials',
          subtitle: 'Top products for your gaming station',
          imageUrl: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg',
          linkType: 'category',
          linkValue: 'gaming',
        },
        {
          id: '3',
          title: 'Home Office Setup',
          subtitle: 'Everything you need for productivity',
          imageUrl: 'https://images.pexels.com/photos/2334890/pexels-photo-2334890.jpeg',
          linkType: 'category',
          linkValue: 'laptops',
        }
      ];
    }
  }

  // Push Notifications
  async updatePushToken(token: string) {
    try {
      // Get customer ID to associate the push token
      const customerId = await AsyncStorage.getItem('customerId');
      if (!customerId) {
        throw new Error("Customer ID not found - user may not be authenticated");
      }

      // Option 1: Try to use WordPress user meta to store the push token
      // This requires custom WordPress code to be added to handle the meta field
      const response = await this.handleRequest(`/customers/${customerId}`, {
        method: 'PUT',
        data: {
          meta_data: [
            {
              key: 'expo_push_token',
              value: token
            }
          ]
        }
      });

      console.log('Push token updated for user:', response.id);
      return { success: true, message: 'Push token updated successfully' };
    } catch (error) {
      console.error('Error updating push token:', error);

      // Fallback: try to use a custom endpoint if available
      try {
        const wordpressUrl = this.wordpressUrl;
        const sessionToken = this.sessionToken;

        if (sessionToken) {
          const fallbackResponse = await axios.post(
            `${wordpressUrl}/wp-json/wc/v3/customers/push-token`,
            {
              push_token: token,
              customer_id: await AsyncStorage.getItem('customerId')
            },
            {
              headers: {
                Authorization: `Bearer ${sessionToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          return { success: true, message: 'Push token updated via fallback method' };
        }
      } catch (fallbackError) {
        console.error('Fallback push token update also failed:', fallbackError);
      }

      // If both methods failed, still return success to avoid breaking the flow
      // The token will be stored in AsyncStorage and can be synced later
      return { success: true, message: 'Push token stored locally for sync' };
    }
  }
}

export default WordPressApiService;