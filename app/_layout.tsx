import { useEffect, useRef } from 'react';
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

function AppContent() {
  const { colorScheme } = useTheme();

  return (
    <ForceUpdateProvider>
      <CacheProvider>
        <AuthProvider>
          <CartProvider>
            <NetworkProvider>
              <View style={{ flex: 1 }}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="+not-found" />
                </Stack>
                <FloatingCartButton />
                <ForceUpdateScreen />
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              </View>
            </NetworkProvider>
          </CartProvider>
        </AuthProvider>
      </CacheProvider>
    </ForceUpdateProvider>
  );
}

export default function RootLayout() {
  const router = useRouter();
  const updateSubscriptionRef = useRef<any>(null);
  useFrameworkReady();

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

    // Setup notification listeners with navigation callback
    const cleanup = notificationService.setupNotificationListeners((response) => {

      const notificationData = response?.notification?.request?.content?.data || {};

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

      if (linkType && linkValue) {
        if (linkType === 'category' || linkType === 'category_id') {
          // Handle both category ID and slug (name) - the category route supports both
          router.push(`/category/${linkValue}`);
        } else if (linkType === 'product' || linkType === 'product_id') {
          // Handle product ID - the product route expects an ID
          router.push(`/product/${linkValue}`);
        } else if (linkType === 'page') {
          // Navigate to a specific page
          router.push(`/${linkValue}`);
        } else if (linkType === 'url') {
          // For external URLs, you might want to open in a web view
          console.log('External URL notification:', linkValue);
        } else {
          console.log('Unknown link type in notification:', linkType);
        }
      } else {
        // If there's no navigation data, don't do anything special
        console.log('Notification tapped but no navigation data found');
      }
    });

    return () => {
      if (updateSubscriptionRef.current) {
        updateSubscriptionRef.current.remove();
      }
      cleanup();
    };
  }, [router]);

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
