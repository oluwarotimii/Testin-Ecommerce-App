import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { formatPrice } from '@/utils/formatNumber';
import SkeletonLoader from '@/components/SkeletonLoader';
import BackButton from '@/components/BackButton';
import SafeImage from '@/components/SafeImage';
import Dropdown from '@/components/Dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CheckoutScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { apiService, isAuthenticated, loadingAuth, user } = useAuth();
  const { setCartCount } = useCart();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loadingCart, setLoadingCart] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Dynamic payment and shipping state
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  const [loadingShippingMethods, setLoadingShippingMethods] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<any>(null);
  const [selectedPickupBranch, setSelectedPickupBranch] = useState<string>('');

  const [selectedAddress, setSelectedAddress] = useState(0);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    total: 0
  });

  const { productId, quantity } = useLocalSearchParams();

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
      setLoadingCart(true);

      // Check if we are doing a "Buy Now" (single item checkout)
      if (productId && quantity) {
        const id = Number(productId);
        const qty = Number(quantity);
        const product = await apiService.getProduct(id);

        if (product) {
          setCartItems([{
            id: product.id,
            productId: product.id,
            title: product.name,
            image: product.images && product.images[0] ? product.images[0].src : '',
            price: parseFloat(product.price || '0'),
            quantity: qty
          }]);
        } else {
          // Fallback to cart if product fetch fails
          const cartResponse = await apiService.getCartContents();
          if (cartResponse?.success && cartResponse?.products) {
            setCartItems(cartResponse.products);
          } else {
            setCartItems([]);
          }
        }
      } else {
        // Normal checkout flow - fetch cart
        const cartResponse = await apiService.getCartContents();
        if (cartResponse?.success && cartResponse?.products) {
          setCartItems(cartResponse.products);
        } else {
          setCartItems([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch checkout items:", error);
      setCartItems([]);
    } finally {
      setLoadingCart(false);
    }
  }, [apiService, productId, quantity]);

  // Fetch payment and shipping methods
  const fetchPaymentAndShippingMethods = useCallback(async () => {
    try {
      setLoadingPaymentMethods(true);
      const methods = await apiService.getPaymentMethods();
      setPaymentMethods(methods);
      // Auto-select first payment method if available
      if (methods.length > 0) {
        setSelectedPaymentMethod(methods[0].id);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setPaymentMethods([]);
    } finally {
      setLoadingPaymentMethods(false);
    }

    try {
      setLoadingShippingMethods(true);
      const methods = await apiService.getShippingMethods();
      setShippingMethods(methods);
      // Auto-select first shipping method if available
      if (methods.length > 0) {
        setSelectedShippingMethod(methods[0]);
      }
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
      setShippingMethods([]);
    } finally {
      setLoadingShippingMethods(false);
    }
  }, [apiService]);

  // Check authentication status and fetch checkout data only if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCheckoutData();
      fetchPaymentAndShippingMethods();
    }
  }, [isAuthenticated, fetchCheckoutData]);

  useEffect(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
      const itemQuantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 1;
      return sum + (itemPrice * itemQuantity);
    }, 0);

    // No shipping, no tax, no additional charges - total is same as subtotal
    const total = subtotal;

    setOrderSummary({
      subtotal,
      total
    });
  }, [cartItems]);

  const handlePlaceOrder = async () => {
    if (addresses.length === 0) {
      Alert.alert('Address Required', 'Please add a shipping address to proceed.');
      return;
    }

    setPlacingOrder(true);
    try {
      const selectedAddressData = addresses[selectedAddress];

      // Format order data for WooCommerce
      // Using default/fallback values for payment and shipping as sections were removed
      const orderData = {
        payment_method: selectedPaymentMethod || 'bacs', // Use selected payment method
        payment_method_title: paymentMethods.find(m => m.id === selectedPaymentMethod)?.title || 'Direct Bank Transfer',
        set_paid: false,
        billing: {
          first_name: user?.first_name || user?.name?.split(' ')[0] || 'Customer',
          last_name: user?.last_name || user?.name?.split(' ').slice(1).join(' ') || '',
          address_1: selectedAddressData?.address || '',
          address_2: '',
          city: selectedAddressData?.city || '',
          state: selectedAddressData?.state || '',
          postcode: selectedAddressData?.zipCode || '',
          country: selectedAddressData?.country || '',
          email: user?.email || '',
          phone: user?.phone || selectedAddressData?.phone || ''
        },
        shipping: {
          first_name: selectedAddressData?.firstName || '',
          last_name: selectedAddressData?.lastName || '',
          address_1: selectedAddressData?.address || '',
          address_2: '',
          city: selectedAddressData?.city || '',
          state: selectedAddressData?.state || '',
          postcode: selectedAddressData?.zipCode || '',
          country: selectedAddressData?.country || ''
        },
        line_items: cartItems.map((item: any) => ({
          product_id: item.id || item.productId,
          quantity: item.quantity || 1
        })),
        shipping_lines: selectedShippingMethod ? [{
          method_id: selectedShippingMethod.method_id || 'flat_rate',
          method_title: selectedShippingMethod.title || 'Standard Shipping',
          total: '0'
        }] : [{
          method_id: 'flat_rate',
          method_title: 'Standard Shipping',
          total: '0'
        }],
        // Add pickup branch as meta data if selected
        meta_data: selectedPickupBranch ? [{
          key: '_pickup_branch',
          value: selectedPickupBranch
        }] : []
      };

      const response = await apiService.createOrder(orderData);
      if (response.success || response.id) {
        // Clear the cart after successful order placement
        try {
          await apiService.emptyCart();
          // Also update the cart count context to 0 using the context setter
          setCartCount(0);
        } catch (clearError) {
          console.error('Error clearing cart after order:', clearError);
          // Continue to success page even if cart clear fails
        }

        // Redirect to success screen
        const orderId = response.id || response.order?.id || 'Unknown';
        router.push({
          pathname: '/order-success',
          params: { orderId }
        });
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

  // Show login prompt screen if not authenticated
  if (!isAuthenticated) {
    if (loadingAuth) {
      return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <BackButton />
          <Text style={[styles.title, { color: colors.text }]}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.loginPromptContainer, { backgroundColor: colors.background }]}>
            <View style={styles.loginIconContainer}>
              <Ionicons name="lock-closed" size={64} color={colors.primary} />
            </View>

            <Text style={[styles.loginPromptTitle, { color: colors.text }]}>Login Required</Text>
            <Text style={[styles.loginPromptSubtitle, { color: colors.textSecondary }]}>
              Please login to proceed with checkout and complete your purchase
            </Text>

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/login')}
            >
              <Text style={[styles.loginButtonText, { color: colors.white }]}>Login to Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => router.push('/register')}
            >
              <Text style={[styles.signupButtonText, { color: colors.primary }]}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (loadingAddresses || loadingCart) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <BackButton />
          <Text style={[styles.title, { color: colors.text }]}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <SkeletonLoader width={100} height={24} style={{ marginBottom: 16 }} />
            <View style={[styles.itemsContainer, { backgroundColor: colors.surface, padding: 16 }]}>
              <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                <SkeletonLoader width={60} height={60} borderRadius={8} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <SkeletonLoader width="80%" height={16} style={{ marginBottom: 8 }} />
                  <SkeletonLoader width="40%" height={16} />
                </View>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <SkeletonLoader width={60} height={60} borderRadius={8} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <SkeletonLoader width="80%" height={16} style={{ marginBottom: 8 }} />
                  <SkeletonLoader width="40%" height={16} />
                </View>
              </View>
            </View>
          </View>
          <View style={styles.section}>
            <SkeletonLoader width={150} height={24} style={{ marginBottom: 16 }} />
            <SkeletonLoader width="100%" height={100} borderRadius={12} />
          </View>
          <View style={styles.section}>
            <SkeletonLoader width={120} height={24} style={{ marginBottom: 16 }} />
            <SkeletonLoader width="100%" height={120} borderRadius={12} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={[styles.title, { color: colors.text }]}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Cart Items (Your Order) */}
        {cartItems.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Order</Text>
            <View style={[styles.itemsContainer, { backgroundColor: colors.surface }]}>
              {cartItems.map((item, index) => (
                <View key={item.id} style={[styles.cartItem, { borderBottomColor: colors.border, borderBottomWidth: index === cartItems.length - 1 ? 0 : 1 }]}>
                  <SafeImage source={{ uri: item.image }} style={[styles.itemImage, { backgroundColor: colors.surface }]} />
                  <View style={styles.itemDetails}>
                    <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
                    <Text style={[styles.itemPrice, { color: '#FFA500' }]}>{formatPrice(typeof item.price === 'number' ? item.price : parseFloat(item.price))}</Text>
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
          <TouchableOpacity
            style={[styles.addButton, { borderColor: colors.primary }]}
            onPress={() => router.push('/addresses')}
          >
            <Text style={[styles.addButtonText, { color: colors.primary }]}>+ Add New Address</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
          {loadingPaymentMethods ? (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : paymentMethods.length > 0 ? (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              {paymentMethods.map((method, index) => (
                <View key={method.id}>
                  <TouchableOpacity
                    style={styles.paymentMethodItem}
                    onPress={() => setSelectedPaymentMethod(method.id)}
                  >
                    <View style={styles.radioOuter}>
                      {selectedPaymentMethod === method.id && (
                        <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.paymentMethodTitle, { color: colors.text }]}>
                        {method.title}
                      </Text>
                      {method.description && (
                        <Text style={[styles.paymentMethodDescription, { color: colors.textSecondary }]}>
                          {method.description}
                        </Text>
                      )}
                      {selectedPaymentMethod === method.id && method.instructions && (
                        <View style={[styles.instructionsBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                          <Ionicons name="information-circle" size={16} color={colors.primary} />
                          <Text style={[styles.instructionsText, { color: colors.text }]}>
                            {method.instructions}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                  {index < paymentMethods.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No payment methods available
              </Text>
            </View>
          )}
        </View>

        {/* Shipping/Delivery Method */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Method</Text>
          {loadingShippingMethods ? (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : shippingMethods.length > 0 ? (
            <Dropdown
              options={shippingMethods}
              selectedValue={selectedShippingMethod}
              onValueChange={(method: any) => {
                setSelectedShippingMethod(method);
                // Clear pickup branch if switching away from pickup
                if (method.method_id !== 'local_pickup') {
                  setSelectedPickupBranch('');
                }
              }}
              keyExtractor={(item: any) => `${item.id}-${item.instance_id}`}
              renderItem={(item: any, isSelected: boolean) => (
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[styles.paymentMethodTitle, { color: colors.text }, isSelected && { color: colors.primary }]}>
                      {item.title}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                  </View>
                  {item.zone_name && (
                    <Text style={[styles.paymentMethodDescription, { color: colors.textSecondary }]}>
                      Zone: {item.zone_name}
                    </Text>
                  )}
                </View>
              )}
            />
          ) : (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No shipping methods available
              </Text>
            </View>
          )}
        </View>

        {/* Pickup Branch Selection (conditional) */}
        {selectedShippingMethod?.method_id === 'local_pickup' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Pickup Branch</Text>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Pickup branch selection will be available based on your WooCommerce configuration.
                {selectedShippingMethod.zone_name && ` Available in: ${selectedShippingMethod.zone_name}`}
              </Text>
            </View>
          </View>
        )}

        {/* Order Summary */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{formatPrice(orderSummary.subtotal)}</Text>
            </View>

            <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>{formatPrice(orderSummary.total)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Text style={[styles.contactNotice, { color: colors.error }]}>
          Place your order, we will contact you for details
        </Text>
        <TouchableOpacity
          style={[styles.placeOrderButton, { backgroundColor: colors.primary }]}
          onPress={handlePlaceOrder}
          disabled={placingOrder}
        >
          {placingOrder ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={[styles.placeOrderText, { color: colors.white }]}>
              {`Place Order - ${formatPrice(orderSummary.total)}`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    gap: 12,
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
  card: {
    borderRadius: 12,
    padding: 16,
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
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
  },
  contactNotice: {
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
    fontWeight: '500',
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
  loginPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loginIconContainer: {
    marginBottom: 32,
  },
  loginPromptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  loginPromptSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  loginButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    paddingVertical: 12,
  },
  signupButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Payment and Shipping Method styles
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentMethodDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  instructionsBox: {
    flexDirection: 'row',
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    padding: 12,
  },
});