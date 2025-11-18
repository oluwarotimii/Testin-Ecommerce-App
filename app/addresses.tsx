import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

export default function AddressesScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { apiService, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
    isDefault: false,
  });

  useEffect(() => {
    if (isAuthenticated) {
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
      fetchAddresses();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, apiService]);

  const handleAddAddress = async () => {
    try {
      // In a real implementation, you would call the API to add the address
      // const response = await apiService.addAddress(formData);
      // For now, we'll just simulate adding it
      const newAddress = {
        id: Date.now(),
        ...formData,
      };
      setAddresses([...addresses, newAddress]);
      setFormData({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone: '',
        isDefault: false,
      });
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  const handleSetDefault = async (id: number) => {
    // In a real implementation, you would call the API to set default
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
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
          <Text style={[styles.title, { color: colors.text }]}>Addresses</Text>
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
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsAdding(false)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Add New Address</Text>
          <TouchableOpacity onPress={handleAddAddress}>
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '500' }}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Add Address Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>First Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
              value={formData.firstName}
              onChangeText={(text) => setFormData({...formData, firstName: text})}
              placeholder="John"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
              value={formData.lastName}
              onChangeText={(text) => setFormData({...formData, lastName: text})}
              placeholder="Doe"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Address</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
              value={formData.address}
              onChangeText={(text) => setFormData({...formData, address: text})}
              placeholder="123 Main Street"
            />
          </View>

          <View style={styles.rowGroup}>
            <View style={styles.halfInputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>City</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.city}
                onChangeText={(text) => setFormData({...formData, city: text})}
                placeholder="New York"
              />
            </View>
            <View style={styles.halfInputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>State</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.state}
                onChangeText={(text) => setFormData({...formData, state: text})}
                placeholder="NY"
              />
            </View>
          </View>

          <View style={styles.rowGroup}>
            <View style={styles.halfInputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>ZIP Code</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.zipCode}
                onChangeText={(text) => setFormData({...formData, zipCode: text})}
                placeholder="10001"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Country</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.country}
                onChangeText={(text) => setFormData({...formData, country: text})}
                placeholder="USA"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
              value={formData.phone}
              onChangeText={(text) => setFormData({...formData, phone: text})}
              placeholder="+1 (555) 123-4567"
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity 
            style={styles.defaultAddressContainer}
            onPress={() => setFormData({...formData, isDefault: !formData.isDefault})}
          >
            <Ionicons 
              name={formData.isDefault ? "checkbox" : "square-outline"} 
              size={24} 
              color={colors.primary} 
            />
            <Text style={[styles.defaultAddressText, { color: colors.text }]}>Set as default address</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Shipping Addresses</Text>
        <TouchableOpacity onPress={() => setIsAdding(true)}>
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
              onPress={() => setIsAdding(true)}
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
              <View style={styles.addressActions}>
                {!address.isDefault && (
                  <TouchableOpacity 
                    style={[styles.actionButton, { borderColor: colors.primary }]}
                    onPress={() => handleSetDefault(address.id)}
                  >
                    <Text style={[styles.actionButtonText, { color: colors.primary }]}>Set Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.actionButton, { borderColor: colors.textSecondary }]}>
                  <Text style={[styles.actionButtonText, { color: colors.text }]}>Edit</Text>
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
    marginBottom: 12,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  actionButton: {
    flex: 1,
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
  },
  defaultAddressText: {
    marginLeft: 10,
    fontSize: 16,
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