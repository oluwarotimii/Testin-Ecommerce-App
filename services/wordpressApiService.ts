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

  constructor(wordpressUrl: string, consumerKey: string, consumerSecret: string, sessionToken: string | null = null) {
    // Create axios instance with base configuration
    this.api = axios.create({
      baseURL: `${wordpressUrl}/wp-json/wc/v3/`,
      auth: {
        username: consumerKey,
        password: consumerSecret,
      },
    });

    this.wordpressUrl = wordpressUrl;
    this.jwtEndpoint = `${wordpressUrl}/wp-json/jwt-auth/v1/token`;
    this.sessionToken = sessionToken;
    this.isUserLoggedIn = !!sessionToken;

    // Add request interceptor to inject JWT token
    this.api.interceptors.request.use(async (config) => {
      if (this.sessionToken) {
        config.headers.Authorization = `Bearer ${this.sessionToken}`;
      }
      return config;
    }, (error) => {
      return Promise.reject(error);
    });
  }

  // Helper method to handle API requests with error handling
  private async handleRequest<T>(endpoint: string, options: any = {}) {
    try {
      const response = await this.api(endpoint, options);
      return response.data;
    } catch (error: any) {
      console.error(`Error making request to ${endpoint}:`, error.response?.data || error.message);
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
        this.sessionToken = token;
        this.isUserLoggedIn = true;

        // Store the token in AsyncStorage
        await AsyncStorage.setItem('sessionToken', token);

        // Get customer info and store customer ID
        const customer = await this.getCustomerByEmail(email);
        if (customer && customer.id) {
          await AsyncStorage.setItem('customerId', customer.id.toString());
        }

        return {
          token: token,
          success: true,
          user: response.data.user_email,
          displayName: response.data.user_display_name
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
      const response = await this.api.get('/products', { params });
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
      return response.data;
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

  async addToCart(product_id: number, quantity: number = 1) {
    try {
      // Use AsyncStorage for ALL users for now
      const cartItems = await AsyncStorage.getItem('cartItems');
      let items = cartItems ? JSON.parse(cartItems) : [];

      // Check if product already exists in cart
      const existingItemIndex = items.findIndex((item: any) => item.productId === product_id);

      if (existingItemIndex >= 0) {
        items[existingItemIndex].quantity += quantity;
      } else {
        // We need to get product details to add to cart
        const product = await this.getProduct(product_id);
        const cartItem = {
          key: `cart_${product_id}_${Date.now()}`,
          productId: product.id,
          id: product.id,
          title: product.name,
          image: product.images && product.images[0] ? product.images[0].src : '',
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
    // WooCommerce handles payment methods differently
    // This returns available payment gateways
    try {
      // Get available payment methods from WooCommerce
      return [
        { id: 'bacs', name: 'Direct Bank Transfer', icon: 'bank' },
        { id: 'cheque', name: 'Check Payments', icon: 'dollar-sign' },
        { id: 'cod', name: 'Cash on Delivery', icon: 'hand' },
        { id: 'stripe', name: 'Credit Card (Stripe)', icon: 'credit-card' },
        { id: 'paypal', name: 'PayPal', icon: 'paypal' }
      ];
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return [];
    }
  }

  async getShippingMethods() {
    // WooCommerce calculates shipping methods dynamically based on cart and location
    // This is a simplified response
    return [
      { id: 1, name: 'Standard Shipping', price: 0, estimated_days: 5 },
      { id: 2, name: 'Express Shipping', price: 9.99, estimated_days: 2 },
      { id: 3, name: 'Overnight Shipping', price: 19.99, estimated_days: 1 }
    ];
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
      // Try to find customer by email if ID is not stored
      const sessionToken = await AsyncStorage.getItem('sessionToken');
      if (sessionToken) {
        // This would require a more complex implementation in a real app
        // For now, we'll return an error
        throw new Error("Customer ID not found");
      }
      throw new Error("User not authenticated");
    }
  }

  async updateAccountDetails(details: Record<string, any>) {
    if (!this.isUserLoggedIn) {
      throw new Error("User not authenticated");
    }

    try {
      const customerId = await AsyncStorage.getItem('customerId');
      if (!customerId) throw new Error("Customer ID not found");

      const response = await this.api.put(`/ customers / ${customerId}`, details);
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

      // Map local address format to WooCommerce format
      const wooAddress = {
        first_name: addressData.firstName,
        last_name: addressData.lastName,
        address_1: addressData.address,
        city: addressData.city,
        state: addressData.state,
        postcode: addressData.zipCode,
        country: addressData.country,
        phone: addressData.phone,
        email: addressData.email // Ensure email is included
      };

      // Update both billing and shipping for simplicity, or based on a flag
      const updateData = {
        billing: wooAddress,
        shipping: wooAddress
      };

      const response = await this.api.put(`/ customers / ${customerId}`, updateData);
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
      // Return billing address as the primary address
      // In a real app with multiple addresses, you'd need a custom endpoint or plugin
      return [
        {
          id: 1,
          firstName: customer.billing.first_name,
          lastName: customer.billing.last_name,
          address: customer.billing.address_1,
          city: customer.billing.city,
          state: customer.billing.state,
          zipCode: customer.billing.postcode,
          country: customer.billing.country,
          phone: customer.billing.phone,
          email: customer.billing.email || customer.email, // Include email
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
    // In a real implementation, you would send the token to your WordPress site
    // This might involve creating a custom endpoint to store push tokens
    console.log('Updating push token:', token);
    // For now, just log the token as this would require custom WordPress code
    return { success: true };
  }
}

export default WordPressApiService;