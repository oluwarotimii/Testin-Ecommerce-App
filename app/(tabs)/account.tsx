import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { User, Settings, Heart, MapPin, CreditCard, Bell, CircleHelp as HelpCircle, LogOut, ChevronRight, Moon, Download, UserRoundX } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import updateService from '@/services/updateService';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';

export default function AccountScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { isAuthenticated, apiService, signOut, loadingAuth } = useAuth();
  console.log('isAuthenticated:', isAuthenticated, 'loadingAuth:', loadingAuth);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          const response = await apiService.getAccountDetails();
          if (response.success) {
            setUserDetails(response.account);
          } else {
            console.error('Failed to fetch account details:', response.error);
            setUserDetails(null);
          }
        } catch (error) {
          console.error('Error fetching account details:', error);
          setUserDetails(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setUserDetails(null);
      }
    };

    fetchUserDetails();
  }, [isAuthenticated, apiService]);

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

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
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

      {loadingAuth || loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />
      ) : isAuthenticated && userDetails ? (
        <>
          {/* User Profile */}
          <View style={[styles.profileSection, { backgroundColor: colors.surface }]}>
            <View style={styles.profileInfo}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={[styles.avatarText, { color: colors.white }]}>{userDetails.firstname ? userDetails.firstname.charAt(0) : ''}{userDetails.lastname ? userDetails.lastname.charAt(0) : ''}</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={[styles.userName, { color: colors.text }]}>{userDetails.firstname} {userDetails.lastname}</Text>
                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{userDetails.email}</Text>
                {userDetails.date_added && (
                  <Text style={[styles.memberSince, { color: colors.textSecondary }]}>Member since {new Date(userDetails.date_added).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</Text>
                )}
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
        </>
      ) : (
        <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
          <UserRoundX size={80} color={colors.textSecondary} style={styles.emptyIcon} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>You are not logged in.</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Please log in or create an account to view your profile, orders, and more.</Text>
          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/login')}
          >
            <Text style={[styles.loginButtonText, { color: colors.white }]}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.registerButton, { borderColor: colors.primary }]}
            onPress={() => router.push('/register')}
          >
            <Text style={[styles.registerButtonText, { color: colors.primary }]}>Create Account</Text>
          </TouchableOpacity>
        </View>
      )}

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
  loadingIndicator: {
    marginTop: 50,
    marginBottom: 50,
  },
  noAccountText: {
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300, // Ensure it takes up enough space
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  loginButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});