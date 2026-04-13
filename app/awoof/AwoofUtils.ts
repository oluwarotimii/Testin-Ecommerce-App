// ============================================
// AWOOF CORNER UTILITIES
// ============================================
// Helper functions and utilities for managing Awoof Corner functionality

// ============================================
// CART MANAGEMENT
// ============================================
// In production, replace this with Redux/Zustand/Context API

export interface AwoofProduct {
  id: string;
  name: string;
  originalPrice: number;
  salePrice: number;
  image: string;
  discount: number;
  tag: string;
  stock: number;
}

export interface CartItem extends AwoofProduct {
  quantity: number;
}

// Simple cart state manager (replace with your state management solution)
class AwoofCartManager {
  private cart: CartItem[] = [];
  private listeners: Array<(cart: CartItem[]) => void> = [];

  addItem(product: AwoofProduct, quantity: number = 1) {
    const existingItem = this.cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({ ...product, quantity });
    }
    
    this.notifyListeners();
  }

  removeItem(productId: string) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.notifyListeners();
  }

  updateQuantity(productId: string, quantity: number) {
    const item = this.cart.find(item => item.id === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.notifyListeners();
    }
  }

  clearCart() {
    this.cart = [];
    this.notifyListeners();
  }

  getCart(): CartItem[] {
    return [...this.cart];
  }

  getItemCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getSubtotal(): number {
    return this.cart.reduce((sum, item) => sum + (item.salePrice * item.quantity), 0);
  }

  getTotalSavings(): number {
    return this.cart.reduce(
      (sum, item) => sum + ((item.originalPrice - item.salePrice) * item.quantity),
      0
    );
  }

  subscribe(listener: (cart: CartItem[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getCart()));
  }
}

export const awoofCart = new AwoofCartManager();

// ============================================
// API INTEGRATION HELPERS
// ============================================

// Fetch Awoof deals from your backend
export async function fetchAwoofDeals(): Promise<AwoofProduct[]> {
  try {
    // Replace with your actual API endpoint
    const response = await fetch('https://your-api.com/api/awoof-deals');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Awoof deals:', error);
    return [];
  }
}

// Fetch single product details
export async function fetchProductDetails(productId: string): Promise<AwoofProduct | null> {
  try {
    const response = await fetch(`https://your-api.com/api/products/${productId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching product details:', error);
    return null;
  }
}

// ============================================
// WOOCOMMERCE CHECKOUT URL BUILDER
// ============================================

export function buildWooCommerceCheckoutUrl(
  baseUrl: string,
  cartItems: CartItem[]
): string {
  // Build WooCommerce add-to-cart URL with multiple products
  const cartParams = cartItems.map(item => {
    return `add-to-cart=${item.id}&quantity=${item.quantity}`;
  }).join('&');

  return `${baseUrl}/checkout/?${cartParams}`;
}

// ============================================
// FORMATTING HELPERS
// ============================================

export function formatPrice(price: number, currency: string = '₦'): string {
  return `${currency}${price.toLocaleString()}`;
}

export function calculateDiscount(originalPrice: number, salePrice: number): number {
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

export function formatStockStatus(stock: number): {
  text: string;
  isLow: boolean;
  color: string;
} {
  if (stock === 0) {
    return {
      text: 'Out of Stock',
      isLow: true,
      color: '#FF3B30',
    };
  } else if (stock < 10) {
    return {
      text: `Only ${stock} left!`,
      isLow: true,
      color: '#FF9500',
    };
  } else {
    return {
      text: 'In Stock',
      isLow: false,
      color: '#34C759',
    };
  }
}

// ============================================
// VALIDATION HELPERS
// ============================================

export function canAddToCart(product: AwoofProduct, requestedQuantity: number): {
  canAdd: boolean;
  message?: string;
} {
  if (product.stock === 0) {
    return {
      canAdd: false,
      message: 'This item is out of stock',
    };
  }

  if (requestedQuantity > product.stock) {
    return {
      canAdd: false,
      message: `Only ${product.stock} items available`,
    };
  }

  return { canAdd: true };
}

// ============================================
// ANALYTICS HELPERS (Optional)
// ============================================

export function trackAwoofEvent(eventName: string, data?: any) {
  // Integrate with your analytics service (Firebase, Mixpanel, etc.)
  console.log('Awoof Event:', eventName, data);
  
  // Example: Firebase Analytics
  // analytics().logEvent(eventName, data);
}

// Track common events
export const AwoofEvents = {
  VIEW_FEED: 'awoof_view_feed',
  VIEW_PRODUCT: 'awoof_view_product',
  ADD_TO_CART: 'awoof_add_to_cart',
  REMOVE_FROM_CART: 'awoof_remove_from_cart',
  START_CHECKOUT: 'awoof_start_checkout',
  COMPLETE_ORDER: 'awoof_complete_order',
};

// ============================================
// EXAMPLE USAGE
// ============================================

/*
// In your component:
import { awoofCart, formatPrice, trackAwoofEvent, AwoofEvents } from './AwoofUtils';

// Add to cart
const handleAddToCart = (product: AwoofProduct) => {
  awoofCart.addItem(product, 1);
  trackAwoofEvent(AwoofEvents.ADD_TO_CART, {
    productId: product.id,
    productName: product.name,
    price: product.salePrice,
  });
};

// Get cart count for badge
const [cartCount, setCartCount] = useState(0);

useEffect(() => {
  const unsubscribe = awoofCart.subscribe((cart) => {
    setCartCount(awoofCart.getItemCount());
  });
  
  return unsubscribe;
}, []);

// Display price
<Text>{formatPrice(product.salePrice)}</Text>
*/
