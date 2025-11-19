import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import SkeletonProductItem from '@/components/SkeletonProductItem';
import { useThemeColors } from '@/hooks/useColorScheme';
import SafeImage from '@/components/SafeImage';
import FilterModal, { FilterOptions } from '@/components/FilterModal';

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

  useEffect(() => {
    const fetchProducts = async () => {
      if (!apiService) return; // Ensure apiService is available
      try {
        setLoading(true);
        const response = await apiService.getProducts();
        setProducts(response);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [apiService]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply price filter
    filtered = filtered.filter(product => 
      product.price >= filters.minPrice && product.price <= filters.maxPrice
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
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
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
        <TouchableOpacity
          key={product.id}
          style={styles.productCard}
          onPress={() => router.push(`/product/${product.id}`)}
        >
          <SafeImage source={{ uri: product.image }} style={styles.productImage} />
          {/* Actions overlay on image */}
          <View style={styles.productActionsOverlay}>
            <TouchableOpacity
              style={[styles.addToCartButton, { backgroundColor: colors.primary }]}
              onPress={async (e) => {
                e.stopPropagation(); // Prevent triggering the product detail navigation
                try {
                  // Add to cart logic
                  await apiService.addToCart(product.id, 1);

                  // Update cart count by fetching the current cart contents
                  try {
                    const cartResponse = await apiService.getCartContents();
                    if (cartResponse && cartResponse.products) {
                      const newCartCount = cartResponse.products.reduce((total: any, item: any) => total + item.quantity, 0);
                      setCartCount(newCartCount);
                    }
                  } catch (countError) {
                    console.error("Error updating cart count:", countError);
                  }
                } catch (error) {
                  console.error('Add to cart error:', error);
                }
              }}
            >
              <Ionicons name="cart" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
          {/* Product details below image */}
          <View style={styles.productDetails}>
            <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{product.title}</Text>
            <View style={styles.priceRow}>
              <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>{`₦${(product.price * 1.3).toFixed(2)}`}</Text>
              <Text style={[styles.productPrice, { color: colors.primary }]}>{`₦${product.price.toFixed(2)}`}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderListView = () => (
    <View style={styles.listContainer}>
      {filteredProducts.map((product) => (
        <TouchableOpacity 
          key={product.id} 
          style={[styles.listItem, { backgroundColor: colors.surface }]}
          onPress={() => router.push(`/product/${product.id}`)}
        >
          <View style={styles.listImageContainer}>
            <SafeImage source={{ uri: product.image }} style={styles.listImage} />
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
              <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>{`₦${(product.price * 1.3).toFixed(2)}`}</Text>
              <Text style={[styles.price, { color: colors.primary }]}>{`₦${product.price.toFixed(2)}`}</Text>
            </View>
          </View>
          <View style={styles.listProductActions}>
            <TouchableOpacity 
              style={[styles.listCartButton, { backgroundColor: colors.primary }]} 
              onPress={async (e) => {
                e.stopPropagation();
                try {
                  await apiService.addToCart(product.id, 1);
                  
                  try {
                    const cartResponse = await apiService.getCartContents();
                    if (cartResponse && cartResponse.products) {
                      const newCartCount = cartResponse.products.reduce((total: any, item: any) => total + item.quantity, 0);
                      setCartCount(newCartCount);
                    }
                  } catch (countError) {
                    console.error("Error updating cart count:", countError);
                  }
                } catch (error) {
                  console.error('Add to cart error:', error);
                }
              }}
            >
              <Ionicons name="cart" size={20} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.listWishlistButton} onPress={async (e) => {
              e.stopPropagation();
              try {
                const result = await apiService.addToWishlist(product.id);
                console.log('Added to wishlist:', result);
              } catch (error) {
                console.error('Wishlist error:', error);
              }
            }}>
              <Ionicons name="heart-outline" size={20} color={colors.textSecondary} />
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
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
  productCard: {
    width: '47%',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    height: 200,
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#E5E5EA',
  },
  productActionsOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    zIndex: 1,
  },
  productDetails: {
    padding: 8,
    paddingTop: 4,
    paddingRight: 48,
    position: 'relative',
    top: 0,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addToCartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
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
    backgroundColor: '#E5E5EA',
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
    fontSize: 16,
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