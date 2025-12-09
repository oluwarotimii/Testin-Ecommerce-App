import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { DASHBOARD_API_BASE_URL } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const registerForPushNotificationsAsync = async () => {
  if (!Device.isDevice) {
    console.log('Must use a physical device for push notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permission not granted for push notifications');
    return null;
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

  const fullPushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  console.log('Full Expo push token:', fullPushToken);

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
  } catch (error) {
    console.error('Error registering push token with server:', error);
    // Don't throw error - this is non-critical functionality
  }

  return fullPushToken;
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
  return token;
}

export {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
  initialize,
  sendLocalNotification,
  updatePushTokenForUser
};

export default {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
  initialize,
  sendLocalNotification,
  updatePushTokenForUser
};