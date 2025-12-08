import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeColors } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrderSuccessScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const { orderId } = useLocalSearchParams();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="checkmark-circle" size={100} color={colors.success} />
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

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={() => router.push('/(tabs)')}
                >
                    <Text style={[styles.buttonText, { color: colors.white }]}>Continue Shopping</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.secondaryButton, { borderColor: colors.primary }]}
                    onPress={() => router.push('/orders')}
                >
                    <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>View My Orders</Text>
                </TouchableOpacity>
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
        fontWeight: 'bold',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
    },
    infoCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 32,
        width: '100%',
    },
    infoText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    button: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
