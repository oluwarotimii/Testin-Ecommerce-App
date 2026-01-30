import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator, Linking } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const [email, setEmail] = useState('');
    const { apiService } = useAuth();

    const { expoPublicWordpressUrl } = Constants.expoConfig?.extra || {};
    const FINAL_WORDPRESS_URL = expoPublicWordpressUrl || 'https://femtechit.com/';

    /* Commenting out the password reset function since the backend endpoints are not available
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
            // Clean the URL to prevent double slashes
            const cleanUrl = FINAL_WORDPRESS_URL.endsWith('/') ? FINAL_WORDPRESS_URL.slice(0, -1) : FINAL_WORDPRESS_URL;

            // Try to make the password reset request to the WordPress site
            const response = await fetch(`${cleanUrl}/wp-json/bdpwr/v1/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email
                })
            });

            if (response.ok) {
                const data = await response.json();

                if (data.success || (data.data && data.data.status === 200)) {
                    Alert.alert(
                        'Success',
                        'Password reset link has been sent to your email address. Please check your inbox.',
                        [{
                            text: 'OK',
                            onPress: () => router.push('/login')
                        }]
                    );
                } else {
                    // Even if API response indicates issues, inform user
                    Alert.alert(
                        'Check your email',
                        'If your email is registered with us, you will receive a password reset link shortly.',
                        [{
                            text: 'OK',
                            style: 'cancel'
                        }]
                    );
                }
            } else {
                // Handle different response statuses
                const status = response.status;
                if (status === 404) {
                    Alert.alert(
                        'Email not found',
                        'The email address you entered is not registered with us. Please check and try again.',
                        [{
                            text: 'OK',
                            style: 'cancel'
                        }]
                    );
                } else {
                    // For other errors, fall back to website guidance
                    Alert.alert(
                        'Password Reset',
                        'To reset your password, please visit our website. Due to security restrictions, password resets must be initiated from our website.',
                        [
                            {
                                text: 'Visit Website',
                                onPress: () => {
                                    const resetUrl = `${FINAL_WORDPRESS_URL}/my-account/lost-password/`;
                                    Linking.openURL(resetUrl).catch(() => {
                                        Alert.alert('Error', 'Could not open the website. Please visit it directly in your browser.');
                                    });
                                }
                            },
                            {
                                text: 'OK',
                                style: 'cancel'
                            }
                        ]
                    );
                }
            }
        } catch (error) {
            console.error('Password reset error:', error);

            // On network error or other issues, guide user to website
            Alert.alert(
                'Password Reset',
                'To reset your password, please visit our website. Due to security restrictions, password resets must be initiated from our website.',
                [
                    {
                        text: 'Visit Website',
                        onPress: () => {
                            const resetUrl = `${FINAL_WORDPRESS_URL}/my-account/lost-password/`;
                            Linking.openURL(resetUrl).catch(() => {
                                Alert.alert('Error', 'Could not open the website. Please visit it directly in your browser.');
                            });
                        }
                    },
                    {
                        text: 'OK',
                        style: 'cancel'
                    }
                ]
            );
        } finally {
            setLoading(false);
        }
    };
    */

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
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
                        Password reset is available on our website. Please visit femtechit.com to reset your password.
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

                    {/* Information message about password reset */}
                    <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="information-circle-outline" size={24} color={colors.primary} style={styles.infoIcon} />
                        <Text style={[styles.infoText, { color: colors.text }]}>
                            Password reset functionality is available on our website. Please visit femtechit.com to reset your password.
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.visitWebsiteButton, { backgroundColor: colors.primary }]}
                        onPress={() => {
                            Linking.openURL('https://femtechit.com/my-account/lost-password/').catch(() => {
                                Alert.alert('Error', 'Could not open the website. Please visit it directly in your browser.');
                            });
                        }}
                    >
                        <Text style={[styles.visitWebsiteButtonText, { color: colors.white }]}>
                            Visit Website to Reset Password
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>Remember your password? </Text>
                    <TouchableOpacity onPress={() => router.push('/login')}>
                        <Text style={[styles.footerLink, { color: colors.primary }]}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 32,
        paddingTop: 20,
        paddingBottom: 32,
    },
    backButton: {
        marginBottom: 20,
    },
    header: {
        marginBottom: 40,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 27,
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
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
    },
    infoIcon: {
        marginRight: 12,
        marginTop: 4,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    visitWebsiteButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
    },
    visitWebsiteButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
