import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useColorScheme';

// ============================================
// MAIN COMPONENT
// ============================================
export default function OrderSuccessScreen({ route, navigation }: any) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { orderId = 'N/A' } = route.params || {};

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleContinueShopping = () => {
    navigation.navigate('AwoofFeed');
  };

  const handleViewOrder = () => {
    try {
      navigation.navigate('Orders' as never, {
        screen: 'OrderDetail',
        params: { orderId },
      } as never);
    } catch (e) {
      handleContinueShopping();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 16, backgroundColor: colors.surface }]}
        onPress={() => navigation.navigate('AwoofFeed')}
      >
        <Ionicons name="arrow-back" size={20} color={colors.text} />
      </TouchableOpacity>

      <View style={[styles.content, { paddingTop: insets.top + 40, paddingHorizontal: 24 }]}>
        {/* Success Animation */}
        <Animated.View style={[styles.successCircle, { transform: [{ scale: scaleAnim }], backgroundColor: colors.success }]}>
          <Ionicons name="checkmark" size={48} color="#fff" />
        </Animated.View>

        {/* Success Message */}
        <Animated.View
          style={[
            styles.messageContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={[styles.successTitle, { color: colors.text }]}>Order Confirmed!</Text>
          <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
            Your Awoof deal is on the way
          </Text>
        </Animated.View>

        {/* Order Info Card */}
        <Animated.View
          style={[
            styles.orderCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.orderInfoRow}>
            <Text style={[styles.orderLabel, { color: colors.textSecondary }]}>Order Number</Text>
            <Text style={[styles.orderValue, { color: colors.text }]}>#{orderId}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.orderInfoRow}>
            <Text style={[styles.orderLabel, { color: colors.textSecondary }]}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: colors.success + '15' }]}>
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.statusText, { color: colors.success }]}>Processing</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.orderInfoRow}>
            <Text style={[styles.orderLabel, { color: colors.textSecondary }]}>Estimated Delivery</Text>
            <Text style={[styles.orderValue, { color: colors.text }]}>2-3 Business Days</Text>
          </View>
        </Animated.View>

        {/* Info Box */}
        <Animated.View
          style={[
            styles.infoBox,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              backgroundColor: colors.warning + '15',
              borderColor: colors.warning + '30',
            },
          ]}
        >
          <Ionicons name="mail-outline" size={22} color={colors.warning} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Order confirmation sent to your email
          </Text>
        </Animated.View>

        {/* Next Steps */}
        <Animated.View
          style={[
            styles.nextSteps,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              backgroundColor: colors.surface,
            },
          ]}
        >
          <Text style={[styles.nextStepsTitle, { color: colors.text }]}>What's Next?</Text>

          <View style={styles.stepRow}>
            <View style={[styles.stepNumber, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.stepNumberText, { color: colors.primary }]}>1</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.textSecondary }]}>
              We'll prepare your order for shipping
            </Text>
          </View>

          <View style={styles.stepRow}>
            <View style={[styles.stepNumber, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.stepNumberText, { color: colors.primary }]}>2</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.textSecondary }]}>
              You'll receive tracking details via email
            </Text>
          </View>

          <View style={styles.stepRow}>
            <View style={[styles.stepNumber, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.stepNumberText, { color: colors.primary }]}>3</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.textSecondary }]}>
              Expect delivery within 2-3 business days
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Actions */}
      <Animated.View
        style={[
          styles.bottomActions,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.viewOrderButton, { borderColor: colors.primary }]}
          onPress={handleViewOrder}
        >
          <Text style={[styles.viewOrderText, { color: colors.primary }]}>View Order Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: colors.primary }]}
          onPress={handleContinueShopping}
        >
          <Text style={styles.continueText}>Keep Shopping Deals</Text>
          <Ionicons name="flame" size={18} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    elevation: 2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
  },
  orderCard: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  orderValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  nextSteps: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
  },
  nextStepsTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  bottomActions: {
    paddingHorizontal: 24,
    gap: 12,
  },
  viewOrderButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  viewOrderText: {
    fontSize: 15,
    fontWeight: '600',
  },
  continueButton: {
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
