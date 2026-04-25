import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useColorScheme';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import appConfig from '@/hooks/useAppConfig';
import { awoofCart, buildWooCommerceCheckoutUrl } from './AwoofUtils';
import { useAuth } from '@/context/AuthContext';
import { clearCartAbandonmentReminder, sendLocalNotification } from '@/services/notificationService';

// ============================================
// MAIN COMPONENT
// ============================================
export default function AwoofCheckoutWebView({ route, navigation }: any) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { apiService, sessionToken } = useAuth();
  const cartItems = route?.params?.cartItems || [];
  const webViewRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Track if alert is currently shown to prevent duplicates
  const alertShown = useRef(false);
  const successHandledRef = useRef(false);

  // Get the base URL and clean it
  const baseUrl = appConfig.wordpressUrl.endsWith('/') 
    ? appConfig.wordpressUrl.slice(0, -1) 
    : appConfig.wordpressUrl;

  // Build the actual checkout URL with items and auth token
  const checkoutUrl = useMemo(() => {
    return buildWooCommerceCheckoutUrl(baseUrl, cartItems, sessionToken);
  }, [baseUrl, cartItems, sessionToken]);

  const handleNavigationStateChange = (navState: any) => {
    const { url, loading: isNavLoading } = navState;
    
    // Only check when navigation is finishing to reduce noise
    if (isNavLoading) return;

    console.log('WebView Navigating to:', url);

    if (url.includes('/order-received/') || url.includes('/thank-you/')) {
      handleOrderSuccess(url);
      return;
    }

    // Check if we're leaving the checkout flow
    if (!isCheckoutRelatedUrl(url) && !alertShown.current) {
      alertShown.current = true;
      Alert.alert(
        'Leave Checkout?',
        'Are you sure you want to leave the checkout page?',
        [
          { 
            text: 'Stay', 
            style: 'cancel',
            onPress: () => {
              alertShown.current = false;
            }
          },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => {
              alertShown.current = false;
              router.back();
            },
          },
        ],
        { onDismiss: () => { alertShown.current = false; } }
      );
    }
  };

  const handleShouldStartLoadWithRequest = (request: any) => {
    const url = (request?.url || '').toLowerCase();

    if (url.includes('/order-received/') || url.includes('/thank-you/')) {
      void handleOrderSuccess(request.url);
      return false;
    }

    return true;
  };

  const handleOrderSuccess = async (url: string) => {
    if (successHandledRef.current) {
      return;
    }

    successHandledRef.current = true;
    const orderIdMatch = url.match(/order-received\/(\d+)/);
    const orderId = orderIdMatch ? orderIdMatch[1] : 'N/A';

    if (orderId !== 'N/A') {
      try {
        await apiService.updateOrder(Number(orderId), {
          set_paid: true,
          status: 'processing',
        });
        console.log('✅ WooCommerce order updated from WebView success:', orderId);
      } catch (error) {
        console.error('⚠️ Failed to update WebView order:', error);
      }
    }

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

    // Using replace to prevent going back to checkout
    navigation.replace('OrderSuccess', { orderId });
  };

  const isCheckoutRelatedUrl = (url: string) => {
    const lowerUrl = url.toLowerCase();
    const allowedPaths = [
      '/checkout',
      '/cart',
      '/my-account',
      '/order-received',
      '/thank-you',
      '/awoof-payment-success',
      'paystack.com',
      'checkout',
      'gateway',
      'payment',
      'wp-login.php', // In case login is needed
      baseUrl.toLowerCase()
    ];
    
    // Also allow data URIs and blob URIs often used by scripts
    if (lowerUrl.startsWith('data:') || lowerUrl.startsWith('blob:')) return true;
    
    return allowedPaths.some((path) => lowerUrl.includes(path.toLowerCase()));
  };

  const handleClose = () => {
    if (alertShown.current) return;
    
    alertShown.current = true;
    Alert.alert(
      'Cancel Checkout?',
      'Your items will be saved in your Awoof cart.',
      [
        { 
          text: 'Continue', 
          style: 'cancel',
          onPress: () => { alertShown.current = false; }
        },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => {
            alertShown.current = false;
            router.back();
          },
        },
      ],
      { onDismiss: () => { alertShown.current = false; } }
    );
  };

  const handleError = () => {
    if (alertShown.current) return;
    
    alertShown.current = true;
    Alert.alert(
      'Connection Error',
      'Unable to load checkout page. Please check your internet connection.',
      [
        { text: 'Retry', onPress: () => { 
          alertShown.current = false;
          webViewRef.current?.reload(); 
        }},
        { text: 'Cancel', onPress: () => {
          alertShown.current = false;
          router.back();
        }},
      ],
      { onDismiss: () => { alertShown.current = false; } }
    );
  };

  const injectedJavaScript = `
    (function() {
      // Hide standard WP/Woo elements for a cleaner native feel
      const selectors = ['header', 'footer', 'nav', '.storefront-breadcrumb', '.widget-area'];
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => el.style.display = 'none');
      });
      document.body.style.paddingTop = '0';
      // Ensure the checkout form takes full width
      const container = document.querySelector('.col-full');
      if (container) {
        container.style.maxWidth = '100%';
        container.style.padding = '10px';
      }
    })();
    true;
  `;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Header */}
      <View style={[styles.header, { paddingTop: insets.top + 24, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.surface }]} onPress={handleClose}>
          <Ionicons name="close" size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Secure Checkout</Text>
          <View style={[styles.securityBadge, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="lock-closed" size={10} color={colors.success} />
            <Text style={[styles.securityText, { color: colors.success }]}>Encrypted</Text>
          </View>
        </View>

        <View style={styles.placeholder} />
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading secure checkout...</Text>
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: checkoutUrl }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onError={handleError}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        originWhitelist={['*']}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  securityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  placeholder: {
    width: 36,
  },
  loadingContainer: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  webview: {
    flex: 1,
  },
});
