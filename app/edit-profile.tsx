import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import { ArrowLeftIcon, UserCircleIcon } from 'phosphor-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import { radius, fontFamily, shadow } from '@/constants/designTokens';

export default function EditProfileScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { apiService, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

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
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeftIcon weight="bold" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
          <UserCircleIcon weight="regular" size={80} color={colors.textSecondary} style={styles.emptyIcon} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>You are not logged in.</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Please log in to edit your profile.</Text>
          <Button title="Log In" onPress={() => router.push('/login')} style={{ marginBottom: 15 }} />
          <Button title="Create Account" onPress={() => router.push('/register')} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeftIcon weight="bold" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={{ color: colors.primary, fontSize: 16, fontFamily: fontFamily.medium }}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
        {/* Profile Header */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface, margin: 20 }]}>
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
        </View>

        {/* Edit Form */}
        <View style={[styles.formContainer, { marginHorizontal: 20 }]}>
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
            <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              editable={false} // Email shouldn't be editable from here
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

          <Button title="Save Changes" onPress={handleSave} loading={loading} style={styles.saveButton} />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
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
    padding: 20,
    borderRadius: radius.xl,
    ...shadow.card,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  formContainer: {
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    fontFamily: fontFamily.medium,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    fontSize: 16,
  },
  saveButton: {
    marginTop: 10,
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
});