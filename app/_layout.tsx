import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { usePathname } from 'expo-router';
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
  useFrameworkReady();

  useEffect(() => {
    // Check for updates on app start
    updateService.checkForUpdates();
  }, []);

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
