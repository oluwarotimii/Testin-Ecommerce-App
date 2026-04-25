import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { DASHBOARD_API_BASE_URL } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_REMINDER_ID_KEY = 'cartReminderNotificationId';
const CART_REMINDER_DELAY_SECONDS = 36 * 60 * 60;

// Function to create notification channel for Android 13+
const createNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500], // More noticeable vibration pattern
      lightColor: '#FF231F7C',
    });
  }
};


// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    sound: 'default', // Custom notification sound (to use custom sounds, see documentation)
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH, // Ensure high priority for vibration
  }),
});

const registerForPushNotificationsAsync = async () => {
  if (!Device.isDevice) {
    console.log('Must use a physical device for push notifications');
    return null;
  }

  // IMPORTANT: For Android 13+, the channel must exist for the prompt to trigger
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500], // More noticeable vibration pattern
      lightColor: '#FF231F7C',
    });
  }

  // 1. Check if we already have permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  console.log('Current notification permission status:', existingStatus);
  let finalStatus = existingStatus;

  // 2. If not granted (including null, undefined, denied, or undetermined), trigger the NATIVE SYSTEM PROMPT
  if (existingStatus !== 'granted') {
    console.log('Requesting notification permissions from user...');
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    console.log('Notification permission request result:', status);
  } else {
    console.log('Notification permissions already granted');
  }

  // 3. Only if the user REJECTS the native prompt do we stop
  if (finalStatus !== 'granted') {
    console.log('Permission not granted by user. Status:', finalStatus);
    return null;
  }

  // 4. Get the token now that permission is confirmed
  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
  const fullPushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  console.log('Full Expo push token:', fullPushToken);
  return await processPushToken(fullPushToken);
};

// Function to process the push token after it's obtained
const processPushToken = async (fullPushToken: string) => {
  // Check if user is authenticated
  const sessionToken = await AsyncStorage.getItem('sessionToken');
  const customerId = await AsyncStorage.getItem('customerId');

  if (sessionToken && customerId) {
    // If user is authenticated, update their account with the push token
    try {
      // We'll need to use the API service, but we need to import it properly later
      // For now, we'll store the token in AsyncStorage to be used when AuthContext is available
      await AsyncStorage.setItem('pushToken', fullPushToken);
      console.log('Push token stored for authenticated user');
    } catch (error) {
      console.error('Error storing push token for authenticated user:', error);
    }
  } else {
    // If user is not authenticated, store the token to be used later
    await AsyncStorage.setItem('pushToken', fullPushToken);
    console.log('Push token stored for later use');
  }

  // Send this token to your Next.js API (for server-side notifications)
  // According to the new API format, no authentication is required
  try {
    const response = await fetch(`${DASHBOARD_API_BASE_URL}/api/expo/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expoPushToken: fullPushToken }), // Send the full token as expected
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to register push token with server:', data.error || `HTTP ${response.status}`);
    } else {
      console.log('Push token registered successfully with server');
    }

    // Return the token regardless of server registration success
    return fullPushToken;
  } catch (error) {
    console.error('Error registering push token with server:', error);
    // Still return the token even if server registration fails
    return fullPushToken;
  }
}

const setupNotificationListeners = (navigationCallback?: (response: any) => void) => {
  // Listener for when notification is received
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('Received notification:', notification);
  });

  // Listener for when notification is tapped
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification tapped:', response);
    if (navigationCallback) {
      navigationCallback(response);
    }
  });

  // Return cleanup function
  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}

const sendLocalNotification = async (title: string, body: string, data: any = {}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // Send immediately
  });
};

const clearCartAbandonmentReminder = async () => {
  try {
    const reminderId = await AsyncStorage.getItem(CART_REMINDER_ID_KEY);
    if (reminderId) {
      await Notifications.cancelScheduledNotificationAsync(reminderId);
      await AsyncStorage.removeItem(CART_REMINDER_ID_KEY);
    }
  } catch (error) {
    console.error('Error clearing cart abandonment reminder:', error);
  }
};

const scheduleCartAbandonmentReminder = async (options?: {
  cartCount?: number;
  source?: string;
}) => {
  try {
    await clearCartAbandonmentReminder();

    const cartCount = options?.cartCount ?? 1;
    const source = options?.source || 'shopping cart';
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Still thinking about it?',
        body: cartCount > 1
          ? `You left ${cartCount} items in your ${source}. Checkout is still waiting.`
          : `You left an item in your ${source}. Tap to continue checkout.`,
        data: {
          linkType: 'page',
          linkValue: 'cart',
          notificationType: 'cart_reminder',
        },
      },
      trigger: {
        seconds: CART_REMINDER_DELAY_SECONDS,
      },
    });

    await AsyncStorage.setItem(CART_REMINDER_ID_KEY, id);
    return id;
  } catch (error) {
    console.error('Error scheduling cart abandonment reminder:', error);
    return null;
  }
};

const clearCartReminderIfNeeded = async () => {
  await clearCartAbandonmentReminder();
};

// Function to update push token for authenticated user
// This will be called from the AuthContext when needed
const updatePushTokenForUser = async (apiService: any, pushToken: string) => {
  try {
    // Update the current user's profile with the push token
    // Since there's no direct field for push token in WooCommerce, we'll try to store it as user meta
    const customerId = await AsyncStorage.getItem('customerId');

    if (customerId && apiService && typeof apiService.updatePushToken === 'function') {
      // Try to update push token via API
      const result = await apiService.updatePushToken(pushToken);
      console.log('Push token updated for user:', result);
      return result;
    }
  } catch (error) {
    console.error('Error updating push token for authenticated user:', error);
    throw error;
  }
}

const initialize = async () => {
  // Initialize notifications if needed
  const token = await registerForPushNotificationsAsync();
  // Log the result but don't throw error if registration fails
  if (!token) {
    console.log("Notification initialization failed - permissions denied or device not physical");
  }
  return token;
}

export {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
  initialize,
  sendLocalNotification,
  scheduleCartAbandonmentReminder,
  clearCartAbandonmentReminder,
  clearCartReminderIfNeeded,
  updatePushTokenForUser
};

export default {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
  initialize,
  sendLocalNotification,
  scheduleCartAbandonmentReminder,
  clearCartAbandonmentReminder,
  clearCartReminderIfNeeded,
  updatePushTokenForUser
};
