import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import SkeletonProductItem from '@/components/SkeletonProductItem';
import { useThemeColors } from '@/hooks/useColorScheme';
import SafeImage from '@/components/SafeImage';
import FilterModal, { FilterOptions } from '@/components/FilterModal';
import { transformProducts } from '@/utils/woocommerceTransformers';
import { formatPrice } from '@/utils/formatNumber';
import BackButton from '@/components/BackButton';
import ProductCard from '@/components/ProductCard';

export default function ProductsScreen() {
  const router = useRouter();
  const { apiService } = useAuth();
  const { setCartCount } = useCart();
  const colors = useThemeColors();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    minPrice: 0,
    maxPrice: 1000,
    sortBy: 'newest',
  });
  const [wishlist, setWishlist] = useState<number[]>([]);

  const fetchWishlist = useCallback(async () => {
    if (!apiService) return;
    try {
      const wishlistItems = await apiService.getWishlist();
      setWishlist(wishlistItems.map((item: any) => item.id));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  }, [apiService]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!apiService) return; // Ensure apiService is available
      try {
        setLoading(true);
        const response = await apiService.getProducts();
        // Use transformation utility
        const transformedProducts = transformProducts(response);
        setProducts(transformedProducts);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    fetchWishlist();
  }, [apiService, fetchWishlist]);

  const toggleWishlist = async (productId: number) => {
    if (!apiService) return;

    const isInWishlist = wishlist.includes(productId);

    // Optimistic update
    if (isInWishlist) {
      setWishlist(prev => prev.filter(id => id !== productId));
    } else {
      setWishlist(prev => [...prev, productId]);
    }

    try {
      if (isInWishlist) {
        await apiService.removeFromWishlist(productId);
      } else {
        await apiService.addToWishlist(productId);
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      // Revert on error
      if (isInWishlist) {
        setWishlist(prev => [...prev, productId]);
      } else {
        setWishlist(prev => prev.filter(id => id !== productId));
      }
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product =>
      product.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

  const renderGridView = () => (
    <View style={styles.gridContainer}>
      {filteredProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onPress={() => router.push(`/product/${product.id}` as any)}
          isLiked={wishlist.includes(product.id)}
          onToggleWishlist={() => toggleWishlist(product.id)}
        />
      ))}
    </View>
  );

  const renderListView = () => (
    <View style={styles.listContainer}>
      {filteredProducts.map((product) => (
        <TouchableOpacity
          key={product.id}
          style={[styles.listItem, { backgroundColor: colors.surface }]}
          onPress={() => router.push(`/product/${product.id}` as any)}
        >
          <View style={styles.listImageContainer}>
            <SafeImage source={{ uri: product.image }} style={[styles.listImage, { backgroundColor: colors.background }]} />
          </View>
          <View style={styles.listProductInfo}>
            <Text style={[styles.listProductName, { color: colors.text }]} numberOfLines={2}>{product.title}</Text>
            <Text style={[styles.categoryText, { color: colors.textSecondary }]} numberOfLines={1}>{product.category?.replace('-', ' ')}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={[styles.ratingText, { color: colors.text }]}>{product.rating ? product.rating.rate : 0}</Text>
              <Text style={[styles.reviewsText, { color: colors.textSecondary }]}>({product.rating ? product.rating.count : 0})</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>{formatPrice((typeof product.price === 'number' ? product.price : parseFloat(product.price || '0')) * 1.3)}</Text>
              <Text style={[styles.price, { color: '#ff6b6b' }]}>{formatPrice(typeof product.price === 'number' ? product.price : parseFloat(product.price || '0'))}</Text>
            </View>
          </View>
          <View style={styles.listProductActions}>
            <TouchableOpacity
              style={[styles.listCartButton, { backgroundColor: colors.primary }]}
              onPress={async (e) => {
                e.stopPropagation();
                // Optimistic update for faster UI response
                setCartCount(prev => prev + 1);
                try {
                  await apiService.addToCart(product.id, 1);
                  // Fetch actual cart count to sync
                  const cartResponse = await apiService.getCartContents();
                  if (cartResponse && cartResponse.products) {
                    const newCartCount = cartResponse.products.reduce((total: any, item: any) => total + item.quantity, 0);
                    setCartCount(newCartCount);
                  }
                } catch (error) {
                  console.error('Add to cart error:', error);
                  // Revert optimistic update on error
                  setCartCount(prev => prev - 1);
                }
              }}
            >
              <Ionicons name="cart" size={20} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.listWishlistButton}
              onPress={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
            >
              <Ionicons
                name={wishlist.includes(product.id) ? "heart" : "heart-outline"}
                size={20}
                color={wishlist.includes(product.id) ? "#FF3B30" : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <BackButton />
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
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>Error: {error}</Text>
        ) : (
          <Text style={[styles.resultsText, { color: colors.textSecondary }]}>{filteredProducts.length} products found</Text>
        )}
      </View>

      {/* Products */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
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
        ) : error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>Error loading products: {error}</Text>
        ) : filteredProducts.length === 0 ? (
          <Text style={[styles.noProductsText, { color: colors.textSecondary }]}>No products found.</Text>
        ) : (
          viewMode === 'grid' ? renderGridView() : renderListView()
        )}
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={(newFilters) => setFilters(newFilters)}
        currentFilters={filters}
        maxPriceLimit={1000}
      />
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
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
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
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  listItem: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  listImageContainer: {
    position: 'relative',
  },
  listImage: {
    width: 100,
    height: 100,
  },
  listProductInfo: {
    flex: 1,
    padding: 12,
  },
  listProductName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  reviewsText: {
    fontSize: 12,
    marginLeft: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
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
    borderRadius: 20,
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
});