import { useEffect } from 'react';
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
import FloatingCartButton from '@/components/FloatingCartButton';

function AppContent() {
  const { colorScheme } = useTheme();

  return (
    <CacheProvider>
      <AuthProvider>
        <CartProvider>
          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="+not-found" />
            </Stack>
            <FloatingCartButton />
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          </View>
        </CartProvider>
      </AuthProvider>
    </CacheProvider>
  );
}

export default function RootLayout() {
  const router = useRouter();
  useFrameworkReady();

  useEffect(() => {
    // Check for updates on app start
    updateService.checkForUpdates();

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
      // Handle notification tap - navigate to specific content
      const { linkType, linkValue } = response?.notification?.request?.content?.data || {};
      if (linkType && linkValue) {
        if (linkType === 'category') {
          // Handle both category ID and slug (name) - the category route supports both
          router.push(`/category/${linkValue}`);
        } else if (linkType === 'product') {
          // Handle product ID - the product route expects an ID
          router.push(`/product/${linkValue}`);
        } else if (linkType === 'page') {
          // Navigate to a specific page
          router.push(`/${linkValue}`);
        } else if (linkType === 'url') {
          // For external URLs, you might want to open in a web view
          console.log('External URL notification:', linkValue);
        }
      }
    });

    return () => {
      cleanup();
    };
  }, [router]);

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
