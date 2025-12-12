# Push Notification Setup Guide

This document explains how to properly configure push notifications to navigate to specific screens in your mobile app.

## Notification Data Structure

For push notifications to properly navigate to specific screens when tapped, the notification payload must include specific data:

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

## Supported Navigation Types

### 1. Category Navigation
```json
{
  "data": {
    "linkType": "category",
    "linkValue": "electronics" // category slug (name) or category ID like "5"
  }
}
```
This will navigate to `/category/electronics` or `/category/5`. The category route ([id].tsx) handles both slugs and IDs by checking both the slug and ID fields in the API response.

### 2. Product Navigation
```json
{
  "data": {
    "linkType": "product",
    "linkValue": "123" // product ID (the product route expects an ID)
  }
}
```
This will navigate to `/product/123`

### 3. Page Navigation
```json
{
  "data": {
    "linkType": "page",
    "linkValue": "settings" // page name
  }
}
```
This will navigate to `/${page-name}`

### 4. External URL (no navigation)
```json
{
  "data": {
    "linkType": "url",
    "linkValue": "https://example.com"
  }
}
```
This will log the URL but not navigate (you can extend this to open a web view)

## Implementation Example

### For Expo Server-Sent Notifications

```javascript
// On your server
const message = {
  to: expoPushToken,
  sound: 'default',
  title: 'New Product Available!',
  body: 'Check out our latest product',
  data: { 
    linkType: 'product', 
    linkValue: '123' 
  },
};

const response = await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(message),
});
```

### For Firebase Cloud Messaging (FCM)

```json
{
  "registration_ids": ["device_token_1", "device_token_2"],
  "notification": {
    "title": "New Product Available!",
    "body": "Check out our latest product"
  },
  "data": {
    "linkType": "product",
    "linkValue": "123"
  }
}
```

## Client-Side Implementation

The navigation logic is handled in `app/_layout.tsx` and follows this flow:

1. Notification is received and tapped
2. The `setupNotificationListeners` callback extracts `linkType` and `linkValue` from notification data
3. Based on the `linkType`, appropriate navigation is performed:
   - `category`: Navigates to `/category/{linkValue}`
   - `product`: Navigates to `/product/{linkValue}`
   - `page`: Navigates to `/{linkValue}`
   - `url`: Logs the URL (can be extended)

## Testing

To test the notification navigation functionality:

1. Send a test notification with the proper data structure
2. Tap the notification when the app is in background/killed state
3. Verify it navigates to the correct screen

You can send a test notification using Expo's push notification tool or by implementing backend functionality to send properly formatted notifications.