import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { markWelcomeScreenAsSeen } from '@/utils/welcomeState';
import Button from '@/components/Button';
import { fontFamily } from '@/constants/designTokens';

export default function WelcomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  const handleLogin = () => {
    markWelcomeScreenAsSeen();
    router.push('/login');
  };

  const handleRegister = () => {
    markWelcomeScreenAsSeen();
    router.push('/register');
  };

  const handleContinueAsGuest = () => {
    markWelcomeScreenAsSeen();
    router.push('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.appIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Welcome to Femtech Mobile App</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Discover cutting-edge technology and enjoy seamless shopping experience
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Login" icon="person" onPress={handleLogin} size="lg" />
          <Button title="Register" icon="person-add" onPress={handleRegister} variant="outline" size="lg" />

          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleContinueAsGuest}
          >
            <Text style={[styles.guestButtonText, { color: colors.textSecondary }]}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  iconContainer: {
    marginBottom: 24,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIcon: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontFamily: fontFamily.bold,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 16,
  },
  guestButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  guestButtonText: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
  },
});