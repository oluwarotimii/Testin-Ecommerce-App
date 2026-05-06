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
import AsyncStorage from '@react-native-async-storage/async-storage';

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

    // Handle in-app actions (non-navigation side effects) by routing with params
    if (notificationData?.action === 'empty_cart') {
      router.push({ pathname: '/cart', params: { action: 'empty_cart' } });
      return;
    }

    // Awoof Corner actions (prefill cart, jump to checkout, etc.)
    const isAwoofPage = notificationData?.linkType === 'page' && notificationData?.linkValue === 'awoof';
    const isAwoofLinkType = notificationData?.linkType === 'awoof';
    if (isAwoofPage || isAwoofLinkType || notificationData?.awoofAction) {
      const awoofAction = notificationData?.awoofAction ?? notificationData;
      void (async () => {
        try {
          await AsyncStorage.setItem('pending_awoof_action', JSON.stringify(awoofAction));
        } finally {
          router.push('/awoof');
        }
      })();
      return;
    }
    
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
      } else if (linkType === 'awoof') {
        // Shortcut link type for Awoof Corner
        router.push('/awoof');
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

  // Handle deep linking for referrals
  const handleDeepLink = useCallback(async (url: string | null) => {
    if (!url) return;

    try {
      const parsed = Linking.parse(url);
      console.log('🔗 Parsed deep link:', JSON.stringify(parsed, null, 2));

      // Handle referral code: myapp://referral?code=XYZ
      if (parsed.path === 'referral' || (parsed.queryParams && parsed.queryParams.code)) {
        const code = parsed.queryParams?.code as string;
        if (code) {
          console.log('🎁 Found referral code in deep link:', code);
          await AsyncStorage.setItem('pending_referral_code', code);
          // Optional: navigate to account page or show modal
          // router.push('/(tabs)/account');
        }
      }
    } catch (error) {
      console.error('❌ Error parsing deep link:', error);
    }
  }, []);

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

    // Check for initial URL (cold start)
    Linking.getInitialURL().then(handleDeepLink);

    // Listen for incoming URLs (warm start)
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // CRITICAL: Check for initial notification (app was completely closed)
    // Using getLastNotificationResponseAsync() - the correct API for cold starts
    const checkInitialNotification = async () => {
      try {
        console.log('🔍 Checking for cold start notification...');
        
        // This is the CORRECT API for catching notifications that launched the app
        const response = await Notifications.getLastNotificationResponseAsync();
        console.log('getLastNotificationResponseAsync result:', response ? 'FOUND' : 'NOT FOUND');
        
        if (response) {
          console.log('🔔 App launched from notification tap (cold start)');
          console.log('📊 Full response:', JSON.stringify(response, null, 2));
          
          const notificationData = response.notification?.request?.content?.data || {};
          console.log('📊 Notification data:', JSON.stringify(notificationData, null, 2));
          
          // Wait for router/navigation to be ready
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          handleNotificationNavigation(notificationData);
          return;
        }

        console.log('✅ No cold start notification - normal app launch');
      } catch (error) {
        console.error('❌ Error checking initial notification:', error);
      }
    };

    checkInitialNotification();

    // Setup notification listeners with navigation callback (for when app is already running)
    let cleanupNotifications = () => {};
    void notificationService.setupNotificationListeners((response) => {
      console.log('🔔 Notification tapped (app already running)');
      console.log('📊 Notification data:', JSON.stringify(response?.notification?.request?.content?.data, null, 2));
      const notificationData = response?.notification?.request?.content?.data || {};
      handleNotificationNavigation(notificationData);
    }).then((cleanup) => {
      cleanupNotifications = cleanup;
    });

    return () => {
      if (updateSubscriptionRef.current) {
        updateSubscriptionRef.current.remove();
      }
      cleanupNotifications();
      subscription.remove();
    };
  }, [handleNotificationNavigation, handleDeepLink]);

  return (
    <ThemeProvider>
      <ForceUpdateProvider>
        <AppContent />
      </ForceUpdateProvider>
    </ThemeProvider>
  );
}
