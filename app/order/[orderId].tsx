import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams(); // Get order ID from route params
  const colors = useThemeColors();
  const { apiService } = useAuth();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock order data (in real implementation, this would come from API)
  const mockOrder = {
    id: orderId || 'ORD001',
    order_id: orderId || 'ORD001',
    date: '2023-11-15T10:30:00Z',
    status: 'delivered',
    items: [
      {
        id: 1,
        title: 'Wireless Bluetooth Headphones',
        price: 59.99,
        quantity: 1,
        image: 'https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_.jpg',
      },
      {
        id: 2,
        title: 'Smart Watch Series 5',
        price: 199.99,
        quantity: 1,
        image: 'https://fakestoreapi.com/img/71YtQufLk7L._AC_UL640_QL65_2.jpg',
      }
    ],
    subtotal: 259.98,
    shipping: 9.99,
    tax: 21.50,
    total: 291.47,
    shipping_address: {
      name: 'John Doe',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
      country: 'USA',
    },
    payment_method: 'Visa ending in 1234',
  };

  useEffect(() => {
    // In a real implementation, fetch order details from API
    // const fetchOrderDetails = async () => {
    //   try {
    //     setLoading(true);
    //     const orderData = await apiService.getOrderInfo(Number(orderId));
    //     setOrder(orderData);
    //   } catch (err) {
    //     setError('Failed to load order details');
    //     console.error('Error fetching order:', err);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    
    // For now, use mock data
    setTimeout(() => {
      setOrder(mockOrder);
      setLoading(false);
    }, 500);
  }, [orderId, apiService]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return '#34C759';
      case 'shipped':
        return '#007AFF';
      case 'processing':
        return '#FF9500';
      case 'cancelled':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'checkmark-circle';
      case 'shipped':
        return 'boat';
      case 'processing':
        return 'time';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'cube';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Loading order details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Error: {error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => window.location.reload()}
        >
          <Text style={{ color: colors.white }}>Retry</Text>
        </TouchableOpacity>
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

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Order Details</Text>
        </View>
      </View>

      {/* Order Status */}
      <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
        <View style={styles.statusHeader}>
          <View style={styles.statusIconContainer}>
            <Ionicons name={getStatusIcon(order.status)} size={24} color={getStatusColor(order.status)} />
          </View>
          <View style={styles.statusTextContainer}>
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</Text>
            <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
              Order #{order.order_id} • {new Date(order.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Items</Text>
        <View style={styles.itemsContainer}>
          {order.items.map((item: any) => (
            <View key={item.id} style={[styles.item, { borderBottomColor: colors.border }]}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
                <Text style={[styles.itemPrice, { color: colors.text }]}>₦{item.price.toFixed(2)}</Text>
                <Text style={[styles.itemQuantity, { color: colors.textSecondary }]}>Qty: {item.quantity}</Text>
              </View>
              <Text style={[styles.itemSubtotal, { color: colors.text }]}>₦{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
        <View style={[styles.summary, { backgroundColor: colors.surface }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>₦{order.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Shipping</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>₦{order.shipping.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Tax</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>₦{order.tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>₦{order.total.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Shipping Details */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Shipping Information</Text>
        <View style={[styles.shippingInfo, { backgroundColor: colors.surface }]}>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.text }]}>
              {order.shipping_address.name},{"\n"}
              {order.shipping_address.address},{"\n"}
              {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code},{"\n"}
              {order.shipping_address.country}
            </Text>
          </View>
        </View>
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
        <View style={[styles.paymentInfo, { backgroundColor: colors.surface }]}>
          <View style={styles.detailRow}>
            <Ionicons name="card" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.text }]}>{order.payment_method}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.button, styles.outlineButton, { borderColor: colors.border }]}>
          <Text style={[styles.outlineButtonText, { color: colors.text }]}>Contact Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]}>
          <Text style={[styles.buttonText, { color: colors.white }]}>Track Order</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statusCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusTextContainer: {},
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusSubtitle: {
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  itemsContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#8E8E93',
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  summary: {
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  shippingInfo: {
    borderRadius: 12,
    padding: 16,
  },
  paymentInfo: {
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 34,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
});