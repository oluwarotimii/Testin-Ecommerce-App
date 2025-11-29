import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { API_BASE_URL } from './config';

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

const registerForPushNotificationsAsync = async (authToken?: string) => {
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

  const pushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  console.log('Expo push token:', pushToken);

  // Send this token to your Next.js API
  try {
    const response = await fetch(`${API_BASE_URL}/api/expo/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${authToken}`, // Uncomment if auth is required and token is available
      },
      body: JSON.stringify({ expoPushToken: pushToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to register push token');
    }

    console.log('Push token registered successfully');
    return pushToken;
  } catch (error) {
    console.error('Error registering push token:', error);
    // throw error; // Optional: rethrow if you want to handle it upstream
  }

  return pushToken;
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

const initialize = async (authToken?: string) => {
  // Initialize notifications if needed
  await registerForPushNotificationsAsync(authToken);
  return true;
}

export {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
  initialize
};

export default {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
  initialize
};