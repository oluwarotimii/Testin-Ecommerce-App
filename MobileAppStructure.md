## Mobile Application Structure: E-commerce App

This document outlines the proposed screen flow and functionality for the mobile e-commerce application, based on the available OpenCart Mobile API endpoints.

---

### 1. Authentication & User Management

*   **Splash Screen (`/splash`)**
    *   **Purpose:** Initial loading screen, checks for existing user session.
    *   **API Interaction:**
        *   Potentially `GET /account` (if session token exists) to validate session.
    *   **Navigation:**
        *   If logged in: Navigate to Home/Products screen.
        *   If not logged in: Navigate to Welcome/Login screen.

*   **Welcome Screen (`/welcome`)**
    *   **Purpose:** Entry point for new or logged-out users. Options to Login or Register.
    *   **API Interaction:** None directly.
    *   **Navigation:**
        *   To Login Screen (`/login`)
        *   To Register Screen (`/register`)

*   **Login Screen (`/login`)**
    *   **Purpose:** Allows existing users to log in.
    *   **API Interaction:**
        *   `POST /login`: Authenticates user with email and password.
    *   **Navigation:**
        *   On successful login: Navigate to Home/Products screen.
        *   On failure: Display error message.

*   **Register Screen (`/register`)**
    *   **Purpose:** Allows new users to create an account.
    *   **API Interaction:**
        *   `POST /register`: Creates a new user account.
    *   **Navigation:**
        *   On successful registration: Navigate to Login Screen (or directly log in and go to Home).
        *   On failure: Display error message.

*   **Account Screen (`/(tabs)/account`)**
    *   **Purpose:** Displays user's profile information and provides options for managing their account.
    *   **API Interaction:**
        *   `GET /account`: Retrieve current user details.
        *   `POST /account_update`: Update user details (e.g., name, email, password).
        *   `GET /address_book`: View saved addresses.
        *   `GET /logout`: Log out the user.
    *   **Navigation:**
        *   To Order History (`/(tabs)/orders`)
        *   To Address Book Management (if implemented)
        *   To Update Profile (if implemented)

### 2. Product Browsing & Search

*   **Home/Products Screen (`/(tabs)/index` or `/products`)**
    *   **Purpose:** Displays featured products, categories, and promotions. Main entry point after login.
    *   **API Interaction:**
        *   `GET /products`: Fetch a list of products (e.g., latest, featured).
        *   `GET /categories`: Fetch a list of categories for browsing.
    *   **Navigation:**
        *   To Product Detail Screen (`/product/[id]`)
        *   To Categories Screen (`/(tabs)/categories`)
        *   To Search Screen (`/search`)

*   **Product Detail Screen (`/product/[id]`)**
    *   **Purpose:** Shows detailed information about a single product.
    *   **API Interaction:**
        *   `GET /product`: Retrieve details for a specific product.
        *   `POST /cart_add`: Add product to cart.
        *   `POST /wishlist_add`: Add product to wishlist.
    *   **Navigation:**
        *   To Cart Screen (`/(tabs)/cart`)

*   **Categories Screen (`/(tabs)/categories`)**
    *   **Purpose:** Displays a list of all product categories.
    *   **API Interaction:**
        *   `GET /categories`: Fetch all categories.
        *   `GET /category`: Fetch details for a specific category (if needed for subcategories).
    *   **Navigation:**
        *   To Products filtered by Category (e.g., `/products?category_id=X`)

*   **Search Screen (`/search`)**
    *   **Purpose:** Allows users to search for products by keyword.
    *   **API Interaction:**
        *   `GET /search`: Search for products.
    *   **Navigation:**
        *   To Product Detail Screen (`/product/[id]`)

### 3. Shopping Cart & Checkout

*   **Cart Screen (`/(tabs)/cart`)**
    *   **Purpose:** Displays items currently in the shopping cart. Allows quantity adjustments and item removal.
    *   **API Interaction:**
        *   `GET /cart`: Retrieve current cart contents.
        *   `POST /cart_update`: Update product quantity in cart.
        *   `POST /cart_remove`: Remove product from cart.
    *   **Navigation:**
        *   To Checkout Screen (`/checkout`)

*   **Checkout Screen (`/checkout`)**
    *   **Purpose:** Guides the user through the checkout process (shipping, payment, order confirmation).
    *   **API Interaction:**
        *   `GET /shipping_methods`: Retrieve available shipping methods.
        *   `GET /payment_methods`: Retrieve available payment methods.
        *   `POST /order_create`: Create the final order.
    *   **Navigation:**
        *   To Order Confirmation/Success Screen (if implemented)
        *   To Order History (`/(tabs)/orders`)

### 4. Wishlist

*   **Wishlist Screen (`/wishlist`)**
    *   **Purpose:** Displays products saved to the user's wishlist.
    *   **API Interaction:**
        *   `GET /wishlist`: Retrieve wishlist contents.
        *   `POST /wishlist_remove`: Remove product from wishlist.
        *   `POST /cart_add`: Move product from wishlist to cart.
    *   **Navigation:**
        *   To Product Detail Screen (`/product/[id]`)

### 5. Order History

*   **Order History Screen (`/(tabs)/orders`)**
    *   **Purpose:** Displays a list of the user's past orders.
    *   **API Interaction:**
        *   `GET /orders`: Retrieve a list of all orders.
        *   `GET /order_info`: Retrieve detailed information for a specific order.
    *   **Navigation:**
        *   To Order Detail Screen (if implemented, showing `order_info`)

---

This document provides a comprehensive overview of the mobile application's structure based on the provided API.
