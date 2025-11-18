import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Tabs } from 'expo-router';
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

  // Check if we're on the cart screen
  const currentRoute = state.routes[state.index]?.name;
  const hideTabBar = currentRoute === 'cart';

  // If we need to hide the tab bar, return null
  if (hideTabBar) {
    return null;
  }

  const isDark = colorScheme === 'dark';
  const tabBarBackgroundColor = isDark ? '#1C1C1E' : '#FFFFFF';
  const activeTintColor = isDark ? '#0A84FF' : '#007AFF';
  const inactiveTintColor = isDark ? '#8E8E93' : '#8E8E93';

  const tabIcons = {
    index: 'home',
    wishlist: 'heart',
    cart: 'cart',
    account: 'person',
    devtools: 'construct'
  };

  const getIconName = (routeName: string, focused: boolean) => {
    const baseIcon = tabIcons[routeName as keyof typeof tabIcons] || 'help';
    return focused ? baseIcon : `${baseIcon}-outline`;
  };

  const renderTab = (route: any, index: number) => {
    const { key, name } = route;
    const focused = state.index === index;
    const { options } = descriptors[key];
    const label = options.title || name;
    const iconName = getIconName(name, focused);

    // Special handling for the cart tab
    if (name === 'cart') {
      return (
        <TouchableOpacity
          key={index}
          style={[styles.centerTab, { backgroundColor: colors.background }]}
          onPress={() => navigation.navigate(name)}
        >
          <View style={styles.cartIconContainer}>
            <Ionicons 
              name={iconName} 
              size={24} 
              color={focused ? activeTintColor : inactiveTintColor} 
            />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.centerTabLabel, { color: focused ? activeTintColor : inactiveTintColor }]}>
            {label}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={index}
        style={styles.tab}
        onPress={() => navigation.navigate(name)}
      >
        <Ionicons 
          name={iconName} 
          size={24} 
          color={focused ? activeTintColor : inactiveTintColor} 
        />
        <Text style={[styles.tabLabel, { color: focused ? activeTintColor : inactiveTintColor }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: tabBarBackgroundColor, borderTopColor: isDark ? '#424245' : '#C7C7CC' }]}>
      {state.routes.slice(0, 2).map((route: any, index: number) => renderTab(route, index))}
      
      {/* Center tab - Cart (elevated) */}
      {renderTab(state.routes[2], 2)}
      
      {state.routes.slice(3).map((route: any, index: number) => renderTab(route, index + 3))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 80,
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  centerTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    width: 70,
    height: 70,
    borderRadius: 35,
    top: -20,
    position: 'absolute',
    left: (width / 2) - 35,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  centerTabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default CustomTabBar;