import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Image, Linking, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import updateService from '@/services/updateService';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';

export default function AccountScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { colorScheme, toggleColorScheme, setColorScheme } = useTheme();
  const { isAuthenticated, apiService, signOut, loadingAuth } = useAuth();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  // console.log('isAuthenticated:', isAuthenticated, 'loadingAuth:', loadingAuth);
  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');

  useEffect(() => {
    setDarkMode(colorScheme === 'dark');
  }, [colorScheme]);
  const [notifications, setNotifications] = useState(true);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          const response = await apiService.getAccountDetails(1);
          setUserDetails(response);
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
      id: 'orders',
      title: 'My Orders',
      icon: () => <Ionicons name="receipt" size={20} color={colors.primary} />,
      onPress: () => router.push('/orders'),
    },
    {
      id: 'profile',
      title: 'Edit Profile',
      icon: () => <Ionicons name="person" size={20} color={colors.primary} />,
      onPress: () => router.push('/profile'),
    },
    {
      id: 'addresses',
      title: 'Shipping Addresses',
      icon: () => <Ionicons name="location" size={20} color={colors.primary} />,
      onPress: () => router.push('/addresses'),
    },
    // {
    //   id: 'payment',
    //   title: 'Payment Methods',
    //   icon: () => <Ionicons name="card" size={20} color={colors.primary} />,
    //   onPress: () => router.push('/payment-methods'),
    // },
    {
      id: 'wishlist',
      title: 'Wishlist',
      icon: () => <Ionicons name="heart" size={20} color={colors.primary} />,
      onPress: () => router.push('/wishlist'),
    },
  ];

  const themeItems = [
    {
      id: 'darkmode',
      title: 'Dark Mode',
      icon: () => <Ionicons name="moon" size={20} color={colors.primary} />,
      type: 'switch',
      value: darkMode,
      onToggle: () => {
        const newScheme = darkMode ? 'light' : 'dark';
        setColorScheme(newScheme);
        setDarkMode(!darkMode);
      },
    },
  ];

  const settingsItems = [
    // {
    //   id: 'notifications',
    //   title: 'Push Notifications',
    //   icon: () => <Ionicons name="notifications" size={20} color={colors.primary} />,
    //   type: 'switch',
    //   value: notifications,
    //   onToggle: setNotifications,
    // },
    {
      id: 'settings',
      title: 'App Settings',
      icon: () => <Ionicons name="settings" size={20} color={colors.primary} />,
      type: 'navigation',
      onPress: () => router.push('/settings'),
    },
    // {
    //   id: 'updates',
    //   title: 'Check for Updates',
    //   icon: () => <Ionicons name="download" size={20} color={colors.primary} />,
    //   type: 'navigation',
    //   onPress: () => updateService.forceCheckForUpdates(),
    // },
    // {
    //   id: 'wptest',
    //   title: 'WordPress Test',
    //   icon: () => <Ionicons name="globe" size={20} color={colors.primary} />,
    //   type: 'navigation',
    //   onPress: () => router.push('/wordpress-test'),
    // },
    // {
    //   id: 'devtools',
    //   title: 'Developer Tools',
    //   icon: () => <Ionicons name="code-slash" size={20} color={colors.primary} />,
    //   type: 'navigation',
    //   onPress: () => router.push('/devtools'),
    // },
  ];

  const supportItems = [
    {
      id: 'help',
      title: 'Help & Support',
      icon: () => <Ionicons name="help-circle" size={20} color={colors.primary} />,
      onPress: () => router.push('/help'),
    },
  ];

  const handleLogout = async () => {
    setShowSignOutModal(false);
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setSigningOut(false);
    }
  };

  const renderMenuItem = (item: any) => (
    <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
          {item.icon()}
        </View>
        <Text style={[styles.menuItemText, { color: colors.text }]}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderSettingsItem = (item: any) => (
    <View key={item.id} style={styles.menuItem}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
          {item.icon()}
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
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }} // Add padding for floating tab bar
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Account</Text>
        </View>

        {loadingAuth || loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />
        ) : (
          <>
            {/* Theme Settings - Always visible */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
              <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
                {themeItems.map(renderSettingsItem)}
              </View>
            </View>

            {isAuthenticated && userDetails ? (
              <>
                {/* User Profile */}
                <View style={[styles.profileSection, { backgroundColor: colors.surface }]}>
                  <View style={styles.profileInfo}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.avatarText, { color: colors.white }]}>
                        {userDetails.first_name ? userDetails.first_name.charAt(0) :
                          userDetails.name?.firstname ? userDetails.name.firstname.charAt(0) :
                            userDetails.firstname ? userDetails.firstname.charAt(0) :
                              'U'}
                        {userDetails.last_name ? userDetails.last_name.charAt(0) :
                          userDetails.name?.lastname ? userDetails.name.lastname.charAt(0) :
                            userDetails.lastname ? userDetails.lastname.charAt(0) :
                              ''}
                      </Text>
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={[styles.userName, { color: colors.text }]}>
                        {userDetails.first_name || userDetails.name?.firstname || userDetails.firstname || 'User'} {userDetails.last_name || userDetails.name?.lastname || userDetails.lastname || ''}
                      </Text>
                      <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{userDetails.email}</Text>
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
                  <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.surface }]} onPress={() => setShowSignOutModal(true)}>
                    <Ionicons name="log-out" size={20} color={colors.error} />
                    <Text style={[styles.logoutText, { color: colors.error }]}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
                  <Ionicons name="person-circle-outline" size={80} color={colors.textSecondary} style={styles.emptyIcon} />
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
              </>
            )}
          </>
        )}

        {/* App Version */}
        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>Femtech Mobile App v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Sign Out Confirmation Modal */}
      <Modal
        visible={showSignOutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSignOutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalIconContainer, { backgroundColor: colors.error + '20' }]}>
              <Ionicons name="log-out-outline" size={40} color={colors.error} />
            </View>

            <Text style={[styles.modalTitle, { color: colors.text }]}>Sign Out?</Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              Are you sure you want to sign out of your account?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.background }]}
                onPress={() => setShowSignOutModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, { backgroundColor: colors.error }]}
                onPress={handleLogout}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Activity Indicator Overlay */}
      {signingOut && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>Signing out...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  confirmButton: {
    // backgroundColor set dynamically
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Loading overlay styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingContainer: {
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 150,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
});