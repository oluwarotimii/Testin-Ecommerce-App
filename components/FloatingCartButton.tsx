import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Animated } from 'react-native';
import { useCart } from '@/context/CartContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const FloatingCartButton: React.FC = () => {
  const { cartCount } = useCart();
  const colors = useThemeColors();
  const router = useRouter();
  const pathname = usePathname();
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Hide the button when on the cart page
  const isOnCartPage = pathname === '/(tabs)/cart' || pathname === '/cart';

  // Animate the button when cart count changes from 0 to >0 or >0 to 0 (visibility change)
  const prevCartCount = useRef(cartCount);

  React.useEffect(() => {
    const wasVisible = prevCartCount.current > 0;
    const isVisible = cartCount > 0;

    if (wasVisible !== isVisible) {
      Animated.spring(animatedValue, {
        toValue: isVisible ? 1 : 0,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }).start();
    }

    prevCartCount.current = cartCount;
  }, [cartCount, animatedValue]);

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  if (cartCount === 0 || isOnCartPage) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale }],
          opacity,
        }
      ]}
    >
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(tabs)/cart')}
        activeOpacity={0.8}
      >
        <Ionicons name="cart" size={24} color={colors.white} />
        {cartCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {cartCount > 99 ? '99+' : cartCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90, // Position above the tab bar
    right: 20,
    zIndex: 999,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default FloatingCartButton;