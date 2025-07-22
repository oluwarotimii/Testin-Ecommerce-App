# OpenCart Mobile API

This document provides a guide to the custom REST API created for the OpenCart mobile application.

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