import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { DASHBOARD_API_BASE_URL } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';

// Function to create notification channel for Android 13+
const createNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
};

// Function for pre-prompt before requesting notification permissions
const showNotificationPrePrompt = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // In a real implementation, you would show a custom modal here
    // For now, we'll just return true to proceed with the native prompt
    resolve(true);
  });
};

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

  // Create notification channel (required for Android 13+)
  await createNotificationChannel();

  // Check current permissions status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') {
    // If already granted, proceed directly to getting the token
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    const fullPushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('Full Expo push token (already granted):', fullPushToken);
    return await processPushToken(fullPushToken);
  } else if (existingStatus === 'denied') {
    // If permission was denied, direct user to settings
    console.log('Permission was previously denied for push notifications');
    alert('To receive push notifications, please enable them in your device settings.');
    return null;
  } else {
    // Permission not yet requested - show pre-prompt then request
    const shouldRequestPermission = await showNotificationPrePrompt();
    if (!shouldRequestPermission) {
      console.log('User declined to request notification permission');
      return null;
    }

    // Request permission from the user
    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== 'granted') {
      console.log('Permission not granted for push notifications');
      return null;
    }

    // If permission granted, get the token
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    const fullPushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('Full Expo push token:', fullPushToken);
    return await processPushToken(fullPushToken);
  }
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
  updatePushTokenForUser
};

export default {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
  initialize,
  sendLocalNotification,
  updatePushTokenForUser
};