import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useTheme } from '@/context/ThemeContext';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';

export default function DevToolsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { colorScheme, toggleColorScheme } = useTheme();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const navigationSections = {
    'Authentication': [
      { name: 'Login', path: '/login' },
      { name: 'Register', path: '/register' },
      { name: 'Welcome', path: '/welcome' },
    ],
    'Main Screens': [
      { name: 'Home', path: '/(tabs)/' },
      { name: 'Categories', path: '/(tabs)/categories' },
      { name: 'Products', path: '/products' },
      { name: 'Cart', path: '/(tabs)/cart' },
      { name: 'Wishlist', path: '/wishlist' },
      { name: 'Orders', path: '/(tabs)/orders' },
      { name: 'Account', path: '/(tabs)/account' },
    ],
    'Product Screens': [
      { name: 'Product Detail Page', path: '/product/1' },
    ],
    'Utility': [
      { name: 'Search', path: '/search' },
      { name: 'Checkout', path: '/checkout' },
    ]
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Development Tools</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Quick access to all app screens
        </Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.themeToggle}
          onPress={toggleColorScheme}
        >
          <Text style={[styles.themeToggleText, { color: colors.text }]}>
            Current Theme: {colorScheme.charAt(0).toUpperCase() + colorScheme.slice(1)}
          </Text>
          <Text style={[styles.themeToggleSubtext, { color: colors.textSecondary }]}>
            Tap to toggle theme
          </Text>
        </TouchableOpacity>
      </View>

      {Object.entries(navigationSections).map(([sectionName, screens]) => (
        <View key={sectionName} style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection(sectionName)}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {sectionName}
            </Text>
            <Ionicons
              name={expandedSection === sectionName ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {expandedSection === sectionName && (
            <View style={styles.screenList}>
              {screens.map((screen, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.screenItem, { backgroundColor: colors.surface }]}
                  onPress={() => navigateTo(screen.path)}
                >
                  <Text style={[styles.screenItemText, { color: colors.text }]}>
                    {screen.name}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: colors.error }]}
          onPress={() => router.push('/(tabs)/')}
        >
          <Text style={styles.resetButtonText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  section: {
    marginBottom: 20,
    marginHorizontal: 20,
  },
  themeToggle: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  themeToggleText: {
    fontSize: 18,
    fontWeight: '600',
  },
  themeToggleSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  screenList: {
    marginTop: 8,
  },
  screenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  screenItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  resetButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});