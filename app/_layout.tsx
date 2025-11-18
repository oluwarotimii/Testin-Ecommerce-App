import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import notificationService from '@/services/notificationService';
import updateService from '@/services/updateService';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { CartProvider } from '@/context/CartContext';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // Initialize notifications
    notificationService.initialize();

    // Check for updates on app start
    updateService.checkForUpdates();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
