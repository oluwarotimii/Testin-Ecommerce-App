import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { User, Settings, Heart, MapPin, CreditCard, Bell, CircleHelp as HelpCircle, LogOut, ChevronRight, Moon, Download } from 'lucide-react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import updateService from '@/services/updateService';
import { useThemeColors } from '@/hooks/useColorScheme';

export default function AccountScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const menuItems = [
    {
      id: 'profile',
      title: 'Edit Profile',
      icon: User,
      onPress: () => router.push('/profile'),
    },
    {
      id: 'addresses',
      title: 'Shipping Addresses',
      icon: MapPin,
      onPress: () => router.push('/addresses'),
    },
    {
      id: 'payment',
      title: 'Payment Methods',
      icon: CreditCard,
      onPress: () => router.push('/payment-methods'),
    },
    {
      id: 'wishlist',
      title: 'Wishlist',
      icon: Heart,
      onPress: () => router.push('/wishlist'),
    },
  ];

  const settingsItems = [
    {
      id: 'notifications',
      title: 'Push Notifications',
      icon: Bell,
      type: 'switch',
      value: notifications,
      onToggle: setNotifications,
    },
    {
      id: 'darkmode',
      title: 'Dark Mode',
      icon: Moon,
      type: 'switch',
      value: darkMode,
      onToggle: setDarkMode,
    },
    {
      id: 'settings',
      title: 'App Settings',
      icon: Settings,
      type: 'navigation',
      onPress: () => router.push('/settings'),
    },
    {
      id: 'updates',
      title: 'Check for Updates',
      icon: Download,
      type: 'navigation',
      onPress: () => updateService.forceCheckForUpdates(),
    },
  ];

  const supportItems = [
    {
      id: 'help',
      title: 'Help & Support',
      icon: HelpCircle,
      onPress: () => router.push('/help'),
    },
  ];

  const handleLogout = () => {
    // TODO: Implement logout logic
    router.push('/welcome');
  };

  const renderMenuItem = (item: any) => (
    <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
          <item.icon size={20} color={colors.primary} />
        </View>
        <Text style={[styles.menuItemText, { color: colors.text }]}>{item.title}</Text>
      </View>
      <ChevronRight size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderSettingsItem = (item: any) => (
    <View key={item.id} style={styles.menuItem}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
          <item.icon size={20} color={colors.primary} />
        </View>
        <Text style={[styles.menuItemText, { color: colors.text }]}>{item.title}</Text>
      </View>
      {item.type === 'switch' ? (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.white}
        />
      ) : (
        <TouchableOpacity onPress={item.onPress}>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Account</Text>
      </View>

      {/* User Profile */}
      <View style={[styles.profileSection, { backgroundColor: colors.surface }]}>
        <View style={styles.profileInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.white }]}>JD</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.userName, { color: colors.text }]}>John Doe</Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>john.doe@example.com</Text>
            <Text style={[styles.memberSince, { color: colors.textSecondary }]}>Member since Jan 2024</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.primary }]} onPress={() => router.push('/profile')}>
          <Text style={[styles.editButtonText, { color: colors.white }]}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Account Menu */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
          {menuItems.map(renderMenuItem)}
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
        <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
          {settingsItems.map(renderSettingsItem)}
        </View>
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
        <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
          {supportItems.map(renderMenuItem)}
        </View>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.surface }]} onPress={handleLogout}>
          <LogOut size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <View style={styles.footer}>
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>Techin Mobile v1.0.0</Text>
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  memberSince: {
    fontSize: 12,
    marginTop: 4,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  menuContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 100,
  },
  versionText: {
    fontSize: 12,
  },
});