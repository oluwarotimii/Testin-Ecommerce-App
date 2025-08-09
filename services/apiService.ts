import { Platform } from 'react-native';

class ApiService {
  private baseUrl: string;
  private sessionToken: string | null;

  constructor(sessionToken: string | null = null) {
    this.baseUrl = 'http://localhost/testin/';
    this.sessionToken = sessionToken;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(this.sessionToken ? { 'Cookie': `OCSESSID=${this.sessionToken}` } : {}),
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(endpoint: string, params?: Record<string, any>) {
    let fullEndpoint = endpoint;
    if (params) {
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      fullEndpoint += `?${queryString}`;
    }
    return this.makeRequest(fullEndpoint, { method: 'GET' });
  }

  setSessionToken(token: string | null) {
    this.sessionToken = token;
  }

  async post(endpoint: string, body: Record<string, any>) {
    const formBody = Object.keys(body).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(body[key])).join('&');
    return this.makeRequest(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody,
    });
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.post('login', { email, password });
    if (response.success && response.session_id) {
      this.setSessionToken(response.session_id);
    }
    return response;
  }

  async register(firstname: string, lastname: string, email: string, telephone: string, password: string) {
    return this.post('register', { firstname, lastname, email, telephone, password });
  }

  async logout() {
    return this.post('logout', {});
  }

  // Products
  async getProducts(params?: Record<string, any>) {
    return this.get('products', params);
  }

  async getProduct(product_id: number) {
    return this.get('product', { product_id });
  }

  async searchProducts(search: string, page?: number, limit?: number) {
    return this.get('search', { search, page, limit });
  }

  // Categories
  async getCategories() {
    return this.get('categories');
  }

  async getCategory(category_id: number) {
    return this.get('category', { category_id });
  }

  // Shopping Cart
  async getCartContents() {
    return this.get('cart');
  }

  async addToCart(product_id: number, quantity: number = 1) {
    return this.post('cart_add', { product_id, quantity });
  }

  async updateCart(cart_id: number, quantity: number) {
    return this.post('cart_update', { [`quantity[${cart_id}]`]: quantity });
  }

  async removeFromCart(key: number) {
    return this.post('cart_remove', { key });
  }

  // Wishlist
  async getWishlist() {
    return this.get('wishlist');
  }

  async addToWishlist(product_id: number) {
    return this.post('wishlist_add', { product_id });
  }

  async removeFromWishlist(product_id: number) {
    return this.post('wishlist_remove', { product_id });
  }

  // Checkout
  async getPaymentMethods() {
    return this.get('payment_methods');
  }

  async getShippingMethods() {
    return this.get('shipping_methods');
  }

  async createOrder() {
    return this.post('order_create', {});
  }

  async getOrders() {
    return this.get('orders');
  }

  async getOrderInfo(order_id: number) {
    return this.get('order_info', { order_id });
  }

  // User Account
  async getAccountDetails() {
    return this.get('account');
  }

  async updateAccountDetails(details: Record<string, any>) {
    return this.post('account_update', details);
  }

  async getAddressBook() {
    return this.get('address_book');
  }
}

export default ApiService;
