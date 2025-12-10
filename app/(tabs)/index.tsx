import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SafeImage from '@/components/SafeImage';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import InstagramCarousel from '@/components/InstagramCarousel';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useTheme } from '@/context/ThemeContext';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import SkeletonLoader from '@/components/SkeletonLoader';
import SkeletonProductItem from '@/components/SkeletonProductItem';
import { transformProducts, transformCategories } from '@/utils/woocommerceTransformers';
import { formatPrice } from '@/utils/formatNumber';
import MarketingBanner from '@/components/MarketingBanner';
import { fetchCarousels } from '@/services/carousel';
import BestDealsSection from '@/components/BestDealsSection';
import ProductCard from '@/components/ProductCard';

export default function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { apiService, user, isAuthenticated } = useAuth();
  const { setCartCount } = useCart();
  const [loadingCarousel, setLoadingCarousel] = useState(true);
  const [carouselItems, setCarouselItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [carouselError, setCarouselError] = useState<string | null>(null);
  const [cartSuccess, setCartSuccess] = useState<{ [key: number]: boolean }>({});

  const fetchWishlist = useCallback(async () => {
    if (!apiService) return;
    try {
      const wishlistItems = await apiService.getWishlist();
      setWishlist(wishlistItems.map((item: any) => item.id));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  }, []); // OPTIMIZED: Removed apiService dependency to prevent re-fetches

  const fetchProducts = useCallback(async () => {
    if (!apiService) return;
    setLoadingProducts(true);
    setErrorProducts(null);
    try {
      const response = await apiService.getProducts({ per_page: 20, page: 1 });
      // Transform WooCommerce API response using utility function
      const transformedProducts = transformProducts(response);
      setProducts(transformedProducts);
      // Check if we have more products available (assuming the API returns max available)
      setHasMoreProducts(response.length >= 20);
      setCurrentPage(1); // Reset to page 1 on initial fetch
    } catch (err: any) {
      setErrorProducts(err.message || 'An unexpected error occurred');
    } finally {
      setLoadingProducts(false);
    }
  }, []); // OPTIMIZED: Removed apiService dependency to prevent re-fetches

  const loadMoreProducts = useCallback(async () => {
    if (!hasMoreProducts || isLoadingMore || !apiService) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = await apiService.getProducts({ per_page: 20, page: nextPage });
      // Transform WooCommerce API response using utility function
      const transformedProducts = transformProducts(response);

      // Append new products to existing products
      setProducts(prevProducts => [...prevProducts, ...transformedProducts]);

      // Update pagination state
      setHasMoreProducts(response.length >= 20);
      setCurrentPage(nextPage);
    } catch (err: any) {
      setErrorProducts(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMoreProducts, isLoadingMore]); // OPTIMIZED: Removed apiService dependency

  const fetchCarouselItems = useCallback(async () => {
    setLoadingCarousel(true);
    setCarouselError(null);
    try {
      const items = await fetchCarousels();
      setCarouselItems(items);
    } catch (err: any) {
      console.error('Error fetching carousel items:', err);
      setCarouselError(err.message || 'Failed to load carousel');
    } finally {
      setLoadingCarousel(false);
    }
  }, []); // Already optimized

  const fetchCategories = useCallback(async () => {
    if (!apiService) return;
    setLoadingCategories(true);
    setErrorCategories(null);
    try {
      const response = await apiService.getCategories();
      // Transform WooCommerce categories using utility function
      const formattedCategories = transformCategories(response);
      setCategories(formattedCategories);
    } catch (err: any) {
      setErrorCategories(err.message || 'An unexpected error occurred');
    } finally {
      setLoadingCategories(false);
    }
  }, []); // OPTIMIZED: Removed apiService dependency to prevent re-fetches

  // OPTIMIZED: Fetch data only once when component mounts or when authentication changes
  useEffect(() => {
    if (apiService) {
      fetchProducts();
      fetchCategories();
      if (isAuthenticated) {
        fetchWishlist();
      }
    }
    fetchCarouselItems();
  }, [isAuthenticated]); // OPTIMIZED: Only depend on isAuthenticated, not on functions

  // OPTIMIZED: Handle push notifications - run only once on mount
  useEffect(() => {
    let cleanupFn: (() => void) | null = null;

    const setupNotifications = async () => {
      try {
        const { registerForPushNotificationsAsync, setupNotificationListeners } = await import('@/services/notificationService');

        // Register for push notifications
        const token = await registerForPushNotificationsAsync(apiService?.sessionToken || undefined);

        // If token is null, it means permissions were denied
        if (!token) {
          console.log("Push notifications not enabled due to denied permissions");
        }

        // Setup notification listeners
        cleanupFn = setupNotificationListeners((response) => {
          // Handle notification tap - could navigate to specific content
          const { linkType, linkValue } = response?.notification?.request?.content?.data || {};
          if (linkType && linkValue) {
            if (linkType === 'category') {
              router.push(`/category/${linkValue}` as any);
            } else if (linkType === 'product') {
              router.push(`/product/${linkValue}` as any);
            }
          }
        });
      } catch (error) {
        console.error('Error setting up push notifications:', error);
      }
    };

    setupNotifications();

    // Cleanup listeners on unmount
    return () => {
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, []); // OPTIMIZED: Run only once on mount

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    await fetchCategories();
    if (isAuthenticated) {
      await fetchWishlist();
    }
    await fetchCarouselItems();
    setRefreshing(false);
  }, [isAuthenticated]); // OPTIMIZED: Removed function dependencies


  const handleSeeAllProducts = () => {
    router.push('/products'); // Navigate to the full products page
  };

  const handleCarouselItemPress = useCallback((item: any) => {
    console.log('Carousel item pressed:', item);
    if (item.linkType === 'product') {
      router.push(`/product/${item.linkValue}` as any);
    } else if (item.linkType === 'category') {
      router.push(`/category/${item.linkValue}` as any);
    } else if (item.linkType === 'external') {
      // Handle external links if needed
      console.log('External link:', item.linkValue);
    } else {
      // Default action or navigate to home
      router.push('/');
    }
  }, [router]);

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
      // OPTIMIZED: Pass product data to avoid additional API call
      const result = await apiService.addToCart(product.id, 1, product);
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

      // OPTIMIZED: Removed cart contents fetch - trust optimistic update
      // Cart sync will happen naturally on cart screen visit
    } catch (error) {
      console.error("Add to cart error:", error);
      // Revert optimistic update on error
      setCartCount(prev => prev - 1);
    }
  };

  const [scrollY, setScrollY] = useState(0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sticky Header */}
      <View style={[styles.stickyHeader, {
        backgroundColor: colors.background,
        opacity: scrollY > 50 ? 1 : 0,
        pointerEvents: scrollY > 50 ? 'auto' : 'none',
      }]}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, marginBottom: 0, flex: 1, marginRight: 12 }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchPlaceholder, { color: colors.text }]}
            placeholder="Search products..."
            placeholderTextColor={colors.textSecondary}
            onFocus={() => router.push('/search')}
          />
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }} // Add padding for floating tab bar
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onScroll={(event) => {
          const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
          setScrollY(contentOffset.y);
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 500;

          if (isCloseToBottom && hasMoreProducts && !isLoadingMore) {
            loadMoreProducts();
          }
        }}
        scrollEventThrottle={16}
      >
        {/* Header (Hidden when scrolled) */}
        <View style={[styles.header, { backgroundColor: colors.background, opacity: scrollY > 50 ? 0 : 1 }]}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {isAuthenticated && user ? `Good morning, ${user.first_name || 'User'}` : 'Good morning'}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>Discover</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/search')}>
              <Ionicons name="search" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Carousel */}
        <InstagramCarousel
          data={carouselItems}
          onItemPress={handleCarouselItemPress}
        />

        {/* Featured Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Categories</Text>
            </View>
            <TouchableOpacity
              style={[styles.seeAllButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/categories')}
            >
              <Text style={[styles.seeAllButtonText, { color: colors.white }]}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesContainer}>
            {loadingCategories ? (
              <View style={styles.categoriesRow}>
                <SkeletonLoader width="30%" height={80} borderRadius={12} style={styles.skeletonCategoryItem} />
                <SkeletonLoader width="30%" height={80} borderRadius={12} style={styles.skeletonCategoryItem} />
                <SkeletonLoader width="30%" height={80} borderRadius={12} style={styles.skeletonCategoryItem} />
              </View>
            ) : errorCategories ? (
              <Text style={[styles.errorText, { color: colors.error }]}>Error loading categories: {errorCategories}</Text>
            ) : categories.length === 0 ? (
              <Text style={[styles.noProductsText, { color: colors.textSecondary }]}>No categories found.</Text>
            ) : (
              <View style={styles.categoriesRow}>
                {categories.slice(0, 3).map((category) => (
                  <TouchableOpacity
                    key={category.category_id}
                    style={styles.categoryCard}
                    onPress={() => router.push(`/category/${category.category_id}` as any)}
                  >
                    <View style={styles.categoryImageContainer}>
                      {category.image ? (
                        <SafeImage
                          source={{ uri: category.image }}
                          style={styles.categoryItemImage}
                        />
                      ) : (
                        <View style={[styles.categoryItemImagePlaceholder, { backgroundColor: colors.background }]}>
                          <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
                        </View>
                      )}
                    </View>
                    <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={2}>{category.name && typeof category.name === 'string' ? category.name.replace('-', ' ') : 'Category'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Best Deals (Trending) */}
        <BestDealsSection wishlist={wishlist} toggleWishlist={toggleWishlist} />

        {/* Marketing Banner */}
        <MarketingBanner />

        {/* Latest Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Latest Products</Text>
            <TouchableOpacity
              style={[styles.seeAllButton, { backgroundColor: colors.primary }]}
              onPress={handleSeeAllProducts}
            >
              <Text style={[styles.seeAllButtonText, { color: colors.white }]}>See All</Text>
            </TouchableOpacity>
          </View>
          {loadingProducts ? (
            <View style={styles.productsGrid}>
              <SkeletonProductItem viewMode="grid" />
              <SkeletonProductItem viewMode="grid" />
              <SkeletonProductItem viewMode="grid" />
              <SkeletonProductItem viewMode="grid" />
            </View>
          ) : errorProducts ? (
            <Text style={[styles.errorText, { color: colors.error }]}>Error loading products: {errorProducts}</Text>
          ) : products.length === 0 ? (
            <Text style={[styles.noProductsText, { color: colors.textSecondary }]}>No products found.</Text>
          ) : (
            <View style={styles.productsGrid}>
              {products.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => router.push(`/product/${product.id}` as any)}
                >
                  <View style={styles.productImageContainer}>
                    <SafeImage source={{ uri: product.image }} style={[styles.productImage, { backgroundColor: colors.background }]} />
                    <View style={styles.wishlistOverlay}>
                      <TouchableOpacity
                        style={[styles.wishlistButton, { backgroundColor: colors.surface }]}
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                      >
                        <Ionicons
                          name={wishlist.includes(product.id) ? "heart" : "heart-outline"}
                          size={16}
                          color={wishlist.includes(product.id) ? "#FF3B30" : colors.text}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.cartOverlayBottom}>
                      <TouchableOpacity
                        style={[styles.addToCartButton, { backgroundColor: colors.primary }]}
                        onPress={async (e) => {
                          e.stopPropagation();
                          await addToCart(product);
                        }}
                      >
                        <Ionicons name="cart" size={18} color={colors.white} />
                      </TouchableOpacity>
                    </View>
                    {cartSuccess[product.id] && (
                      <View style={styles.successOverlay}>
                        <Ionicons name="checkmark-circle" size={24} color="#4CD964" />
                      </View>
                    )}
                  </View>

                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{product.title}</Text>
                    <View style={styles.priceRow}>
                      <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>{formatPrice((typeof product.price === 'number' ? product.price : parseFloat(product.price || '0')) * 1.3)}</Text>
                      <Text style={[styles.productPrice, { color: '#FFA500' }]}>{formatPrice(typeof product.price === 'number' ? product.price : parseFloat(product.price || '0'))}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              {isLoadingMore && (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60, // Adjust based on safe area
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 14,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  searchPlaceholder: {
    marginLeft: 12,
    fontSize: 16,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 20, // Add padding to ensure last row is not hidden behind tab bar
  },
  loadingMoreContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoBanner: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  promoCode: {
    fontSize: 12,
    fontWeight: '500',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  loadingIndicator: {
    marginTop: 20,
    marginBottom: 20,
  },
  categoryCard: {
    width: '30%', // 3 items per row with some spacing
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  categoryImageContainer: {
    position: 'relative',
    width: '100%',
  },
  categoryItemImage: {
    width: '100%',
    height: 100, // Adjusted height for category card
    borderRadius: 8,
  },
  categoryItemImagePlaceholder: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 8,
  },
  skeletonCategoryItem: {
    marginHorizontal: 2,
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
  productCard: {
    width: '47%', // Default width for grid
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
  },
  productImage: {
    width: '100%',
    height: 160,
  },
  wishlistOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
  },
  cartOverlayBottom: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    zIndex: 2,
  },
  wishlistButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  productInfo: {
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  seeAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  seeAllButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});