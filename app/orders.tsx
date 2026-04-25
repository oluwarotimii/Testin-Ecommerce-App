import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import SkeletonLoader from '@/components/SkeletonLoader';
import BackButton from '@/components/BackButton';
import { getOrderStatus } from '@/constants/orderStatus';
import { SafeAreaView } from 'react-native-safe-area-context';

const getOrderMetaValue = (metaData: any[] | undefined, key: string) => {
  if (!Array.isArray(metaData)) return undefined;
  return metaData.find((item) => item?.key === key)?.value;
};

const isAwoofOrder = (metaData: any[] | undefined) => {
  const source = getOrderMetaValue(metaData, '_awoof_checkout_source') || getOrderMetaValue(metaData, '_awoof_order_tag');
  return String(source || '').toLowerCase() === 'mobile_app' || String(source || '').toLowerCase() === 'awoof';
};

const isPaidOrder = (order: any) => {
  return !!order.date_paid || ['processing', 'completed'].includes(String(order.status || '').toLowerCase());
};

const getDeliveryMethodLabel = (order: any) => {
  const shippingLine = Array.isArray(order?.shipping_lines) ? order.shipping_lines[0] : null;
  const methodId = String(shippingLine?.method_id || '').toLowerCase();
  const methodTitle = String(shippingLine?.method_title || shippingLine?.title || '').trim();
  const pickupBranch = getOrderMetaValue(order?.meta_data, '_pickup_branch');

  if (methodId === 'local_pickup') {
    return pickupBranch ? `Store Pickup - ${pickupBranch}` : 'Store Pickup';
  }

  if (methodTitle) {
    return methodTitle;
  }

  return 'Delivery';
};


export default function OrdersScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { apiService, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<number | null>(null); // Track which order ID the modal is for

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await apiService.getOrders();
        // WooCommerce API returns array directly
        if (Array.isArray(response)) {
          // Transform WooCommerce orders to app format
          const transformedOrders = response.map((order: any) => ({
            order_id: order.id || order.order_id,
            date_added: order.date_created || order.date_added,
            status: order.status,
            total: order.total,
            products: order.line_items || order.products || [],
            meta_data: order.meta_data || [],
            shipping_lines: order.shipping_lines || [],
            date_paid: order.date_paid,
            payment_method_title: order.payment_method_title
          }));
          setOrders(transformedOrders);
        } else {
          console.error('Unexpected response format:', response);
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [apiService, isAuthenticated, router]);

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleCancelOrder = (orderId: number) => {
    console.log('handleCancelOrder called for order:', orderId);
    console.log('Current orders array:', orders);
    console.log('Looking for order with ID:', orderId);

    // Show the confirmation modal instead of Alert
    setShowCancelModal(orderId);
    console.log('Showed cancel confirmation modal for order:', orderId);
  };

  const confirmCancelOrder = async (orderId: number) => {
    console.log('Confirming cancellation for order:', orderId);
    setShowCancelModal(null); // Close the modal

    try {
      console.log('Setting cancellingOrderId to:', orderId);
      setCancellingOrderId(orderId);
      console.log('cancellingOrderId state set to:', orderId);

      // Find the order to preserve its original status in case of failure
      console.log('Finding order to cancel...');
      const orderToCancel = orders.find(order => order.order_id === orderId);
      console.log('Found order to cancel:', orderToCancel);

      if (!orderToCancel) {
        console.log('Order not found, throwing error');
        throw new Error('Order not found');
      }

      // Update the order status in the local state instantly
      console.log('Updating order status to cancelled in local state for order:', orderId);
      setOrders(prevOrders => {
        console.log('Updating orders state...');
        return prevOrders.map(order =>
          order.order_id === orderId
            ? { ...order, status: 'cancelled' }
            : order
        );
      });

      // Make the API call
      console.log('Making API call to cancel order with ID:', orderId);
      await apiService.cancelOrder(orderId);
      console.log('API call to cancel order completed successfully');

      // Refresh the orders list after successful API call
      console.log('Refreshing orders list after successful cancellation...');
      const response = await apiService.getOrders();
      console.log('Received updated orders list:', response);

      if (Array.isArray(response)) {
        console.log('Transforming orders data...');
        const transformedOrders = response.map((order: any) => ({
          order_id: order.id || order.order_id,
          date_added: order.date_created || order.date_added,
          status: order.status,
          total: order.total,
          products: order.line_items || order.products || [],
          meta_data: order.meta_data || [],
          shipping_lines: order.shipping_lines || [],
          date_paid: order.date_paid,
          payment_method_title: order.payment_method_title
        }));

        console.log('Setting updated orders state...');
        setOrders(transformedOrders);
        console.log('Orders list refreshed with', transformedOrders.length, 'orders');
      } else {
        console.log('Response is not an array, response:', response);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      console.error('Error details:', error.message, error.stack);

      // If the API call fails, refresh the orders to get the correct status
      try {
        console.log('Refreshing orders after failed cancellation...');
        const response = await apiService.getOrders();
        if (Array.isArray(response)) {
          const transformedOrders = response.map((order: any) => ({
            order_id: order.id || order.order_id,
            date_added: order.date_created || order.date_added,
            status: order.status,
            total: order.total,
            products: order.line_items || order.products || [],
            meta_data: order.meta_data || [],
            shipping_lines: order.shipping_lines || [],
            date_paid: order.date_paid,
            payment_method_title: order.payment_method_title
          }));
          setOrders(transformedOrders);
          console.log('Orders list refreshed after failed cancellation');
        }
      } catch (refreshError) {
        console.error('Error refreshing orders after failed cancellation:', refreshError);
      }
      Alert.alert('Error', 'Failed to cancel order. Please try again.');
    } finally {
      console.log('In finally block, resetting cancellingOrderId...');
      setCancellingOrderId(null);
      console.log('cancellingOrderId reset to null');
    }
  };

  const cancelCancelOrder = () => {
    console.log('User cancelled the cancellation');
    setShowCancelModal(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <BackButton style={{ marginRight: 12 }} />
          <Text style={[styles.title, { color: colors.text }]}>Orders</Text>
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.skeletonCard, { backgroundColor: colors.surface }]}>
              <SkeletonLoader width={100} height={20} marginBottom={10} />
              <SkeletonLoader width={200} height={16} marginBottom={10} />
              <SkeletonLoader width={80} height={16} />
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <BackButton style={{ marginRight: 12 }} />
          <Text style={[styles.title, { color: colors.text }]}>Orders</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Ionicons name="bag-handle-outline" size={80} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No orders yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Start shopping to see your orders here.
          </Text>
          <TouchableOpacity
            style={[styles.shopButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={[styles.shopButtonText, { color: colors.white }]}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <BackButton style={{ marginRight: 12 }} />
        <Text style={[styles.title, { color: colors.text }]}>Orders</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {orders.map((order) => {
          const orderStatus = getOrderStatus(order.status);
          const awoofOrder = isAwoofOrder(order.meta_data);
          const paidOrder = isPaidOrder(order);
          const deliveryMethod = getDeliveryMethodLabel(order);
          const isDarkMode = String(colors.background).toLowerCase() === '#000000';
          return (
            <TouchableOpacity
              key={order.order_id}
              style={[styles.orderCard, { backgroundColor: colors.surface }]}
              onPress={() => router.push(`/order/${order.order_id}`)}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.orderId, { color: colors.text }]}>Order #{order.order_id}</Text>
                  <Text style={[styles.orderDate, { color: colors.textSecondary }]}>
                    {new Date(order.date_added).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.badgeRow}>
                  {awoofOrder && (
                    <View style={[styles.sourceBadge, { backgroundColor: colors.primary + '18' }]}>
                      <Text style={[styles.sourceText, { color: colors.primary }]}>Awoof</Text>
                    </View>
                  )}
                  <View style={[styles.statusBadge, { backgroundColor: orderStatus.color + '20' }]}>
                    <Text style={[styles.statusText, { color: orderStatus.color }]}>
                      {orderStatus.label}
                    </Text>
                  </View>
                  <View style={[styles.paymentBadge, { backgroundColor: paidOrder ? colors.success + '18' : colors.warning + '18' }]}>
                    <Text style={[styles.paymentText, { color: paidOrder ? colors.success : colors.warning }]}>
                      {paidOrder ? 'Paid' : 'Pending'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.cardFooter}>
                <View>
                  <Text style={[styles.itemCount, { color: colors.textSecondary }]}>
                    {order.products ? order.products.length : 0} items
                  </Text>
                  <Text style={[styles.deliveryMethodText, { color: colors.textSecondary }]}>
                    {deliveryMethod}
                  </Text>
                </View>
                <View style={styles.totalContainer}>
                  <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total: </Text>
                  <Text style={[styles.totalAmount, { color: isDarkMode ? colors.white : colors.primary }]}>
                    ₦{formatPrice(order.total)}
                  </Text>
                </View>
              </View>

              {/* Show cancel button for pending/processing orders
              {order && order.status && ['pending', 'processing'].includes(order.status.toLowerCase()) && (
                <View style={styles.cancelButtonContainer}>
                  <TouchableOpacity
                    style={[styles.cancelButton, { backgroundColor: colors.danger }]}
                    onPress={() => {
                      console.log('Cancel button pressed for order:', order.order_id);
                      handleCancelOrder(order.order_id);
                    }}
                    disabled={cancellingOrderId === order.order_id}
                  >
                    {cancellingOrderId === order.order_id ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={colors.white} />
                      </View>
                    ) : (
                      <Text style={[styles.cancelButtonText, { color: colors.white }]}>
                        Cancel Order
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )} */}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 23,
    fontWeight: 'bold',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  orderCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 6,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sourceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sourceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCount: {
    fontSize: 14,
  },
  deliveryMethodText: {
    fontSize: 12,
    marginTop: 2,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  shopButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  skeletonCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cancelButtonContainer: {
    marginTop: 12,
    alignItems: 'flex-start', // Align the button to the start
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#ff4757', // Red background
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
