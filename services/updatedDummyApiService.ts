// Updated dummy data for electronics e-commerce app
const dummyElectronicsProducts = [
  // Smartphones
  {
    id: 1,
    title: "iPhone 17 Pro Max",
    price: 1499.99,
    description: "The latest iPhone with advanced camera technology, A17 Bionic chip, and all-day battery life.",
    category: "smartphones",
    image: "https://femtechit.com/image/cache/catalog/Products/iphone%2017-270x270.png",
    rating: { rate: 4.9, count: 1250 }
  },
  {
    id: 2,
    title: "iPhone 17 Pro",
    price: 1299.99,
    description: "Advanced triple-camera system, A17 Bionic chip, and exceptional durability with Ceramic Shield.",
    category: "smartphones",
    image: "https://femtechit.com/image/cache/catalog/Products/17pro-270x270.png",
    rating: { rate: 4.8, count: 1100 }
  },
  {
    id: 3,
    title: "iPhone 17",
    price: 999.99,
    description: "Powerful performance with A17 chip, advanced dual-camera system, and long-lasting battery.",
    category: "smartphones",
    image: "https://femtechit.com/image/cache/catalog/Products/iphone%2017-270x270.png",
    rating: { rate: 4.7, count: 980 }
  },
  {
    id: 4,
    title: "iPhone 15 Pro Max",
    price: 1199.99,
    description: "Titanium design, 48MP Main camera, and Action Button for enhanced functionality.",
    category: "smartphones",
    image: "https://femtechit.com/image/cache/catalog/Products/15pm-270x270.png",
    rating: { rate: 4.6, count: 850 }
  },
  {
    id: 5,
    title: "Honor 10",
    price: 499.99,
    description: "Powerful performance with AI capabilities and long-lasting battery life.",
    category: "smartphones",
    image: "https://femtechit.com/image/cache/catalog/Products/honor10-200x200.png",
    rating: { rate: 4.3, count: 320 }
  },
  {
    id: 6,
    title: "Honor 60i",
    price: 399.99,
    description: "Sleek design, fast charging, and impressive camera capabilities.",
    category: "smartphones",
    image: "https://femtechit.com/image/cache/catalog/Products/hot60i-200x200.png",
    rating: { rate: 4.2, count: 280 }
  },
  {
    id: 7,
    title: "iTel Vision 60K",
    price: 299.99,
    description: "Stylish smartphone with AI dual cameras and long battery life.",
    category: "smartphones",
    image: "https://femtechit.com/image/cache/catalog/Products/itel-60k-228x228.png",
    rating: { rate: 4.0, count: 220 }
  },
  {
    id: 8,
    title: "iTel P33 Gen",
    price: 249.99,
    description: "Affordable smartphone with reliable performance and decent camera quality.",
    category: "smartphones",
    image: "https://femtechit.com/image/cache/catalog/Products/itel-gen-228x228.png",
    rating: { rate: 3.9, count: 180 }
  },
  {
    id: 9,
    title: "POCO X7",
    price: 349.99,
    description: "Gaming-focused smartphone with high refresh rate display and powerful processor.",
    category: "smartphones",
    image: "https://femtechit.com/image/cache/catalog/Products/poco-x7-228x228.png",
    rating: { rate: 4.4, count: 350 }
  },
  {
    id: 10,
    title: "Redmi Note 15",
    price: 329.99,
    description: "Great performance with impressive camera setup and long battery life.",
    category: "smartphones",
    image: "https://femtechit.com/image/cache/catalog/Products/redmi15-228x228.png",
    rating: { rate: 4.3, count: 400 }
  },
  {
    id: 11,
    title: "iPhone 15T",
    price: 1099.99,
    description: "Premium iPhone with enhanced security features and improved camera system.",
    category: "smartphones",
    image: "https://femtechit.com/image/cache/catalog/Products/15T-228x228.png",
    rating: { rate: 4.7, count: 560 }
  },
  {
    id: 12,
    title: "OnePlus VT30s",
    price: 449.99,
    description: "Fast-charging smartphone with smooth performance and excellent display.",
    category: "smartphones",
    image: "https://femtechit.com/image/cache/catalog/Products/VT30s-228x228.png",
    rating: { rate: 4.2, count: 290 }
  },
  {
    id: 13,
    title: "Realme 100C",
    price: 199.99,
    description: "Budget-friendly smartphone with decent performance and camera quality.",
    category: "smartphones",
    image: "https://femtechit.com/image/cache/catalog/Products/100c-228x228.png",
    rating: { rate: 3.8, count: 150 }
  },
  {
    id: 14,
    title: "Oraimo OTW-324S",
    price: 149.99,
    description: "Affordable smartphone with essential features for everyday use.",
    category: "smartphones",
    image: "https://femtechit.com/image/cache/catalog/Products/OTW-324S-228x228.png",
    rating: { rate: 3.7, count: 120 }
  },
  {
    id: 15,
    title: "iTel Smart 8",
    price: 179.99,
    description: "Entry-level smartphone with basic features and reliable performance.",
    category: "smartphones",
    image: "https://femtechit.com/image/cache/catalog/Products/smart8-200x200.jpg",
    rating: { rate: 3.6, count: 90 }
  },

  // Laptops
  {
    id: 101,
    title: "MacBook Pro M4",
    price: 2499.99,
    description: "The ultimate pro laptop with M4 chip, stunning Liquid Retina XDR display, and all-day battery life.",
    category: "laptops",
    image: "https://femtechit.com/image/cache/catalog/Products/MacbookM4-228x228.png",
    rating: { rate: 4.9, count: 820 }
  },
  {
    id: 102,
    title: "Canon Pixma TS705A",
    price: 149.99,
    description: "All-in-one inkjet printer with wireless connectivity and mobile printing capabilities.",
    category: "printers",
    image: "https://femtechit.com/image/cache/catalog/Products/pixma_ts705a-228x228.png",
    rating: { rate: 4.4, count: 210 }
  },

  // Headphones & Audio
  {
    id: 201,
    title: "Samsung Galaxy Buds4",
    price: 129.99,
    description: "Wireless earbuds with active noise cancellation and premium sound quality.",
    category: "headphones",
    image: "https://femtechit.com/image/cache/catalog/Products/buds4-228x228.png",
    rating: { rate: 4.5, count: 420 }
  },

  // Home Appliances
  {
    id: 301,
    title: "Synix Air Fryer",
    price: 89.99,
    description: "Digital air fryer with preset cooking functions and healthy oil-free cooking.",
    category: "home-appliances",
    image: "https://femtechit.com/image/cache/catalog/Products/synix-fryer-228x228.png",
    rating: { rate: 4.3, count: 180 }
  },
  {
    id: 302,
    title: "Qasa Electric Kettle",
    price: 39.99,
    description: "Fast-boiling electric kettle with auto-shutoff and boil-dry protection.",
    category: "home-appliances",
    image: "https://femtechit.com/image/cache/catalog/Products/qasa18-228x228.png",
    rating: { rate: 4.0, count: 150 }
  },
  {
    id: 303,
    title: "InSinkErator ISW-20",
    price: 99.99,
    description: "Food waste disposer with quiet operation and anti-jam technology.",
    category: "home-appliances",
    image: "https://femtechit.com/image/cache/catalog/Products/ISW-20-228x228.png",
    rating: { rate: 4.1, count: 95 }
  },

  // Computer Accessories
  {
    id: 401,
    title: "7318 Mist Keyboard",
    price: 59.99,
    description: "Wireless keyboard with comfortable typing experience and long battery life.",
    category: "computer-accessories",
    image: "https://femtechit.com/image/cache/catalog/Products/7318-mist-228x228.png",
    rating: { rate: 4.2, count: 140 }
  },
  {
    id: 402,
    title: "7318 Mist Mouse",
    price: 29.99,
    description: "Ergonomic wireless mouse with precise tracking and comfortable grip.",
    category: "computer-accessories",
    image: "https://femtechit.com/image/cache/catalog/Products/7318-mist-228x228.png",
    rating: { rate: 4.1, count: 120 }
  },

  // Tablets
  {
    id: 501,
    title: "iPad Pro 12.9-inch",
    price: 1099.99,
    description: "The ultimate iPad experience with M2 chip, Liquid Retina XDR display, and Apple Pencil support.",
    category: "tablets",
    image: "https://images.pexels.com/photos/34709170/pexels-photo-34709170.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    rating: { rate: 4.8, count: 650 }
  },
  {
    id: 502,
    title: "iPad Air",
    price: 599.99,
    description: "Powerful performance in a thin and light design with 10.9-inch Liquid Retina display.",
    category: "tablets",
    image: "https://images.pexels.com/photos/34709168/pexels-photo-34709168.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    rating: { rate: 4.6, count: 420 }
  },

  // Gaming
  {
    id: 601,
    title: "Gaming Keyboard RGB",
    price: 79.99,
    description: "Mechanical gaming keyboard with customizable RGB lighting and responsive keys.",
    category: "gaming",
    image: "https://images.pexels.com/photos/34728969/pexels-photo-34728969.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    rating: { rate: 4.4, count: 380 }
  },
  {
    id: 602,
    title: "Gaming Mouse",
    price: 49.99,
    description: "High-precision gaming mouse with adjustable DPI and programmable buttons.",
    category: "gaming",
    image: "https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    rating: { rate: 4.3, count: 320 }
  },
  {
    id: 603,
    title: "Gaming Headset",
    price: 89.99,
    description: "Immersive audio gaming headset with noise-cancelling microphone.",
    category: "gaming",
    image: "https://images.pexels.com/photos/3810792/pexels-photo-3810792.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    rating: { rate: 4.5, count: 280 }
  },

  // Smart Home
  {
    id: 701,
    title: "Smart Home Hub",
    price: 129.99,
    description: "Central control for all your smart home devices with voice assistant integration.",
    category: "smart-home",
    image: "https://images.pexels.com/photos/3194524/pexels-photo-3194524.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    rating: { rate: 4.2, count: 180 }
  },
  {
    id: 702,
    title: "Smart LED Strip",
    price: 24.99,
    description: "RGB LED strip with app control, music sync, and timer functions.",
    category: "smart-home",
    image: "https://images.pexels.com/photos/4458554/pexels-photo-4458554.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    rating: { rate: 4.1, count: 210 }
  },
  {
    id: 703,
    title: "Smart Speaker",
    price: 79.99,
    description: "Voice-controlled smart speaker with premium sound quality and smart home integration.",
    category: "smart-home",
    image: "https://images.pexels.com/photos/8101600/pexels-photo-8101600.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    rating: { rate: 4.3, count: 290 }
  },

  // Photography
  {
    id: 801,
    title: "Wireless Camera",
    price: 399.99,
    description: "Digital camera with wireless connectivity and 4K video recording capabilities.",
    category: "photography",
    image: "https://images.pexels.com/photos/5076523/pexels-photo-5076523.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    rating: { rate: 4.6, count: 150 }
  },
  {
    id: 802,
    title: "Action Camera",
    price: 199.99,
    description: "Waterproof action camera with 4K recording and image stabilization.",
    category: "photography",
    image: "https://images.pexels.com/photos/34709170/pexels-photo-34709170.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    rating: { rate: 4.4, count: 240 }
  },

  // Wearables
  {
    id: 901,
    title: "Smart Watch",
    price: 199.99,
    description: "Advanced health monitoring, fitness tracking, and smart notifications.",
    category: "wearables",
    image: "https://images.pexels.com/photos/5082245/pexels-photo-5082245.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    rating: { rate: 4.3, count: 450 }
  },
  {
    id: 902,
    title: "Fitness Tracker",
    price: 89.99,
    description: "All-day activity monitoring with heart rate tracking and sleep analysis.",
    category: "wearables",
    image: "https://images.pexels.com/photos/296115/pexels-photo-296115.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    rating: { rate: 4.1, count: 380 }
  },

  // Storage
  {
    id: 1001,
    title: "WD 2TB External Drive",
    price: 89.99,
    description: "High-capacity portable external hard drive with USB 3.0 interface.",
    category: "storage",
    image: "https://images.pexels.com/photos/12899121/pexels-photo-12899121.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    rating: { rate: 4.4, count: 280 }
  },
  {
    id: 1002,
    title: "SanDisk 1TB SSD",
    price: 129.99,
    description: "Fast SATA III 6Gb/s internal SSD for improved PC performance.",
    category: "storage",
    image: "https://images.pexels.com/photos/5076522/pexels-photo-5076522.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    rating: { rate: 4.5, count: 320 }
  },
  {
    id: 1003,
    title: "USB Flash Drive 256GB",
    price: 19.99,
    description: "Compact USB 3.0 flash drive with high-speed data transfer.",
    category: "storage",
    image: "https://images.pexels.com/photos/1092671/pexels-photo-1092671.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    rating: { rate: 4.0, count: 420 }
  },

  // Monitors
  {
    id: 1101,
    title: "27-inch 4K Monitor",
    price: 349.99,
    description: "Ultra-high resolution monitor with HDR support and wide color gamut.",
    category: "monitors",
    image: "https://images.pexels.com/photos/5244025/pexels-photo-5244025.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    rating: { rate: 4.6, count: 180 }
  },
  {
    id: 1102,
    title: "24-inch Gaming Monitor",
    price: 249.99,
    description: "144Hz refresh rate gaming monitor with AMD FreeSync technology.",
    category: "monitors",
    image: "https://images.pexels.com/photos/34688826/pexels-photo-34688826.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    rating: { rate: 4.5, count: 220 }
  },
  {
    id: 1103,
    title: "Ultrawide Monitor",
    price: 499.99,
    description: "34-inch curved ultrawide monitor with 21:9 aspect ratio.",
    category: "monitors",
    image: "https://images.pexels.com/photos/5076531/pexels-photo-5076531.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    rating: { rate: 4.7, count: 140 }
  },

  // Networking
  {
    id: 1201,
    title: "Wi-Fi 6 Router",
    price: 149.99,
    description: "High-performance router with Wi-Fi 6 technology for faster speeds.",
    category: "networking",
    image: "https://images.pexels.com/photos/34710667/pexels-photo-34710667.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    rating: { rate: 4.3, count: 190 }
  },
  {
    id: 1202,
    title: "Mesh Wi-Fi System",
    price: 299.99,
    description: "Whole-home Wi-Fi system with seamless coverage and easy management.",
    category: "networking",
    image: "https://images.pexels.com/photos/34702466/pexels-photo-34702466.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    rating: { rate: 4.4, count: 160 }
  },

  // Chargers & Accessories
  {
    id: 1301,
    title: "Wireless Charger",
    price: 29.99,
    description: "Fast wireless charging pad compatible with Qi-enabled devices.",
    category: "chargers",
    image: "https://images.pexels.com/photos/34688828/pexels-photo-34688828.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    rating: { rate: 4.2, count: 540 }
  },
  {
    id: 1302,
    title: "USB-C Cable",
    price: 14.99,
    description: "High-speed USB-C cable with fast charging and data transfer.",
    category: "chargers",
    image: "https://images.pexels.com/photos/34688832/pexels-photo-34688832.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    rating: { rate: 4.0, count: 680 }
  },
  {
    id: 1303,
    title: "Power Bank 20000mAh",
    price: 39.99,
    description: "High-capacity portable charger with fast charging capabilities.",
    category: "chargers",
    image: "https://images.pexels.com/photos/34709167/pexels-photo-34709167.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    rating: { rate: 4.3, count: 420 }
  },
  {
    id: 1304,
    title: "Wall Charger 65W",
    price: 24.99,
    description: "Fast wall charger with multiple USB ports and safety protection.",
    category: "chargers",
    image: "https://images.pexels.com/photos/34710668/pexels-photo-34710668.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    rating: { rate: 4.1, count: 380 }
  }
];

const dummyElectronicsCategories = [
  "smartphones",
  "laptops",
  "tablets",
  "headphones",
  "home-appliances", 
  "computer-accessories",
  "gaming",
  "smart-home",
  "photography",
  "wearables",
  "storage",
  "monitors",
  "networking",
  "chargers",
  "printers"
];

// Simulate cart data
let cartItems: any[] = [];

// Simulate wishlist data
let wishlistItems: any[] = [];

// Simulate user data
const dummyUser = {
  id: 1,
  email: "test@example.com",
  username: "techuser",
  name: {
    firstname: "Tech",
    lastname: "User"
  },
  phone: "1234567890",
  __v: 0
};

// Simulate orders data
const dummyOrders = [
  {
    id: 1,
    order_id: "ORD001",
    products: [
      { id: 1, title: "iPhone 17 Pro Max", quantity: 1, price: 1499.99 },
      { id: 201, title: "Samsung Galaxy Buds4", quantity: 1, price: 129.99 }
    ],
    total: 1629.98,
    date_added: "2023-01-15T10:30:00Z",
    status: "delivered"
  },
  {
    id: 2,
    order_id: "ORD002",
    products: [
      { id: 101, title: "MacBook Pro M4", quantity: 1, price: 2499.99 }
    ],
    total: 2499.99,
    date_added: "2023-02-20T14:45:00Z",
    status: "shipped"
  }
];

class UpdatedDummyApiService {
  private sessionToken: string | null;
  private isUserLoggedIn: boolean;

  constructor(sessionToken: string | null = null) {
    this.sessionToken = sessionToken;
    this.isUserLoggedIn = !!sessionToken;
  }

  // Authentication methods
  async login(email: string, password: string) {
    // Simulate login success
    this.sessionToken = `session_${Date.now()}`;
    this.isUserLoggedIn = true;

    return {
      token: this.sessionToken,
      user: dummyUser,
      success: true
    };
  }

  async register(firstname: string, lastname: string, email: string, telephone: string, password: string) {
    // Simulate successful registration
    this.sessionToken = `session_${Date.now()}`;
    this.isUserLoggedIn = true;

    return {
      id: Date.now(),
      email,
      username: email,
      name: { firstname, lastname },
      phone: telephone,
      __v: 0,
      token: this.sessionToken
    };
  }

  async logout() {
    this.sessionToken = null;
    this.isUserLoggedIn = false;
    cartItems = []; // Clear cart on logout
    return { success: true };
  }

  // Products
  async getProducts(params?: Record<string, any>) {
    let filteredProducts = [...dummyElectronicsProducts];

    if (params && params.limit) {
      filteredProducts = filteredProducts.slice(0, params.limit);
    }

    return filteredProducts;
  }

  async getProduct(product_id: number) {
    return dummyElectronicsProducts.find(product => product.id === product_id) ||
           { error: "Product not found" };
  }

  async searchProducts(search: string, page?: number, limit?: number) {
    const filteredProducts = dummyElectronicsProducts.filter(product =>
      product.title.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase())
    );

    return filteredProducts.slice(0, limit || filteredProducts.length);
  }

  // Categories
  async getCategories() {
    return dummyElectronicsCategories;
  }

  async getCategory(category_name: string) {
    const filteredProducts = dummyElectronicsProducts.filter(product =>
      product.category === category_name
    );
    return filteredProducts;
  }

  // Shopping Cart
  async getCartContents() {
    return {
      success: true,
      products: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity
      })),
      cartTotal: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
  }

  async addToCart(product_id: number, quantity: number = 1) {
    const product = dummyElectronicsProducts.find(p => p.id === product_id);
    if (!product) {
      throw new Error("Product not found");
    }

    const existingItem = cartItems.find(item => item.id === product_id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cartItems.push({
        ...product,
        quantity: quantity
      });
    }

    return {
      success: true,
      message: `${product.title} added to cart`,
      cart: cartItems
    };
  }

  async updateCart(cart_id: number, quantity: number) {
    const item = cartItems.find(item => item.id === cart_id);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        cartItems = cartItems.filter(item => item.id !== cart_id);
      }
    }

    return {
      success: true,
      cart: cartItems
    };
  }

  async removeFromCart(key: number) {
    cartItems = cartItems.filter(item => item.id !== key);
    return {
      success: true,
      cart: cartItems
    };
  }

  // Wishlist
  async getWishlist() {
    return wishlistItems;
  }

  async addToWishlist(product_id: number) {
    const product = dummyElectronicsProducts.find(p => p.id === product_id);
    if (!product) {
      throw new Error("Product not found");
    }

    const existingItem = wishlistItems.find(item => item.id === product_id);
    if (!existingItem) {
      wishlistItems.push(product);
    }

    return {
      success: true,
      message: `${product.title} added to wishlist`,
      wishlist: wishlistItems
    };
  }

  async removeFromWishlist(product_id: number) {
    wishlistItems = wishlistItems.filter(item => item.id !== product_id);
    return {
      success: true,
      wishlist: wishlistItems
    };
  }

  // Checkout
  async getPaymentMethods() {
    return [
      { id: 1, name: "Credit Card", icon: "credit-card" },
      { id: 2, name: "PayPal", icon: "paypal" },
      { id: 3, name: "Apple Pay", icon: "apple-pay" }
    ];
  }

  async getShippingMethods() {
    return [
      { id: 1, name: "Standard Shipping", price: 0, estimated_days: 5 },
      { id: 2, name: "Express Shipping", price: 9.99, estimated_days: 2 },
      { id: 3, name: "Overnight Shipping", price: 19.99, estimated_days: 1 }
    ];
  }

  async createOrder() {
    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    const newOrder = {
      id: dummyOrders.length + 1,
      order_id: `ORD${String(dummyOrders.length + 1).padStart(3, '0')}`,
      products: cartItems.map(item => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        price: item.price
      })),
      total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      date_added: new Date().toISOString(),
      status: "processing"
    };

    // Clear cart after order
    cartItems = [];

    // Add to dummy orders
    dummyOrders.push(newOrder);

    return {
      success: true,
      order: newOrder
    };
  }

  async getOrders() {
    return {
      success: true,
      orders: dummyOrders
    };
  }

  async getOrderInfo(order_id: number) {
    const order = dummyOrders.find(o => o.id === order_id) ||
                  dummyOrders.find(o => o.order_id === `ORD${String(order_id).padStart(3, '0')}`);
    return order || { error: "Order not found" };
  }

  // User Account
  async getAccountDetails() {
    if (!this.isUserLoggedIn) {
      throw new Error("User not authenticated");
    }
    return dummyUser;
  }

  async updateAccountDetails(details: Record<string, any>) {
    if (!this.isUserLoggedIn) {
      throw new Error("User not authenticated");
    }

    Object.assign(dummyUser, details);
    return dummyUser;
  }

  async getAddressBook() {
    return [
      {
        id: 1,
        firstName: "Tech",
        lastName: "User",
        address: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
        phone: "1234567890"
      }
    ];
  }

  // Utility methods
  setSessionToken(token: string | null) {
    this.sessionToken = token;
    this.isUserLoggedIn = !!token;
  }

  get isAuthenticated() {
    return this.isUserLoggedIn;
  }
}

export default UpdatedDummyApiService;