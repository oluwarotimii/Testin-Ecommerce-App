import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const { expoPublicWordpressUrl } = Constants.expoConfig?.extra || {};
    const WORDPRESS_URL = expoPublicWordpressUrl || process.env.EXPO_PUBLIC_WORDPRESS_URL || 'https://femtech.ng/';

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Missing Information', 'Please enter your email address.');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            // WordPress lost password endpoint
            const cleanUrl = WORDPRESS_URL.endsWith('/') ? WORDPRESS_URL.slice(0, -1) : WORDPRESS_URL;
            const response = await axios.post(`${cleanUrl}/wp-json/bdpwr/v1/reset-password`, {
                email: email
            });

            if (response.data && response.data.data && response.data.data.status === 200) {
                Alert.alert(
                    'Success',
                    'Password reset link has been sent to your email address. Please check your inbox.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.push('/login')
                        }
                    ]
                );
            } else {
                Alert.alert('Error', response.data?.message || 'Unable to send reset link. Please try again.');
            }
        } catch (error: any) {
            console.error('Password reset error:', error.response?.data || error.message);

            let errorMessage = 'An error occurred. Please try again.';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 404) {
                errorMessage = 'Email address not found. Please check and try again.';
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.push('/login')}
            >
                <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>

            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Image source={require('@/assets/images/icon.png')} style={styles.appIcon} />
                </View>
                <Text style={[styles.title, { color: colors.text }]}>Forgot Password?</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Enter your email address and we'll send you a link to reset your password.
                </Text>
            </View>

            <View style={styles.form}>
                <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
                    <Ionicons name="mail" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Email"
                        placeholderTextColor={colors.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.resetButton, { backgroundColor: colors.primary }]}
                    onPress={handleResetPassword}
                    disabled={loading}
                >
                    <View style={styles.buttonContent}>
                        {loading && <ActivityIndicator size="small" color={colors.white} style={styles.buttonSpinner} />}
                        <Text style={[styles.resetButtonText, { color: colors.white }]}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>Remember your password? </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                    <Text style={[styles.footerLink, { color: colors.primary }]}>Sign In</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

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
        lineHeight: 24,
    },
    form: {
        marginBottom: 32,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 24,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    resetButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    resetButtonText: {
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
});
