import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useColorScheme';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, loadingAuth } = useAuth();
  const colors = useThemeColors();

  useEffect(() => {
    const checkSessionAndNavigate = async () => {
      // Wait for auth to be loaded
      if (loadingAuth) {
        // Wait a bit more to ensure auth is loaded
        setTimeout(() => {
          checkSessionAndNavigate();
        }, 100);
        return;
      }

      if (isAuthenticated) {
        // User is authenticated, go to main app
        router.replace('/(tabs)');
      } else {
        // No valid session, go to welcome/login
        router.replace('/welcome');
      }
    };

    checkSessionAndNavigate();
  }, [isAuthenticated, loadingAuth]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.appName, { color: colors.text }]}>Femtech Mobile App</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>Your Tech Shopping Destination</Text>
      </View>

      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
});