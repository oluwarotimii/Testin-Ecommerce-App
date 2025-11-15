import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function CartScreen() {
  const router = useRouter();
  const { apiService } = useAuth();
  const [cart, setCart] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCartContents = async () => {
    try {
      setLoading(true);
      const cartResponse = await apiService.get('carts/5'); // Fetch a single cart
      setCart(cartResponse);

      if (cartResponse && cartResponse.products) {
        const productPromises = cartResponse.products.map(item =>
          apiService.getProduct(item.productId)
        );
        const productsResponse = await Promise.all(productPromises);
        
        const mergedProducts = cartResponse.products.map((cartItem, index) => ({
          ...productsResponse[index],
          quantity: cartItem.quantity,
        }));

        setProducts(mergedProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch cart contents:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartContents();
  }, []);

  const subtotal = products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text>Loading cart...</Text>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ShoppingBag size={80} color="#8E8E93" />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add some products to get started</Text>
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
        <Text style={styles.title}>Shopping Cart</Text>
        <Text style={styles.itemCount}>{products.length} items</Text>
      </View>

      {/* Cart Items */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {products.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.title}</Text>
              <Text style={styles.itemPrice}>{`$${item.price}`}</Text>
            </View>
            <View style={styles.itemActions}>
              <View style={styles.quantityContainer}>
                <Text style={styles.quantity}>{item.quantity}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Order Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>
            {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.checkoutButton}
          onPress={() => router.push('/checkout')}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
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
  itemCount: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  itemSpecs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specText: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  removeButton: {
    padding: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  summary: {
    backgroundColor: '#F2F2F7',
    padding: 20,
    paddingBottom: 40,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#1D1D1F',
  },
  summaryValue: {
    fontSize: 16,
    color: '#1D1D1F',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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