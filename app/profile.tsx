import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { apiService, isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
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
          setFormData({
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

  const handleSave = async () => {
    try {
      setLoading(true);
      await apiService.updateAccountDetails({
        name: { firstname: formData.firstname, lastname: formData.lastname },
        email: formData.email,
        phone: formData.phone,
      });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

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
            await logout();
            router.replace('/(tabs)');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        </View>

        <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
          <Ionicons name="person-circle-outline" size={80} color={colors.textSecondary} style={styles.emptyIcon} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>You are not logged in.</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Please log in to view and edit your profile.</Text>
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
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>My Profile</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '500' }}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Info Card */}
      <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: `https://ui-avatars.com/api/?name=${formData.firstname}+${formData.lastname}&background=007AFF&color=fff&size=128` }}
            style={styles.profilePicture}
          />
          <View style={styles.profileTexts}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {formData.firstname} {formData.lastname}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
              {formData.email}
            </Text>
          </View>
        </View>

        {isEditing ? (
          <View style={styles.editForm}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>First Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={formData.firstname}
                onChangeText={(text) => setFormData({ ...formData, firstname: text })}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Last Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={formData.lastname}
                onChangeText={(text) => setFormData({ ...formData, lastname: text })}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Phone</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.text }]}>{formData.phone || user?.billing?.phone || user?.mobile || user?.phone_number || 'No phone number'}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Menu Options */}
      {!isEditing && (
        <View style={styles.menuContainer}>
          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface }]} onPress={() => router.push('/orders')}>
            <View style={[styles.menuIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="cube-outline" size={22} color="#2196F3" />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>My Orders</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface }]} onPress={() => router.push('/addresses')}>
            <View style={[styles.menuIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="location-outline" size={22} color="#4CAF50" />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>Shipping Addresses</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface }]} onPress={() => router.push('/wishlist')}>
            <View style={[styles.menuIcon, { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="heart-outline" size={22} color="#F44336" />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>My Wishlist</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface, marginTop: 20 }]} onPress={handleLogout}>
            <View style={[styles.menuIcon, { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="log-out-outline" size={22} color="#D32F2F" />
            </View>
            <Text style={[styles.menuText, { color: '#D32F2F' }]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
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
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  profileTexts: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  editForm: {
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
    borderRadius: 16,
    marginBottom: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
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