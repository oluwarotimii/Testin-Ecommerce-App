# Awoof Corner - React Native Expo Feature

A high-energy, deal-focused shopping feature for your e-commerce app. Built with React Native, Expo, and WooCommerce integration.

## 📱 What's Included

### Screens (5 Total)
1. **AwoofFeedScreen** - Main product grid with engaging deal cards
2. **ProductDetailScreen** - Full product details with quantity selector
3. **AwoofMiniCartModal** - Quick cart summary modal
4. **AwoofCheckoutWebView** - Secure WooCommerce checkout
5. **OrderSuccessScreen** - Celebration screen after purchase

### Supporting Files
- **AwoofCornerNavigator** - Stack navigator configuration
- **AwoofUtils** - Cart management and helper functions

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Using npm
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-webview expo-linear-gradient
npm install react-native-screens react-native-safe-area-context

# Or using yarn
yarn add @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
yarn add react-native-webview expo-linear-gradient
yarn add react-native-screens react-native-safe-area-context
```

### 2. Copy Files to Your Project

```
your-app/
├── src/
│   ├── screens/
│   │   ├── AwoofCorner/
│   │   │   ├── AwoofFeedScreen.tsx
│   │   │   ├── ProductDetailScreen.tsx
│   │   │   ├── AwoofMiniCartModal.tsx
│   │   │   ├── AwoofCheckoutWebView.tsx
│   │   │   └── OrderSuccessScreen.tsx
│   ├── navigation/
│   │   └── AwoofCornerNavigator.tsx
│   └── utils/
│       └── AwoofUtils.ts
```

### 3. Add to Bottom Tab Navigator

```typescript
// In your MainNavigator.tsx or App.tsx
import { AwoofCornerNavigator } from './navigation/AwoofCornerNavigator';

<Tab.Navigator>
  <Tab.Screen name="Home" component={HomeScreen} />
  <Tab.Screen name="Categories" component={CategoriesScreen} />
  
  {/* Add Awoof Corner tab */}
  <Tab.Screen 
    name="AwoofCorner" 
    component={AwoofCornerNavigator}
    options={{
      tabBarLabel: 'Awoof Corner',
      tabBarIcon: ({ color, size }) => (
        <Text style={{ fontSize: 24 }}>🔥</Text>
      ),
    }}
  />
  
  <Tab.Screen name="Cart" component={CartScreen} />
  <Tab.Screen name="Orders" component={OrdersScreen} />
  <Tab.Screen name="Account" component={AccountScreen} />
</Tab.Navigator>
```

## 🔧 Customization Guide

### Replace Demo Data with Real API

#### AwoofFeedScreen.tsx
```typescript
// Replace DEMO_DEALS with API call
import { fetchAwoofDeals } from '../utils/AwoofUtils';

const [deals, setDeals] = useState([]);

useEffect(() => {
  loadDeals();
}, []);

const loadDeals = async () => {
  const data = await fetchAwoofDeals();
  setDeals(data);
};
```

#### Update API Endpoints in AwoofUtils.ts
```typescript
export async function fetchAwoofDeals(): Promise<AwoofProduct[]> {
  const response = await fetch('YOUR_API_URL/api/awoof-deals');
  const data = await response.json();
  return data;
}
```

### Connect to WooCommerce

#### AwoofCheckoutWebView.tsx
```typescript
// Replace demo URL with your WooCommerce store
const CHECKOUT_URL = 'https://your-store.com/checkout/';

// Build checkout URL with cart items
import { buildWooCommerceCheckoutUrl } from '../utils/AwoofUtils';

const checkoutUrl = buildWooCommerceCheckoutUrl(
  'https://your-store.com',
  cartItems
);
```

### Integrate State Management

If you're using Redux, Zustand, or Context API:

```typescript
// Replace local cart state with your global state
import { useSelector, useDispatch } from 'react-redux';

const cartItems = useSelector(state => state.awoofCart.items);
const dispatch = useDispatch();

const handleAddToCart = (product) => {
  dispatch(addToAwoofCart(product));
};
```

## 🎨 Theming

### Update Brand Colors

All screens use your navy blue (`#001f3f`). To change:

```typescript
// Find and replace these colors:
const BRAND_PRIMARY = '#001f3f';
const BRAND_SECONDARY = '#003d7a';
const BRAND_ACCENT = '#FFD700';

// Update gradient colors in LinearGradient components:
colors={['#001f3f', '#003d7a']}
```

### Customize Card Layout

In `AwoofFeedScreen.tsx`:

```typescript
// Change grid columns
numColumns={2} // Change to 1 for list view, 3 for denser grid

// Adjust card width
const CARD_WIDTH = (width - 48) / 2; // Modify spacing
```

## 🔒 Security Considerations

### WebView Checkout
- The WebView is locked to checkout-related URLs only
- Payment processing happens on WooCommerce/Paystack (PCI compliant)
- SSL/HTTPS enforced for all checkout pages
- Header/footer stripped for clean checkout experience

### Order Verification
```typescript
// In AwoofCheckoutWebView.tsx
const handleOrderSuccess = (url: string) => {
  // Verify order on backend before showing success
  verifyOrder(orderId).then(isValid => {
    if (isValid) {
      navigation.replace('OrderSuccess', { orderId });
    }
  });
};
```

## 📊 Analytics Integration

Track key events:

```typescript
import { trackAwoofEvent, AwoofEvents } from './AwoofUtils';

// Track product view
trackAwoofEvent(AwoofEvents.VIEW_PRODUCT, {
  productId: product.id,
  productName: product.name,
});

// Track purchase
trackAwoofEvent(AwoofEvents.COMPLETE_ORDER, {
  orderId: orderId,
  total: grandTotal,
  itemCount: cartItems.length,
});
```

## 🎯 Key Features

### Isolated Cart System
- Awoof Corner has its own cart (doesn't mix with main app cart)
- Prevents confusion between browsing and buying
- Clear separation of "wishlist" vs "ready to buy"

### Locked WebView Checkout
- Users can't navigate away from checkout
- Alert before leaving checkout page
- Auto-detects successful payment
- Seamless transition to success screen

### High-Energy Design
- Bold discount badges
- Stock urgency indicators
- Animated success screen
- Trust badges throughout

## 🐛 Troubleshooting

### WebView not loading
```bash
# iOS
cd ios && pod install && cd ..

# Make sure Info.plist has:
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
```

### Navigation errors
```typescript
// Make sure all screen names match exactly
navigation.navigate('ProductDetail') // Not 'productDetail'
```

### Images not loading
```typescript
// Verify image URLs are valid
// Add error handling
<Image 
  source={{ uri: product.image }}
  onError={() => console.log('Image failed to load')}
/>
```

## 📝 Next Steps

1. **Connect to your backend API**
   - Replace demo data in screens
   - Update API endpoints in AwoofUtils.ts

2. **Configure WooCommerce**
   - Set up checkout URL
   - Test payment flow
   - Configure Paystack integration

3. **Add state management**
   - Integrate with Redux/Zustand
   - Persist cart across sessions
   - Sync with backend

4. **Implement analytics**
   - Track user behavior
   - Monitor conversion rates
   - A/B test deal layouts

5. **Polish & test**
   - Test on both iOS and Android
   - Handle edge cases (no internet, failed payments)
   - Add loading states and error messages

## 💡 Tips

- Start with the feed screen, test navigation
- Use demo data initially, swap in API calls later
- Test checkout flow thoroughly before launch
- Monitor analytics to optimize deal placement
- Update stock counts in real-time if possible

## 🤝 Support

Need help integrating? Check:
- React Navigation docs: https://reactnavigation.org
- Expo WebView: https://docs.expo.dev/versions/latest/sdk/webview/
- WooCommerce API: https://woocommerce.github.io/woocommerce-rest-api-docs/

---

Built with ❤️ for high-converting mobile commerce
