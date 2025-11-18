import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import SkeletonCartItem from '@/components/SkeletonCartItem';
import SkeletonLoader from '@/components/SkeletonLoader';
import { useIsFocused } from '@react-navigation/native';

export default function CartScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { apiService } = useAuth();
  const { setCartCount } = useCart();
  const isFocused = useIsFocused();
  const [cart, setCart] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCartContents = async () => {
    try {
      setLoading(true);
      const cartResponse = await apiService.getCartContents();
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

  useEffect(() => {
    if (isFocused) {
      fetchCartContents();
    }
  }, [isFocused]);

  useEffect(() => {
    // Update cart count whenever products change
    const totalQuantity = products.reduce((total, item) => total + (item.quantity || 1), 0);
    setCartCount(totalQuantity);
  }, [products, setCartCount]);

  const subtotal = cart ? cart.cartTotal || 0 : products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text, marginLeft: 10 }]}>Shopping Cart</Text>
          </View>
          <SkeletonLoader width={60} height={16} />
        </View>

        {/* Cart Items */}
        <ScrollView style={[styles.content, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
          <SkeletonCartItem />
          <SkeletonCartItem />
          <SkeletonCartItem />
        </ScrollView>

        {/* Order Summary */}
        <View style={[styles.summary, { backgroundColor: colors.surface }]}>
          <SkeletonLoader width="100%" height={20} marginBottom={12} />
          <SkeletonLoader width="100%" height={20} marginBottom={12} />
          <SkeletonLoader width="100%" height={20} marginBottom={12} />
          <SkeletonLoader width="100%" height={20} marginBottom={20} />
          <SkeletonLoader width="100%" height={50} borderRadius={12} />
        </View>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="cart-outline" size={80} color={colors.textSecondary} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Your cart is empty</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Add some products to get started</Text>
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text, marginLeft: 10 }]}>Shopping Cart</Text>
        </View>
        <Text style={[styles.itemCount, { color: colors.textSecondary }]}>{products.length} items</Text>
      </View>

      {/* Cart Items */}
      <ScrollView style={[styles.content, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        {products.map((item) => (
          <View key={item.id} style={[styles.cartItem, { borderBottomColor: colors.border }]}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
              <Text style={[styles.itemPrice, { color: colors.primary }]}>{`₦${item.price.toFixed(2)}`}</Text>
            </View>
            <View style={styles.itemActions}>
              <View style={[styles.quantityContainer, { backgroundColor: colors.surface }]}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={async () => {
                    if (item.quantity > 1) {
                      try {
                        await apiService.updateCart(item.id, item.quantity - 1);
                        fetchCartContents(); // Refresh cart after update
                      } catch (error) {
                        console.error('Error updating cart:', error);
                      }
                    }
                  }}
                >
                  <Ionicons name="remove" size={16} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.quantity, { color: colors.text }]}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={async () => {
                    try {
                      await apiService.updateCart(item.id, item.quantity + 1);
                      fetchCartContents(); // Refresh cart after update
                    } catch (error) {
                      console.error('Error updating cart:', error);
                    }
                  }}
                >
                  <Ionicons name="add" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={async () => {
                  try {
                    await apiService.removeFromCart(item.id);
                    fetchCartContents(); // Refresh cart after removal
                  } catch (error) {
                    console.error('Error removing item from cart:', error);
                  }
                }}
              >
                <Ionicons name="trash" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Order Summary */}
      <View style={[styles.summary, { backgroundColor: colors.surface }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>₦{total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/checkout')}
        >
          <Text style={[styles.checkoutButtonText, { color: colors.white }]}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    marginBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
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