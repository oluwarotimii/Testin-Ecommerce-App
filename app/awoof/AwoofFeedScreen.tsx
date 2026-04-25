import React, { useState, useEffect, useRef } from 'react';
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
import { awoofCart, AwoofProduct, AwoofEvents, trackAwoofEvent, mapToAwoofProduct } from './AwoofUtils';
import SafeImage from '@/components/SafeImage';
import { useAuth } from '@/context/AuthContext';
import { transformProducts } from '@/utils/woocommerceTransformers';
import AwoofToast, { AwoofToastRef } from '@/components/AwoofToast';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// ============================================
// MAIN COMPONENT
// ============================================
export default function AwoofFeedScreen({ navigation }: any) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { apiService } = useAuth();
  const toastRef = useRef<AwoofToastRef>(null);
  
  const [deals, setDeals] = useState<AwoofProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDeals();
    
    const unsubscribe = awoofCart.subscribe(() => {
      setCartCount(awoofCart.getItemCount());
    });
    setCartCount(awoofCart.getItemCount());
    return unsubscribe;
  }, []);

  const loadDeals = async () => {
    try {
      setLoading(true);
      if (!apiService.getProductsByCategory) {
        throw new Error('Product category lookup is unavailable.');
      }
      // Fetch from "awoof-corner" category
      const rawProducts = await apiService.getProductsByCategory('awoof-corner', 50);
      
      // Transform raw WooCommerce products to AppProduct format first
      const appProducts = transformProducts(rawProducts);
      
      // Map AppProduct to AwoofProduct format
      const awoofDeals = appProducts.map(mapToAwoofProduct);
      
      setDeals(awoofDeals);
    } catch (error) {
      console.error('Error loading Awoof deals:', error);
      // Fallback or empty state handled by deals array
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDeals();
  };

  const handleProductPress = (product: any) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleCartPress = () => {
    navigation.navigate('AwoofMiniCart');
  };

  const handleQuickAdd = (product: AwoofProduct) => {
    awoofCart.addItem(product, 1);
    trackAwoofEvent(AwoofEvents.ADD_TO_CART, { productId: product.id, quantity: 1 });
    toastRef.current?.show(`${product.name} added to cart!`);
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Hunting for deals...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AwoofToast ref={toastRef} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
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
        data={deals}
        keyExtractor={(item) => item.id}
        numColumns={2}
        style={styles.list}
        contentContainerStyle={[styles.grid, { padding: 16, gap: 16, paddingBottom: insets.bottom + 140 }]}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hot deals found right now.</Text>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={loadDeals}>
              <Text style={styles.retryText}>Check Again</Text>
            </TouchableOpacity>
          </View>
        }
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
      style={[styles.card, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Image Container */}
      <View style={[styles.imageContainer, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
        <SafeImage
          source={{ uri: deal.image }}
          style={styles.productImage}
        />

        {/* Discount Badge */}
        {deal.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{deal.discount}%</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.cardContent}>
        <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
          {deal.name}
        </Text>

        <View style={styles.priceRow}>
          <Text style={[styles.salePrice, { color: colors.error }]}>₦{deal.salePrice.toLocaleString()}</Text>
          {deal.originalPrice > deal.salePrice && (
            <Text style={[styles.originalPrice, { color: colors.primary }]}>₦{deal.originalPrice.toLocaleString()}</Text>
          )}
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
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
  headerTitleContainer: {
    flex: 1, // Allow title container to take available space
    alignItems: 'center', // Center horizontally
    position: 'absolute', // Use absolute positioning to overlay and center
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center', // Center vertically within its absolute bounds
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
    zIndex: 1, // Ensure cart button is above centered title if overlap occurs
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
    gap: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.9,
    position: 'relative',
    borderBottomWidth: 1,
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
    padding: 14,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 19,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  salePrice: {
    fontSize: 17,
    fontWeight: '800',
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
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAddText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});
