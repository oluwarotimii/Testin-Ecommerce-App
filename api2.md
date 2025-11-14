# OpenCart Mobile API

This file provides a controller-based API for this OpenCart installation. It allows you to interact with your store's data through a simple RESTful interface, suitable for mobile applications and headless frontends.

## Base URL

The API is accessible through the standard OpenCart `index.php` file with a specific route. The base URL for all endpoints is:
`http://localhost/techin/index.php?route=api/mobile/`

## Authentication

For endpoints that require a customer to be logged in, you first need to use the `login` endpoint. The login endpoint will return a session ID in the `token` field. You need to send this session ID as a cookie named `OCSESSID` in subsequent requests.

Example of using the session cookie with `curl` (assuming `cookies.txt` contains the session cookie from a successful login):
```bash
curl -b cookies.txt "http://localhost/techin/index.php?route=api/mobile/account"
```

## Environment Setup

To configure the mobile application to communicate with the OpenCart API, environment variables are used. This allows for easy switching between development and production API endpoints and securely managing sensitive information like API keys.

### Using `.env` files

The project uses `react-native-dotenv` to load environment variables from a `.env` file.

1.  **Create a `.env` file**: In the root directory of your project, create a file named `.env`.

2.  **Add API variables**: Open the `.env` file and add the following lines:

    ```
    API_BASE_URL=http://localhost/techin/index.php?route=api/mobile/
    API_KEY=TECHTENT-AUG-2025-frobenius
    ```
    *   `API_BASE_URL`: This is the base URL for your OpenCart Mobile API. Adjust `http://localhost/techin/` to your OpenCart installation's URL.
    *   `API_KEY`: This is the secret key required to authenticate with the API. **Do not share this key publicly.**

3.  **Babel Configuration**: Ensure your `babel.config.js` file is configured to use `react-native-dotenv`. It should look similar to this:

    ```javascript
    module.exports = function(api) {
      api.cache(true);
      return {
        presets: ['babel-preset-expo'],
        plugins: [
          ["module:react-native-dotenv", {
            "env": ["API_BASE_URL", "API_KEY"]
          }]
        ]
      };
    };
    ```
    This configuration tells Babel to make `API_BASE_URL` and `API_KEY` available via `process.env` in your application code.

### Accessing Variables in Code

In your JavaScript/TypeScript files (e.g., `services/apiService.ts`), you can access these variables using `process.env`:

```typescript
// Example in services/apiService.ts
class ApiService {
  private baseUrl: string;
  private apiKey: string; // Added for clarity

  constructor(sessionToken: string | null = null) {
    this.baseUrl = process.env.API_BASE_URL || 'http://localhost/testin/';
    this.apiKey = process.env.API_KEY || ''; // Initialize API Key
    // ...
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey, // Use the API Key here
          ...(this.sessionToken ? { 'Cookie': `OCSESSID=${this.sessionToken}` } : {}),
          ...options.headers,
        },
      });
      // ...
    }
  }
  // ...
}
```

## Endpoints

Below is a detailed list of available endpoints, their methods, parameters, and expected responses.

### 1. General

#### `GET /` (index)
*   **Description:** Checks if the API endpoint is reachable.
*   **Parameters:** None
*   **Example `curl`:**
    ```bash
    curl "http://localhost/techin/index.php?route=api/mobile"
    ```
*   **Expected Response:**
    ```json
    {
        "success": true,
        "message": "Mobile API endpoint reached successfully!"
    }
    ```

### 2. Catalog

#### `GET /products`
*   **Description:** Retrieves a list of products.
*   **Parameters (Optional):**
    *   `category_id` (int): Filter products by category ID.
    *   `manufacturer_id` (int): Filter products by manufacturer ID.
    *   `sort` (string): Sort order (e.g., `p.date_added`, `pd.name`, `p.price`).
    *   `order` (string): Sort direction (`ASC` or `DESC`).
    *   `page` (int): Page number for pagination.
    *   `limit` (int): Number of products per page.
*   **Example `curl`:**
    ```bash
    curl "http://localhost/techin/index.php?route=api/mobile/products&category_id=20&sort=p.price&order=ASC&limit=5"
    ```
*   **Expected Response:**
    ```json
    [
        {
            "product_id": "...",
            "thumb": "...",
            "name": "...",
            "description": "...",
            "price": "...",
            "special": false,
            "tax": "...",
            "minimum": "1",
            "rating": 0,
            "href": "..."
        }
    ]
    ```

#### `GET /product`
*   **Description:** Retrieves details for a single product.
*   **Parameters (Required):**
    *   `product_id` (int): The ID of the product.
*   **Example `curl`:**
    ```bash
    curl "http://localhost/techin/index.php?route=api/mobile/product&product_id=42"
    ```
*   **Expected Response (Success):**
    ```json
    {
        "success": true,
        "data": {
            "product_id": "...",
            "name": "...",
            "description": "...",
            "price": "...",
            "image": "...",
            "images": [],
            "options": []
        }
    }
    ```
*   **Expected Response (Failure):**
    ```json
    {
        "success": false,
        "message": "Product not found"
    }
    ```

#### `GET /categories`
*   **Description:** Retrieves a list of all product categories.
*   **Parameters:** None
*   **Example `curl`:**
    ```bash
    curl "http://localhost/techin/index.php?route=api/mobile/categories"
    ```
*   **Expected Response:**
    ```json
    {
        "success": true,
        "data": [
            {
                "category_id": "...",
                "name": "...",
                "image": "...",
                "parent_id": "...",
                "sort_order": "...",
                "status": "...",
                "date_added": "...",
                "date_modified": "...",
                "language_id": "...",
                "description": "...",
                "meta_title": "...",
                "meta_description": "...",
                "meta_keyword": "...",
                "store_id": "..."
            }
        ]
    }
    ```

#### `GET /category`
*   **Description:** Retrieves details for a single category.
*   **Parameters (Required):**
    *   `category_id` (int): The ID of the category.
*   **Example `curl`:**
    ```bash
    curl "http://localhost/techin/index.php?route=api/mobile/category&category_id=20"
    ```
*   **Expected Response (Success):**
    ```json
    {
        "success": true,
        "data": {
            "category_id": "...",
            "name": "...",
            "description": "...",
            "image": "..."
        }
    }
    ```
*   **Expected Response (Failure):**
    ```json
    {
        "success": false,
        "message": "Category not found"
    }
    ```

#### `GET /search`
*   **Description:** Searches for products based on a keyword.
*   **Parameters (Optional):**
    *   `search` (string): The search query.
    *   `limit` (int): Number of results per page (default 20).
    *   `page` (int): Page number (default 1).
*   **Example `curl`:**
    ```bash
    curl "http://localhost/techin/index.php?route=api/mobile/search&search=iPhone"
    ```
*   **Expected Response:**
    ```json
    {
        "success": true,
        "data": [
            {
                "product_id": "...",
                "name": "...",
                "description": "...",
                "price": "...",
                "image": "...",
                "href": "..."
            }
        ]
    }
    ```

### 3. Customer Accounts

#### `POST /login`
*   **Description:** Logs in a customer and establishes a session.
*   **Parameters (Required - in POST body):**
    *   `email` (string): Customer's email.
    *   `password` (string): Customer's password.
*   **Example `curl`:**
    ```bash
    curl -X POST -d "email=your_customer_email@example.com&password=your_customer_password" -c cookies.txt "http://localhost/techin/index.php?route=api/mobile/login"
    ```
*   **Expected Response (Success):**
    ```json
    {
        "success": true,
        "message": "Login successful",
        "token": "..."
    }
    ```
*   **Expected Response (Failure):**
    ```json
    {
        "success": false,
        "message": "Invalid email or password"
    }
    ```

#### `POST /register`
*   **Description:** Registers a new customer account.
*   **Parameters (Required - in POST body):**
    *   `firstname` (string)
    *   `lastname` (string)
    *   `email` (string)
    *   `telephone` (string)
    *   `password` (string)
*   **Example `curl`:**
    ```bash
    curl -X POST -d "firstname=API&lastname=User&email=newuser@example.com&telephone=1234567890&password=securepassword123" "http://localhost/techin/index.php?route=api/mobile/register"
    ```
*   **Expected Response (Success):**
    ```json
    {
        "success": true,
        "message": "Account created successfully"
    }
    ```
*   **Expected Response (Failure):**
    ```json
    {
        "success": false,
        "errors": {
            "email": "Warning: E-Mail Address is already registered!"
        }
    }
    ```

#### `GET /logout`
*   **Description:** Logs out the current customer session.
*   **Parameters:** None
*   **Authentication:** Required
*   **Example `curl`:**
    ```bash
    curl -b cookies.txt "http://localhost/techin/index.php?route=api/mobile/logout"
    ```
*   **Expected Response:**
    ```json
    {
        "success": true,
        "message": "Logout successful"
    }
    ```

#### `GET /account`
*   **Description:** Retrieves details of the currently logged-in customer.
*   **Parameters:** None
*   **Authentication:** Required
*   **Example `curl`:**
    ```bash
    curl -b cookies.txt "http://localhost/techin/index.php?route=api/mobile/account"
    ```
*   **Expected Response (Success):**
    ```json
    {
        "success": true,
        "data": {
            "customer_id": "...",
            "firstname": "...",
            "lastname": "...",
            "email": "...",
            "telephone": "..."
        }
    }
    ```
*   **Expected Response (Failure):**
    ```json
    {
        "error": "You must be logged in to view your account details."
    }
    ```

#### `POST /account_update`
*   **Description:** Updates details of the currently logged-in customer.
*   **Parameters (Optional - in POST body):**
    *   `firstname` (string)
    *   `lastname` (string)
    *   `email` (string)
    *   `telephone` (string)
    *   `password` (string): Only if you want to change it.
*   **Authentication:** Required
*   **Example `curl`:**
    ```bash
    curl -X POST -b cookies.txt -d "telephone=9998887777" "http://localhost/techin/index.php?route=api/mobile/account_update"
    ```
*   **Expected Response (Success):**
    ```json
    {
        "success": true,
        "message": "Account updated successfully"
    }
    ```
*   **Expected Response (Failure):astere
    ```json
    {
        "success": false,
        "errors": {
            "email": "Warning: E-Mail Address is already registered!"
        }
    }
    ```

#### `GET /address_book`
*   **Description:** Retrieves the address book entries for the logged-in customer.
*   **Parameters:** None
*   **Authentication:** Required
*   **Example `curl`:**
    ```bash
    curl -b cookies.txt "http://localhost/techin/index.php?route=api/mobile/address_book"
    ```
*   **Expected Response (Success):astere
    ```json
    {
        "success": true,
        "data": []
    }
    ```
*   **Expected Response (Failure):astere
    ```json
    {
        "error": "You must be logged in to view your address book."
    }
    ```

### 4. Shopping Cart

#### `GET /cart`
*   **Description:** Retrieves the current contents of the shopping cart.
*   **Parameters:** None
*   **Authentication:** Required
*   **Example `curl`:**
    ```bash
    curl -b cookies.txt "http://localhost/techin/index.php?route=api/mobile/cart"
    ```
*   **Expected Response:**
    ```json
    {
        "products": [],
        "totals": []
    }
    ```

#### `POST /cart_add`
*   **Description:** Adds a product to the shopping cart.
*   **Parameters (Required - in POST body):**
    *   `product_id` (int): The ID of the product to add.
*   **Parameters (Optional - in POST body):**
    *   `quantity` (int): Default is 1.
    *   `option` (array): Key-value pairs for product options (e.g., `option[product_option_id]=product_option_value_id`).
*   **Authentication:** Required
*   **Example `curl`:**
    ```bash
    curl -X POST -b cookies.txt -d "product_id=40&quantity=1" "http://localhost/techin/index.php?route=api/mobile/cart_add"
    ```
*   **Expected Response (Success):astere
    ```json
    {
        "success": "Success: You have added ... to your shopping cart!",
        "total": "..."
    }
    ```
*   **Expected Response (Failure - e.g., missing required option):astere
    ```json
    {
        "error": {
            "option": {
                "product_option_id": "Error message"
            }
        }
    }
    ```

#### `POST /cart_update`
*   **Description:** Updates the quantity of items in the shopping cart.
*   **Parameters (Required - in POST body):astere
    *   `quantity` (array): An associative array where keys are `cart_id` and values are the new `quantity`.
*   **Authentication:** Required
*   **Example `curl`:**
    ```bash
    curl -X POST -b cookies.txt -d "quantity[2]=2" "http://localhost/techin/index.php?route=api/mobile/cart_update"
    ```
*   **Expected Response:**
    ```json
    {
        "success": "Success: You have modified your shopping cart!"
    }
    ```

#### `POST /cart_remove`
*   **Description:** Removes an item from the shopping cart.
*   **Parameters (Required - in POST body):astere
    *   `key` (string): The unique key of the cart item to remove (this is the `cart_id` from the `GET /cart` response).
*   **Authentication:** Required
*   **Example `curl`:**
    ```bash
    curl -X POST -b cookies.txt -d "key=2" "http://localhost/techin/index.php?route=api/mobile/cart_remove"
    ```
*   **Expected Response:**
    ```json
    {
        "success": "Success: Your shopping cart has been modified!"
    }
    ```

### 5. Wishlist

#### `GET /wishlist`
*   **Description:** Retrieves the current contents of the customer's wishlist.
*   **Parameters:** None
*   **Authentication:** Required
*   **Example `curl`:**
    ```bash
    curl -b cookies.txt "http://localhost/techin/index.php?route=api/mobile/wishlist"
    ```
*   **Expected Response (Success):astere
    ```json
    {
        "products": []
    }
    ```
*   **Expected Response (Failure):astere
    ```json
    {
        "error": "You must be logged in to view your wishlist."
    }
    ```

#### `POST /wishlist_add`
*   **Description:** Adds a product to the customer's wishlist.
*   **Parameters (Required - in POST body):astere
    *   `product_id` (int): The ID of the product to add.
*   **Authentication:** Required
*   **Example `curl`:**
    ```bash
    curl -X POST -b cookies.txt -d "product_id=40" "http://localhost/techin/index.php?route=api/mobile/wishlist_add"
    ```
*   **Expected Response (Success):astere
    ```json
    {
        "success": "Success: You have added ... to your wish list!",
        "total": "Wish List (1)"
    }
    ```
*   **Expected Response (Failure):astere
    ```json
    {
        "error": "You must be logged in to save a product to your wishlist!"
    }
    ```

#### `POST /wishlist_remove`
*   **Description:** Removes a product from the customer's wishlist.
*   **Parameters (Required - in POST body):astere
    *   `product_id` (int): The ID of the product to remove.
*   **Authentication:** Required
*   **Example `curl`:**
    ```bash
    curl -X POST -b cookies.txt -d "product_id=40" "http://localhost/techin/index.php?route=api/mobile/wishlist_remove"
    ```
*   **Expected Response (Success):astere
    ```json
    {
        "success": "Success: You have modified your wish list!"
    }
    ```
*   **Expected Response (Failure):astere
    ```json
    {
        "error": "You must be logged in to modify your wishlist!"
    }
    ```

### 6. Checkout & Orders

#### `GET /payment_methods`
*   **Description:** Retrieves available payment methods for the current session.
*   **Parameters:** None
*   **Authentication:** Required
*   **Example `curl`:**
    ```bash
    curl -b cookies.txt "http://localhost/techin/index.php?route=api/mobile/payment_methods"
    ```
*   **Expected Response (Success):astere
    ```json
    {
        "payment_methods": {
            "free_checkout": {
                "code": "free_checkout",
                "title": "Free Checkout",
                "terms": "",
                "sort_order": "1"
            }
        }
    }
    ```
*   **Expected Response (Failure):astere
    ```json
    {
        "error": "You must be logged in to view payment methods."
    }
    ```

#### `GET /shipping_methods`
*   **Description:** Retrieves available shipping methods for the current session.
*   **Parameters:** None
*   **Authentication:** Required
*   **Example `curl`:**
    ```bash
    curl -b cookies.txt "http://localhost/techin/index.php?route=api/mobile/shipping_methods"
    ```
*   **Expected Response (Success):astere
    ```json
    {
        "shipping_methods": {
            "flat": {
                "title": "Flat Rate",
                "quote": {
                    "flat": {
                        "code": "flat.flat",
                        "title": "Flat Shipping Rate",
                        "cost": "5.00",
                        "tax_class_id": "9",
                        "text": "$8.00"
                    }
                },
                "sort_order": "1",
                "error": false
            }
        }
    }
    ```
*   **Expected Response (Failure):astere
    ```json
    {
        "error": "You must be logged in to view shipping methods."
    }
    ```

#### `POST /order_create`
*   **Description:** Creates a new order from the current cart contents. Requires comprehensive customer, address, and method details.
*   **Parameters (Required - in POST body):astere
    *   Many parameters are expected, including customer details, payment address, shipping address, payment method, and shipping method. Refer to the `mobile.php` controller's `order_create` method for the full list.
*   **Authentication:** Required
*   **Example `curl`:**
    ```bash
    curl -X POST -b cookies.txt -d "invoice_prefix=INV-2025-00&store_id=0&store_url=http://localhost/techin/&customer_id=2&customer_group_id=1&firstname=API&lastname=User&email=newuser@example.com&telephone=1234567890&fax=&custom_field={}&payment_firstname=API&payment_lastname=User&payment_company=&payment_address_1=123 Main St&payment_address_2=&payment_city=Anytown&payment_postcode=12345&payment_country=United States&payment_country_id=223&payment_zone=New York&payment_zone_id=36&payment_address_format=&payment_custom_field={}&payment_method=Free Checkout&payment_code=free_checkout&shipping_firstname=API&shipping_lastname=User&shipping_company=&shipping_address_1=123 Main St&shipping_address_2=&shipping_city=Anytown&shipping_postcode=12345&shipping_country=United States&shipping_country_id=223&shipping_zone=New York&shipping_zone_id=36&shipping_address_format=&shipping_custom_field={}&shipping_method=Flat Rate&shipping_code=flat.flat&comment=Order placed via Mobile API&total=123.20&language_id=1&currency_id=1&currency_code=USD&currency_value=1.00000000&ip=127.0.0.1&forwarded_ip=&user_agent=curl&accept_language=en-US,en;q=0.9" "http://localhost/techin/index.php?route=api/mobile/order_create"
    ```
*   **Expected Response (Success):astere
    ```json
    {
        "order_id": "..."
    }
    ```
*   **Expected Response (Failure):astere
    ```json
    {
        "error": "You must be logged in to create an order."
    }
    ```

#### `GET /orders`
*   **Description:** Retrieves a list of orders for the logged-in customer.
*   **Parameters:** None
*   **Authentication:** Required
*   **Example `curl`:**
    ```bash
    curl -b cookies.txt "http://localhost/techin/index.php?route=api/mobile/orders"
    ```
*   **Expected Response (Success):astere
    ```json
    [
        {
            "order_id": "...",
            "firstname": "...",
            "lastname": "...",
            "status": "...",
            "date_added": "...",
            "total": "...",
            "currency_code": "...",
            "currency_value": "..."
        }
    ]
    ```
*   **Expected Response (Failure):astere
    ```json
    {
        "error": "You must be logged in to view your orders."
    }
    ```

#### `GET /order_info`
*   **Description:** Retrieves detailed information for a specific order.
*   **Parameters (Required):astere
    *   `order_id` (int): The ID of the order.
*   **Authentication:** Required
*   **Example `curl`:**
    ```bash
    curl -b cookies.txt "http://localhost/techin/index.php?route=api/mobile/order_info&order_id=1"
    ```
*   **Expected Response (Success):astere
    ```json
    {
        "order_id": "...",
        "invoice_no": "...",
        "products": [],
        "totals": [],
        "histories": []
    }
    ```
*   **Expected Response (Failure):astere
    ```json
    {
        "error": "You must be logged in to view your order details."
    }
    ```

## Handling Cross-Origin Resource Sharing (CORS) Errors

When developing a mobile application or a headless frontend, you might encounter CORS errors. This happens when your application (running on one domain/port) tries to make requests to your OpenCart API (running on a different domain/port). Browsers and some mobile environments enforce security policies that prevent such "cross-origin" requests by default.

To resolve CORS errors, your OpenCart server needs to send specific HTTP headers in its responses, indicating that it allows requests from other origins.

### Solution: Adding CORS Headers

You can add CORS headers in a few ways. The most direct way for your API controller is to add them within the `ControllerApiMobile` class.

**1. Modify `catalog/controller/api/mobile.php`**

You can add the following lines at the very beginning of your `ControllerApiMobile` class's `index()` method, or even better, in a constructor or a common method that all your API endpoints call. For simplicity, let's add it to the `index()` method and you can decide where to place it more globally later.

```php
<?php
class ControllerApiMobile extends Controller {
    public function index() {
        // Add CORS headers
        $this->response->addHeader('Access-Control-Allow-Origin: *'); // Or specify your app's origin, e.g., 'http://your-mobile-app-domain.com'
        $this->response->addHeader('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        $this->response->addHeader('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        $this->response->addHeader('Access-Control-Allow-Credentials: true'); // Important for sending cookies/sessions

        $this->response->addHeader('Content-Type: application/json');
        $this->response->setOutput(json_encode([
            'success' => true,
            'message' => 'Mobile API endpoint reached successfully!'
        ]));
    }

    // ... rest of your methods
}
```

**Explanation of Headers:**

*   `Access-Control-Allow-Origin`: Specifies which origins are allowed to access the resource.
    *   `*`: Allows requests from *any* origin. This is good for development but less secure for production.
    *   `http://your-mobile-app-domain.com`: For production, replace `*` with the specific origin(s) of your mobile app or frontend. If you have multiple, you might need logic to dynamically set this based on the `Origin` header in the incoming request.
*   `Access-Control-Allow-Methods`: Specifies the HTTP methods allowed when accessing the resource (e.g., GET, POST, PUT, DELETE).
*   `Access-Control-Allow-Headers`: Indicates which HTTP headers can be used when making the actual request. `Content-Type` is common for POST requests, `Authorization` if you use token-based auth, `X-Requested-With` for AJAX.
*   `Access-Control-Allow-Credentials: true`: This header is crucial if your API relies on cookies (like OpenCart's session cookies) or HTTP authentication. It tells the browser to expose the response to the frontend JavaScript code when the request includes credentials.

**2. Handling Preflight (OPTIONS) Requests**

Some complex cross-origin requests (e.g., POST requests with `Content-Type: application/json`) will trigger a "preflight" `OPTIONS` request from the browser before the actual request. Your server needs to respond to these `OPTIONS` requests with the appropriate CORS headers.

You can add a specific method to handle `OPTIONS` requests in your controller:

```php
<?php
class ControllerApiMobile extends Controller {
    public function __construct($registry) {
        parent::__construct($registry);
        // Apply CORS headers globally for all API methods
        $this->response->addHeader('Access-Control-Allow-Origin: *');
        $this->response->addHeader('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        $this->response->addHeader('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        $this->response->addHeader('Access-Control-Allow-Credentials: true');

        // Handle preflight OPTIONS requests
        if ($this->request->server['REQUEST_METHOD'] == 'OPTIONS') {
            $this->response->addHeader('Content-Length: 0');
            $this->response->setOutput('');
            exit(); // Terminate script execution after sending headers for OPTIONS
        }
    }

    public function index() {
        // CORS headers are already added in constructor
        $this->response->addHeader('Content-Type: application/json');
        $this->response->setOutput(json_encode([
            'success' => true,
            'message' => 'Mobile API endpoint reached successfully!'
        ]));
    }

    // ... rest of your methods
}
```

**Important Considerations:**

*   **Security:** Using `Access-Control-Allow-Origin: *` is convenient for development but is generally not recommended for production environments as it allows any website to make requests to your API. Always restrict it to your specific application's domain(s) in production.
*   **Placement:** Adding CORS headers in the controller's constructor (`__construct`) ensures they are applied to all API methods.
*   **Server Configuration:** For more complex setups or if you want to apply CORS globally to all PHP files, you might consider configuring your web server (Apache via `.htaccess` or Nginx) to send these headers. However, for an API controller, doing it in PHP is often sufficient.

```
```