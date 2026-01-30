import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '@/components/BackButton';
import { getOrderStatus } from '@/constants/orderStatus';
import SafeImage from '@/components/SafeImage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const colors = useThemeColors();
  const { apiService } = useAuth();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError('No order ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const orderData = await apiService.getOrderInfo(Number(orderId));

        if (orderData && !orderData.error) {
          // Transform WooCommerce order to app format
          const transformedOrder = {
            id: orderData.id,
            order_id: orderData.id,
            date: orderData.date_created || orderData.date_added,
            status: orderData.status,
            items: orderData.line_items ? orderData.line_items.map((item: any) => ({
              id: item.product_id || item.id,
              title: item.name || item.title,
              price: parseFloat(item.price || item.total) / (item.quantity || 1),
              quantity: item.quantity || 1,
              image: item.image?.src || item.image || 'https://via.placeholder.com/150'
            })) : [],
            subtotal: parseFloat(orderData.total || '0') - parseFloat(orderData.shipping_total || '0') - parseFloat(orderData.total_tax || '0'),
            shipping: parseFloat(orderData.shipping_total || '0'),
            tax: parseFloat(orderData.total_tax || '0'),
            total: parseFloat(orderData.total || '0'),
            shipping_address: {
              name: `${orderData.shipping?.first_name || ''} ${orderData.shipping?.last_name || ''}`.trim() || 'N/A',
              address: orderData.shipping?.address_1 || 'N/A',
              city: orderData.shipping?.city || 'N/A',
              state: orderData.shipping?.state || 'N/A',
              zip_code: orderData.shipping?.postcode || 'N/A',
              country: orderData.shipping?.country || 'N/A'
            },
            payment_method: orderData.payment_method_title || 'N/A'
          };

          setOrder(transformedOrder);
        } else {
          setError('Order not found');
        }
      } catch (err: any) {
        console.error('Error fetching order details:', err);
        setError(err.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, apiService]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSecondary, marginTop: 16 }}>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Order not found</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={{ color: colors.white }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const orderStatus = getOrderStatus(order.status);

  const handleCancelOrder = async () => {
    console.log('handleCancelOrder called');
    console.log('Current order object:', order);
    console.log('Current order status:', order?.status);
    console.log('Order ID to cancel:', order?.order_id);

    // Show the confirmation modal instead of Alert
    setShowCancelModal(true);
    console.log('Showed cancel confirmation modal');
  };

  const confirmCancelOrder = async () => {
    console.log('Confirming cancellation for order:', order.order_id);
    setShowCancelModal(false); // Close the modal

    try {
      console.log('Setting cancelling state to true...');
      setCancelling(true);
      console.log('Cancelling state set to true');

      console.log('Calling apiService.cancelOrder with order_id:', order.order_id);
      await apiService.cancelOrder(order.order_id);
      console.log('API call to cancel order completed successfully');

      // Refresh the order data
      console.log('Refreshing order data...');
      const updatedOrderData = await apiService.getOrderInfo(Number(orderId));
      console.log('Received updated order data:', updatedOrderData);

      if (updatedOrderData && !updatedOrderData.error) {
        console.log('Transforming updated order data...');
        const transformedOrder = {
          id: updatedOrderData.id,
          order_id: updatedOrderData.id,
          date: updatedOrderData.date_created || updatedOrderData.date_added,
          status: updatedOrderData.status,
          items: updatedOrderData.line_items ? updatedOrderData.line_items.map((item: any) => ({
            id: item.product_id || item.id,
            title: item.name || item.title,
            price: parseFloat(item.price || item.total) / (item.quantity || 1),
            quantity: item.quantity || 1,
            image: item.image?.src || item.image || 'https://via.placeholder.com/150'
          })) : [],
          subtotal: parseFloat(updatedOrderData.total || '0') - parseFloat(updatedOrderData.shipping_total || '0') - parseFloat(updatedOrderData.total_tax || '0'),
          shipping: parseFloat(updatedOrderData.shipping_total || '0'),
          tax: parseFloat(updatedOrderData.total_tax || '0'),
          total: parseFloat(updatedOrderData.total || '0'),
          shipping_address: {
            name: `${updatedOrderData.shipping?.first_name || ''} ${updatedOrderData.shipping?.last_name || ''}`.trim() || 'N/A',
            address: updatedOrderData.shipping?.address_1 || 'N/A',
            city: updatedOrderData.shipping?.city || 'N/A',
            state: updatedOrderData.shipping?.state || 'N/A',
            zip_code: updatedOrderData.shipping?.postcode || 'N/A',
            country: updatedOrderData.shipping?.country || 'N/A'
          },
          payment_method: updatedOrderData.payment_method_title || 'N/A'
        };

        console.log('Setting new order state...');
        setOrder(transformedOrder);
        console.log('Order state updated, showing success alert');
        Alert.alert('Success', 'Order has been cancelled successfully.');
      } else {
        console.log('Updated order data is invalid or contains error:', updatedOrderData);
      }
    } catch (err: any) {
      console.error('Error cancelling order:', err);
      console.error('Error details:', err.message, err.stack);
      Alert.alert('Error', 'Failed to cancel order. Please try again.');
    } finally {
      console.log('In finally block, setting cancelling state to false...');
      setCancelling(false);
      console.log('Cancelling state set to false');
    }
  };

  const cancelCancelOrder = () => {
    console.log('User cancelled the cancellation');
    setShowCancelModal(false);
  };

  // Determine if order can be cancelled (only pending or processing orders)
  const canCancelOrder = order && order.status && ['pending', 'processing'].includes(order.status.toLowerCase());

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <BackButton style={{ marginRight: 12 }} />
        <Text style={[styles.title, { color: colors.text }]}>Order Details</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIconContainer, { backgroundColor: orderStatus.color + '20' }]}>
              <Ionicons name="cube" size={24} color={orderStatus.color} />
            </View>
            <View>
              <Text style={[styles.statusText, { color: orderStatus.color }]}>
                {orderStatus.label}
              </Text>
              <Text style={[styles.statusDate, { color: colors.textSecondary }]}>
                {new Date(order.date).toLocaleDateString()} • {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Items</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {order.items.map((item: any, index: number) => (
              <View key={item.id}>
                <View style={styles.itemRow}>
                  <SafeImage source={{ uri: item.image }} style={[styles.itemImage, { backgroundColor: colors.border }]} />
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
                    <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
                      Qty: {item.quantity}
                    </Text>
                  </View>
                  <Text style={[styles.itemPrice, { color: '#FFA500' }]}>
                    ₦{formatPrice(item.price * item.quantity)}
                  </Text>
                </View>
                {index < order.items.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Summary</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>₦{formatPrice(order.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Shipping</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>₦{formatPrice(order.shipping)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Tax</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>₦{formatPrice(order.tax)}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
              <Text style={[styles.totalValue, { color: '#FFA500' }]}>₦{formatPrice(order.total)}</Text>
            </View>
          </View>
        </View>

        {/* Shipping Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Shipping Details</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={colors.textSecondary} style={styles.infoIcon} />
              <View>
                <Text style={[styles.infoTitle, { color: colors.text }]}>{order.shipping_address.name}</Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {order.shipping_address.address}
                </Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}
                </Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {order.shipping_address.country}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionButtons}>
          {canCancelOrder && (
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.danger }]}
              onPress={() => {
                console.log('Cancel button pressed');
                handleCancelOrder();
              }}
              disabled={cancelling}
            >
              {cancelling ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.white} />
                </View>
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={20} color={colors.white} style={{ marginRight: 8 }} />
                  <Text style={[styles.cancelButtonText, { color: colors.white }]}>Cancel Order</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.outlineButton,
              { borderColor: colors.border },
              canCancelOrder ? null : { flex: 1 } // Make this button take full width if no cancel button
            ]}
            onPress={() => Linking.openURL('https://wa.me/2348051516565')}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" style={{ marginRight: 8 }} />
            <Text style={[styles.outlineButtonText, { color: colors.text }]}>Contact Support</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]}>
            <Text style={[styles.primaryButtonText, { color: colors.white }]}>Track Order</Text>
          </TouchableOpacity> */}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: '#FF0000' }]}>Cancel Order</Text>
            <Text style={[styles.modalMessage, { color: '#0000FF' }]}>
              Are you sure you want to cancel this order? This action cannot be undone.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { borderColor: colors.border }]}
                onPress={cancelCancelOrder}
              >
                <Text style={[styles.modalCancelButtonText, { color: '#FF0000' }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmButton, { backgroundColor: colors.danger }]}
                onPress={confirmCancelOrder}
              >
                <Text style={[styles.modalConfirmButtonText, { color: '#000000' }]}>Yes, Cancel Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
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
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusDate: {
    fontSize: 14,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginLeft: 4,
    marginRight: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 12,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 8,
  },
  outlineButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff4757', // Red background
    marginTop: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
     color: '#ff4757',
  },
  modalConfirmButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
     color: '#ff4757',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4757',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
});