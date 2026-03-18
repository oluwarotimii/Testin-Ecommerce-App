import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Animated, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import SafeImage from '@/components/SafeImage';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useNetwork } from '@/context/NetworkContext';
import InstagramCarousel from '@/components/InstagramCarousel';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useTheme } from '@/context/ThemeContext';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import SkeletonLoader from '@/components/SkeletonLoader';
import SkeletonProductItem from '@/components/SkeletonProductItem';
import { transformProducts, transformCategories } from '@/utils/woocommerceTransformers';
import { formatPrice } from '@/utils/formatNumber';
import MarketingBanner from '@/components/MarketingBanner';
import { fetchCarousels } from '@/services/carousel';
import BestDealsSection from '@/components/BestDealsSection';
import ProductCard from '@/components/ProductCard';
import NetworkError from '@/components/NetworkError';
import { FEATURED_PRODUCTS_LIMIT } from '@/services/config';

// Section types for FlashList
type SectionType = 
  | { type: 'header' }
  | { type: 'search' }
  | { type: 'carousel' }
  | { type: 'categories' }
  | { type: 'bestDeals' }
  | { type: 'banner' }
  | { type: 'products' };

// Memoized Category Item - prevents re-renders when parent state changes
const CategoryItem = memo(({ category, colors, onPress }: { 
  category: any; 
  colors: any; 
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.categoryCard, { backgroundColor: colors.surface }]}
    onPress={onPress}
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
    <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={2}>
      {category.name && typeof category.name === 'string' ? category.name.replace('-', ' ') : 'Category'}
    </Text>
  </TouchableOpacity>
));
CategoryItem.displayName = 'CategoryItem';

// Memoized Product Item - prevents re-renders when parent state changes
const ProductItem = memo(({ 
  product, 
  colors, 
  wishlist, 
  cartSuccess, 
  onProductPress, 
  onToggleWishlist, 
  onAddToCart 
}: { 
  product: any; 
  colors: any;
  wishlist: number[];
  cartSuccess: { [key: number]: boolean };
  onProductPress: () => void;
  onToggleWishlist: (e: any) => void;
  onAddToCart: (e: any) => void;
}) => {
  const isInWishlist = wishlist.includes(product.id);
  
  return (
    <TouchableOpacity
      key={product.id}
      style={[styles.productCard, { backgroundColor: colors.surface }]}
      onPress={onProductPress}
    >
      <View style={styles.productImageContainer}>
        <SafeImage 
          source={{ uri: product.image }} 
          style={[styles.productImage, { backgroundColor: colors.background }]} 
        />
        <View style={styles.wishlistOverlay}>
          <TouchableOpacity
            style={[styles.wishlistButton, { backgroundColor: colors.surface }]}
            onPress={onToggleWishlist}
          >
            <Ionicons
              name={isInWishlist ? "heart" : "heart-outline"}
              size={16}
              color={isInWishlist ? "#FF3B30" : colors.text}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.cartOverlayBottom}>
          <TouchableOpacity
            style={[styles.addToCartButton, { backgroundColor: colors.primary }]}
            onPress={onAddToCart}
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
        <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
          {product.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
            {formatPrice((typeof product.price === 'number' ? product.price : parseFloat(product.price || '0')) * 1.3)}
          </Text>
          <Text style={[styles.productPrice, { color: '#042861' }]}>
            {formatPrice(typeof product.price === 'number' ? product.price : parseFloat(product.price || '0'))}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});
ProductItem.displayName = 'ProductItem';

export default function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { apiService, user, isAuthenticated } = useAuth();
  const { setCartCount } = useCart();
  const { isConnected, isInternetReachable, checkConnectivity } = useNetwork();

  // OPTIMIZED: Use Animated.Value directly for scroll - no useState re-renders
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = scrollY; // Reuse the same Animated.Value for header fade

  // Derived animated values for header animation (computed on native thread)
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [-20, 0],
    extrapolate: 'clamp',
  });

  // Carousel state
  const [loadingCarousel, setLoadingCarousel] = useState(true);
  const [carouselItems, setCarouselItems] = useState<any[]>([]);
  const [carouselError, setCarouselError] = useState<string | null>(null);

  // Categories state
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);

  // Products state
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Refresh and wishlist state
  const [refreshing, setRefreshing] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [cartSuccess, setCartSuccess] = useState<{ [key: number]: boolean }>({});

  // OPTIMIZED: Featured products state with caching
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [errorFeatured, setErrorFeatured] = useState<string | null>(null);
  
  // OPTIMIZED: Use ref to track if featured products have been loaded (prevents callback recreation)
  const hasFeaturedRef = useRef(false);

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
      setErrorProducts('No internet connection. Please check your connection and try again.');
      setLoadingProducts(false);
      return;
    }

    setLoadingProducts(true);
    setErrorProducts(null);
    try {
      const response = await apiService.getProducts({ per_page: 20, page: 1 });
      const transformedProducts = transformProducts(response);
      setProducts(transformedProducts);
      setHasMoreProducts(response.length >= 20);
      setCurrentPage(1);
    } catch (err: any) {
      const isOnline = await checkConnectivity();
      if (!isOnline) {
        setErrorProducts('No internet connection. Please check your connection and try again.');
      } else {
        setErrorProducts(err.message || 'An unexpected error occurred');
      }
    } finally {
      setLoadingProducts(false);
    }
  }, [apiService, checkConnectivity]);

  const loadMoreProducts = useCallback(async () => {
    if (!hasMoreProducts || isLoadingMore || !apiService) return;

    const isOnline = await checkConnectivity();
    if (!isOnline) {
      setIsLoadingMore(false);
      return;
    }

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = await apiService.getProducts({ per_page: 20, page: nextPage });
      const transformedProducts = transformProducts(response);

      setProducts(prevProducts => {
        const existingIds = new Set(prevProducts.map(p => p.id));
        const uniqueNewProducts = transformedProducts.filter(p => !existingIds.has(p.id));
        return [...prevProducts, ...uniqueNewProducts];
      });

      setHasMoreProducts(response.length >= 20);
      setCurrentPage(nextPage);
    } catch (err: any) {
      const isOnline = await checkConnectivity();
      if (!isOnline) {
        setErrorProducts('No internet connection. Please check your connection and try again.');
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [apiService, currentPage, hasMoreProducts, isLoadingMore, checkConnectivity]);

  const fetchCarouselItems = useCallback(async () => {
    setLoadingCarousel(true);
    setCarouselError(null);

    const isOnline = await checkConnectivity();
    if (!isOnline) {
      setCarouselError('No internet connection. Please check your connection and try again.');
      setLoadingCarousel(false);
      return;
    }

    try {
      const items = await fetchCarousels();
      setCarouselItems(items);
    } catch (err: any) {
      const isOnline = await checkConnectivity();
      if (!isOnline) {
        setCarouselError('No internet connection. Please check your connection and try again.');
      } else {
        console.error('Error fetching carousel items:', err);
        setCarouselError(err.message || 'Failed to load carousel');
      }
    } finally {
      setLoadingCarousel(false);
    }
  }, [checkConnectivity]);

  const fetchCategories = useCallback(async () => {
    if (!apiService) return;

    const isOnline = await checkConnectivity();
    if (!isOnline) {
      setErrorCategories('No internet connection. Please check your connection and try again.');
      setLoadingCategories(false);
      return;
    }

    setLoadingCategories(true);
    setErrorCategories(null);
    try {
      const response = await apiService.getCategories();
      const formattedCategories = transformCategories(response);
      setCategories(formattedCategories);
    } catch (err: any) {
      const isOnline = await checkConnectivity();
      if (!isOnline) {
        setErrorCategories('No internet connection. Please check your connection and try again.');
      } else {
        setErrorCategories(err.message || 'An unexpected error occurred');
      }
    } finally {
      setLoadingCategories(false);
    }
  }, [apiService, checkConnectivity]);

  // OPTIMIZED: Fetch featured products with ref-based caching
  const fetchFeaturedProducts = useCallback(async () => {
    if (!apiService) return;

    // Don't show loading if we already have data (stale-while-revalidate)
    if (featuredProducts.length === 0 && !hasFeaturedRef.current) {
      setLoadingFeatured(true);
    }
    setErrorFeatured(null);

    try {
      // Try to fetch from 'daily-deals' category first
      try {
        const products = await apiService.getProducts({
          category: 'daily-deals',
          per_page: FEATURED_PRODUCTS_LIMIT,
          status: 'publish',
        });

        if (products && products.length > 0) {
          const transformed = transformProducts(products);
          setFeaturedProducts(transformed);
          setLoadingFeatured(false);
          hasFeaturedRef.current = true;
          return;
        }
      } catch (slugError) {
        console.warn('Failed to fetch by slug, trying featured products:', slugError);
      }

      // Fallback: Fetch featured products
      try {
        const products = await apiService.getProducts({
          featured: true,
          per_page: FEATURED_PRODUCTS_LIMIT,
          status: 'publish',
        });

        if (products && products.length > 0) {
          const transformed = transformProducts(products);
          setFeaturedProducts(transformed);
          setLoadingFeatured(false);
          hasFeaturedRef.current = true;
          return;
        }
      } catch (featuredError) {
        console.warn('Failed to fetch featured products:', featuredError);
      }

      // Final fallback: Fetch latest products
      const products = await apiService.getProducts({
        per_page: FEATURED_PRODUCTS_LIMIT,
        status: 'publish',
        orderby: 'date',
        order: 'desc',
      });

      const transformed = transformProducts(products);
      setFeaturedProducts(transformed);
      hasFeaturedRef.current = true;

    } catch (error: any) {
      console.error('Error fetching featured products:', error);
      // Silently fail - keep existing data if available
      if (featuredProducts.length === 0) {
        setErrorFeatured('Failed to load best deals');
      }
    } finally {
      setLoadingFeatured(false);
    }
  }, [apiService, featuredProducts.length]);

  // OPTIMIZED: Stagger API calls - load visible content first
  useEffect(() => {
    if (!apiService) return;

    // Load visible content first (carousel + categories)
    Promise.all([
      fetchCarouselItems(),
      fetchCategories(),
    ]).then(() => {
      // Then load below-the-fold content
      Promise.all([
        fetchProducts(),
        fetchFeaturedProducts(),
      ]);
    }).catch(err => console.error('Staggered fetch error:', err));

    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [apiService, isAuthenticated]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const isOnline = await checkConnectivity();
    if (isOnline) {
      await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchFeaturedProducts(),
        fetchCarouselItems(),
      ]);
      if (isAuthenticated) {
        await fetchWishlist();
      }
    } else {
      setErrorProducts('No internet connection. Please check your connection and try again.');
    }
    setRefreshing(false);
  }, [isAuthenticated, checkConnectivity, fetchFeaturedProducts]);

  const handleSeeAllProducts = () => {
    router.push('/products');
  };

  const handleCarouselItemPress = useCallback((item: any) => {
    console.log('Carousel item pressed:', item);
    if (item.linkType === 'product') {
      router.push(`/product/${item.linkValue}` as any);
    } else if (item.linkType === 'category') {
      router.push(`/category/${item.linkValue}` as any);
    } else if (item.linkType === 'external') {
      console.log('External link:', item.linkValue);
    } else {
      router.push('/');
    }
  }, [router]);

  // OPTIMIZED: Memoized callbacks for list items
  const handleProductPress = useCallback((id: number) => {
    router.push(`/product/${id}` as any);
  }, [router]);

  const handleCategoryPress = useCallback((id: string | number) => {
    router.push(`/category/${id}` as any);
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
      }, 1500);
    } catch (error) {
      console.error("Add to cart error:", error);
      // Revert optimistic update on error
      setCartCount(prev => prev - 1);
    }
  };

  // OPTIMIZED: FlashList data sections
  const sections: SectionType[] = [
    { type: 'header' },
    { type: 'search' },
    { type: 'carousel' },
    { type: 'categories' },
    { type: 'bestDeals' },
    { type: 'banner' },
    { type: 'products' },
  ];

  // OPTIMIZED: Render sections with FlashList
  const renderSection = useCallback(({ item }: { item: SectionType }) => {
    switch (item.type) {
      case 'header':
        return (
          <View style={styles.headerSpacer}>
            <Animated.View style={[
              styles.header,
              {
                backgroundColor: colors.background,
                opacity: headerOpacity,
                transform: [{ translateY: headerTranslateY }],
              }
            ]}>
              <View>
                <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                  {isAuthenticated && user ? `Hello, ${user.first_name || 'User'}` : 'Hello'}
                </Text>
                <Text style={[styles.title, { color: colors.text }]}>Discover the best tech!</Text>
              </View>
              <View style={styles.headerIcons} />
            </Animated.View>
          </View>
        );

      case 'search':
        return (
          <View style={styles.searchWrapper}>
            <View style={[
              styles.searchContainer,
              {
                backgroundColor: colors.surface,
                borderRadius: 24
              }
            ]}>
              <Ionicons name="search" size={20} color={colors.textSecondary} style={{ marginLeft: 12 }} />
              <TextInput
                style={[styles.searchPlaceholder, { color: colors.text, flex: 1 }]}
                placeholder="Search products..."
                placeholderTextColor={colors.textSecondary}
                onFocus={() => router.push('/search')}
              />
            </View>
          </View>
        );

      case 'carousel':
        return <InstagramCarousel data={carouselItems} onItemPress={handleCarouselItemPress} />;

      case 'categories':
        return (
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
                    <CategoryItem
                      key={category.category_id}
                      category={category}
                      colors={colors}
                      onPress={() => handleCategoryPress(category.category_id)}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        );

      case 'bestDeals':
        return (
          <BestDealsSection
            featuredProducts={featuredProducts}
            loadingFeatured={loadingFeatured}
            errorFeatured={errorFeatured}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
            apiService={apiService}
            onRefresh={fetchFeaturedProducts}
          />
        );

      case 'banner':
        return <MarketingBanner />;

      case 'products':
        return (
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
              errorProducts.includes('internet connection') || errorProducts.includes('No internet') ? (
                <NetworkError
                  title="No Internet Connection"
                  message="Please check your connection and try again"
                  onRetry={onRefresh}
                />
              ) : (
                <View style={styles.errorContainer}>
                  <Text style={[styles.errorText, { color: colors.error }]}>Error loading products: {errorProducts}</Text>
                  <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: colors.primary }]}
                    onPress={onRefresh}
                  >
                    <Text style={[styles.retryButtonText, { color: colors.white }]}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )
            ) : products.length === 0 ? (
              <Text style={[styles.noProductsText, { color: colors.textSecondary }]}>No products found.</Text>
            ) : (
              <View style={styles.productsGrid}>
                {products.map((product) => (
                  <ProductItem
                    key={product.id}
                    product={product}
                    colors={colors}
                    wishlist={wishlist}
                    cartSuccess={cartSuccess}
                    onProductPress={() => handleProductPress(product.id)}
                    onToggleWishlist={(e: any) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    onAddToCart={(e: any) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                  />
                ))}
                {isLoadingMore && (
                  <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                )}
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  }, [
    colors,
    headerOpacity,
    headerTranslateY,
    isAuthenticated,
    user,
    carouselItems,
    loadingCategories,
    errorCategories,
    categories,
    featuredProducts,
    loadingFeatured,
    errorFeatured,
    wishlist,
    loadingProducts,
    errorProducts,
    products,
    isLoadingMore,
    cartSuccess,
    handleCarouselItemPress,
    handleCategoryPress,
    handleProductPress,
    toggleWishlist,
    addToCart,
    onRefresh,
    fetchFeaturedProducts,
    apiService,
    router,
  ]);

  // Get estimated item sizes for FlashList optimization
  const getEstimatedItemSize = (item: SectionType) => {
    switch (item.type) {
      case 'header': return 60;
      case 'search': return 60;
      case 'carousel': return 200;
      case 'categories': return 180;
      case 'bestDeals': return 280;
      case 'banner': return 150;
      case 'products': return 450;
      default: return 200;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sticky Header - positioned absolutely */}
      <Animated.View style={[
        styles.stickyHeader, 
        {
          backgroundColor: colors.background,
          opacity: fadeAnim,
          transform: [{ translateY: headerTranslateY }],
        }
      ]}>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/search')}>
            <Ionicons name="search" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* OPTIMIZED: FlashList with virtualized rendering */}
      <FlashList<SectionType>
        data={sections}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderSection}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { 
            useNativeDriver: true,
            listener: (event: NativeScrollEvent) => {
              // Only check bottom for pagination - no setState
              const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
              if (layoutMeasurement && contentSize) {
                const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 500;
                if (isCloseToBottom && hasMoreProducts && !isLoadingMore) {
                  loadMoreProducts();
                }
              }
            }
          }
        )}
        scrollEventThrottle={16}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stickyHeader: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 25,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerSpacer: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 14,
  },
  title: {
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
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 24,
    flex: 1,
  },
  searchPlaceholder: {
    marginLeft: 6,
    fontSize: 13,
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
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
    paddingBottom: 20,
  },
  loadingMoreContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIndicator: {
    marginTop: 20,
    marginBottom: 20,
  },
  categoryCard: {
    width: '30%',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryImageContainer: {
    position: 'relative',
    width: '100%',
  },
  categoryItemImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  categoryItemImagePlaceholder: {
    width: '100%',
    height: 120,
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
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
  },
  productImage: {
    width: '100%',
    height: 200,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  retryButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
