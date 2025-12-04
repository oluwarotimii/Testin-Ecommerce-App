import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '@/components/BackButton';

export default function AddressesScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { apiService, isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
    email: '',
    isDefault: false,
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, apiService]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAddressBook();
      setAddresses(response);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (address: any) => {
    setFormData({
      firstName: address.firstName || user?.first_name || user?.name?.split(' ')[0] || '',
      lastName: address.lastName || user?.last_name || user?.name?.split(' ').slice(1).join(' ') || user?.name || '',
      company: address.company || '',
      address: address.address || '',
      address2: address.address2 || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
      country: address.country || '',
      phone: address.phone || user?.phone || '',
      email: address.email || user?.email || '',
      isDefault: address.isDefault || false,
    });
    setIsEditing(true);
    setIsAdding(true);
  };

  const handleSaveAddress = async () => {
    try {
      if (!formData.firstName || !formData.lastName || !formData.address || !formData.city || !formData.country) {
        Alert.alert('Missing Information', 'Please fill in all required fields (First Name, Last Name, Address, City, Country).');
        return;
      }

      setLoading(true);

      if (isEditing) {
        // Update existing address
        if (apiService.updateCustomerAddress) {
          await apiService.updateCustomerAddress(formData);
          Alert.alert('Success', 'Shipping address updated successfully');
        } else {
          console.warn("Update address not supported by API service");
        }
      } else {
        // Add new address - try to find the appropriate method
        if (apiService.addCustomerAddress) {
          await apiService.addCustomerAddress(formData);
          Alert.alert('Success', 'New shipping address added successfully');
        } else if (apiService.updateCustomerAddress) {
          // Fallback: This may create/update depending on implementation
          await apiService.updateCustomerAddress(formData);
          Alert.alert('Success', 'Shipping address saved successfully');
        } else {
          console.warn("Address management not supported by API service");
        }
      }

      // Refresh addresses
      await fetchAddresses();

      // Reset form and navigation state
      setFormData({
        firstName: '',
        lastName: '',
        company: '',
        address: '',
        address2: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone: '',
        email: '',
        isDefault: false,
      });
      setIsAdding(false);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save shipping address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      setLoading(true);

      // Update the default address on the server
      if (apiService.updateDefaultAddress) {
        await apiService.updateDefaultAddress(addressId);
      }

      // Update local state
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      })));

      Alert.alert('Success', 'Default address updated successfully');
    } catch (error) {
      console.error('Error setting default address:', error);
      Alert.alert('Error', 'Failed to update default address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              // Delete address on the server - try multiple possible API methods
              if (apiService.deleteCustomerAddress) {
                await apiService.deleteCustomerAddress(addressId);
              } else if (apiService.updateCustomerAddress) {
                // If we can't delete directly, try to remove via update with empty values
                // But this would require tracking which address ID to update
                console.warn("Direct address deletion not supported, may need to update customer profile");
              } else {
                // Fallback to a more generic update method if available
                console.warn("No delete address method found in API service");
              }

              // Refresh addresses to reflect the change
              await fetchAddresses();

              Alert.alert('Success', 'Address deleted successfully');
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'Failed to delete address. Please try again.');
            } finally {
              setLoading(false);
            }
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
          <BackButton />
          <Text style={[styles.title, { color: colors.text }]}>Shipping Addresses</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
          <Ionicons name="location-outline" size={80} color={colors.textSecondary} style={styles.emptyIcon} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>You are not logged in.</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Please log in to manage your shipping addresses.</Text>
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

  if (isAdding) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setIsAdding(false); setIsEditing(false); }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>{isEditing ? 'Edit Shipping Address' : 'Add Shipping Address'}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Add Address Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>First Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                placeholder="First name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Last Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                placeholder="Last name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder=""
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
                placeholder=""
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Address Line 1 *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder=""
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Address Line 2</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.address2}
                onChangeText={(text) => setFormData({ ...formData, address2: text })}
                placeholder=""
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
                  placeholder=""
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <View style={styles.halfInputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>State</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                  value={formData.state}
                  onChangeText={(text) => setFormData({ ...formData, state: text })}
                  placeholder=""
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.rowGroup}>
              <View style={styles.halfInputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>ZIP Code</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                  value={formData.zipCode}
                  onChangeText={(text) => setFormData({ ...formData, zipCode: text })}
                  placeholder=""
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="default"
                />
              </View>
              <View style={styles.halfInputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Country *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                  value={formData.country}
                  onChangeText={(text) => setFormData({ ...formData, country: text })}
                  placeholder=""
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder=""
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSaveAddress}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={[styles.saveButtonText, { color: colors.white }]}>Save Shipping Address</Text>
              )}
            </TouchableOpacity>
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
        <Text style={[styles.title, { color: colors.text }]}>Shipping Addresses</Text>
        <TouchableOpacity onPress={() => {
          setFormData({
            firstName: '',
            lastName: '',
            company: '',
            address: '',
            address2: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
            phone: '',
            email: '',
            isDefault: false,
          });
          setIsAdding(true);
          setIsEditing(false);
        }}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Addresses List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={80} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No addresses yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Add your first shipping address</Text>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                setFormData({
                  firstName: user?.first_name || user?.first_name || user?.name?.split(' ')[0] || '',
                  lastName: user?.last_name || user?.name?.split(' ').slice(1).join(' ') || user?.name || '',
                  address: '',
                  city: '',
                  state: '',
                  zipCode: '',
                  country: '',
                  phone: user?.phone || '',
                  email: user?.email || '',
                  isDefault: false,
                });
                setIsAdding(true);
                setIsEditing(false);
              }}
            >
              <Text style={[styles.primaryButtonText, { color: colors.white }]}>Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((address) => (
            <View key={address.id} style={[styles.addressCard, { backgroundColor: colors.surface }]}>
              <View style={styles.addressHeader}>
                <Text style={[styles.addressName, { color: colors.text }]}>{address.firstName} {address.lastName}</Text>
                {address.isDefault && (
                  <Text style={[styles.defaultBadge, { color: colors.primary, borderColor: colors.primary }]}>Default</Text>
                )}
              </View>
              <Text style={[styles.addressText, { color: colors.text }]}>{address.address}</Text>
              <Text style={[styles.addressText, { color: colors.text }]}>{address.city}, {address.state} {address.zipCode}</Text>
              <Text style={[styles.addressText, { color: colors.text }]}>{address.country}</Text>
              <Text style={[styles.addressPhone, { color: colors.textSecondary }]}>{address.phone}</Text>
              <Text style={[styles.addressPhone, { color: colors.textSecondary }]}>{address.email}</Text>
              <View style={styles.addressActions}>
                {!address.isDefault && (
                  <TouchableOpacity
                    style={[styles.actionButton, { borderColor: colors.primary }]}
                    onPress={() => handleSetDefault(address.id)}
                  >
                    <Text style={[styles.actionButtonText, { color: colors.primary }]}>Set Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, { borderColor: colors.textSecondary }]}
                  onPress={() => handleEditAddress(address)}
                >
                  <Text style={[styles.actionButtonText, { color: colors.text }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { borderColor: colors.error, backgroundColor: `${colors.error}10` }]}
                  onPress={() => handleDeleteAddress(address.id)}
                >
                  <Text style={[styles.actionButtonText, { color: colors.error }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
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
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  addressCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  defaultBadge: {
    fontSize: 12,
    fontWeight: '600',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  addressText: {
    fontSize: 14,
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 2,
  },
  addressActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    marginTop: 10,
  },
  actionButton: {
    minWidth: '30%', // Minimum width for each button
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  defaultAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  defaultAddressText: {
    marginLeft: 10,
    fontSize: 16,
  },
  saveButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 100,
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
  },
  primaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
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