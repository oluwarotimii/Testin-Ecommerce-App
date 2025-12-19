# Techin Mobile App

This is a comprehensive mobile e-commerce application built with Expo and React Native, featuring OTA updates, push notifications, and dynamic content management through Airtable.

## Features

### 🚀 Core Features
- **Modern UI/UX** with Apple-level design aesthetics
- **Tab-based navigation** with smooth transitions
- **Product catalog** with search and filtering
- **Shopping cart** and checkout flow
- **User authentication** and account management
- **Order history** and tracking
- **Wishlist** functionality

### 📱 Mobile-First Features
- **OTA Updates** with Expo Updates
- **Push Notifications** with Expo Notifications
- **Dynamic carousel** powered by Airtable
- **Promo notifications** from Airtable
- **Offline support** and error handling
- **Cross-platform** (iOS, Android, Web)

### 🔧 Technical Features
- **TypeScript** for type safety
- **Expo Router** for file-based routing
- **Lucide Icons** for consistent iconography
- **Responsive design** for all screen sizes
- **State management** for cart and user data

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Airtable
Update `services/airtableService.ts` with your Airtable credentials:
```typescript
this.baseUrl = 'https://api.airtable.com/v0/YOUR_BASE_ID';
this.apiKey = 'YOUR_API_KEY';
```

### 3. Configure Push Notifications
Update `app.json` with your project details and notification settings.

### 4. Configure OTA Updates
Set up your Expo project ID in `app.json`:
```json
"updates": {
  "url": "https://u.expo.dev/your-project-id"
}
```

### 5. Run the App
```bash
npm run dev
```

## Airtable Schema

### Carousel Table
- **Title** (Single line text)
- **Subtitle** (Single line text)
- **Image** (Attachment)
- **LinkType** (Single select: product, category, external, none)
- **LinkValue** (Single line text)
- **Active** (Checkbox)
- **Order** (Number)
- **BackgroundColor** (Single line text)

### Notifications Table
- **Title** (Single line text)
- **Message** (Long text)
- **Type** (Single select: info, warning, success, error)
- **Active** (Checkbox)
- **StartDate** (Date)
- **EndDate** (Date)
- **TargetAudience** (Single select: all, new, returning, vip)
- **ActionType** (Single select: none, navigate, external)
- **ActionValue** (Single line text)

## API Integration

The app is designed to work with OpenCart's REST API. Update the base URLs in the service files to point to your OpenCart installation.

Alternatively, you can integrate with WordPress/WooCommerce by configuring the appropriate environment variables (see WordPress Integration section below).

## Base URL

All API endpoints are relative to the following base URL:

`http://localhost/testin/index.php?route=api/mobile/`

## Authentication

For endpoints that require authentication, you must first log in to obtain a session token. This token must be included in the Cookie header of subsequent requests.

### 1. Login

Authenticates a user and returns a session token.

*   **Endpoint:** `login`
*   **Method:** `POST`
*   **Parameters:**
    *   `email` (string, required)
    *   `password` (string, required)

**cURL Example:**

```bash
curl -X POST -d "email=your_email@example.com&password=your_password" http://localhost/testin/index.php?route=api/mobile/login
```

### 2. Register

Creates a new customer account.

*   **Endpoint:** `register`
*   **Method:** `POST`
*   **Parameters:**
    *   `firstname` (string, required)
    *   `lastname` (string, required)
    *   `email` (string, required)
    *   `telephone` (string, required)
    *   `password` (string, required)

**cURL Example:**

```bash
curl -X POST -d "firstname=John&lastname=Doe&email=john.doe@example.com&telephone=1234567890&password=password123" http://localhost/testin/index.php?route=api/mobile/register
```

### 3. Logout

Logs the user out and invalidates their session.

*   **Endpoint:** `logout`
*   **Method:** `POST`

**cURL Example:**

```bash
curl -X POST --cookie "OCSESSID=your_session_token" http://localhost/testin/index.php?route=api/mobile/logout
```

## Products

### 1. Get Products

Retrieves a list of products with filtering, sorting, and pagination.

*   **Endpoint:** `products`
*   **Method:** `GET`
*   **Parameters:**
    *   `category_id` (int, optional)
    *   `manufacturer_id` (int, optional)
    *   `sort` (string, optional) - e.g., `p.price`, `p.rating`, `p.model`
    *   `order` (string, optional) - `ASC` or `DESC`
    *   `page` (int, optional)
    *   `limit` (int, optional)

**cURL Example:**

```bash
curl http://localhost/testin/index.php?route=api/mobile/products&category_id=20&sort=p.price&order=ASC
```

### 2. Get Single Product

Retrieves detailed information for a single product.

*   **Endpoint:** `product`
*   **Method:** `GET`
*   **Parameters:**
    *   `product_id` (int, required)

**cURL Example:**

```bash
curl http://localhost/testin/index.php?route=api/mobile/product&product_id=43
```

### 3. Search Products

Searches for products by keyword.

*   **Endpoint:** `search`
*   **Method:** `GET`
*   **Parameters:**
    *   `search` (string, required)
    *   `page` (int, optional)
    *   `limit` (int, optional)

**cURL Example:**

```bash
curl http://localhost/testin/index.php?route=api/mobile/search&search=macbook
```

## Categories

### 1. Get All Categories

Retrieves a list of all product categories.

*   **Endpoint:** `categories`
*   **Method:** `GET`

**cURL Example:**

```bash
curl http://localhost/testin/index.php?route=api/mobile/categories
```

### 2. Get Single Category

Retrieves information for a specific category.

*   **Endpoint:** `category`
*   **Method:** `GET`
*   **Parameters:**
    *   `category_id` (int, required)

**cURL Example:**

```bash
curl http://localhost/testin/index.php?route=api/mobile/category&category_id=20
```

## Shopping Cart

### 1. Get Cart Contents

Retrieves the contents of the user's shopping cart.

*   **Endpoint:** `cart`
*   **Method:** `GET`

**cURL Example:**

```bash
curl --cookie "OCSESSID=your_session_token" http://localhost/testin/index.php?route=api/mobile/cart
```

### 2. Add to Cart

Adds a product to the shopping cart.

*   **Endpoint:** `cart_add`
*   **Method:** `POST`
*   **Parameters:**
    *   `product_id` (int, required)
    *   `quantity` (int, optional)

**cURL Example:**

```bash
curl -X POST --cookie "OCSESSID=your_session_token" -d "product_id=43&quantity=2" http://localhost/testin/index.php?route=api/mobile/cart_add
```

### 3. Update Cart

Updates the quantity of a product in the cart.

*   **Endpoint:** `cart_update`
*   **Method:** `POST`
*   **Parameters:**
    *   `quantity[cart_id]` (int, required)

**cURL Example:**

```bash
curl -X POST --cookie "OCSESSID=your_session_token" -d "quantity[cart_id]=3" http://localhost/testin/index.php?route=api/mobile/cart_update
```

### 4. Remove from Cart

Removes a product from the cart.

*   **Endpoint:** `cart_remove`
*   **Method:** `POST`
*   **Parameters:**
    *   `key` (int, required) - The `cart_id` of the product to remove.

**cURL Example:**

```bash
curl -X POST --cookie "OCSESSID=your_session_token" -d "key=cart_id" http://localhost/testin/index.php?route=api/mobile/cart_remove
```

## Wishlist

### 1. Get Wishlist

Retrieves the user's wishlist.

*   **Endpoint:** `wishlist`
*   **Method:** `GET`

**cURL Example:**

```bash
curl --cookie "OCSESSID=your_session_token" http://localhost/testin/index.php?route=api/mobile/wishlist
```

### 2. Add to Wishlist

Adds a product to the user's wishlist.

*   **Endpoint:** `wishlist_add`
*   **Method:** `POST`
*   **Parameters:**
    *   `product_id` (int, required)

**cURL Example:**

```bash
curl -X POST --cookie "OCSESSID=your_session_token" -d "product_id=43" http://localhost/testin/index.php?route=api/mobile/wishlist_add
```

### 3. Remove from Wishlist

Removes a product from the user's wishlist.

*   **Endpoint:** `wishlist_remove`
*   **Method:** `POST`
*   **Parameters:**
    *   `product_id` (int, required)

**cURL Example:**

```bash
curl -X POST --cookie "OCSESSID=your_session_token" -d "product_id=43" http://localhost/testin/index.php?route=api/mobile/wishlist_remove
```

## Checkout

### 1. Get Payment Methods

Retrieves available payment methods.

*   **Endpoint:** `payment_methods`
*   **Method:** `GET`

**cURL Example:**

```bash
curl --cookie "OCSESSID=your_session_token" http://localhost/testin/index.php?route=api/mobile/payment_methods
```

### 2. Get Shipping Methods

Retrieves available shipping methods.

*   **Endpoint:** `shipping_methods`
*   **Method:** `GET`

**cURL Example:**

```bash
curl --cookie "OCSESSID=your_session_token" http://localhost/testin/index.php?route=api/mobile/shipping_methods
```

### 3. Create Order

Creates a new order.

*   **Endpoint:** `order_create`
*   **Method:** `POST`

**cURL Example:**

```bash
curl -X POST --cookie "OCSESSID=your_session_token" http://localhost/testin/index.php?route=api/mobile/order_create
```

### 4. Get Orders

Retrieves a list of the user's past orders.

*   **Endpoint:** `orders`
*   **Method:** `GET`

**cURL Example:**

```bash
curl --cookie "OCSESSID=your_session_token" http://localhost/testin/index.php?route=api/mobile/orders
```

### 5. Get Order Info

Retrieves the details of a specific order.

*   **Endpoint:** `order_info`
*   **Method:** `GET`
*   **Parameters:**
    *   `order_id` (int, required)

**cURL Example:**

```bash
curl --cookie "OCSESSID=your_session_token" http://localhost/testin/index.php?route=api/mobile/order_info&order_id=1
```

## User Account

### 1. Get Account Details

Retrieves the logged-in user's account details.

*   **Endpoint:** `account`
*   **Method:** `GET`

**cURL Example:**

```bash
curl --cookie "OCSESSID=your_session_token" http://localhost/testin/index.php?route=api/mobile/account
```

## Test Account Details

For testing the application, you can use the following dummy account credentials:

### Login Test Credentials:
- **Email:** `test@example.com`
- **Password:** `password123`

Alternatively, you can register a new account with:
- **First Name:** `Test`
- **Last Name:** `User`
- **Email:** Any valid email (e.g., `newtest@example.com`)
- **Phone:** Any valid phone number (e.g., `1234567890`)
- **Password:** `password123`

### Demo Features:
- Browse through the product catalog
- Add items to cart and wishlist
- View order history
- Switch between light and dark modes
- Access all app sections (home, categories, cart, orders, account)

The dummy API service simulates realistic responses for all user interactions such as adding to cart, placing orders, etc.

### 2. Update Account Details

Updates the logged-in user's account details.

*   **Endpoint:** `account_update`
*   **Method:** `POST`
*   **Parameters:**
    *   `firstname` (string, optional)
    *   `lastname` (string, optional)
    *   `email` (string, optional)
    *   `telephone` (string, optional)
    *   `password` (string, optional)

**cURL Example:**

```bash
curl -X POST --cookie "OCSESSID=your_session_token" -d "firstname=Johnathan" http://localhost/testin/index.php?route=api/mobile/account_update
```

### 3. Get Address Book

Retrieves the user's address book.

*   **Endpoint:** `address_book`
*   **Method:** `GET`

**cURL Example:**

```bash
curl --cookie "OCSESSID=your_session_token" http://localhost/testin/index.php?route=api/mobile/address_book
```

## WordPress/WooCommerce Integration

The application now supports integration with WordPress/WooCommerce sites using the WooCommerce REST API. Follow the guide in [WordPressIntegration.md](WordPressIntegration.md) to set up your WordPress site and connect it to the mobile app.

### Switching Between API Services

You can easily switch between different API backends by changing the environment variable:

- Set `EXPO_PUBLIC_API_SERVICE_TYPE=wordpress` to use WordPress/WooCommerce API
- Set `EXPO_PUBLIC_API_SERVICE_TYPE=dummy` to use local dummy data (default)

The application's architecture allows for seamless switching between different API services without code changes.

## Notification Troubleshooting

### Issue Summary
Notifications were not working in preview and production builds of the mobile app. The primary cause was that notification initialization code was commented out in the main layout file.

### Root Cause
In `app/_layout.tsx`, the notification initialization code was commented out, preventing the app from registering for push notifications and setting up proper listeners.

### Fix Applied
The notification initialization code was uncommented in `app/_layout.tsx`:

```typescript
// Initialize notifications
const initNotifications = async () => {
  const token = await notificationService.initialize();
  // If token is null, it means permissions were denied
  if (!token) {
    console.log("Push notifications not enabled due to denied permissions");
  }
};

initNotifications();
```

### Additional Configuration Requirements

#### 1. Build Configuration
Make sure your `app.json` contains the proper notification configuration:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/logo.png",
          "color": "#007AFF"
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": [
          "background-fetch",
          "remote-notification"
        ]
      }
    },
    "android": {
      "permissions": ["android.permission.POST_NOTIFICATIONS"]
    }
  }
}
```

#### 2. Environment Variables
Ensure your environment variables are properly set:

```env
EXPO_PUBLIC_API_SERVICE_TYPE=wordpress  # or dummy
EXPO_PUBLIC_WORDPRESS_URL=https://your-wordpress-site.com
EXPO_PUBLIC_WORDPRESS_CONSUMER_KEY=your_consumer_key
EXPO_PUBLIC_WORDPRESS_CONSUMER_SECRET=your_consumer_secret
EXPO_PUBLIC_DASHBOARD_URL=https://your-dashboard-url.com
```

#### 3. Server-Side Token Registration
The app attempts to register the Expo push token with your server at `${DASHBOARD_API_BASE_URL}/api/expo/token`. Make sure this endpoint exists on your server.

### Testing Notifications

#### For Development (Preview Builds)
1. Notifications only work on physical devices, not in simulators/emulators
2. When testing in Expo Go, make sure you've granted notification permissions
3. For preview builds, ensure the build was created with the proper configuration

#### For Production Builds
1. Physical device is required for testing
2. Ensure notification permissions are granted
3. Check that the push token is successfully registered with your server

### Notification Payload Format
To make notifications navigate to specific screens when tapped, use this format:

```json
{
  "title": "Your Notification Title",
  "body": "Your Notification Body",
  "data": {
    "linkType": "category|product|page|url",
    "linkValue": "category-id|product-id|page-name|url"
  }
}
```

### Common Issues and Solutions

#### Issue: Notifications don't appear
- **Cause**: Permissions not granted
- **Solution**: Check device notification settings and app permissions

#### Issue: App doesn't navigate when notification is tapped
- **Cause**: Incorrect data payload format
- **Solution**: Ensure notification contains proper `linkType` and `linkValue` in the data field

#### Issue: Push token not registered with server
- **Cause**: Server endpoint doesn't exist or network issue
- **Solution**: Verify that `${DASHBOARD_API_BASE_URL}/api/expo/token` endpoint exists and is accessible

#### Issue: Notifications work in development but not production
- **Cause**: Different API endpoints or build configurations
- **Solution**: Verify that production build uses correct server URLs and credentials

### Build Commands for Different Environments

#### Development
```bash
npx expo start
```

#### Preview Build
```bash
eas build --profile preview --platform all
```

#### Production Build
```bash
eas build --profile production --platform all
```

### Important Note About OTA Updates and Native Permissions

**Native configuration changes (like the new Android permission) will NOT be applied through OTA updates.**

If you make changes to:
- Android permissions in app.json
- iOS Info.plist settings
- Native plugins configurations
- Build properties

You must create a new native build using:
```bash
eas build --profile preview --platform all  # For preview
# or
eas build --profile production --platform all  # For production
```

OTA updates only work for JavaScript/TypeScript code changes, assets, and configuration that doesn't require native code changes.

For the notification permissions fix to work properly:
1. You must create a new native build with `eas build`
2. Users will need to download the updated app from the app store
3. Only after the native build with the correct permissions will OTA updates work properly for notification functionality

### Debugging Tips

1. Check the device logs for notification-related messages
2. Verify that the Expo push token is obtained and logged in the console
3. Confirm that the token is sent to your server successfully
4. Test notification delivery using Expo's push notification tool
5. Ensure the notification payload contains the expected data structure
