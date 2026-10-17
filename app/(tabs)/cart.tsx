import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import { ArrowLeftIcon, ShoppingCartIcon, MinusIcon, PlusIcon, TrashIcon } from 'phosphor-react-native';
import SkeletonCartItem from '@/components/SkeletonCartItem';
import SkeletonLoader from '@/components/SkeletonLoader';
import { useIsFocused } from '@react-navigation/native';
import SafeImage from '@/components/SafeImage';
import { formatPrice } from '@/utils/formatNumber';
import Button from '@/components/Button';
import { spacing, radius, typeScale, fontFamily, shadow } from '@/constants/designTokens';

export default function CartScreen() {
  const router = useRouter();
  const { action } = useLocalSearchParams<{ action?: string }>();
  const colors = useThemeColors();
  const isDarkMode = String(colors.background).toLowerCase() === '#000000';
  const { apiService } = useAuth();
  const { setCartCount } = useCart();
  const isFocused = useIsFocused();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const hasHandledActionRef = useRef(false);

  const fetchCartContents = async () => {
    try {
      setLoading(true);
      const cartResponse = await apiService.getCartContents();

      if (cartResponse && cartResponse.products && cartResponse.products.length > 0) {
        // Cart items now have all necessary data (productId, image, title, price, quantity)
        // No need to fetch product details separately
        setProducts(cartResponse.products);
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
    if (hasHandledActionRef.current) return;
    if (action !== 'empty_cart') return;
    hasHandledActionRef.current = true;

    void (async () => {
      try {
        await apiService.emptyCart();
        setProducts([]);
        setCartCount(0);
        Alert.alert('Cart cleared', 'Your cart has been emptied.');
      } catch (error) {
        console.error('Error emptying cart from notification action:', error);
        Alert.alert('Unable to clear cart', 'Please try again.');
      }
    })();
  }, [action, apiService, setCartCount]);

  useEffect(() => {
    // Update cart count whenever products change
    const totalQuantity = products.reduce((total, item) => total + (item.quantity || 1), 0);
    setCartCount(totalQuantity);
  }, [products, setCartCount]);

  // Calculate subtotal consistently with checkout page (no shipping or tax)
  const subtotal = useMemo(() => {
    return products.reduce((sum, item) => {
      const price = typeof item.price === 'number' ? item.price : parseFloat(item.price || '0');
      const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 1;
      return sum + (price * quantity);
    }, 0);
  }, [products]);

  const total = subtotal;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeftIcon weight="bold" size={24} color={colors.text} />
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
        <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
          <ShoppingCartIcon weight="regular" size={80} color={colors.textSecondary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Your cart is empty</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Add some products to get started</Text>
        <Button title="Start Shopping" onPress={() => router.push('/(tabs)')} fullWidth={false} style={styles.shopButton} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeftIcon weight="bold" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text, marginLeft: 10 }]}>Shopping Cart</Text>
        </View>
        <Text style={[styles.itemCount, { color: colors.textSecondary }]}>{products.length} items</Text>
      </View>

      {/* Cart Items */}
      <ScrollView style={[styles.content, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        {products.map((item) => (
          <View key={item.productId || item.id} style={[styles.cartItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <SafeImage source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
              <Text style={[styles.itemPrice, { color: isDarkMode ? colors.white : colors.primary }]}>{formatPrice(typeof item.price === 'number' ? item.price : parseFloat(item.price || '0'))}</Text>
            </View>
            <View style={styles.itemActions}>
              <View style={[styles.quantityContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={async () => {
                    if (item.quantity > 1) {
                      try {
                        const result = await apiService.updateCart(item.productId || item.id, item.quantity - 1);
                        if (result.success) {
                          // Update the item quantity directly to avoid full cart reload
                          setProducts(prevProducts =>
                            prevProducts.map(cartItem =>
                              cartItem.id === item.id || cartItem.productId === item.productId
                                ? { ...cartItem, quantity: cartItem.quantity - 1 }
                                : cartItem
                            )
                          );
                        }
                      } catch (error) {
                        console.error('Error updating cart:', error);
                      }
                    }
                  }}
                >
                  <MinusIcon weight="bold" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.quantity, { color: colors.text }]}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={async () => {
                    try {
                      const result = await apiService.updateCart(item.productId || item.id, item.quantity + 1);
                      if (result.success) {
                        // Update the item quantity directly to avoid full cart reload
                        setProducts(prevProducts =>
                          prevProducts.map(cartItem =>
                            cartItem.id === item.id || cartItem.productId === item.productId
                              ? { ...cartItem, quantity: cartItem.quantity + 1 }
                              : cartItem
                          )
                        );
                      }
                    } catch (error) {
                      console.error('Error updating cart:', error);
                    }
                  }}
                >
                  <PlusIcon weight="bold" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={async () => {
                  try {
                    const result = await apiService.removeFromCart(item.productId || item.id);
                    if (result.success) {
                      // Remove the item directly to avoid full cart reload
                      setProducts(prevProducts =>
                        prevProducts.filter(cartItem =>
                          cartItem.id !== item.id && cartItem.productId !== item.productId
                        )
                      );
                    }
                  } catch (error) {
                    console.error('Error removing item from cart:', error);
                  }
                }}
              >
                <TrashIcon weight="fill" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Order Summary */}
      <View style={[styles.summary, { backgroundColor: colors.surface }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
          <Text style={[styles.totalValue, { color: isDarkMode ? colors.white : colors.primary }]}>{formatPrice(total)}</Text>
        </View>

        <Button title="Proceed to Checkout" onPress={() => router.push('/checkout')} size="lg" style={shadow.raised} />
      </View>
    </SafeAreaView>
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
    paddingTop: 10,
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
    fontFamily: fontFamily.bold,
  },
  itemCount: {
    fontSize: 14,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: radius.lg,
    marginBottom: 12,
    paddingHorizontal: spacing.md,
    ...shadow.card,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
  },
  itemSpecs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specText: {
    fontSize: 14,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: typeScale.bodyLarge,
    fontFamily: fontFamily.bold,
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
    borderRadius: radius.pill,
    padding: 4,
    borderWidth: 1,
  },
  quantityButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  quantity: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  summary: {
    padding: 20,
    paddingBottom: 20,
    ...shadow.raised,
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
    fontFamily: fontFamily.bold,
  },
  totalValue: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: fontFamily.bold,
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  shopButton: {
    paddingHorizontal: 32,
  },
});
