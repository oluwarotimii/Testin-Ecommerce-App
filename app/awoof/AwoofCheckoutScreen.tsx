import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { clearCartAbandonmentReminder, sendLocalNotification } from '@/services/notificationService';
import appConfig from '@/hooks/useAppConfig';
import { CartItem, awoofCart } from './AwoofUtils';
import SafeImage from '@/components/SafeImage';
import axios from 'axios';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWebCheckoutVisible, setIsWebCheckoutVisible] = useState(false);
  const [isWebLoading, setIsWebLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const baseWordPressUrl = useMemo(() => appConfig.wordpressUrl.replace(/\/$/, ''), []);
  const callbackUrl = useMemo(() => `${baseWordPressUrl}/awoof-payment-callback`, [baseWordPressUrl]);

  useEffect(() => {
    if (!loadingAuth && isAuthenticated) {
      loadAddress();
    } else if (!loadingAuth && !isAuthenticated) {
      setLoading(false);
    }
  }, [loadingAuth, isAuthenticated]);

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
          ...getAddressPayload(address),
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

      setPaymentData({ ...payload, authorization_url: authorizationUrl });
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
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

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

  if (cartItems.length === 0) {
    Alert.alert('Empty Cart', 'Your cart is empty. Please add items to proceed.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <SafeImage source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.itemPrice, { color: colors.error }]}>
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

            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Delivery Fee</Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>₦{deliveryFee.toLocaleString()}</Text>
            </View>

            <View style={[styles.priceRow, { marginTop: 8 }]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>₦{total.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.secureInfo}>
          <Ionicons name="shield-checkmark" size={16} color={colors.success} />
          <Text style={[styles.secureText, { color: colors.textSecondary }]}>
            Secure payment powered by Paystack. Your data is encrypted.
          </Text>
        </View>

        <View style={{ height: insets.bottom + 140 }} />
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          {
            borderTopColor: colors.border,
            backgroundColor: colors.card,
            paddingBottom: insets.bottom + 16,
            bottom: insets.bottom + 92,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.payButton, { backgroundColor: colors.primary }, isProcessing && { opacity: 0.7 }]}
          onPress={initiatePayment}
          disabled={isProcessing || !address}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.payButtonText}>Pay ₦{total.toLocaleString()}</Text>
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

          {checkoutUrl ? (
            <WebView
              ref={webViewRef}
              source={{ uri: checkoutUrl }}
              style={styles.webView}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
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
    position: 'absolute',
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
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
    backgroundColor: '#fff',
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
