import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set up notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS !== 'web') {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo push token:', token);
    }

    return token;
  }

  async scheduleNotification(title: string, body: string, seconds: number = 1) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: { seconds },
    });
  }

  async showNotification(title: string, body: string) {
    await Notifications.presentNotificationAsync({
      title: title,
      body: body,
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.HIGH,
    });
  }

  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  async getBadgeCount() {
    return await Notifications.getBadgeCountAsync();
  }

  // Configure notification listeners
  addNotificationReceivedListener(listener: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  addNotificationResponseReceivedListener(listener: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  // Remove notification listeners
  removeNotificationSubscription(subscription: any) {
    if (subscription) {
      subscription.remove();
    }
  }

  // Clear all notifications
  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
  }

  // Cancel scheduled notifications
  async cancelAllScheduledNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Initialize notification service
  async initialize() {
    // Request permissions and set up the service
    await this.registerForPushNotificationsAsync();
  }

  // Set up notification listeners (placeholder for now)
  setupNotificationListeners() {
    // This is a placeholder - implement actual listener setup if needed
    return [];
  }

  // Cleanup notification listeners (placeholder for now)
  cleanup(listeners: any[]) {
    // This is a placeholder - implement actual cleanup if needed
  }
}

export default new NotificationService();