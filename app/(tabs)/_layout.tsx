import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import CustomTabBar from '@/components/CustomTabBar';

export default function TabLayout() {
  const colors = useThemeColors();
  const { cartCount } = useCart();
  const { colorScheme } = useTheme();

  // Determine tab bar theme based on current theme
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />

      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
        }}
      />
      {/* <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
        }}
      /> */}
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
        }}
      />

    </Tabs>
  );
}