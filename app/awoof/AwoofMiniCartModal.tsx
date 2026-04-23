import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useColorScheme';
import { awoofCart, CartItem } from './AwoofUtils';
import SafeImage from '@/components/SafeImage';

const { height } = Dimensions.get('window');

// ============================================
// MAIN COMPONENT
// ============================================
export default function AwoofMiniCartModal({ navigation, route }: any) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [cartItems, setCartItems] = useState<CartItem[]>(awoofCart.getCart());
  const slideAnim = useState(new Animated.Value(height))[0];

  useEffect(() => {
    const unsubscribe = awoofCart.subscribe((updatedCart) => {
      setCartItems(updatedCart);
    });

    const addedProduct = route?.params?.addedProduct;
    if (addedProduct) {
      awoofCart.addItem(addedProduct, addedProduct.quantity || 1);
    }

    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();

    return unsubscribe;
  }, []);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      navigation.goBack();
    });
  };

  const handleCheckout = () => {
    // Close modal first, then navigate
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      navigation.goBack(); // Dismiss the modal
      // Small delay to ensure modal is dismissed before navigating to next screen
      setTimeout(() => {
        navigation.navigate('AwoofCheckoutWebView', { cartItems });
      }, 100);
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    const item = cartItems.find(i => i.id === itemId);
    if (item) {
      const newQty = Math.max(1, item.quantity + delta);
      awoofCart.updateQuantity(itemId, newQty);
    }
  };

  const removeItem = (itemId: string) => {
    awoofCart.removeItem(itemId);
  };

  const subtotal = cartItems.reduce((sum: number, item: CartItem) => sum + (item.salePrice * item.quantity), 0);
  const originalTotal = cartItems.reduce((sum: number, item: CartItem) => sum + (item.originalPrice * item.quantity), 0);
  const totalSavings = originalTotal - subtotal;
  const deliveryFee = 1500;
  const grandTotal = subtotal + deliveryFee;

  if (cartItems.length === 0) {
    return (
      <Modal visible={true} transparent={true} animationType="none" onRequestClose={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
          <Animated.View style={[styles.modalContent, { backgroundColor: colors.card, paddingBottom: insets.bottom + 16, transform: [{ translateY: slideAnim }] }]}>
            <View style={[styles.emptyContainer, { paddingBottom: 60 }]}>
              <Ionicons name="cart-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Your cart is empty</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Browse deals and add items to get started</Text>
              <TouchableOpacity style={[styles.emptyButton, { backgroundColor: colors.primary }]} onPress={handleClose}>
                <Text style={styles.emptyButtonText}>Browse Deals</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={true} transparent={true} animationType="none" onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

        <Animated.View style={[styles.modalContent, { backgroundColor: colors.card, paddingBottom: insets.bottom + 16, transform: [{ translateY: slideAnim }] }]}>
          {/* Handle Bar */}
          <View style={[styles.handleBar, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Your Awoof Cart</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{cartItems.length} item{cartItems.length > 1 ? 's' : ''}</Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={28} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Cart Items */}
          <ScrollView style={styles.itemsContainer} showsVerticalScrollIndicator={false}>
            {cartItems.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                colors={colors}
                onUpdateQuantity={(delta: number) => updateQuantity(item.id, delta)}
                onRemove={() => removeItem(item.id)}
              />
            ))}

            {/* Summary Section */}
            <View style={[styles.summarySection, { backgroundColor: colors.surface }]}>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>Order Summary</Text>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>₦{subtotal.toLocaleString()}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Delivery Fee</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>₦{deliveryFee.toLocaleString()}</Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.summaryRow}>
                <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>₦{grandTotal.toLocaleString()}</Text>
              </View>

              <View style={[styles.savingsCard, { backgroundColor: colors.success + '15' }]}>
                <Text style={[styles.savingsText, { color: colors.success }]}>
                  🎉 You're saving ₦{totalSavings.toLocaleString()} on this order!
                </Text>
              </View>
            </View>

            {/* Trust Badges */}
            <View style={styles.trustSection}>
              <View style={styles.trustBadge}>
                <Ionicons name="lock-closed" size={18} color={colors.textSecondary} />
                <Text style={[styles.trustText, { color: colors.textSecondary }]}>Secure Checkout</Text>
              </View>
              <View style={styles.trustBadge}>
                <Ionicons name="cube" size={18} color={colors.textSecondary} />
                <Text style={[styles.trustText, { color: colors.textSecondary }]}>Fast Delivery</Text>
              </View>
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>

          {/* Bottom CTA */}
          <View style={[styles.bottomSection, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
            <View style={styles.bottomContent}>
              <View style={styles.priceInfo}>
                <Text style={[styles.bottomLabel, { color: colors.textSecondary }]}>Total Amount</Text>
                <Text style={[styles.bottomPrice, { color: colors.primary }]}>₦{grandTotal.toLocaleString()}</Text>
              </View>

              <TouchableOpacity
                style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
                onPress={handleCheckout}
              >
                <Text style={styles.checkoutText}>Proceed to Secure Payment</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ============================================
// CART ITEM COMPONENT
// ============================================
function CartItemRow({ item, colors, onUpdateQuantity, onRemove }: any) {
  return (
    <View style={[styles.cartItem, { borderBottomColor: colors.border }]}>
      <SafeImage source={{ uri: item.image }} style={styles.itemImage} />

      <View style={styles.itemDetails}>
        <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.priceRow}>
          <Text style={[styles.itemPrice, { color: colors.error }]}>₦{item.salePrice.toLocaleString()}</Text>
          <Text style={[styles.itemOriginalPrice, { color: colors.primary }]}>₦{item.originalPrice.toLocaleString()}</Text>
        </View>

        <View style={styles.itemActions}>
          <View style={[styles.quantityControl, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={[styles.quantityBtn, { backgroundColor: colors.primary }]}
              onPress={() => onUpdateQuantity(-1)}
            >
              <Ionicons name="remove" size={16} color="#fff" />
            </TouchableOpacity>

            <Text style={[styles.quantityValue, { color: colors.text }]}>{item.quantity}</Text>

            <TouchableOpacity
              style={[styles.quantityBtn, { backgroundColor: colors.primary }]}
              onPress={() => onUpdateQuantity(1)}
            >
              <Ionicons name="add" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.85,
    paddingTop: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  itemsContainer: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  itemOriginalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 4,
  },
  quantityBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 16,
  },
  removeButton: {
    padding: 8,
  },
  summarySection: {
    padding: 16,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  savingsCard: {
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  savingsText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  trustBadge: {
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '500',
  },
  bottomSection: {
    borderTopWidth: 1,
    paddingBottom: 16,
  },
  bottomContent: {
    padding: 16,
  },
  priceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bottomLabel: {
    fontSize: 14,
  },
  bottomPrice: {
    fontSize: 22,
    fontWeight: '700',
  },
  checkoutButton: {
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
