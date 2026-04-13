import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useColorScheme';
import { awoofCart, AwoofProduct, AwoofEvents, trackAwoofEvent } from './AwoofUtils';
import SafeImage from '@/components/SafeImage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// ============================================
// DEMO DATA - Easy to replace with API calls
// ============================================
const DEMO_DEALS = [
  {
    id: '1',
    name: 'Wireless Earbuds Pro',
    originalPrice: 15000,
    salePrice: 8500,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
    discount: 43,
    tag: 'FLASH DEAL',
    stock: 12,
  },
  {
    id: '2',
    name: 'Smart Watch Series 6',
    originalPrice: 45000,
    salePrice: 28000,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    discount: 38,
    tag: 'HOT',
    stock: 5,
  },
  {
    id: '3',
    name: 'Bluetooth Speaker XL',
    originalPrice: 12000,
    salePrice: 6500,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
    discount: 46,
    tag: 'LIMITED',
    stock: 8,
  },
  {
    id: '4',
    name: 'USB-C Fast Charger',
    originalPrice: 5000,
    salePrice: 2200,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400',
    discount: 56,
    tag: 'CLEARANCE',
    stock: 20,
  },
  {
    id: '5',
    name: 'Phone Stand Aluminum',
    originalPrice: 8000,
    salePrice: 3500,
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400',
    discount: 56,
    tag: 'STEAL',
    stock: 15,
  },
  {
    id: '6',
    name: 'Laptop Sleeve 15"',
    originalPrice: 9500,
    salePrice: 4800,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400',
    discount: 49,
    tag: 'NEW',
    stock: 10,
  },
];

// ============================================
// MAIN COMPONENT
// ============================================
export default function AwoofFeedScreen({ navigation }: any) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [cartCount, setCartCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = awoofCart.subscribe(() => {
      setCartCount(awoofCart.getItemCount());
    });
    setCartCount(awoofCart.getItemCount());
    return unsubscribe;
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleProductPress = (product: any) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleCartPress = () => {
    navigation.navigate('AwoofMiniCart');
  };

  const handleQuickAdd = (product: any) => {
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
    awoofCart.addItem(awProduct, 1);
    trackAwoofEvent(AwoofEvents.ADD_TO_CART, { productId: product.id, quantity: 1 });
    Alert.alert('Added!', `${product.name} added to your Awoof Cart`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Awoof Corner</Text>
            <Text style={[styles.headerSubtitle, { color: colors.primary }]}>🔥 Today's Hottest Deals</Text>
          </View>

          <TouchableOpacity
            style={[styles.cartButton, { backgroundColor: colors.primary }]}
            onPress={handleCartPress}
          >
            <Ionicons name="cart-outline" size={24} color="#fff" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Deals Grid */}
      <FlatList
        data={DEMO_DEALS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        style={styles.list}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={<View style={styles.listHeader} />}
        renderItem={({ item }) => (
          <DealCard
            deal={item}
            colors={colors}
            onPress={() => handleProductPress(item)}
            onQuickAdd={() => handleQuickAdd(item)}
          />
        )}
      />
    </View>
  );
}

// ============================================
// DEAL CARD COMPONENT
// ============================================
function DealCard({ deal, colors, onPress, onQuickAdd }: any) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <SafeImage
          source={{ uri: deal.image }}
          style={styles.productImage}
        />

        {/* Discount Badge */}
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{deal.discount}%</Text>
        </View>
      </View>

      {/* Product Info */}
      <View style={styles.cardContent}>
        <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
          {deal.name}
        </Text>

        <View style={styles.priceRow}>
          <Text style={[styles.salePrice, { color: colors.error }]}>₦{deal.salePrice.toLocaleString()}</Text>
          <Text style={[styles.originalPrice, { color: colors.primary }]}>₦{deal.originalPrice.toLocaleString()}</Text>
        </View>

        <View style={styles.stockRow}>
          <View style={styles.stockIndicator}>
            <View style={[styles.stockDot, { backgroundColor: deal.stock < 10 ? colors.warning : colors.success }]} />
            <Text style={[styles.stockText, { color: colors.textSecondary }]}>
              {deal.stock < 10 ? `Only ${deal.stock} left!` : 'In Stock'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.quickAddButton, { backgroundColor: colors.primary }]}
          onPress={(e) => {
            e.stopPropagation();
            onQuickAdd();
          }}
        >
          <Ionicons name="cart-outline" size={14} color="#fff" />
          <Text style={styles.quickAddText}> Quick Add</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '600',
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  listHeader: {
    height: 8,
  },
  grid: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.9,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  cardContent: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    height: 40,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  salePrice: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  stockRow: {
    marginBottom: 10,
  },
  stockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '500',
  },
  quickAddButton: {
    borderRadius: 8,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAddText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
