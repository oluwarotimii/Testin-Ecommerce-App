import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, Animated, useWindowDimensions } from 'react-native';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import SkeletonProductItem from '@/components/SkeletonProductItem';
import { useThemeColors } from '@/hooks/useColorScheme';
import SafeImage from '@/components/SafeImage';
import FilterModal, { FilterOptions } from '@/components/FilterModal';
import { transformProducts, transformCategories } from '@/utils/woocommerceTransformers';
import { formatPrice } from '@/utils/formatNumber';
import BackButton from '@/components/BackButton';
import ProductCard from '@/components/ProductCard';
import { Colors } from '@/constants/Colors';

export default function ProductsScreen() {
  const router = useRouter();
  const { apiService } = useAuth();
  const { setCartCount } = useCart();
  const colors = useThemeColors();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    minPrice: 0,
    maxPrice: 100000000, // 100 million
    sortBy: 'newest',
  });
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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

  const fetchCategories = useCallback(async () => {
    if (!apiService) return;
    try {
      const response = await apiService.getCategories();
      // Use transformation utility to ensure consistent format
      const transformedCategories = transformCategories(response);
      setCategories(transformedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
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
    fetchCategories();
  }, [apiService, fetchWishlist, fetchCategories]);

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

  const addToCart = async (product: any) => {
    // Optimistic update for faster UI response
    setCartCount(prev => prev + 1);

    try {
      const result = await apiService.addToCart(product.id, 1);
      console.log(`Added ${product.title} to cart!`, result);

      // Show success indicator
      setCartSuccess(prev => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setCartSuccess(prev => {
          const newCartSuccess = { ...prev };
          delete newCartSuccess[product.id];
          return newCartSuccess;
        });
      }, 1500); // Hide after 1.5 seconds

      // Add a small delay before fetching updated cart to ensure the server processes the add
      await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay

      // Update cart count to actual value from server with error handling
      try {
        const cartResponse = await apiService.getCartContents();
        if (cartResponse && cartResponse.products) {
          const newCartCount = cartResponse.products.reduce((total: any, item: any) => total + item.quantity, 0);
          setCartCount(newCartCount);
        } else {
          // If the cart fetch fails or returns empty, keep the optimistic update
          console.warn("Could not fetch updated cart contents");
        }
      } catch (countError) {
        console.error("Error fetching cart contents, keeping optimistic count:", countError);
        // Keep the optimistic update if cart fetch fails
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      // Revert optimistic update on error
      setCartCount(prev => prev - 1);
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product =>
      product.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply category filter
    if (selectedCategory !== 'all' && selectedCategory) {
      filtered = filtered.filter(product => {
        // Check if selectedCategory is a category ID (prefixed with 'cat_')
        if (selectedCategory.startsWith('cat_')) {
          const categoryId = parseInt(selectedCategory.replace('cat_', ''), 10);

          // Check if the product's category_id matches the selected category ID
          if (product.category_id && product.category_id === categoryId) {
            return true;
          }

          // Check if product.categories array contains the selected category ID
          if (product.categories && Array.isArray(product.categories)) {
            return product.categories.some((cat: any) =>
              cat.id === categoryId
            );
          }

          // If no match found, return false
          return false;
        } else {
          // For backward compatibility, if somehow it's not an ID format
          // Find the category by slug from the available categories
          const selectedCat = categories.find(cat => cat.slug === selectedCategory);

          if (!selectedCat) {
            // If we can't find the category by slug, match by product's category name
            return product.category?.toLowerCase() === selectedCategory.toLowerCase();
          }

          // Check if the product belongs to the selected category
          if (product.category_id && selectedCat.category_id &&
              product.category_id === selectedCat.category_id) {
            return true;
          }

          // Check if product.categories array contains the selected category
          if (product.categories && Array.isArray(product.categories)) {
            const hasMatchingCategory = product.categories.some((cat: any) =>
              (cat.id && selectedCat.category_id && cat.id === selectedCat.category_id) ||
              (cat.slug && selectedCategory && cat.slug === selectedCategory) ||
              (cat.name && selectedCat.name && cat.name?.toLowerCase() === selectedCat.name?.toLowerCase())
            );
            if (hasMatchingCategory) return true;
          }

          // Fallback to product.category name matching - but make it more specific
          if (product.category && selectedCat.name) {
            return product.category.toLowerCase() === selectedCat.name.toLowerCase();
          }

          // If none of the above match, then the product doesn't belong to selected category
          return false;
        }
      });
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
  }, [products, searchQuery, filters, selectedCategory, categories]);

  const renderGridView = () => (
    <View style={styles.gridContainer}>
      {filteredProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onPress={() => router.push(`/product/${product.id}` as any)}
          isLiked={wishlist.includes(product.id)}
          onToggleWishlist={() => toggleWishlist(product.id)}
          onAddToCart={() => addToCart(product)}
          cartSuccess={cartSuccess[product.id]}
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
              <Text style={[styles.price, { color: '#FFA500' }]}>{formatPrice(typeof product.price === 'number' ? product.price : parseFloat(product.price || '0'))}</Text>
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

  // Calculate header collapse
  const headerHeight = 120; // Approximate header height (header + search + category)
  const minHeaderHeight = 60; // Minimum height when collapsed
  const headerHeightDiff = headerHeight - minHeaderHeight;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.5],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeightDiff],
    outputRange: [0, -60],  // Move header up by 60px when collapsed
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.headerContainer,
          {
            backgroundColor: colors.background,
            transform: [{ translateY: headerTranslateY }],
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
          <Animated.View style={[styles.headerCenter, { opacity: headerOpacity }]}>
            <Text style={[styles.title, { color: colors.text }]}>Products</Text>
          </Animated.View>
          <Animated.View style={{ opacity: headerOpacity }}>
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
          </Animated.View>
        </View>

        {/* Search Bar */}
        <Animated.View style={{ opacity: headerOpacity }}>
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
        </Animated.View>

        {/* Category Filter */}
        <Animated.View style={{ opacity: headerOpacity }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.categoryScroll, { maxHeight: 40 }]}
            contentContainerStyle={[styles.categoryScrollContent, {
              alignItems: 'center',
              paddingVertical: 0
            }]}
          >
            <View style={{ flexDirection: 'row', flexWrap: 'nowrap', gap: 8 }}>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  { backgroundColor: colors.surface },
                  selectedCategory === 'all' ? { backgroundColor: colors.primary } : null
                ]}
                onPress={() => setSelectedCategory('all')}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === 'all' ? { color: colors.white } : { color: colors.text }
                ]}>
                  All
                </Text>
              </TouchableOpacity>

              {categories.map((category) => (
                <TouchableOpacity
                  key={category.category_id}
                  style={[
                    styles.categoryButton,
                    { backgroundColor: colors.surface },
                    selectedCategory === `cat_${category.category_id}` ? { backgroundColor: colors.primary } : null
                  ]}
                  onPress={() => setSelectedCategory(`cat_${category.category_id}`)}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === `cat_${category.category_id}` ? { color: colors.white } : { color: colors.text }
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>

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
      <Animated.ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
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
      </Animated.ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={(newFilters) => setFilters(newFilters)}
        currentFilters={filters}
        maxPriceLimit={100000000}
      />
    </View>
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
    paddingTop: 30,
    paddingBottom: 8,
  },
  headerLeft: {
    flex: 1,
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
    marginBottom: 4,
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
  categoryScroll: {
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  categoryButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    height: 30,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '500',
  },
});