import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeColors } from '@/hooks/useColorScheme';
import { CheckCircleIcon } from 'phosphor-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import { radius, fontFamily, shadow } from '@/constants/designTokens';

export default function OrderSuccessScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const { orderId } = useLocalSearchParams();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <CheckCircleIcon weight="fill" size={100} color={colors.success} />
                </View>

                <Text style={[styles.title, { color: colors.text }]}>Order Placed!</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Your order #{orderId} has been placed successfully.
                </Text>

                <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.infoText, { color: colors.text }]}>
                        We have received your order and will contact you shortly to confirm details and arrange delivery.
                    </Text>
                </View>

                <Button title="Continue Shopping" onPress={() => router.push('/(tabs)')} size="lg" style={{ marginBottom: 16 }} />
                <Button title="View My Orders" onPress={() => router.push('/orders')} variant="outline" size="lg" />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        width: '100%',
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontFamily: fontFamily.bold,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
    },
    infoCard: {
        padding: 20,
        borderRadius: radius.xl,
        marginBottom: 32,
        width: '100%',
        ...shadow.card,
    },
    infoText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
});
