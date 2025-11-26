import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import ProductGridItem from '@/components/ProductGridItem';
import { formatPrice } from '@/utils/formatNumber';

export default function CheckoutScreen() {
  const router = useRouter();
  const colors = useThemeColors();
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

  // Additional state for selections and promo code
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState(0);
  const [selectedShipping, setSelectedShipping] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: 0
  });

  const fetchCheckoutData = useCallback(async () => {
    try {
      setLoadingAddresses(true);
      const addressResponse = await apiService.getAddressBook();
      if (Array.isArray(addressResponse)) {
        setAddresses(addressResponse);
        if (addressResponse.length > 0) {
          setSelectedAddress(0);
        }
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }

    try {
      setLoadingPaymentMethods(true);
      const paymentResponse = await apiService.getPaymentMethods();
      if (Array.isArray(paymentResponse)) {
        setPaymentMethods(paymentResponse);
        if (paymentResponse.length > 0) {
          setSelectedPayment(0);
        }
      } else {
        setPaymentMethods([]);
      }
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
      setPaymentMethods([]);
    } finally {
      setLoadingPaymentMethods(false);
    }

    try {
      setLoadingShippingMethods(true);
      const shippingResponse = await apiService.getShippingMethods();
      if (Array.isArray(shippingResponse)) {
        setShippingMethods(shippingResponse);
        if (shippingResponse.length > 0) {
          setSelectedShipping(0);
        }
      } else {
        setShippingMethods([]);
      }
    } catch (error) {
      console.error("Failed to fetch shipping methods:", error);
      setShippingMethods([]);
    } finally {
      setLoadingShippingMethods(false);
    }

    try {
      setLoadingCart(true);
      const cartResponse = await apiService.getCartContents();
      if (cartResponse?.success && cartResponse?.products) {
        // Cart items now have all necessary data (productId, image, title, price, quantity)
        setCartItems(cartResponse.products);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Failed to fetch cart contents:", error);
      setCartItems([]);
    } finally {
      setLoadingCart(false);
    }
  }, [apiService]);

  useEffect(() => {
    fetchCheckoutData();
  }, [fetchCheckoutData]);

  useEffect(() => {
    const selectedShippingMethod = shippingMethods[selectedShipping];
    const subtotal = cartItems.reduce((sum, item) => {
      const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
      const itemQuantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 1;
      return sum + (itemPrice * itemQuantity);
    }, 0);
    const shippingCost = selectedShippingMethod ? (typeof selectedShippingMethod.price === 'number' ? selectedShippingMethod.price : parseFloat(selectedShippingMethod.price) || 0) : 0;
    const tax = subtotal * 0.08;
    const discount = promoCode ? subtotal * 0.1 : 0;
    const total = subtotal + shippingCost + tax - discount;

    setOrderSummary({
      subtotal,
      shipping: shippingCost,
      tax,
      discount,
      total
    });
  }, [cartItems, shippingMethods, selectedShipping, promoCode]);

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    try {
      const selectedAddressData = addresses[selectedAddress];
      const selectedPaymentData = paymentMethods[selectedPayment];
      const selectedShippingData = shippingMethods[selectedShipping];

      // Format order data for WooCommerce
      const orderData = {
        payment_method: selectedPaymentData?.id || 'bacs',
        payment_method_title: selectedPaymentData?.name || 'Direct Bank Transfer',
        set_paid: false,
        billing: {
          first_name: selectedAddressData?.firstName || 'Customer',
          last_name: selectedAddressData?.lastName || '',
          address_1: selectedAddressData?.address || '',
          city: selectedAddressData?.city || '',
          state: selectedAddressData?.state || '',
          postcode: selectedAddressData?.zipCode || '',
          country: selectedAddressData?.country || '',
          email: selectedAddressData?.email || '',
          phone: selectedAddressData?.phone || ''
        },
        shipping: {
          first_name: selectedAddressData?.firstName || 'Customer',
          last_name: selectedAddressData?.lastName || '',
          address_1: selectedAddressData?.address || '',
          city: selectedAddressData?.city || '',
          state: selectedAddressData?.state || '',
          postcode: selectedAddressData?.zipCode || '',
          country: selectedAddressData?.country || ''
        },
        line_items: cartItems.map((item: any) => ({
          product_id: item.id || item.productId,
          quantity: item.quantity || 1
        })),
        shipping_lines: [{
          method_id: selectedShippingData?.id || 'flat_rate',
          method_title: selectedShippingData?.name || 'Standard Shipping',
          total: (selectedShippingData?.price || 0).toString()
        }]
      };

      const response = await apiService.createOrder(orderData);
      if (response.success || response.id) {
        Alert.alert('Order Placed Successfully', 'Your order has been placed successfully!', [
          { text: 'OK', onPress: () => router.push('/orders') }
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Cart Items (Your Order) - Moved to top and styled like Cart */}
        {cartItems.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Order</Text>
            <View style={[styles.itemsContainer, { backgroundColor: colors.surface }]}>
              {cartItems.map((item, index) => (
                <View key={item.id} style={[styles.cartItem, { borderBottomColor: colors.border, borderBottomWidth: index === cartItems.length - 1 ? 0 : 1 }]}>
                  <Image source={{ uri: item.image }} style={[styles.itemImage, { backgroundColor: colors.surface }]} />
                  <View style={styles.itemDetails}>
                    <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
                    <Text style={[styles.itemPrice, { color: colors.primary }]}>{formatPrice(typeof item.price === 'number' ? item.price : parseFloat(item.price))}</Text>
                    <Text style={[styles.itemQuantity, { color: colors.textSecondary }]}>Qty: {item.quantity || 1}</Text>
                  </View>
                  <Text style={[styles.itemTotal, { color: colors.text }]}>
                    {formatPrice((typeof item.price === 'number' ? item.price : parseFloat(item.price)) * (item.quantity || 1))}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Shipping Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Shipping Address</Text>
          </View>
          {addresses.map((address, index) => (
            <TouchableOpacity
              key={address.id}
              style={[
                styles.optionCard,
                { backgroundColor: colors.surface, borderColor: 'transparent' },
                selectedAddress === index && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
              ]}
              onPress={() => setSelectedAddress(index)}
            >
              <View style={styles.optionContent}>
                <View style={styles.addressInfo}>
                  <Text style={[styles.addressName, { color: colors.text }]}>{address.name}</Text>
                  <Text style={[styles.addressText, { color: colors.textSecondary }]}>{address.address}</Text>
                  <Text style={[styles.addressText, { color: colors.textSecondary }]}>{address.city}</Text>
                  {address.isDefault && (
                    <Text style={[styles.defaultBadge, { color: colors.primary }]}>Default</Text>
                  )}
                </View>
                {selectedAddress === index && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.addButton, { borderColor: colors.primary }]}>
            <Text style={[styles.addButtonText, { color: colors.primary }]}>+ Add New Address</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
          </View>
          {paymentMethods.map((payment, index) => (
            <TouchableOpacity
              key={payment.id}
              style={[
                styles.optionCard,
                { backgroundColor: colors.surface, borderColor: 'transparent' },
                selectedPayment === index && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
              ]}
              onPress={() => setSelectedPayment(index)}
            >
              <View style={styles.optionContent}>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentIcon}>{payment.icon}</Text>
                  <View>
                    <Text style={[styles.paymentName, { color: colors.text }]}>{payment.name}</Text>
                    {payment.isDefault && (
                      <Text style={[styles.defaultBadge, { color: colors.primary }]}>Default</Text>
                    )}
                  </View>
                </View>
                {selectedPayment === index && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.addButton, { borderColor: colors.primary }]}>
            <Text style={[styles.addButtonText, { color: colors.primary }]}>+ Add New Payment Method</Text>
          </TouchableOpacity>
        </View>

        {/* Shipping Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="boat" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Shipping Method</Text>
          </View>
          {shippingMethods.map((shipping, index) => (
            <TouchableOpacity
              key={shipping.id}
              style={[
                styles.optionCard,
                { backgroundColor: colors.surface, borderColor: 'transparent' },
                selectedShipping === index && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
              ]}
              onPress={() => setSelectedShipping(index)}
            >
              <View style={styles.optionContent}>
                <View style={styles.shippingInfo}>
                  <Text style={[styles.shippingName, { color: colors.text }]}>{shipping.name}</Text>
                  <Text style={[styles.shippingTime, { color: colors.textSecondary }]}>{shipping.time}</Text>
                  <Text style={[styles.shippingDescription, { color: colors.textSecondary }]}>{shipping.description}</Text>
                </View>
                <View style={styles.shippingPrice}>
                  <Text style={[styles.priceText, { color: colors.primary }]}>
                    {shipping.price === 0 ? 'Free' : formatPrice(shipping.price)}
                  </Text>
                  {selectedShipping === index && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Promo Code */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Promo Code</Text>
          <View style={styles.promoContainer}>
            <TextInput
              style={[styles.promoInput, { backgroundColor: colors.surface, color: colors.text }]}
              placeholder="Enter promo code"
              placeholderTextColor={colors.textSecondary}
              value={promoCode}
              onChangeText={setPromoCode}
            />
            <TouchableOpacity style={[styles.applyButton, { backgroundColor: colors.primary }]}>
              <Text style={[styles.applyButtonText, { color: colors.white }]}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Summary */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{formatPrice(orderSummary.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>Shipping</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {orderSummary.shipping === 0 ? 'Free' : formatPrice(orderSummary.shipping)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>Tax</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{formatPrice(orderSummary.tax)}</Text>
            </View>
            {orderSummary.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>Discount</Text>
                <Text style={[styles.summaryValue, { color: colors.success }]}>
                  -{formatPrice(orderSummary.discount)}
                </Text>
              </View>
            )}
            <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>{formatPrice(orderSummary.total)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.placeOrderButton, { backgroundColor: colors.primary }]} onPress={handlePlaceOrder}>
          <Text style={[styles.placeOrderText, { color: colors.white }]}>Place Order - {formatPrice(orderSummary.total)}</Text>
        </TouchableOpacity>
      </View>
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
    marginLeft: -8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
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
    marginBottom: 12,
  },
  itemsContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  cartItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemQuantity: {
    fontSize: 12,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  optionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
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
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    marginBottom: 2,
  },
  defaultBadge: {
    fontSize: 12,
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
  },
  shippingInfo: {
    flex: 1,
  },
  shippingName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  shippingTime: {
    fontSize: 14,
    marginBottom: 2,
  },
  shippingDescription: {
    fontSize: 12,
  },
  shippingPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  promoContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  promoInput: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  applyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryCard: {
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
  },
  summaryValue: {
    fontSize: 16,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  placeOrderButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeOrderText: {
    fontSize: 16,
    fontWeight: '600',
  },
});