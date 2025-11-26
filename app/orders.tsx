import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import SkeletonLoader from '@/components/SkeletonLoader';


export default function OrdersScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { apiService } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await apiService.getOrders();
        // WooCommerce API returns array directly, not wrapped in success object
        if (Array.isArray(response)) {
          // Transform WooCommerce orders to app format
          const transformedOrders = response.map((order: any) => ({
            order_id: order.id || order.order_id,
            date_added: order.date_created || order.date_added,
            status: order.status,
            total: order.total,
            products: order.line_items || order.products || []
          }));
          setOrders(transformedOrders);
        } else if (response.success && response.orders) {
          // Fallback for dummy API format
          setOrders(response.orders);
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
  }, [apiService]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return colors.success;
      case 'shipped': return colors.info;
      case 'processing': return colors.warning;
      case 'cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>My Orders</Text>
        </View>
        <View style={styles.content}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.skeletonCard, { backgroundColor: colors.surface }]}>
              <SkeletonLoader width={100} height={20} marginBottom={10} />
              <SkeletonLoader width={200} height={16} marginBottom={10} />
              <SkeletonLoader width={80} height={16} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
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
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Orders</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {orders.map((order) => (
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
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.cardFooter}>
              <Text style={[styles.itemCount, { color: colors.textSecondary }]}>
                {order.products ? order.products.length : 0} items
              </Text>
              <View style={styles.totalContainer}>
                <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total: </Text>
                <Text style={[styles.totalAmount, { color: colors.primary }]}>
                  ₦{parseFloat(order.total).toFixed(2)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  statusText: {
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
});