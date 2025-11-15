import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { apiService } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);



  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const response = await apiService.register(firstName, lastName, email, phone, password);
      if (response.id) {
        Alert.alert('Registration Successful', 'You can now log in.');
        router.push('/login');
      } else {
        Alert.alert('Registration Failed', 'An error occurred.');
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert('Registration Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color="#007AFF" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join us and start shopping</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <User size={20} color="#8E8E93" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        <View style={styles.inputContainer}>
          <User size={20} color="#8E8E93" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Mail size={20} color="#8E8E93" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Phone size={20} color="#8E8E93" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color="#8E8E93" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            {showPassword ? (
              <EyeOff size={20} color="#8E8E93" />
            ) : (
              <Eye size={20} color="#8E8E93" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color="#8E8E93" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            {showConfirmPassword ? (
              <EyeOff size={20} color="#8E8E93" />
            ) : (
              <Eye size={20} color="#8E8E93" />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
          <Text style={styles.registerButtonText}>{loading ? 'Registering...' : 'Create Account'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.footerLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
};


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
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
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#1D1D1F',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: '#8E8E93',
    },
    form: {
      marginBottom: 32,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F2F2F7',
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
      color: '#1D1D1F',
    },
    eyeIcon: {
      padding: 4,
    },
    registerButton: {
      backgroundColor: '#007AFF',
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    registerButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    footerText: {
      color: '#8E8E93',
      fontSize: 14,
    },
    footerLink: {
      color: '#007AFF',
      fontSize: 14,
      fontWeight: '500',
    },
  });
