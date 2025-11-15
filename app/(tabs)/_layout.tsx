import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colors = useThemeColors();
  const { cartCount } = useCart();
  const { colorScheme } = useTheme();

  // Determine tab bar theme based on current theme
  const isDark = colorScheme === 'dark';
  const tabBarBackgroundColor = isDark ? '#000000' : '#007AFF';
  const tabBarActiveTintColor = isDark ? '#007AFF' : '#FFFFFF';
  const tabBarInactiveTintColor = isDark ? '#8E8E93' : '#FFFFFF';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tabBarActiveTintColor,
        tabBarInactiveTintColor: tabBarInactiveTintColor,
        tabBarStyle: {
          backgroundColor: tabBarBackgroundColor,
          borderTopWidth: 0,
          paddingBottom: 10,
          paddingTop: 10,
          height: 80,
          position: 'absolute',
          bottom: 10,
          left: 10,
          right: 10,
          borderRadius: 15,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ size, color }) => (
            <View style={{ 
              position: 'relative',
              width: 50,
              height: 50,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.background,
              borderRadius: 25,
              top: -15,
              borderWidth: 2,
              borderColor: tabBarBackgroundColor,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 8,
            }}>
              <Ionicons name="cart" size={size > 24 ? 30 : size} color={color} />
              {cartCount > 0 && (
                <View style={{
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
                }}>
                  <Text style={{
                    color: '#FFFFFF',
                    fontSize: 10,
                    fontWeight: 'bold',
                  }}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="devtools"
        options={{
          title: 'Dev Tools',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="construct" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}