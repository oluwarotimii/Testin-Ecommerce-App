import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { register, loadingAuth } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async () => {
    setError(''); // Clear previous errors
    if (password !== confirmPassword) {
      setError("Passwords don't match. Please make sure both passwords are the same.");
      return;
    }

    if (!firstName || !lastName || !email || !phone || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      await register(firstName, lastName, email, phone, password);
      setSuccess('Account created successfully!');
      // Optional: automatically navigate after a delay or let user click to continue
      setTimeout(() => {
        router.push('/(tabs)');
      }, 1500); // Navigate after 1.5 seconds
    } catch (error: any) {
      console.error("Registration error:", error);

      // Parse error message for user-friendly display
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error?.code === 'registration-error-email-exists') {
        errorMessage = 'This email is already registered. Please log in or use a different email address.';
      } else if (error?.code === 'registration-error-username-exists') {
        errorMessage = 'This username is already taken. Please try a different email address.';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Image source={require('@/assets/images/icon.png')} style={styles.appIcon} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Join us and start shopping</Text>
        </View>

        <View style={styles.form}>
          {success ? (
            <View style={[styles.successContainer, { backgroundColor: `${colors.success || '#4CD964'}20`, borderColor: colors.success || '#4CD964', borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16 }]}>
              <Text style={[styles.successText, { color: colors.success || '#4CD964', fontSize: 14 }]}>{success}</Text>
            </View>
          ) : null}
          {error ? (
            <View style={[styles.errorContainer, { backgroundColor: `${colors.error}20`, borderColor: colors.error, borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16 }]}>
              <Text style={[styles.errorText, { color: colors.error, fontSize: 14 }]}>{error}</Text>
            </View>
          ) : null}
          <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
            <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="First Name"
              placeholderTextColor={colors.textSecondary}
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
            <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Last Name"
              placeholderTextColor={colors.textSecondary}
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
            <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
            <Ionicons name="call-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Phone Number"
              placeholderTextColor={colors.textSecondary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              {showPassword ? (
                <Ionicons name="eye-off-outline" size={20} color={colors.textSecondary} />
              ) : (
                <Ionicons name="eye-outline" size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Confirm Password"
              placeholderTextColor={colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              {showConfirmPassword ? (
                <Ionicons name="eye-off-outline" size={20} color={colors.textSecondary} />
              ) : (
                <Ionicons name="eye-outline" size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.registerButton, { backgroundColor: colors.primary }]} onPress={handleRegister} disabled={loadingAuth}>
            <View style={styles.buttonContent}>
              {loadingAuth && <ActivityIndicator size="small" color={colors.white} style={styles.buttonSpinner} />}
              <Text style={[styles.registerButtonText, { color: colors.white }]}>{loadingAuth ? 'Registering...' : 'Create Account'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={[styles.footerLink, { color: colors.primary }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 32,
  },
  backButton: {
    marginBottom: 32,
  },
  header: {
    marginBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  registerButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSpinner: {
    marginRight: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    marginVertical: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  successContainer: {
    marginVertical: 8,
  },
  successText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
