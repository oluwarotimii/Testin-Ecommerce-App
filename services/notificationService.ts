import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useAuth } from '@/context/AuthContext';

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const registerForPushNotificationsAsync = async (apiService: any) => {
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

  // Send this token to your Next.js API via your Auth API service
  try {
    if (apiService && pushToken) {
      await apiService.updatePushToken(pushToken);
      console.log('Push token registered successfully:', pushToken);
    }
  } catch (error) {
    console.error('Error sending push token to API:', error);
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

export default {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
  initialize: async (apiService?: any) => {
    // Initialize notifications if needed
    // For now, just register for push notifications
    if (apiService) {
      await registerForPushNotificationsAsync(apiService);
    }
    return true;
  }
};