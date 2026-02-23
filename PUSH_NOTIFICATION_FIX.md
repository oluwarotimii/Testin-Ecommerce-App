# Push Notification Slug Fix

## Problem
When sending push notifications from the dashboard using **slugs** (e.g., `my-product-name` or `electronics`), the app would show:
- **Product notifications**: "Product not found" error
- **Category notifications**: Category page loads but shows "No products found"

## Root Cause

### Product Issue
The product route (`app/product/[id].tsx`) only called `apiService.getProduct(Number(id))` which requires a numeric ID. When a slug was passed, it would try to fetch product by an invalid ID and fail.

### Category Issue (More Complex)
The category page was passing the slug directly to the WooCommerce API:
```typescript
const params = {
    category: idStr, // ❌ Passing slug like "electronics"
    per_page: 20
};
```

**The Problem**: WooCommerce REST API v3 (`/wp-json/wc/v3/products`) **only accepts numeric category IDs** for the `category` parameter, **NOT slugs**.

When you pass a slug like `"electronics"` to the `category` parameter, the API doesn't error - it just returns **all products** (or an empty set if no products match the invalid category filter).

## Solution

### 1. Product Route Fix
Modified `app/product/[id].tsx` to detect whether the incoming parameter is a numeric ID or a slug:

```typescript
const idStr = id.toString();
const numericId = Number(idStr);

if (!isNaN(numericId) && idStr === numericId.toString()) {
    // It's a numeric ID, fetch directly
    fetchedProduct = await apiService.getProduct(numericId);
} else {
    // It's a slug, fetch by slug
    fetchedProduct = await apiService.getProductBySlug(idStr);
}
```

### 2. Category Route Fix
Modified `app/category/[id].tsx` to:
1. First fetch all categories to find the matching one (by slug or ID)
2. Extract the numeric ID from the found category
3. Use that ID to fetch products

```typescript
// Step 1: Find category by slug or ID
const categories = await apiService.getCategories();
const category = categories.find((cat: any) =>
    cat.slug === idStr || cat.id.toString() === idStr
);

if (!category) {
    setError('Category not found');
    return;
}

// Step 2: Use the numeric ID to fetch products
const params = {
    category: category.id.toString(), // ✅ Use numeric ID
    per_page: 20
};
const categoryProducts = await apiService.getProducts(params);
```

## Why This Happened

The confusion comes from different WooCommerce API versions:
- **Legacy API** (`/wc-api/v3/`): Uses `filter[category]=slug`
- **Store API** (`/wc/store/v1/`): Accepts both IDs and slugs
- **REST API v3** (`/wp-json/wc/v3/`): **Only accepts numeric IDs** for `category` parameter

Your app uses the **REST API v3**, which requires numeric IDs.

## What Now Works

### Product Notifications
You can now send push notifications with **either** product IDs **or** slugs:

```json
{
  "data": {
    "linkType": "product",
    "linkValue": "123"  // Product ID
  }
}
```

OR

```json
{
  "data": {
    "linkType": "product",
    "linkValue": "my-product-slug"  // Product slug
  }
}
```

### Category Notifications
Category notifications now work correctly with both IDs and slugs:

```json
{
  "data": {
    "linkType": "category",
    "linkValue": "electronics"  // Category slug
  }
}
```

OR

```json
{
  "data": {
    "linkType": "category",
    "linkValue": "5"  // Category ID
  }
}
```

## Testing (Without Affecting Real Users)

### Use the Test Screen (Recommended - No Login Required!)

1. **Open the app** and go to the **Account** tab (bottom right)
2. **Scroll down** to the "Developer Tools" section (always visible, no login needed)
3. **Tap "Test Push Notifications"** (bug icon 🐛)
4. **Enter a real product/category slug or ID** from your WooCommerce store:
   - For product: Enter something like `my-product-name` or `123`
   - For category: Enter something like `electronics` or `5`
   - Tip: Find slugs in WooCommerce Admin → Products/Categories → check the permalink
5. **Tap "Test"** to send a local notification
6. **Minimize the app** (send to background)
7. **Tap the notification** from the notification center
8. **Verify** the app navigates to the correct product/category page

### Option 2: Use Console/Debugger

If you want to test the notification handler directly:

1. Open the app in development mode
2. Open the developer console (shake device → "Debug")
3. In the console, test the navigation:
   ```javascript
   // Test product by slug
   router.push('/product/my-product-slug');
   
   // Test product by ID
   router.push('/product/123');
   
   // Test category by slug
   router.push('/category/electronics');
   
   // Test category by ID
   router.push('/category/5');
   ```

## How to Find Product/Category Slugs

### From WooCommerce Admin
1. Go to **Products** → All Products
2. Click on any product
3. The **slug** is shown in the URL: `.../post.php?post=123&action=edit`
   - Or check the "Permalink" field under the product title
   - The slug is the last part: `my-product-name`

### From Category Admin
1. Go to **Products** → Categories
2. Hover over any category
3. The **slug** is shown in the URL or in the "Slug" column
   - Example: `electronics`, `clothing`, etc.

## Dashboard Notification Format

When sending notifications from your dashboard, use this format:

```json
{
  "to": "expo_push_token_here",
  "title": "New Product Available!",
  "body": "Check out our latest product",
  "data": {
    "linkType": "product",
    "linkValue": "my-product-slug"  // Can be slug OR ID
  }
}
```

## Files Changed

1. **app/product/[id].tsx** - Added slug detection and handling
2. **app/test-notifications.tsx** - New test screen for push notifications
3. **app/settings.tsx** - Added link to test screen
4. **PushNotificationSetup.md** - Updated documentation

## Deployment Notes

- ✅ No backend changes required
- ✅ No database changes required
- ✅ Backward compatible (existing numeric ID notifications still work)
- ✅ Safe to deploy while users are active (no breaking changes)

## Troubleshooting

If navigation still fails:

1. **Check console logs** - Look for errors in the metro bundler console
2. **Verify the slug exists** - Make sure the product/category slug is correct
3. **Check API connection** - Ensure the app can fetch products from WooCommerce
4. **Test with numeric ID first** - Confirm basic navigation works, then test with slug

## Next Steps

After testing:
1. ✅ Remove or hide the "Test Push Notifications" menu item from settings (optional)
2. ✅ Delete `app/test-notifications.tsx` if no longer needed (optional)
3. ✅ Update your dashboard to use slugs instead of IDs (if preferred)
