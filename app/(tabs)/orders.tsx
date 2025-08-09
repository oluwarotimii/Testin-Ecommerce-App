import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Package, Clock, CircleCheck as CheckCircle, Circle as XCircle, Truck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function OrdersScreen() {
  const router = useRouter();
  const { apiService } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await apiService.getOrders();
        if (response.success) {
          setOrders(response.orders);
        } else {
          console.error('Failed to fetch orders:', response.error);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [apiService]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle size={20} color="#34C759" />;
      case 'shipped':
        return <Truck size={20} color="#007AFF" />;
      case 'processing':
        return <Clock size={20} color="#FF9500" />;
      case 'cancelled':
        return <XCircle size={20} color="#FF3B30" />;
      default:
        return <Package size={20} color="#8E8E93" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text>Loading orders...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Package size={80} color="#8E8E93" />
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptySubtitle}>Your order history will appear here</Text>
        <TouchableOpacity 
          style={styles.shopButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Order History</Text>
        <Text style={styles.subtitle}>{orders.length} orders</Text>
      </View>

      {/* Orders List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {orders.map((order) => (
          <TouchableOpacity 
            key={order.order_id} 
            style={styles.orderCard}
            onPress={() => router.push(`/order/${order.order_id}`)}
          >
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderId}>Order ID: {order.order_id}</Text>
                <Text style={styles.orderDate}>{new Date(order.date_added).toLocaleDateString()}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                {getStatusIcon(order.status)}
                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                  {getStatusText(order.status)}
                </Text>
              </View>
            </View>

            <View style={styles.orderDetails}>
              <View style={styles.orderMeta}>
                <Text style={styles.itemCount}>{order.products ? order.products.length : 0} item{order.products && order.products.length > 1 ? 's' : ''}</Text>
                <Text style={styles.orderTotal}>${parseFloat(order.total).toFixed(2)}</Text>
              </View>
              
              {/* Tracking number is not directly available in /orders API response, would need /order_info */}
              {/* {order.trackingNumber && (
                <View style={styles.trackingInfo}>
                  <Text style={styles.trackingLabel}>Tracking: </Text>
                  <Text style={styles.trackingNumber}>{order.trackingNumber}</Text>
                </View>
              )} */}
            </View>

            <View style={styles.orderActions}>
              {/* Action buttons would need more complex logic based on API capabilities */}
              <TouchableOpacity style={styles.viewButton} onPress={() => router.push(`/order/${order.order_id}`)}>
                <Text style={styles.viewButtonText}>View Details</Text>
              </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  orderCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  orderDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: 16,
  },
  orderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  trackingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackingLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  trackingNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#FFFFFF',
  },
  viewButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  viewButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});