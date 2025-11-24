# WordPress/WooCommerce Integration Guide

This mobile app supports integration with WordPress/WooCommerce sites using the REST API. Follow the steps below to configure your WordPress site and connect it to your mobile app.

## Setting Up WooCommerce REST API Keys

1. Install and activate WooCommerce on your WordPress site (if not already installed)
2. Navigate to WooCommerce > Settings > Advanced > REST API
3. Click "Add Key"
4. Set permissions to "Read/Write" (for full functionality)
5. Generate your API keys
6. Note the "Consumer Key" and "Consumer Secret" values

## Configuring Environment Variables

1. Copy the `.env.example` file to create a `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` with your WordPress site information:
   ```
   EXPO_PUBLIC_API_SERVICE_TYPE=wordpress
   EXPO_PUBLIC_WORDPRESS_URL=https://your-wordpress-site.com
   EXPO_PUBLIC_WORDPRESS_CONSUMER_KEY=your_consumer_key_here
   EXPO_PUBLIC_WORDPRESS_CONSUMER_SECRET=your_consumer_secret_here
   ```

3. Make sure to add `.env` to your `.gitignore` file to protect your API keys:
   ```
   .env
   ```

## Required WordPress Plugins

For optimal functionality with the mobile app, consider installing these plugins:

1. **WooCommerce** - Core e-commerce functionality
2. **WooCommerce REST API** - Built-in with WooCommerce, provides API endpoints
3. **JWT Authentication for WP REST API** (optional) - For enhanced authentication
4. **WP REST API - Meta Endpoints** (optional) - For additional metadata

## Available Endpoints

The integration uses these WooCommerce REST API endpoints:

- Products: `/wp-json/wc/v3/products`
- Categories: `/wp-json/wc/v3/products/categories`
- Customers: `/wp-json/wc/v3/customers`
- Orders: `/wp-json/wc/v3/orders`
- Cart: Managed through draft orders functionality

## Switching Between WordPress and Dummy Data

You can toggle between WordPress API and dummy data by changing the `EXPO_PUBLIC_API_SERVICE_TYPE` value:

- `dummy` - Use local dummy data (default for development)
- `wordpress` - Use WordPress/WooCommerce API

## Security Considerations

- Never commit API keys to version control
- Use appropriate permission levels for API keys
- Implement SSL/HTTPS on your WordPress site
- Regularly rotate API keys

## Troubleshooting

1. If API requests fail with authentication errors, verify your Consumer Key and Consumer Secret
2. If endpoints return 404 errors, ensure WooCommerce is properly installed and activated
3. For CORS issues, check your WordPress site's CORS configuration