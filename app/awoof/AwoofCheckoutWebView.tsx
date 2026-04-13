import React, { useRef, useState } from 'react';
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

// ============================================
// MAIN COMPONENT
// ============================================
export default function AwoofCheckoutWebView({ route, navigation }: any) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const cartItems = route?.params?.cartItems || [];
  const webViewRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  const CHECKOUT_URL = 'https://your-store.com/checkout/';
  const checkoutUrl = __DEV__
    ? 'https://demo.woothemes.com/storefront/checkout/'
    : CHECKOUT_URL;

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;

    if (url.includes('/order-received/') || url.includes('/thank-you/')) {
      handleOrderSuccess(url);
    }

    if (!isCheckoutRelatedUrl(url)) {
      Alert.alert(
        'Leave Checkout?',
        'Are you sure you want to leave the checkout page?',
        [
          { text: 'Stay', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
      return false;
    }
  };

  const handleOrderSuccess = (url: string) => {
    const orderIdMatch = url.match(/order-received\/(\d+)/);
    const orderId = orderIdMatch ? orderIdMatch[1] : 'N/A';
    navigation.replace('OrderSuccess', { orderId });
  };

  const isCheckoutRelatedUrl = (url: string) => {
    const allowedPaths = [
      '/checkout',
      '/cart',
      '/my-account',
      '/order-received',
      '/thank-you',
      'paystack.com',
    ];
    return allowedPaths.some((path) => url.includes(path));
  };

  const handleClose = () => {
    Alert.alert(
      'Cancel Checkout?',
      'Your items will be saved in your cart.',
      [
        { text: 'Continue Shopping', style: 'cancel' },
        {
          text: 'Cancel Checkout',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleError = () => {
    Alert.alert(
      'Connection Error',
      'Unable to load checkout page. Please check your internet connection.',
      [
        { text: 'Retry', onPress: () => webViewRef.current?.reload() },
        { text: 'Cancel', onPress: () => navigation.goBack() },
      ]
    );
  };

  const injectedJavaScript = `
    (function() {
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      const nav = document.querySelector('nav');
      if (header) header.style.display = 'none';
      if (footer) footer.style.display = 'none';
      if (nav) nav.style.display = 'none';
      document.body.style.paddingTop = '0';
    })();
    true;
  `;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
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
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
