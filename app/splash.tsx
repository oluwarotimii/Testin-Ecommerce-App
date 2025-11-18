import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function SplashScreen() {
  const router = useRouter();
  const { apiService, isAuthenticated, loadingAuth } = useAuth();

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
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>Techin</Text>
        </View>
        <Text style={styles.tagline}>Your Tech Shopping Destination</Text>
      </View>

      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#007AFF',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#8E8E93',
  },
});