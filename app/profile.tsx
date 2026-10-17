import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import {
  ArrowLeftIcon,
  UserCircleIcon,
  PhoneIcon,
  PackageIcon,
  MapPinIcon,
  HeartIcon,
  SignOutIcon,
  TrashIcon,
  CaretRightIcon,
} from 'phosphor-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import { radius, fontFamily, shadow } from '@/constants/designTokens';

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { apiService, isAuthenticated, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // User data state
  const [userData, setUserData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserDetails = async () => {
        try {
          setLoading(true);
          const response = await apiService.getAccountDetails();
          setUser(response);
          setUserData({
            firstname: response.first_name || response.name?.firstname || response.firstname || '',
            lastname: response.last_name || response.name?.lastname || response.lastname || '',
            email: response.email || '',
            phone: response.phone || response.mobile || response.phone_number || response.billing?.phone || '',
          });
        } catch (error) {
          console.error('Error fetching user details:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserDetails();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, apiService]);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace('/(tabs)');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "⚠️ Warning: This action cannot be undone. All your account data, order history, and personal information will be permanently deleted. Are you sure you want to delete your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: async () => {
            try {
              // Get user ID first
              const userDetails = await apiService.getAccountDetails();
              const userId = userDetails.id;

              if (!userId) {
                Alert.alert("Error", "Could not retrieve user information. Please try again.");
                return;
              }

              // Call the API to delete the account
              await apiService.deleteAccount(userId);

              // Sign out the user after successful deletion
              await signOut();

              // Navigate to home screen
              router.replace('/(tabs)');

              Alert.alert("Account Deleted", "Your account has been successfully deleted.");
            } catch (error: any) {
              console.error('Error deleting account:', error);
              Alert.alert("Error", "Failed to delete account. Please try again.");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeftIcon weight="bold" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        </View>

        <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
          <UserCircleIcon weight="regular" size={80} color={colors.textSecondary} style={styles.emptyIcon} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>You are not logged in.</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Please log in to view and edit your profile.</Text>
          <Button title="Log In" onPress={() => router.push('/login')} style={{ marginBottom: 15 }} />
          <Button title="Create Account" onPress={() => router.push('/register')} variant="outline" />

          {/* Privacy Policy Link */}
          <TouchableOpacity
            style={styles.privacyLink}
            onPress={() => router.push('/privacy-policy')}
          >
            <Text style={[styles.privacyLinkText, { color: colors.textSecondary }]}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeftIcon weight="bold" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>My Profile</Text>
          <TouchableOpacity onPress={() => router.push('/edit-profile')}>
            <Text style={{ color: colors.primary, fontSize: 16, fontFamily: fontFamily.medium }}>
              Edit
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Info Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: `https://ui-avatars.com/api/?name=${userData.firstname}+${userData.lastname}&background=007AFF&color=fff&size=128` }}
              style={styles.profilePicture}
            />
            <View style={styles.profileTexts}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {userData.firstname} {userData.lastname}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                {userData.email}
              </Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <PhoneIcon weight="regular" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.text }]}>{userData.phone || user?.billing?.phone || user?.mobile || user?.phone_number || 'No phone number'}</Text>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface }]} onPress={() => router.push('/orders')}>
            <View style={[styles.menuIcon, { backgroundColor: '#E3F2FD' }]}>
              <PackageIcon weight="regular" size={22} color="#2196F3" />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>My Orders</Text>
            <CaretRightIcon weight="bold" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface }]} onPress={() => router.push('/addresses')}>
            <View style={[styles.menuIcon, { backgroundColor: '#E8F5E9' }]}>
              <MapPinIcon weight="regular" size={22} color="#4CAF50" />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>Shipping Addresses</Text>
            <CaretRightIcon weight="bold" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface }]} onPress={() => router.push('/wishlist')}>
            <View style={[styles.menuIcon, { backgroundColor: '#FFEBEE' }]}>
              <HeartIcon weight="regular" size={22} color="#F44336" />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>My Wishlist</Text>
            <CaretRightIcon weight="bold" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface, marginTop: 20 }]} onPress={handleLogout}>
            <View style={[styles.menuIcon, { backgroundColor: '#FFEBEE' }]}>
              <SignOutIcon weight="regular" size={22} color="#D32F2F" />
            </View>
            <Text style={[styles.menuText, { color: '#D32F2F' }]}>Log Out</Text>
          </TouchableOpacity>

          {/* Delete Account Button */}
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.surface, marginTop: 10 }]}
            onPress={() => handleDeleteAccount()}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#FFEBEE' }]}>
              <TrashIcon weight="regular" size={22} color="#F44336" />
            </View>
            <Text style={[styles.menuText, { color: '#D32F2F' }]}>Delete Account</Text>
          </TouchableOpacity>

          {/* Privacy Policy Link */}
          <TouchableOpacity style={styles.privacyLink} onPress={() => router.push('/privacy-policy')}>
            <Text style={[styles.privacyLinkText, { color: colors.text }]}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: fontFamily.bold,
  },
  profileCard: {
    margin: 20,
    padding: 20,
    borderRadius: radius.xl,
    ...shadow.card,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 70,
    height: 70,
    borderRadius: radius.pill,
    marginRight: 16,
  },
  profileTexts: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontFamily: fontFamily.bold,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: radius.xl,
    marginBottom: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFamily.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  privacyLink: {
    marginTop: 15,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
  },
  privacyLinkText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});