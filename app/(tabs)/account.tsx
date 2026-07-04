import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Image, Linking, Modal, Clipboard, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import updateService from '@/services/updateService';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import ReferralSystem from '@/components/ReferralSystem';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AccountScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const isDarkMode = String(colors.background).toLowerCase() === '#000000';
  const { colorScheme, toggleColorScheme, setColorScheme } = useTheme();
  const { isAuthenticated, apiService, signOut, loadingAuth } = useAuth();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  // console.log('isAuthenticated:', isAuthenticated, 'loadingAuth:', loadingAuth);
  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState(false);

  useEffect(() => {
    setDarkMode(colorScheme === 'dark');
  }, [colorScheme]);
  const [notifications, setNotifications] = useState(true);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check for pending referral code on mount
  useEffect(() => {
    const checkPendingReferral = async () => {
      try {
        const pendingCode = await AsyncStorage.getItem('pending_referral_code');
        if (pendingCode) {
          setShowReferralModal(true);
        }
      } catch (error) {
        console.error('Error checking pending referral:', error);
      }
    };
    checkPendingReferral();
  }, []);

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

  const supportItems = [
    // {
    //   id: 'referral',
    //   title: 'Referral Program',
    //   icon: () => <Ionicons name="people" size={20} color={colors.primary} />,
    //   onPress: () => setShowReferralModal(true),
    // },
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

  const fetchPushToken = async () => {
    try {
      setLoadingToken(true);
      
      if (!Device.isDevice) {
        Alert.alert(
          'Device Not Supported',
          'Push notifications require a physical device. Please test on a real device.'
        );
        setLoadingToken(false);
        return;
      }

      // Check permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Push notification permission is required. Please enable it in your device settings.'
        );
        setLoadingToken(false);
        return;
      }

      // Get the push token
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      setPushToken(token);
      
      // Copy to clipboard automatically
      Clipboard.setString(token);
      Alert.alert(
        'Push Token Retrieved',
        `Token copied to clipboard:\n\n${token}`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error fetching push token:', error);
      Alert.alert(
        'Error',
        `Failed to get push token: ${error.message || 'Unknown error'}`
      );
    } finally {
      setLoadingToken(false);
    }
  };

  const copyPushTokenToClipboard = () => {
    if (pushToken) {
      Clipboard.setString(pushToken);
      Alert.alert('Copied!', 'Push token copied to clipboard.', [{ text: 'OK' }]);
    }
  };

  const renderMenuItem = (item: any) => (
    <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
          {item.icon()}
        </View>
        <Text style={[styles.menuItemText, { color: colors.text }]}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderSettingsItem = (item: any) => (
    <View key={item.id} style={styles.menuItem}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
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
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
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
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="color-palette-outline" size={18} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
              </View>
              <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
                {themeItems.map(renderSettingsItem)}
              </View>
            </View>
            {isAuthenticated && userDetails ? (
              <>
                {/* User Profile */}
                <View style={[styles.profileSection, { backgroundColor: isDarkMode ? colors.surface : colors.primary + '12' }]}>
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
                      <Text style={[styles.memberSince, { color: colors.textSecondary }]}>Account member</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.primary }]} onPress={() => router.push('/profile')}>
                    <Ionicons name="create-outline" size={18} color={colors.white} />
                  </TouchableOpacity>
                </View>

                {/* Referral System - Hidden from main view, moved to modal */}
                {/* <ReferralSystem /> */}

                {/* Account Menu */}
                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="grid-outline" size={18} color={colors.primary} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
                  </View>
                  <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
                    {menuItems.map(renderMenuItem)}
                  </View>
                </View>

                {/* Support */}
                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="headset-outline" size={18} color={colors.primary} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
                  </View>
                  <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
                    {supportItems.map(renderMenuItem)}
                  </View>
                </View>

                {/* Privacy Policy Link */}
                <View style={styles.section}>
                  <TouchableOpacity style={styles.privacyLink} onPress={() => router.push('/privacy-policy')}>
                    <Text style={[styles.privacyLinkText, { color: colors.text }]}>Privacy Policy</Text>
                  </TouchableOpacity>
                </View>

                {/* Logout */}
                <View style={styles.section}>
                  <TouchableOpacity style={[styles.logoutCard, { backgroundColor: colors.surface, borderColor: colors.error + '20' }]} onPress={() => setShowSignOutModal(true)}>
                    <View style={[styles.logoutIconContainer, { backgroundColor: colors.error + '15' }]}>
                      <Ionicons name="log-out-outline" size={22} color={colors.error} />
                    </View>
                    <Text style={[styles.logoutText, { color: colors.error }]}>Sign Out</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
                  <View style={[styles.emptyIconCircle, { backgroundColor: colors.primary + '10' }]}>
                    <Ionicons name="person-outline" size={40} color={colors.primary} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>You are not logged in.</Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Please log in or create an account to view your profile, orders, and more.</Text>
                  <TouchableOpacity
                    style={[styles.loginButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.push('/login')}
                  >
                    <Ionicons name="log-in-outline" size={18} color={colors.white} />
                    <Text style={[styles.loginButtonText, { color: colors.white }]}>Log In</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.registerButton, { borderColor: colors.primary }]}
                    onPress={() => router.push('/register')}
                  >
                    <Ionicons name="person-add-outline" size={18} color={colors.primary} />
                    <Text style={[styles.registerButtonText, { color: colors.primary }]}>Create Account</Text>
                  </TouchableOpacity>

                  {/* Privacy Policy Link for non-authenticated users */}
                  <TouchableOpacity
                    style={styles.privacyLink}
                    onPress={() => router.push('/privacy-policy')}
                  >
                    <Text style={[styles.privacyLinkText, { color: colors.textSecondary }]}>Privacy Policy</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </>
        )}

        {/* App Version - Hidden trigger for Referral System */}
        <TouchableOpacity 
          style={styles.footer} 
          onPress={() => setShowReferralModal(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>Femtech Mobile App v3.3.0</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Referral Program Modal */}
      <Modal
        visible={showReferralModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReferralModal(false)}
      >
        <View style={styles.referralModalOverlay}>
          <View style={[styles.referralModalContent, { backgroundColor: colors.background }]}>
            <View style={styles.referralModalHeader}>
              <Text style={[styles.referralModalTitle, { color: colors.text }]}>Referral Program</Text>
              <TouchableOpacity onPress={() => setShowReferralModal(false)} style={styles.closeModalButton}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.referralModalScroll}>
              <ReferralSystem />
            </ScrollView>
          </View>
        </View>
      </Modal>

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
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => setShowSignOutModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, { backgroundColor: colors.error }]}
                onPress={handleLogout}
              >
                <Text style={[styles.modalButtonText, { color: colors.white }]}>Sign Out</Text>
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
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginHorizontal: 20,
    borderRadius: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  memberSince: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
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
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
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
    minHeight: 360,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  loginButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 14,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  privacyButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 15,
  },
  privacyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  privacyLink: {
    marginTop: 15,
    alignSelf: 'center',
  },
  privacyLinkText: {
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
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
  // Push Token Display styles
  pushTokenContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  pushTokenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pushTokenTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  pushTokenDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  tokenDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  tokenText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  copyButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getTokenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  getTokenButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  referralModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  referralModalContent: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  referralModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  referralModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeModalButton: {
    padding: 4,
  },
  referralModalScroll: {
    paddingBottom: 40,
  },
});
