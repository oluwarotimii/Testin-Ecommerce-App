import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';

export default function CheckoutScreen() {
  const router = useRouter();
  const { apiService } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  const [loadingShippingMethods, setLoadingShippingMethods] = useState(true);
  const [loadingCart, setLoadingCart] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const fetchCheckoutData = useCallback(async () => {
    try {
      setLoadingAddresses(true);
      const addressResponse = await apiService.getAddressBook();
      if (addressResponse.success && addressResponse.addresses) {
        setAddresses(addressResponse.addresses);
        if (addressResponse.addresses.length > 0) {
          setSelectedAddress(0);
        }
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setLoadingAddresses(false);
    }

    try {
      setLoadingPaymentMethods(true);
      const paymentResponse = await apiService.getPaymentMethods();
      if (paymentResponse.success && paymentResponse.payment_methods) {
        setPaymentMethods(paymentResponse.payment_methods);
        if (paymentResponse.payment_methods.length > 0) {
          setSelectedPayment(0);
        }
      }
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
    } finally {
      setLoadingPaymentMethods(false);
    }

    try {
      setLoadingShippingMethods(true);
      const shippingResponse = await apiService.getShippingMethods();
      if (shippingResponse.success && shippingResponse.shipping_methods) {
        setShippingMethods(shippingResponse.shipping_methods);
        if (shippingResponse.shipping_methods.length > 0) {
          setSelectedShipping(0);
        }
      }
    } catch (error) {
      console.error("Failed to fetch shipping methods:", error);
    } finally {
      setLoadingShippingMethods(false);
    }

    try {
      setLoadingCart(true);
      const cartResponse = await apiService.getCartContents();
      if (cartResponse.success && cartResponse.products) {
        setCartItems(cartResponse.products);
      }
    } catch (error) {
      console.error("Failed to fetch cart contents:", error);
    } finally {
      setLoadingCart(false);
    }
  }, []);

  useEffect(() => {
    fetchCheckoutData();
  }, [fetchCheckoutData]);

  const selectedShippingMethod = shippingMethods[selectedShipping];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = selectedShippingMethod ? selectedShippingMethod.price : 0;
  const tax = subtotal * 0.08; // Assuming a fixed 8% tax for now
  const discount = 0; // Implement promo code logic later
  const total = subtotal + shippingCost + tax - discount;

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    try {
      const response = await apiService.createOrder();
      if (response.success) {
        Alert.alert('Order Placed Successfully', 'Your order has been placed successfully!', [
          { text: 'OK', onPress: () => router.push('/(tabs)/orders') }
        ]);
      } else {
        Alert.alert('Order Placement Failed', response.error || 'An error occurred while placing your order.');
      }
    } catch (error) {
      console.error("Order placement error:", error);
      Alert.alert('Order Placement Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Shipping Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Shipping Address</Text>
          </View>
          {addresses.map((address, index) => (
            <TouchableOpacity 
              key={address.id} 
              style={[
                styles.optionCard,
                selectedAddress === index && styles.selectedCard
              ]}
              onPress={() => setSelectedAddress(index)}
            >
              <View style={styles.optionContent}>
                <View style={styles.addressInfo}>
                  <Text style={styles.addressName}>{address.name}</Text>
                  <Text style={styles.addressText}>{address.address}</Text>
                  <Text style={styles.addressText}>{address.city}</Text>
                  {address.isDefault && (
                    <Text style={styles.defaultBadge}>Default</Text>
                  )}
                </View>
                {selectedAddress === index && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add New Address</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
          {paymentMethods.map((payment, index) => (
            <TouchableOpacity 
              key={payment.id} 
              style={[
                styles.optionCard,
                selectedPayment === index && styles.selectedCard
              ]}
              onPress={() => setSelectedPayment(index)}
            >
              <View style={styles.optionContent}>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentIcon}>{payment.icon}</Text>
                  <View>
                    <Text style={styles.paymentName}>{payment.name}</Text>
                    {payment.isDefault && (
                      <Text style={styles.defaultBadge}>Default</Text>
                    )}
                  </View>
                </View>
                {selectedPayment === index && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add New Payment Method</Text>
          </TouchableOpacity>
        </View>

        {/* Shipping Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="boat" size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Shipping Method</Text>
          </View>
          {shippingMethods.map((shipping, index) => (
            <TouchableOpacity 
              key={shipping.id} 
              style={[
                styles.optionCard,
                selectedShipping === index && styles.selectedCard
              ]}
              onPress={() => setSelectedShipping(index)}
            >
              <View style={styles.optionContent}>
                <View style={styles.shippingInfo}>
                  <Text style={styles.shippingName}>{shipping.name}</Text>
                  <Text style={styles.shippingTime}>{shipping.time}</Text>
                  <Text style={styles.shippingDescription}>{shipping.description}</Text>
                </View>
                <View style={styles.shippingPrice}>
                  <Text style={styles.priceText}>
                    {shipping.price === 0 ? 'Free' : `₦${shipping.price.toFixed(2)}`}
                  </Text>
                  {selectedShipping === index && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Promo Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promo Code</Text>
          <View style={styles.promoContainer}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter promo code"
              value={promoCode}
              onChangeText={setPromoCode}
            />
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₦{orderSummary.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>
                {orderSummary.shipping === 0 ? 'Free' : `₦${orderSummary.shipping.toFixed(2)}`}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>₦{orderSummary.tax.toFixed(2)}</Text>
            </View>
            {orderSummary.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>
                  -₦{orderSummary.discount.toFixed(2)}
                </Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₦{orderSummary.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
          <Text style={styles.placeOrderText}>Place Order - ₦{orderSummary.total.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  optionCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF10',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  defaultBadge: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 4,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  shippingInfo: {
    flex: 1,
  },
  shippingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  shippingTime: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  shippingDescription: {
    fontSize: 12,
    color: '#8E8E93',
  },
  shippingPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  promoContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  promoInput: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1D1D1F',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#1D1D1F',
  },
  summaryValue: {
    fontSize: 16,
    color: '#1D1D1F',
  },
  discountValue: {
    color: '#34C759',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  placeOrderButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});