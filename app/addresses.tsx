import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import { MapPinIcon, ArrowLeftIcon } from 'phosphor-react-native';
import BackButton from '@/components/BackButton';
import Button from '@/components/Button';
import { radius, fontFamily, shadow } from '@/constants/designTokens';

// WooCommerce only stores one shipping/billing address per customer - there
// is no "add another address" endpoint. This screen reflects that directly
// instead of pretending to manage a list (the old Add/Delete/Set Default
// actions called API methods that don't exist on the backend and silently
// did nothing).
export default function AddressesScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { apiService, isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    country: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddress();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, apiService]);

  const fetchAddress = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAddressBook();
      setAddress(Array.isArray(response) && response.length > 0 ? response[0] : null);
    } catch (error) {
      console.error('Error fetching address:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditForm = () => {
    setFormData({
      firstName: address?.firstName || '',
      lastName: address?.lastName || '',
      company: address?.company || '',
      address: address?.address || '',
      address2: address?.address2 || '',
      city: address?.city || '',
      state: address?.state || '',
      country: address?.country || '',
      phone: address?.phone || user?.phone || '',
      email: address?.email || user?.email || '',
    });
    setIsEditing(true);
  };

  const handleSaveAddress = async () => {
    if (!formData.firstName || !formData.lastName || !formData.address || !formData.city || !formData.country) {
      Alert.alert('Missing Information', 'Please fill in all required fields (First Name, Last Name, Address, City, Country).');
      return;
    }

    try {
      setLoading(true);
      await apiService.updateCustomerAddress?.(formData);
      await fetchAddress();
      setIsEditing(false);
      Alert.alert('Success', 'Shipping address saved successfully');
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save shipping address. Please try again.');
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <BackButton />
          <Text style={[styles.title, { color: colors.text }]}>Shipping Address</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
          <MapPinIcon weight="regular" size={80} color={colors.textSecondary} style={styles.emptyIcon} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>You are not logged in.</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Please log in to manage your shipping address.</Text>
          <Button title="Log In" onPress={() => router.push('/login')} style={{ marginBottom: 15 }} />
          <Button title="Create Account" onPress={() => router.push('/register')} variant="outline" />
        </View>
      </View>
    );
  }

  if (isEditing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsEditing(false)}>
            <ArrowLeftIcon weight="bold" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>{address ? 'Edit Shipping Address' : 'Add Shipping Address'}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>First Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Last Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Company</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.company}
                onChangeText={(text) => setFormData({ ...formData, company: text })}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Address Line 1 *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Address Line 2</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.address2}
                onChangeText={(text) => setFormData({ ...formData, address2: text })}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.rowGroup}>
              <View style={styles.halfInputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>City *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <View style={styles.halfInputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>State</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                  value={formData.state}
                  onChangeText={(text) => setFormData({ ...formData, state: text })}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Country *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.country}
                onChangeText={(text) => setFormData({ ...formData, country: text })}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            <Button
              title="Save Shipping Address"
              onPress={handleSaveAddress}
              loading={loading}
              fullWidth
              style={styles.saveButton}
            />
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={[styles.title, { color: colors.text }]}>Shipping Address</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!address ? (
          <View style={styles.emptyContainer}>
            <MapPinIcon weight="regular" size={80} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No address yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Add your shipping address</Text>
            <Button title="Add Address" onPress={openEditForm} style={styles.primaryButton} />
          </View>
        ) : (
          <View style={[styles.addressCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.addressName, { color: colors.text }]}>{address.firstName} {address.lastName}</Text>
            <Text style={[styles.addressText, { color: colors.text }]}>{address.address}</Text>
            {!!address.address2 && (
              <Text style={[styles.addressText, { color: colors.text }]}>{address.address2}</Text>
            )}
            <Text style={[styles.addressText, { color: colors.text }]}>{address.city}, {address.state}</Text>
            <Text style={[styles.addressText, { color: colors.text }]}>{address.country}</Text>
            {!!address.phone && (
              <Text style={[styles.addressPhone, { color: colors.textSecondary }]}>{address.phone}</Text>
            )}
            {!!address.email && (
              <Text style={[styles.addressPhone, { color: colors.textSecondary }]}>{address.email}</Text>
            )}
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: colors.primary }]}
              onPress={openEditForm}
            >
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
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
    paddingTop: 15,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: fontFamily.bold,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  halfInputGroup: {
    flex: 1,
    marginBottom: 20,
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
    marginBottom: 8,
  },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    fontSize: 16,
  },
  addressCard: {
    borderRadius: radius.xl,
    padding: 20,
    marginTop: 16,
    gap: 4,
    ...shadow.card,
  },
  addressName: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: 14,
    marginTop: 4,
  },
  actionButton: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: fontFamily.medium,
  },
  saveButton: {
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 100,
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
  },
  primaryButton: {
    marginTop: 10,
  },
});
