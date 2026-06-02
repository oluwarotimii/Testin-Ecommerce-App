import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { clearCartAbandonmentReminder, sendLocalNotification } from '@/services/notificationService';
import appConfig from '@/hooks/useAppConfig';
import { CartItem, awoofCart } from '@/utils/awoof/AwoofUtils';
import SafeImage from '@/components/SafeImage';
import Dropdown from '@/components/Dropdown';
import axios from 'axios';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateAwoofCouponDiscount, clearStoredAwoofAppliedCoupon, getStoredAwoofAppliedCoupon, normalizeAwoofCouponCode, setStoredAwoofAppliedCoupon, type AwoofAppliedCoupon } from '@/utils/awoofCoupons';

const PAYSTACK_INIT_ENDPOINT = `${appConfig.wordpressUrl.replace(/\/$/, '')}/wp-json/awoof/v1/initialize-payment`;

type PaymentData = {
  access_code?: string;
  authorization_url?: string;
  reference?: string;
  order_id?: string | number;
};

export default function AwoofCheckoutScreen({ route, navigation }: any) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { apiService, isAuthenticated, loadingAuth, user, sessionToken } = useAuth();
  const cartItems: CartItem[] = route?.params?.cartItems || [];

  const webViewRef = useRef<any>(null);
  const paymentCompletedRef = useRef(false);
  const [address, setAddress] = useState<any>(null);
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingShippingMethods, setLoadingShippingMethods] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWebCheckoutVisible, setIsWebCheckoutVisible] = useState(false);
  const [isWebLoading, setIsWebLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<any>(null);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AwoofAppliedCoupon | null>(null);

  const baseWordPressUrl = useMemo(() => appConfig.wordpressUrl.replace(/\/$/, ''), []);
  const callbackUrl = useMemo(() => `${baseWordPressUrl}/awoof-payment-callback`, [baseWordPressUrl]);
  const isDarkMode = String(colors.background).toLowerCase() === '#000000';

  useEffect(() => {
    if (!loadingAuth && isAuthenticated) {
      loadAddress();
      loadShippingMethods();
    } else if (!loadingAuth && !isAuthenticated) {
      setLoading(false);
      setLoadingShippingMethods(false);
    }
  }, [loadingAuth, isAuthenticated]);

  useEffect(() => {
    void (async () => {
      const stored = await getStoredAwoofAppliedCoupon();
      if (stored) {
        setAppliedCoupon(stored);
        setCouponInput(stored.code);
      }
    })();
  }, []);

  // Check for pending payment to resume if the app was closed
  useEffect(() => {
    const checkPendingPayment = async () => {
      try {
        const stored = await AsyncStorage.getItem('pending_awoof_payment');
        if (stored) {
          const data = JSON.parse(stored);
          // Only resume if it's recent (e.g., last 2 hours)
          const isRecent = Date.now() - (data.timestamp || 0) < 2 * 60 * 60 * 1000;
          
          if (isRecent && data.authorization_url) {
            Alert.alert(
              "Resume Payment?",
              "You have an incomplete payment. Would you like to resume it?",
              [
                { 
                  text: "Cancel", 
                  style: "cancel",
                  onPress: () => AsyncStorage.removeItem('pending_awoof_payment')
                },
                { 
                  text: "Resume", 
                  onPress: () => {
                    setPaymentData(data);
                    setCheckoutUrl(data.authorization_url);
                    if (data.address) setAddress(data.address);
                    setIsWebCheckoutVisible(true);
                  }
                }
              ]
            );
          } else {
            await AsyncStorage.removeItem('pending_awoof_payment');
          }
        }
      } catch (e) {
        console.error('Error checking pending payment:', e);
      }
    };

    if (isAuthenticated && !loadingAuth) {
      checkPendingPayment();
    }
  }, [isAuthenticated, loadingAuth]);

  const handleApplyCoupon = async () => {
    const code = normalizeAwoofCouponCode(couponInput);
    if (!code) {
      Alert.alert('Enter a code', 'Please enter a coupon code.');
      return;
    }

    try {
      if (!apiService.getCouponByCode) {
        Alert.alert('Unavailable', 'Coupons are not available right now.');
        return;
      }

      const coupon = await apiService.getCouponByCode(code);
      if (!coupon) {
        Alert.alert('Invalid coupon', 'That coupon code was not found.');
        return;
      }

      const discountType = String(coupon.discount_type || '').toLowerCase();
      const amount = Number.parseFloat(String(coupon.amount || '0'));
      const minimumAmount = Number.parseFloat(String(coupon.minimum_amount || '0'));

      if (!Number.isFinite(amount) || amount <= 0) {
        Alert.alert('Invalid coupon', 'This coupon cannot be applied.');
        return;
      }

      if (Number.isFinite(minimumAmount) && minimumAmount > 0 && subtotal < minimumAmount) {
        Alert.alert('Not eligible', `Order subtotal must be at least ₦${minimumAmount} to use this coupon.`);
        return;
      }

      if (coupon.date_expires) {
        const expiresAt = new Date(String(coupon.date_expires));
        if (!Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() < Date.now()) {
          Alert.alert('Expired coupon', 'This coupon has expired.');
          return;
        }
      }

      if (discountType !== 'percent' && discountType !== 'fixed_cart') {
        Alert.alert('Unsupported coupon', 'This coupon type is not supported in Awoof.');
        return;
      }

      const applied: AwoofAppliedCoupon = { code, discountType, amount };
      await setStoredAwoofAppliedCoupon(applied);
      setAppliedCoupon(applied);
      setCouponInput(code);
      Alert.alert('Coupon applied', 'Discount will apply to this Awoof order.');
    } catch (error) {
      console.error('Error applying Awoof coupon:', error);
      Alert.alert('Error', 'Could not apply this coupon. Please try again.');
    }
  };

  const handleRemoveCoupon = async () => {
    await clearStoredAwoofAppliedCoupon();
    setAppliedCoupon(null);
    setCouponInput('');
  };

  const loadShippingMethods = useCallback(async () => {
    try {
      setLoadingShippingMethods(true);
      const methods = await apiService.getShippingMethods();
      setShippingMethods(Array.isArray(methods) ? methods : []);
      if (Array.isArray(methods) && methods.length > 0) {
        setSelectedShippingMethod(methods[0]);
      }
    } catch (error) {
      console.error('Error loading Awoof shipping methods:', error);
      setShippingMethods([]);
    } finally {
      setLoadingShippingMethods(false);
    }
  }, [apiService]);

  const loadAddress = async () => {
    try {
      setLoading(true);
      const addresses = await apiService.getAddressBook();
      const primary = addresses.find((a: any) => a.isDefault) || addresses[0];
      setAddress(primary);
    } catch (error) {
      console.error('Error loading address:', error);
      Alert.alert('Error', 'Failed to load shipping address.');
    } finally {
      setLoading(false);
    }
  };

  const getAuthToken = async () => {
    const candidates = [
      sessionToken,
      await AsyncStorage.getItem('sessionToken'),
      await AsyncStorage.getItem('user_token'),
    ];

    const token = candidates.find((value) => typeof value === 'string' && value.trim().length > 0) || null;
    return token ? token.replace(/^"|"$/g, '') : null;
  };

  const getCustomerEmail = () => {
    return (
      user?.email ||
      user?.user_email ||
      user?.billing?.email ||
      address?.email ||
      ''
    );
  };

  const getAddressPayload = (selectedAddressData: any) => {
    const firstName = selectedAddressData?.firstName || selectedAddressData?.name?.split(' ')[0] || user?.first_name || user?.name?.split(' ')[0] || '';
    const lastName = selectedAddressData?.lastName || selectedAddressData?.name?.split(' ').slice(1).join(' ') || user?.last_name || user?.name?.split(' ').slice(1).join(' ') || '';
    return {
      billing: {
        first_name: firstName,
        last_name: lastName,
        company: '',
        address_1: selectedAddressData?.address || '',
        address_2: '',
        city: selectedAddressData?.city || '',
        state: selectedAddressData?.state || '',
        postcode: selectedAddressData?.zipCode || '',
        country: selectedAddressData?.country || '',
        email: getCustomerEmail(),
        phone: selectedAddressData?.phone || user?.phone || '',
      },
      shipping: {
        first_name: firstName,
        last_name: lastName,
        company: '',
        address_1: selectedAddressData?.address || '',
        address_2: '',
        city: selectedAddressData?.city || '',
        state: selectedAddressData?.state || '',
        postcode: selectedAddressData?.zipCode || '',
        country: selectedAddressData?.country || '',
      },
    };
  };

  const getShippingPayload = (deliveryFeeOverride?: number) => {
    const deliveryFee =
      typeof deliveryFeeOverride === 'number' && Number.isFinite(deliveryFeeOverride)
        ? deliveryFeeOverride
        : getSelectedShippingCost();

    if (!selectedShippingMethod) {
      return {
        shipping_lines: [{
          method_id: 'flat_rate',
          method_title: 'Standard Shipping',
          total: deliveryFee.toFixed(2),
        }],
      };
    }

    const methodId = selectedShippingMethod.method_id || selectedShippingMethod.id || 'flat_rate';
    const methodTitle = selectedShippingMethod.title || selectedShippingMethod.method_title || 'Standard Shipping';
    const shippingLines = [{
      method_id: methodId,
      method_title: methodTitle,
      total: deliveryFee.toFixed(2),
    }];

    return {
      shipping_lines: shippingLines,
      meta_data: [],
    };
  };

  const getSelectedShippingCost = () => {
    const rawCost =
      selectedShippingMethod?.cost ??
      selectedShippingMethod?.settings?.cost?.value ??
      selectedShippingMethod?.settings?.cost ??
      selectedShippingMethod?.settings?.shipping_cost?.value ??
      selectedShippingMethod?.settings?.shipping_cost ??
      0;

    const parsed = Number.parseFloat(String(rawCost).replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const handlePayPress = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    void initiatePayment();
  };

  const initiatePayment = async () => {
    if (!address) {
      Alert.alert('Address Missing', 'Please add a shipping address before proceeding.');
      return;
    }

    const email = getCustomerEmail();
    if (!email) {
      Alert.alert('Email Missing', 'User email is missing. Please log in again.');
      return;
    }

    try {
      setIsProcessing(true);
      setLoading(true);
      paymentCompletedRef.current = false;

      const authToken = await getAuthToken();
      if (!authToken) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const itemsPayload = cartItems.map((item) => ({
        id: Number(item.id),
        qty: item.quantity,
      }));

      const subtotalNow = cartItems.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);
      const deliveryFeeNow = getSelectedShippingCost();
      const discountNow = appliedCoupon ? calculateAwoofCouponDiscount(subtotalNow, appliedCoupon) : 0;

      console.log('🚀 Initiating awoof payment:', {
        endpoint: PAYSTACK_INIT_ENDPOINT,
        itemCount: itemsPayload.length,
        hasToken: true,
      });

      const response = await axios.post(
        PAYSTACK_INIT_ENDPOINT,
        {
          items: itemsPayload,
          callback_url: callbackUrl,
          email,
          coupon_code: appliedCoupon?.code || undefined,
          ...getAddressPayload(address),
          ...getShippingPayload(deliveryFeeNow),
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const payload: PaymentData = response.data || {};
      const authorizationUrl =
        payload.authorization_url ||
        (payload.access_code ? `https://checkout.paystack.com/${payload.access_code}` : null);

      if (!authorizationUrl) {
        throw new Error('Payment initialization succeeded but no checkout URL was returned.');
      }

      const paymentInfo = { ...payload, authorization_url: authorizationUrl };
      setPaymentData(paymentInfo);
      
      // Save pending payment for recovery if app closes
      try {
        await AsyncStorage.setItem('pending_awoof_payment', JSON.stringify({
          ...paymentInfo,
          timestamp: Date.now(),
          email: getCustomerEmail(),
          address: address
        }));
      } catch (storageError) {
        console.error('Failed to save pending payment:', storageError);
      }

      setCheckoutUrl(authorizationUrl);
      setIsWebCheckoutVisible(true);
    } catch (error: any) {
      console.error('Payment initialization failed:', error.response?.data || error.message);

      let errorMessage = 'An unexpected error occurred during payment initialization.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Payment Initialization Failed', errorMessage, [
        { text: 'Retry', onPress: initiatePayment },
        { text: 'Cancel', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  const finalizeWooCommerceOrder = async () => {
    const orderId = Number(paymentData?.order_id);
    if (!Number.isFinite(orderId) || orderId <= 0) {
      return;
    }

    try {
      await apiService.updateOrder(orderId, {
        set_paid: true,
        status: 'processing',
        transaction_id: paymentData?.reference || paymentData?.access_code || '',
      });
      console.log('✅ WooCommerce order marked as paid:', orderId);
    } catch (error) {
      console.error('⚠️ Failed to mark WooCommerce order as paid:', error);
    }
  };

  const finishPayment = async (source: string) => {
    if (paymentCompletedRef.current) {
      return;
    }

    paymentCompletedRef.current = true;
    const orderId = String(paymentData?.order_id || paymentData?.reference || 'SUCCESS');
    console.log('✅ Payment finished via:', source, { orderId, paymentData });

    await finalizeWooCommerceOrder();
    await clearCartAbandonmentReminder();
    awoofCart.clearCart();
    await clearStoredAwoofAppliedCoupon();
    
    // Clear pending payment
    await AsyncStorage.removeItem('pending_awoof_payment');

    await sendLocalNotification(
      'Order placed successfully',
      `Your Awoof order #${orderId} has been confirmed and is being processed.`,
      {
        linkType: 'page',
        linkValue: 'orders',
        orderId,
      }
    );
    setPaymentData(null);
    setCheckoutUrl(null);
    setIsWebLoading(false);
    setIsWebCheckoutVisible(false);
    navigation.replace('OrderSuccess', { orderId });
  };

  const handlePaymentCancel = () => {
    if (paymentCompletedRef.current) {
      return;
    }

    console.log('❌ Payment cancelled');
    webViewRef.current?.stopLoading?.();
    setPaymentData(null);
    setCheckoutUrl(null);
    setIsWebLoading(false);
    setIsWebCheckoutVisible(false);
    paymentCompletedRef.current = false;
    
    // Clear pending payment
    void AsyncStorage.removeItem('pending_awoof_payment');
    
    navigation.goBack();
  };

  const handleWebViewNavigation = (navState: any) => {
    const url = (navState?.url || '').toLowerCase();
    if (!url) return;

    const successSignals = [
      '/awoof-payment-callback',
      '/awoof-payment-success',
      '/order-received/',
      '/thank-you/',
      '/payment-success',
      '/success',
    ];

    if (successSignals.some((signal) => url.includes(signal))) {
      finishPayment(url);
      return;
    }
  };

  const handleShouldStartLoadWithRequest = (request: any) => {
    const url = (request?.url || '').toLowerCase();
    const successSignals = [
      '/awoof-payment-callback',
      '/order-received/',
      '/thank-you/',
      '/payment-success',
      '/success',
    ];

    if (successSignals.some((signal) => url.includes(signal))) {
      void finishPayment(request.url || url);
      return false;
    }

    return true;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);
  const deliveryFee = getSelectedShippingCost();
  const discount = appliedCoupon ? calculateAwoofCouponDiscount(subtotal, appliedCoupon) : 0;

  const total = Math.max(0, subtotal - discount) + deliveryFee;
  if (loading || loadingAuth) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Verifying payment details...
        </Text>
      </View>
    );
  }

  if (cartItems.length === 0 && !paymentData) {
    Alert.alert('Empty Cart', 'Your cart is empty. Please add items to proceed.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surface }]} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Awoof Checkout</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Confirm delivery before paying
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 260 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Shipping Address</Text>
            <TouchableOpacity onPress={() => router.push('/addresses')}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Change</Text>
            </TouchableOpacity>
          </View>

          {address ? (
            <View style={[styles.addressCard, { backgroundColor: colors.surface }]}>
              <View style={styles.addressInfo}>
                <Ionicons name="location" size={20} color={colors.primary} />
                <View style={styles.addressTextContainer}>
                  <Text style={[styles.addressName, { color: colors.text }]}>
                    {address.firstName} {address.lastName}
                  </Text>
                  <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                    {address.address}
                  </Text>
                  <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                    {address.city}, {address.state}
                  </Text>
                  <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                    {address.phone}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.emptyAddress, { borderColor: colors.border }]}
              onPress={() => router.push('/addresses')}
            >
              <Ionicons name="add-circle-outline" size={24} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, marginLeft: 8 }}>Add Shipping Address</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Method</Text>
          {loadingShippingMethods ? (
            <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : shippingMethods.length > 0 ? (
            <Dropdown
              options={shippingMethods}
              selectedValue={selectedShippingMethod}
              onValueChange={(method: any) => {
                setSelectedShippingMethod(method);
              }}
              keyExtractor={(item: any) => `${item.id}-${item.instance_id || item.method_id || item.title}`}
              renderItem={(item: any, isSelected: boolean) => (
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[styles.deliveryMethodTitle, { color: colors.text }, isSelected && { color: colors.primary }]}>
                      {item.title || item.method_title}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                  </View>
                  {item.zone_name && (
                    <Text style={[styles.deliveryMethodDescription, { color: colors.textSecondary }]}>
                      Zone: {item.zone_name}
                    </Text>
                  )}
                </View>
              )}
            />
          ) : (
            <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.deliveryMethodDescription, { color: colors.textSecondary }]}>
                No delivery methods available
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.deliveryNotice, { color: colors.error }]}>
            Delivery is only available in the areas listed in the location options. No delivery outside the available zones.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <SafeImage source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.itemPrice, { color: isDarkMode ? colors.white : colors.error }]}>
                    ₦{item.salePrice.toLocaleString()} x {item.quantity}
                  </Text>
                </View>
              </View>
            ))}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>₦{subtotal.toLocaleString()}</Text>
            </View>

            <View style={styles.couponBox}>
              <Text style={[styles.couponTitle, { color: colors.text }]}>Coupon (Awoof only)</Text>
              <View style={styles.couponRow}>
                <TextInput
                  value={couponInput}
                  onChangeText={setCouponInput}
                  placeholder="Enter coupon code"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  style={[
                    styles.couponInput,
                    { color: colors.text, backgroundColor: colors.background, borderColor: colors.border },
                  ]}
                />
                {appliedCoupon ? (
                  <TouchableOpacity
                    style={[styles.couponButton, { backgroundColor: colors.textSecondary }]}
                    onPress={handleRemoveCoupon}
                  >
                    <Text style={styles.couponButtonText}>Remove</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.couponButton, { backgroundColor: colors.primary }]}
                    onPress={handleApplyCoupon}
                  >
                    <Text style={styles.couponButtonText}>Apply</Text>
                  </TouchableOpacity>
                )}
              </View>
              {appliedCoupon && discount > 0 && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Discount ({appliedCoupon.code})</Text>
                  <Text style={[styles.priceValue, { color: colors.textSecondary }]}>-₦{discount.toLocaleString()}</Text>
                </View>
              )}
            </View>

            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Delivery Fee</Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>₦{deliveryFee.toLocaleString()}</Text>
            </View>

            <View style={[styles.priceRow, { marginTop: 8 }]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
              <Text style={[styles.totalValue, { color: isDarkMode ? colors.white : colors.primary }]}>₦{total.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.secureInfo}>
          <Ionicons name="shield-checkmark" size={16} color={colors.success} />
          <Text style={[styles.secureText, { color: colors.textSecondary }]}>
            Secure payment powered by Paystack. Your data is encrypted.
          </Text>
        </View>

      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          {
            borderTopColor: colors.border,
            backgroundColor: colors.card,
            paddingBottom: insets.bottom + 20,
            bottom: insets.bottom + 16,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.payButton, { backgroundColor: colors.primary }, isProcessing && { opacity: 0.7 }]}
          onPress={handlePayPress}
          disabled={isProcessing || (isAuthenticated && !address)}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.payButtonText}>{isAuthenticated ? `Pay ₦${total.toLocaleString()}` : 'Login to Pay'}</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={isWebCheckoutVisible}
        animationType="slide"
        transparent
        onRequestClose={handlePaymentCancel}
      >
        <View style={[styles.webModalContainer, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
          <View
            style={[
              styles.webModalHeader,
              {
                backgroundColor: colors.card,
                borderBottomColor: colors.border,
                paddingTop: insets.top + 24,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.surface }]}
              onPress={handlePaymentCancel}
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.webHeaderContent}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Secure Checkout</Text>
              <View style={[styles.securityBadge, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="lock-closed" size={10} color={colors.success} />
                <Text style={[styles.securityText, { color: colors.success }]}>Paystack</Text>
              </View>
            </View>

            <View style={styles.placeholder} />
          </View>

          <>
            {checkoutUrl ? (
              <WebView
                ref={webViewRef}
                source={{ uri: checkoutUrl }}
                style={[styles.webView, { backgroundColor: colors.background }]}
                onNavigationStateChange={handleWebViewNavigation}
                onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
                onLoadStart={() => setIsWebLoading(true)}
                onLoadEnd={() => setIsWebLoading(false)}
                onError={() => {
                  setIsWebLoading(false);
                  Alert.alert(
                    'Checkout Error',
                    'Unable to open the payment page. Please try again.',
                    [{ text: 'OK', onPress: handlePaymentCancel }]
                  );
                }}
                javaScriptEnabled
                domStorageEnabled
                originWhitelist={['*']}
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
              />
            ) : isWebLoading ? (
              <View style={[styles.webFallback, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.modalText, { color: colors.textSecondary }]}>
                  Loading secure checkout...
                </Text>
              </View>
            ) : (
              <View style={[styles.webFallback, { backgroundColor: colors.background }]}>
                <Text style={[styles.modalText, { color: colors.textSecondary }]}>
                  Preparing secure checkout...
                </Text>
              </View>
            )}
          </>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 20,
  },
  sectionShell: {
    borderRadius: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  addressCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressTextContainer: {
    marginLeft: 12,
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
  emptyAddress: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  itemDetails: {
    marginLeft: 12,
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  deliveryMethodTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  deliveryMethodDescription: {
    fontSize: 12,
    marginTop: 4,
  },
  deliveryNotice: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  couponBox: {
    marginTop: 10,
    gap: 10,
  },
  couponTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  couponRow: {
    flexDirection: 'row',
    gap: 10,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  couponButton: {
    paddingHorizontal: 14,
    borderRadius: 14,
    justifyContent: 'center',
  },
  couponButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  secureInfo: {
    flexDirection: 'row',
    paddingHorizontal: 25,
    alignItems: 'center',
    gap: 8,
  },
  secureText: {
    fontSize: 12,
    lineHeight: 16,
  },
  bottomBar: {
    // position: 'absolute',
    // left: 0,
    // top: 10,
    // right: 20,
    padding: 10,
    borderTopWidth: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: -4 },
    // shadowOpacity: 0.08,
    // shadowRadius: 12,
    // elevation: 12,
  },
  payButton: {
    height: 58,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  loadingText: {
    marginTop: 12,
  },
  webModalContainer: {
    flex: 1,
  },
  webModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    zIndex: 2,
    elevation: 2,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webHeaderContent: {
    alignItems: 'center',
    gap: 6,
  },
  securityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  securityText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  placeholder: {
    width: 36,
    height: 36,
  },
  webView: {
    flex: 1,
  },
  webFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
});
