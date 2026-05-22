import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation }) => {
  const colors = useThemeColors();
  const { colorScheme } = useTheme();
  const { cartCount } = useCart();
  const insets = useSafeAreaInsets();

  // Pulse animation for Awoof tab
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [pulseAnim]);

  // Check if we should hide the tab bar (e.g., on cart or checkout screens)
  const currentTabRoute = state.routes[state.index];
  const currentRouteName = currentTabRoute?.name;
  
  // Detect nested route name if it's a nested navigator (like Awoof Corner)
  let nestedRouteName = '';
  if (currentTabRoute?.state?.routes) {
    const nestedState = currentTabRoute.state;
    nestedRouteName = nestedState.routes[nestedState.index]?.name;
  }

  const hideTabBar = 
    currentRouteName === 'cart' || 
    nestedRouteName === 'AwoofCheckout' ||
    nestedRouteName === 'AwoofCheckoutWebView' ||
    nestedRouteName === 'OrderSuccess';

  // If we need to hide the tab bar, return null
  if (hideTabBar) {
    return null;
  }

  const isDark = colorScheme === 'dark';
  const tabBarBackgroundColor = isDark ? '#1C1C1E' : '#FFFFFF'; // Keeping this for now as surface might be too plain, but let's check if we should use colors.surface
  // Actually, let's use the theme colors for better consistency if available, but hardcoded is fine for specific design control.
  // However, for floating tab bar, we want it to pop.
  const activeTintColor = colors.primary;
  const inactiveTintColor = colors.textSecondary;

  const tabIcons = {
    index: 'home',
    categories: 'menu',
    awoof: 'pricetag',
    cart: 'cart',
    account: 'person',
  };

  const getIconName = (routeName: string, focused: boolean): any => {
    const baseIcon = tabIcons[routeName as keyof typeof tabIcons] || 'help';
    return focused ? baseIcon : `${baseIcon}-outline`;
  };

  const renderTab = (route: any, index: number) => {
    const { key, name } = route;
    const focused = state.index === index;
    const { options } = descriptors[key];
    const label = options.title || name;
    const iconName = getIconName(name, focused);

    const isAwoof = name === 'awoof';
    const awoofColor = '#ff0000'; // Gold color to make it pop

    // Animation for the glow ring
    const glowScale = pulseAnim.interpolate({
      inputRange: [1, 1.15],
      outputRange: [1, 1.4],
    });

    const glowOpacity = pulseAnim.interpolate({
      inputRange: [1, 1.15],
      outputRange: [0.3, 0],
    });

    return (
      <TouchableOpacity
        key={index}
        style={styles.tab}
        onPress={() => navigation.navigate(name)}
      >
        <View style={styles.cartIconContainer}>
          {isAwoof && (
            <Animated.View 
              style={[
                styles.awoofGlow,
                {
                  transform: [{ scale: glowScale }],
                  opacity: glowOpacity,
                }
              ]}
            />
          )}
          <Animated.View 
            style={[
              isAwoof && { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <Ionicons
              name={iconName}
              size={isAwoof ? 26 : 24} // Slightly larger for Awoof
              color={isAwoof ? awoofColor : (focused ? activeTintColor : inactiveTintColor)}
            />
          </Animated.View>
          {name === 'cart' && cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartCount > 99 ? '99+' : cartCount}
              </Text>
            </View>
          )}
          {isAwoof && !focused && (
            <View style={styles.awoofDot} />
          )}
        </View>
        <Text style={[
          styles.tabLabel, 
          { 
            color: isAwoof ? awoofColor : (focused ? activeTintColor : inactiveTintColor),
            fontWeight: isAwoof || focused ? 'bold' : '600'
          }
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, {
      backgroundColor: tabBarBackgroundColor,
      borderTopColor: isDark ? '#424245' : '#C7C7CC',
      bottom: Math.max(insets.bottom, 10) + 10 // Add safe area inset + 10px padding
    }]}>
      {state.routes.map((route: any, index: number) => renderTab(route, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
    position: 'absolute',
    // bottom is now set dynamically with safe area insets
    left: 20,
    right: 20,
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingBottom: 0,
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  cartIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  awoofDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  awoofGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    zIndex: 1,
  },
});

export default CustomTabBar;