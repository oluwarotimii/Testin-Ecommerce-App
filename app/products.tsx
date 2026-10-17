import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useNetwork } from '@/context/NetworkContext';
import { Ionicons } from '@expo/vector-icons';
import SkeletonProductItem from '@/components/SkeletonProductItem';
import { useThemeColors } from '@/hooks/useColorScheme';
import SafeImage from '@/components/SafeImage';
import FilterModal, { FilterOptions } from '@/components/FilterModal';
import { transformProducts } from '@/utils/woocommerceTransformers';
import { formatPrice } from '@/utils/formatNumber';
import ProductCard from '@/components/ProductCard';
import NetworkError from '@/components/NetworkError';
import SalePill from '@/components/SalePill';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, radius, typeScale, fontFamily, shadow } from '@/constants/designTokens';
import { useResponsiveColumns } from '@/hooks/useResponsiveColumns';

// Memoized list-view row - only receives primitives derived for this item so
// memo() can bail out when a sibling's wishlist/cart state changes.
const ListProductItem = memo(({
  product,
  colors,
  isDarkMode,
  isLiked,
  showCartSuccess,
  onPress,
  onToggleWishlist,
  onAddToCart,
}: {
  product: any;
  colors: any;
  isDarkMode: boolean;
  isLiked: boolean;
  showCartSuccess: boolean;
  onPress: (id: number) => void;
  onToggleWishlist: (id: number) => void;
  onAddToCart: (product: any) => void;
}) => {
  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price || '0');
  const originalPrice = typeof product.original_price === 'number'
    ? product.original_price
    : parseFloat(product.original_price ?? product.price ?? '0');
  const isOnSale = originalPrice > price;
  const percentOff = isOnSale ? ((originalPrice - price) / originalPrice) * 100 : 0;

  return (
    <TouchableOpacity
      style={[styles.listItem, { backgroundColor: colors.surface }]}
      onPress={() => onPress(product.id)}
    >
      <View style={styles.listImageContainer}>
        <SafeImage source={{ uri: product.image }} style={[styles.listImage, { backgroundColor: colors.background }]} />
        {isOnSale && (
          <View style={styles.listSaleOverlay}>
            <SalePill percentOff={percentOff} />
          </View>
        )}
      </View>
      <View style={styles.listProductInfo}>
        <Text style={[styles.listProductName, { color: colors.text }]} numberOfLines={2}>{product.title}</Text>
        <View style={styles.priceContainer}>
          {isOnSale && (
            <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>{formatPrice(originalPrice)}</Text>
          )}
          <Text style={[styles.price, { color: isDarkMode ? colors.white : colors.primary }]}>{formatPrice(price)}</Text>
        </View>
      </View>
      <View style={styles.listProductActions}>
        <TouchableOpacity
          style={[styles.listCartButton, { backgroundColor: colors.primary }]}
          onPress={(e: any) => { e.stopPropagation(); onAddToCart(product); }}
        >
          <Ionicons name={showCartSuccess ? 'checkmark' : 'cart'} size={20} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.listWishlistButton}
          onPress={(e: any) => { e.stopPropagation(); onToggleWishlist(product.id); }}
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={20}
            color={isLiked ? "#FF3B30" : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});
ListProductItem.displayName = 'ListProductItem';

export default function ProductsScreen() {
  const router = useRouter();
  const { apiService } = useAuth();
  const { setCartCount } = useCart();
  const { checkConnectivity } = useNetwork();
  const colors = useThemeColors();
  const isDarkMode = String(colors.background).toLowerCase() === '#000000';
  const numColumns = useResponsiveColumns(2);
  const cardWidthPercent = numColumns >= 4 ? 23 : numColumns === 3 ? 31 : 47;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    minPrice: 0,
    maxPrice: 100000000, // 100 million
    sortBy: 'newest',
  });
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [cartSuccess, setCartSuccess] = useState<{ [key: number]: boolean }>({});

  const fetchWishlist = useCallback(async () => {
    if (!apiService) return;
    try {
      const wishlistItems = await apiService.getWishlist();
      setWishlist(wishlistItems.map((item: any) => item.id));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  }, [apiService]);

  const fetchProducts = useCallback(async () => {
    if (!apiService) return;

    const isOnline = await checkConnectivity();
    if (!isOnline) {
      setError('No internet connection. Please check your connection and try again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params: any = { per_page: 20, page: 1 };
      if (searchQuery) params.search = searchQuery;

      const response = await apiService.getProducts(params);
      const transformedProducts = transformProducts(response);
      setProducts(transformedProducts);
      setHasMore(response.length === 20);
      setCurrentPage(1);
    } catch (err: any) {
      const isOnline = await checkConnectivity();
      if (!isOnline) {
        setError('No internet connection. Please check your connection and try again.');
      } else {
        console.error('Error fetching products:', err);
        setError('Unable to load products right now. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [apiService, searchQuery, checkConnectivity]);

  useEffect(() => {
    fetchProducts();
    fetchWishlist();
  }, [fetchProducts, fetchWishlist]);

  const toggleWishlist = useCallback(async (productId: number) => {
    if (!apiService) return;

    let wasInWishlist = false;
    setWishlist(prev => {
      wasInWishlist = prev.includes(productId);
      return wasInWishlist ? prev.filter(id => id !== productId) : [...prev, productId];
    });

    try {
      if (wasInWishlist) {
        await apiService.removeFromWishlist(productId);
      } else {
        await apiService.addToWishlist(productId);
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      setWishlist(prev =>
        wasInWishlist ? [...prev, productId] : prev.filter(id => id !== productId)
      );
    }
  }, [apiService]);

  const loadMoreProducts = useCallback(async () => {
    if (!hasMore || loadingMore || !apiService) return;

    const isOnline = await checkConnectivity();
    if (!isOnline) {
      return;
    }

    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const params: any = { per_page: 20, page: nextPage };
      if (searchQuery) params.search = searchQuery;

      const response = await apiService.getProducts(params);
      const transformedProducts = transformProducts(response);

      setProducts(prev => [...prev, ...transformedProducts]);
      setHasMore(response.length === 20);
      setCurrentPage(nextPage);
    } catch {
      // Silent fail on pagination - keep existing products, user can scroll to retry
    } finally {
      setLoadingMore(false);
    }
  }, [apiService, currentPage, hasMore, loadingMore, searchQuery, checkConnectivity]);

  const addToCart = useCallback(async (product: any) => {
    setCartCount(prev => prev + 1);

    try {
      await apiService.addToCart(product.id, 1, product);

      setCartSuccess(prev => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setCartSuccess(prev => {
          const next = { ...prev };
          delete next[product.id];
          return next;
        });
      }, 1500);
    } catch (error) {
      console.error("Add to cart error:", error);
      setCartCount(prev => prev - 1);
    }
  }, [apiService, setCartCount]);

  const handleProductPress = useCallback((id: number) => {
    router.push(`/product/${id}` as any);
  }, [router]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products]; // Work with all loaded products

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply price filter
    filtered = filtered.filter(product =>
      (typeof product.price === 'number' ? product.price : parseFloat(product.price || '0')) >= filters.minPrice &&
      (typeof product.price === 'number' ? product.price : parseFloat(product.price || '0')) <= filters.maxPrice
    );

    // Apply rating filter
    if (filters.rating && filters.rating > 0) {
      filtered = filtered.filter(product =>
        product.rating && product.rating.rate >= filters.rating!
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) =>
          (typeof a.price === 'number' ? a.price : parseFloat(a.price || '0')) -
          (typeof b.price === 'number' ? b.price : parseFloat(b.price || '0'))
        );
        break;
      case 'price-desc':
        filtered.sort((a, b) =>
          (typeof b.price === 'number' ? b.price : parseFloat(b.price || '0')) -
          (typeof a.price === 'number' ? a.price : parseFloat(a.price || '0'))
        );
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => b.id - a.id);
        break;
    }

    return filtered;
  }, [products, searchQuery, filters]);

  const keyExtractor = useCallback((item: any) => String(item.id), []);

  const renderItem = useCallback(({ item }: { item: any }) => {
    if (viewMode === 'list') {
      return (
        <ListProductItem
          product={item}
          colors={colors}
          isDarkMode={isDarkMode}
          isLiked={wishlist.includes(item.id)}
          showCartSuccess={!!cartSuccess[item.id]}
          onPress={handleProductPress}
          onToggleWishlist={toggleWishlist}
          onAddToCart={addToCart}
        />
      );
    }
    return (
      <View style={styles.gridItemWrapper}>
        <ProductCard
          product={item}
          style={{ width: `${cardWidthPercent}%` }}
          onPress={() => handleProductPress(item.id)}
          isLiked={wishlist.includes(item.id)}
          onToggleWishlist={() => toggleWishlist(item.id)}
          onAddToCart={() => addToCart(item)}
          cartSuccess={!!cartSuccess[item.id]}
        />
      </View>
    );
  }, [viewMode, colors, isDarkMode, wishlist, cartSuccess, cardWidthPercent, handleProductPress, toggleWishlist, addToCart]);

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.gridContainer}>
          {viewMode === 'grid' ? (
            <>
              <SkeletonProductItem viewMode="grid" />
              <SkeletonProductItem viewMode="grid" />
              <SkeletonProductItem viewMode="grid" />
              <SkeletonProductItem viewMode="grid" />
              <SkeletonProductItem viewMode="grid" />
              <SkeletonProductItem viewMode="grid" />
            </>
          ) : (
            <>
              <SkeletonProductItem viewMode="list" />
              <SkeletonProductItem viewMode="list" />
              <SkeletonProductItem viewMode="list" />
              <SkeletonProductItem viewMode="list" />
              <SkeletonProductItem viewMode="list" />
            </>
          )}
        </View>
      );
    }
    if (error) {
      return error.includes('internet connection') || error.includes('No internet') ? (
        <NetworkError
          title="No Internet Connection"
          message="Please check your connection and try again"
          onRetry={fetchProducts}
        />
      ) : (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>Error loading products: {error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={fetchProducts}
          >
            <Text style={[styles.retryButtonText, { color: colors.white }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return <Text style={[styles.noProductsText, { color: colors.textSecondary }]}>No products found.</Text>;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.headerContainer,
          {
            backgroundColor: colors.background,
          }
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)')}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <Text style={[styles.title, { color: colors.text }]}>Products</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
              <Ionicons name="filter" size={20} color={colors.primary} />
            </TouchableOpacity>
            <View style={[styles.viewToggle, { backgroundColor: colors.surface }]}>
              <TouchableOpacity
                style={[styles.toggleButton, viewMode === 'grid' && { backgroundColor: colors.primary }]}
                onPress={() => setViewMode('grid')}
              >
                <Ionicons name="grid" size={16} color={viewMode === 'grid' ? colors.white : colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, viewMode === 'list' && { backgroundColor: colors.primary }]}
                onPress={() => setViewMode('list')}
              >
                <Ionicons name="list" size={16} color={viewMode === 'list' ? colors.white : colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search products..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setCurrentPage(1);
              setHasMore(true);
            }}
          />
        </View>
      </View>

      {/* Results Count - omitted while loading; the skeleton grid below
          already communicates that, showing a second spinner here too was
          redundant. */}
      {!loading && (
        <View style={styles.resultsContainer}>
          {error ? (
            <Text style={[styles.errorText, { color: colors.error }]}>Error: {error}</Text>
          ) : (
            <Text style={[styles.resultsText, { color: colors.textSecondary }]}>{filteredProducts.length} products found</Text>
          )}
        </View>
      )}

      {/* Products - virtualized so only visible rows are ever mounted, even
          after many pages have been loaded via infinite scroll. */}
      <FlashList
        key={`${viewMode}-${numColumns}`}
        data={filteredProducts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={viewMode === 'grid' ? numColumns : 1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={viewMode === 'grid' ? styles.gridContentContainer : styles.listContentContainer}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={loadingMore ? (
          <View style={styles.loadingMoreContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null}
        onEndReached={() => {
          if (hasMore && !loadingMore) {
            loadMoreProducts();
          }
        }}
        onEndReachedThreshold={0.5}
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
          setHasMore(true);
        }}
        currentFilters={filters}
        maxPriceLimit={100000000}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  headerLeft: {
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: fontFamily.bold,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterButton: {
    padding: 8,
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: radius.pill,
    padding: 2,
  },
  toggleButton: {
    padding: 8,
    borderRadius: radius.pill,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: 6,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 13,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    marginBottom: 2,
  },
  resultsText: {
    fontSize: 14,
  },
  gridContentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 120,
  },
  listContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  gridItemWrapper: {
    flex: 1,
    paddingHorizontal: 6,
    marginBottom: spacing.lg,
  },
  listItem: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadow.card,
  },
  listImageContainer: {
    position: 'relative',
  },
  listImage: {
    width: 100,
    height: 100,
  },
  listSaleOverlay: {
    position: 'absolute',
    top: 4,
    left: 4,
  },
  listProductInfo: {
    flex: 1,
    padding: 12,
  },
  listProductName: {
    fontSize: typeScale.bodyLarge,
    fontFamily: fontFamily.medium,
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  originalPrice: {
    fontSize: typeScale.small,
    fontFamily: fontFamily.regular,
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: typeScale.subtitle,
    fontFamily: fontFamily.bold,
  },
  listProductActions: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  listCartButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listWishlistButton: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  noProductsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  loadingMoreContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  retryButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.pill,
    minWidth: 120,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
  },
});
