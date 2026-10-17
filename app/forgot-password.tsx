import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image, Linking } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import { radius, fontFamily } from '@/constants/designTokens';

// Password reset is handled entirely on the website - there's no in-app
// reset endpoint, so this screen just collects the email for display and
// hands off to femtechit.com rather than submitting anything itself.
export default function ForgotPasswordScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const [email, setEmail] = useState('');

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

                    <Button
                        title="Visit Website to Reset Password"
                        onPress={() => {
                            Linking.openURL('https://femtechit.com/my-account/lost-password/').catch(() => {
                                Alert.alert('Error', 'Could not open the website. Please visit it directly in your browser.');
                            });
                        }}
                        style={styles.visitWebsiteButton}
                    />
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
        borderRadius: radius.xl,
    },
    title: {
        fontSize: 32,
        fontFamily: fontFamily.bold,
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
        borderRadius: radius.pill,
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
        fontFamily: fontFamily.medium,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: radius.lg,
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
        marginBottom: 24,
    },
});
