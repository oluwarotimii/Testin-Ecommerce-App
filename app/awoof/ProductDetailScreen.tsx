import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useColorScheme';
import { awoofCart, AwoofProduct, AwoofEvents, trackAwoofEvent } from './AwoofUtils';
import SafeImage from '@/components/SafeImage';
import AwoofToast, { AwoofToastRef } from '@/components/AwoofToast';

const { width } = Dimensions.get('window');

// ============================================
// MAIN COMPONENT
// ============================================
export default function ProductDetailScreen({ route, navigation }: any) {
  const { product } = route.params;
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const isDarkMode = String(colors.background).toLowerCase() === '#000000';
  const [quantity, setQuantity] = useState(1);
  const scrollY = useRef(new Animated.Value(0)).current;
  const toastRef = useRef<AwoofToastRef>(null);

  const images = [product.image, product.image, product.image];

  const handleBuyNow = () => {
    const awProduct: AwoofProduct = {
      id: product.id,
      name: product.name,
      originalPrice: product.originalPrice,
      salePrice: product.salePrice,
      image: product.image,
      discount: product.discount,
      tag: product.tag,
      stock: product.stock,
    };
    awoofCart.addItem(awProduct, quantity);
    trackAwoofEvent(AwoofEvents.ADD_TO_CART, { productId: product.id, quantity });
    navigation.navigate('AwoofMiniCart');
  };

  const handleAddToCart = () => {
    const awProduct: AwoofProduct = {
      id: product.id,
      name: product.name,
      originalPrice: product.originalPrice,
      salePrice: product.salePrice,
      image: product.image,
      discount: product.discount,
      tag: product.tag,
      stock: product.stock,
    };
    awoofCart.addItem(awProduct, quantity);
    trackAwoofEvent(AwoofEvents.ADD_TO_CART, { productId: product.id, quantity });
    toastRef.current?.show(`${product.name} added to cart!`);
  };

  const savings = (product.originalPrice - product.salePrice) * quantity;
  const totalPrice = product.salePrice * quantity;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AwoofToast ref={toastRef} />
      
      {/* Animated Header Background */}
      <Animated.View style={[styles.header, { opacity: headerOpacity, backgroundColor: colors.card }]}>
        <View style={[styles.headerFill, { paddingTop: insets.top }]} />
      </Animated.View>

      {/* Back Button */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 16, backgroundColor: colors.surface }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={20} color={colors.text} />
      </TouchableOpacity>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ 
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom + 180 
        }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <SafeImage source={{ uri: images[0] }} style={styles.mainImage} />

          {/* Discount Badge */}
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discount}%</Text>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.contentSection}>
          {/* Title & Stock */}
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
              <View style={[styles.stockBadge, { backgroundColor: colors.surface }]}>
                <View style={[styles.stockDot, { backgroundColor: product.stock < 10 ? colors.warning : colors.success }]} />
                <Text style={[styles.stockText, { color: colors.textSecondary }]}>
                  {product.stock < 10 ? `Only ${product.stock} left!` : 'In Stock'}
                </Text>
              </View>
            </View>
          </View>

          {/* Price Section */}
          <View style={[styles.priceSection, { backgroundColor: colors.surface }]}>
            <View style={styles.priceRow}>
              <Text style={[styles.salePrice, { color: isDarkMode ? colors.white : colors.error }]}>₦{product.salePrice.toLocaleString()}</Text>
              <Text style={[styles.originalPrice, { color: isDarkMode ? colors.white : colors.primary }]}>₦{product.originalPrice.toLocaleString()}</Text>
            </View>
            <View style={[styles.savingsCard, { backgroundColor: colors.success + '15' }]}>
              <Text style={[styles.savingsText, { color: colors.success }]}>
                💰 You save ₦{(product.originalPrice - product.salePrice).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quantity</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={[styles.quantityButton, { backgroundColor: colors.primary }, quantity <= 1 && { opacity: 0.4 }]}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Ionicons name="remove" size={20} color="#fff" />
              </TouchableOpacity>

              <View style={[styles.quantityDisplay, { backgroundColor: colors.surface }]}>
                <Text style={[styles.quantityText, { color: colors.text }]}>{quantity}</Text>
              </View>

              <TouchableOpacity
                style={[styles.quantityButton, { backgroundColor: colors.primary }, quantity >= product.stock && { opacity: 0.4 }]}
                onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Total Calculation */}
          <View style={[styles.totalSection, { backgroundColor: colors.warning + '10', borderColor: colors.warning }]}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Subtotal ({quantity} item{quantity > 1 ? 's' : ''})</Text>
              <Text style={[styles.totalAmount, { color: isDarkMode ? colors.white : colors.primary }]}>₦{totalPrice.toLocaleString()}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.savingsLabel, { color: colors.warning }]}>Total Savings</Text>
              <Text style={[styles.savingsAmount, { color: colors.warning }]}>− ₦{savings.toLocaleString()}</Text>
            </View>
          </View>

          {/* Why Buy Section */}
          <View style={styles.whyBuySection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Why This Deal?</Text>
            <View style={styles.benefitRow}>
              <Ionicons name="flash" size={22} color={colors.primary} />
              <View style={styles.benefitContent}>
                <Text style={[styles.benefitTitle, { color: colors.text }]}>Flash Sale Price</Text>
                <Text style={[styles.benefitDesc, { color: colors.textSecondary }]}>Exclusive Awoof Corner discount</Text>
              </View>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="cube" size={22} color={colors.primary} />
              <View style={styles.benefitContent}>
                <Text style={[styles.benefitTitle, { color: colors.text }]}>Quick Delivery</Text>
                <Text style={[styles.benefitDesc, { color: colors.textSecondary }]}>Ships within 24 hours</Text>
              </View>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
              <View style={styles.benefitContent}>
                <Text style={[styles.benefitTitle, { color: colors.text }]}>Secure Payment</Text>
                <Text style={[styles.benefitDesc, { color: colors.textSecondary }]}>Paystack secure checkout</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </View>
      </Animated.ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.bottomBarContent}>
          <TouchableOpacity
            style={[styles.addToCartButton, { borderColor: colors.primary }]}
            onPress={handleAddToCart}
          >
            <Ionicons name="cart-outline" size={18} color={colors.primary} />
            <Text style={[styles.addToCartText, { color: colors.primary }]}>Add</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buyNowButton, { backgroundColor: colors.primary }]}
            onPress={handleBuyNow}
          >
            <Text style={styles.buyNowText}>Buy Now</Text>
            <Text style={styles.buyNowPrice}>₦{totalPrice.toLocaleString()}</Text>
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
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerFill: {
    height: 60,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  imageGallery: {
    marginTop: 50,
    width,
    height: width * 0.9,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 48,
    right: 16,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  discountText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  contentSection: {
    padding: 20,
  },
  titleRow: {
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 30,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '500',
  },
  priceSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  salePrice: {
    fontSize: 28,
    fontWeight: '700',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  savingsCard: {
    borderRadius: 8,
    padding: 10,
  },
  savingsText: {
    fontSize: 13,
    fontWeight: '600',
  },
  quantitySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityDisplay: {
    flex: 1,
    marginHorizontal: 20,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  savingsLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  savingsAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  whyBuySection: {
    marginBottom: 24,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitContent: {
    flex: 1,
    marginLeft: 12,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: 13,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 92,
    borderTopWidth: 1,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  bottomBarContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  addToCartButton: {
    width: 66,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  addToCartText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  buyNowButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  buyNowPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
});
