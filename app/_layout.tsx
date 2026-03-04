import { useEffect, useRef, useCallback } from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { usePathname } from 'expo-router';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import notificationService from '@/services/notificationService';
import updateService from '@/services/updateService';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { CartProvider } from '@/context/CartContext';
import { CacheProvider } from '@/context/CacheContext';
import { NetworkProvider } from '@/context/NetworkContext';
import { ForceUpdateProvider } from '@/context/ForceUpdateContext';
import FloatingCartButton from '@/components/FloatingCartButton';
import ForceUpdateScreen from '@/components/ForceUpdateScreen';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';

function AppContent() {
  const { colorScheme } = useTheme();

  return (
    <CacheProvider>
      <AuthProvider>
        <CartProvider>
          <NetworkProvider>
            <View style={{ flex: 1 }}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="+not-found" />
              </Stack>
              <FloatingCartButton />
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              <ForceUpdateScreen />
            </View>
          </NetworkProvider>
        </CartProvider>
      </AuthProvider>
    </CacheProvider>
  );
}

export default function RootLayout() {
  const router = useRouter();
  const updateSubscriptionRef = useRef<any>(null);
  useFrameworkReady();

  // Helper function to handle notification navigation
  const handleNotificationNavigation = useCallback((notificationData: any) => {
    console.log('🧭 handleNotificationNavigation called with:', JSON.stringify(notificationData, null, 2));
    
    // First, try the expected format (using linkType/linkValue)
    let { linkType, linkValue } = notificationData;

    // If not found, check for the format mentioned in logs (deepLinkType/deepLinkValue)
    if (!linkType && !linkValue) {
      linkType = notificationData.deepLinkType;
      linkValue = notificationData.deepLinkValue;
    }

    // Also check for fallback in case notificationId is present
    if (!linkType && !linkValue && notificationData.notificationId) {
      // If there's just a notificationId, you might want to handle it differently
      // For now, we'll log it but not navigate
      console.log('Notification with ID only, no navigation data:', notificationData.notificationId);
      return;
    }

    console.log('🔍 Extracted linkType:', linkType, 'linkValue:', linkValue);

    if (linkType && linkValue) {
      console.log('🚀 Navigating to:', linkType, linkValue);
      if (linkType === 'category' || linkType === 'category_id') {
        // Handle both category ID and slug (name) - the category route supports both
        console.log('📂 Navigating to category:', linkValue);
        router.push(`/category/${linkValue}`);
      } else if (linkType === 'product' || linkType === 'product_id') {
        // Handle product ID - the product route expects an ID
        console.log('📦 Navigating to product:', linkValue);
        router.push(`/product/${linkValue}`);
      } else if (linkType === 'page') {
        // Navigate to a specific page
        console.log('📄 Navigating to page:', linkValue);
        router.push(`/${linkValue}`);
      } else if (linkType === 'url') {
        // For external URLs, you might want to open in a web view
        console.log('🌐 External URL notification:', linkValue);
      } else {
        console.log('⚠️ Unknown link type in notification:', linkType);
      }
    } else {
      // If there's no navigation data, don't do anything special
      console.log('⚠️ Notification tapped but no navigation data found');
      console.log('Full notificationData:', JSON.stringify(notificationData, null, 2));
    }
  }, [router]);

  useEffect(() => {
    // Initialize silent updates that run in the background
    updateSubscriptionRef.current = updateService.initializeSilentUpdates();

    // Initialize notifications
    const initNotifications = async () => {
      const token = await notificationService.initialize();
      // If token is null, it means permissions were denied
      if (!token) {
        console.log("Push notifications not enabled due to denied permissions");
      }
    };

    initNotifications();

    // CRITICAL: Check for initial notification (app was completely closed)
    // This handles the case when user taps notification while app is idle/killed
    const checkInitialNotification = async () => {
      try {
        // Method 1: Try expo-notifications initial notification
        const initialNotification = await Notifications.getInitialNotificationAsync();
        console.log('Initial notification check:', initialNotification ? 'FOUND' : 'NOT FOUND');
        
        if (initialNotification) {
          console.log('🔔 App launched from notification:', JSON.stringify(initialNotification, null, 2));
          const notificationData = initialNotification.request.content.data || {};
          console.log('📊 Notification data:', JSON.stringify(notificationData, null, 2));
          
          // Wait for router to be ready
          await new Promise(resolve => setTimeout(resolve, 1000));
          handleNotificationNavigation(notificationData);
          return;
        }

        // Method 2: Try Linking initial URL (for expo-router deep links)
        const initialUrl = await Linking.getInitialURL();
        console.log('Initial URL check:', initialUrl || 'NOT FOUND');
        
        if (initialUrl) {
          console.log('🔗 App launched from URL:', initialUrl);
          // Parse the URL to extract notification data if it contains deep link params
          const url = new URL(initialUrl);
          const linkType = url.searchParams.get('linkType');
          const linkValue = url.searchParams.get('linkValue');
          
          if (linkType && linkValue) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            handleNotificationNavigation({ linkType, linkValue });
            return;
          }
        }

        console.log('✅ No initial notification or deep link found - normal app launch');
      } catch (error) {
        console.error('❌ Error checking initial notification:', error);
      }
    };

    checkInitialNotification();

    // Setup notification listeners with navigation callback
    const cleanup = notificationService.setupNotificationListeners((response) => {
      console.log('🔔 Notification tapped (app already running):', JSON.stringify(response, null, 2));
      const notificationData = response?.notification?.request?.content?.data || {};
      console.log('📊 Notification data:', JSON.stringify(notificationData, null, 2));
      handleNotificationNavigation(notificationData);
    });

    return () => {
      if (updateSubscriptionRef.current) {
        updateSubscriptionRef.current.remove();
      }
      cleanup();
    };
  }, [handleNotificationNavigation]);

  return (
    <ThemeProvider>
      <ForceUpdateProvider>
        <AppContent />
      </ForceUpdateProvider>
    </ThemeProvider>
  );
}
