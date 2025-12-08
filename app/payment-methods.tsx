import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { apiService, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    isDefault: false,
  });

  useEffect(() => {
    if (isAuthenticated) {
      const fetchPaymentMethods = async () => {
        try {
          setLoading(true);
          // In a real implementation, this would come from the API
          const mockMethods = [
            {
              id: 1,
              type: 'credit',
              last4: '1234',
              brand: 'Visa',
              expiry: '12/25',
              isDefault: true,
              cardholder: 'John Doe',
            },
            {
              id: 2,
              type: 'credit',
              last4: '5678',
              brand: 'MasterCard',
              expiry: '06/26',
              isDefault: false,
              cardholder: 'John Doe',
            }
          ];
          setPaymentMethods(mockMethods);
        } catch (error) {
          console.error('Error fetching payment methods:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchPaymentMethods();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleAddPaymentMethod = async () => {
    try {
      // In a real implementation, you would call the API to add the payment method
      const newMethod = {
        id: Date.now(),
        type: 'credit',
        last4: formData.cardNumber.slice(-4),
        brand: 'Visa', // Would detect from number in real app
        expiry: formData.expiryDate,
        isDefault: formData.isDefault,
        cardholder: formData.cardholderName,
      };
      setPaymentMethods([...paymentMethods, newMethod]);
      setFormData({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        isDefault: false,
      });
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding payment method:', error);
    }
  };

  const handleSetDefault = async (id: number) => {
    // In a real implementation, you would call the API to set default
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
  };

  const handleDelete = async (id: number) => {
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
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
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Payment Methods</Text>
        </View>

        <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
          <Ionicons name="card-outline" size={80} color={colors.textSecondary} style={styles.emptyIcon} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>You are not logged in.</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Please log in to manage your payment methods.</Text>
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
      </SafeAreaView>
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
          <Text style={[styles.title, { color: colors.text }]}>Add Payment Method</Text>
          <TouchableOpacity onPress={handleAddPaymentMethod}>
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '500' }}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Add Payment Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Card Number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
              value={formData.cardNumber}
              onChangeText={(text) => setFormData({...formData, cardNumber: text.replace(/\D/g, '')})}
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
              maxLength={19}
            />
          </View>

          <View style={styles.rowGroup}>
            <View style={styles.halfInputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Expiry Date</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.expiryDate}
                onChangeText={(text) => {
                  // Format as MM/YY
                  let formatted = text.replace(/\D/g, '');
                  if (formatted.length > 2) {
                    formatted = formatted.substring(0, 2) + '/' + formatted.substring(2, 4);
                  }
                  setFormData({...formData, expiryDate: formatted});
                }}
                placeholder="MM/YY"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View style={styles.halfInputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>CVV</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={formData.cvv}
                onChangeText={(text) => setFormData({...formData, cvv: text.replace(/\D/g, '')})}
                placeholder="123"
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Cardholder Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
              value={formData.cardholderName}
              onChangeText={(text) => setFormData({...formData, cardholderName: text})}
              placeholder="John Doe"
            />
          </View>

          <TouchableOpacity 
            style={styles.defaultCardContainer}
            onPress={() => setFormData({...formData, isDefault: !formData.isDefault})}
          >
            <Ionicons 
              name={formData.isDefault ? "checkbox" : "square-outline"} 
              size={24} 
              color={colors.primary} 
            />
            <Text style={[styles.defaultCardText, { color: colors.text }]}>Set as default payment method</Text>
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
        <Text style={[styles.title, { color: colors.text }]}>Payment Methods</Text>
        <TouchableOpacity onPress={() => setIsAdding(true)}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Payment Methods List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {paymentMethods.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={80} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No payment methods</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Add your first payment method</Text>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={() => setIsAdding(true)}
            >
              <Text style={[styles.primaryButtonText, { color: colors.white }]}>Add Payment Method</Text>
            </TouchableOpacity>
          </View>
        ) : (
          paymentMethods.map((method) => (
            <View key={method.id} style={[styles.cardContainer, { backgroundColor: colors.surface }]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardBrand}>
                  <Ionicons name={method.brand.toLowerCase() === 'mastercard' ? 'card' : 'card'} size={24} color={colors.text} />
                  <Text style={[styles.cardBrandText, { color: colors.text }]}>{method.brand}</Text>
                </View>
                {method.isDefault && (
                  <Text style={[styles.defaultBadge, { color: colors.primary, borderColor: colors.primary }]}>Default</Text>
                )}
              </View>
              
              <Text style={[styles.cardNumber, { color: colors.text }]}>•••• •••• •••• {method.last4}</Text>
              <Text style={[styles.cardExpiry, { color: colors.textSecondary }]}>Expires {method.expiry}</Text>
              
              <View style={styles.cardActions}>
                {!method.isDefault && (
                  <TouchableOpacity 
                    style={[styles.actionButton, { borderColor: colors.primary }]}
                    onPress={() => handleSetDefault(method.id)}
                  >
                    <Text style={[styles.actionButtonText, { color: colors.primary }]}>Set Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={[styles.actionButton, { borderColor: colors.textSecondary }]}
                  onPress={() => handleDelete(method.id)}
                >
                  <Text style={[styles.actionButtonText, { color: colors.text }]}>Remove</Text>
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
  cardContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardBrandText: {
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
  cardNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardExpiry: {
    fontSize: 14,
    marginBottom: 16,
  },
  cardActions: {
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
  defaultCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  defaultCardText: {
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