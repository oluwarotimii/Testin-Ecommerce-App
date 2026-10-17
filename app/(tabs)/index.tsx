import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import SafeImage from '@/components/SafeImage';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useNetwork } from '@/context/NetworkContext';
import InstagramCarousel from '@/components/InstagramCarousel';
import { useThemeColors } from '@/hooks/useColorScheme';
import {
  BellIcon,
  MagnifyingGlassIcon,
  ImageIcon,
  HeartIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
} from 'phosphor-react-native';
import SkeletonLoader from '@/components/SkeletonLoader';
import SkeletonProductItem from '@/components/SkeletonProductItem';
import { transformProducts, transformCategories } from '@/utils/woocommerceTransformers';
import { formatPrice } from '@/utils/formatNumber';
import MarketingBanner from '@/components/MarketingBanner';
import { fetchCarousels } from '@/services/carousel';
import BestDealsSection from '@/components/BestDealsSection';
import NetworkError from '@/components/NetworkError';
import SalePill from '@/components/SalePill';
import { FEATURED_PRODUCTS_LIMIT } from '@/services/config';
import { spacing, radius, typeScale, fontFamily, shadow } from '@/constants/designTokens';
import { useResponsiveColumns } from '@/hooks/useResponsiveColumns';

// Section types for FlashList
type SectionType =
  | { type: 'header' }
  | { type: 'carousel' }
  | { type: 'products' }
  | { type: 'categories' }
  | { type: 'bestDeals' }
  | { type: 'banner' };

// Memoized Category Item - prevents re-renders when parent state changes
const CategoryItem = memo(({ category, colors, isDarkMode, onPress }: { 
  category: any; 
  colors: any; 
  isDarkMode: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.categoryCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.categoryImageCircle, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7' }]}>
      {category.image ? (
        <SafeImage
          source={{ uri: category.image }}
          style={styles.categoryItemImage}
        />
      ) : (
        <ImageIcon size={24} color={colors.textSecondary} />
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
  cardWidthPercent,
  onProductPress,
  onToggleWishlist,
  onAddToCart
}: {
  product: any;
  colors: any;
  wishlist: number[];
  cartSuccess: { [key: number]: boolean };
  cardWidthPercent: number;
  onProductPress: () => void;
  onToggleWishlist: (e: any) => void;
  onAddToCart: (e: any) => void;
}) => {
  const isInWishlist = wishlist.includes(product.id);
  const isDarkMode = String(colors.background).toLowerCase() === '#000000';
  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price || '0');
  const originalPrice = typeof product.original_price === 'number' ? product.original_price : parseFloat(product.original_price || '0');
  const isOnSale = originalPrice > price;
  const percentOff = isOnSale ? ((originalPrice - price) / originalPrice) * 100 : 0;

  return (
    <TouchableOpacity
      key={product.id}
      style={[styles.productCard, { backgroundColor: colors.surface, width: `${cardWidthPercent}%` }]}
      onPress={onProductPress}
    >
      <View style={styles.productImageContainer}>
        <SafeImage
          source={{ uri: product.image }}
          style={[styles.productImage, { backgroundColor: colors.background }]}
        />
        {isOnSale && (
          <View style={styles.saleBadge}>
            <SalePill percentOff={percentOff} />
          </View>
        )}
        <View style={styles.wishlistOverlay}>
          <TouchableOpacity
            style={[styles.wishlistButton, { backgroundColor: colors.surface }]}
            onPress={onToggleWishlist}
          >
            <HeartIcon
              weight={isInWishlist ? 'fill' : 'regular'}
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
            <ShoppingCartIcon weight="fill" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
        {cartSuccess[product.id] && (
          <View style={styles.successOverlay}>
            <CheckCircleIcon weight="fill" size={24} color="#4CD964" />
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
          {product.title}
        </Text>
        <View style={styles.priceRow}>
          {isOnSale && (
            <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
              {formatPrice(originalPrice)}
            </Text>
          )}
          <Text style={[styles.productPrice, { color: isDarkMode ? colors.white : colors.primary }]}>
            {formatPrice(price)}
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
  const isDarkMode = String(colors.background).toLowerCase() === '#000000';
  const { apiService, user, isAuthenticated } = useAuth();
  const { setCartCount } = useCart();
  const { checkConnectivity } = useNetwork();

  // Column count adapts to screen width (phones vs tablets) instead of a
  // hardcoded 2-up grid; card width then derives from that so the grid
  // actually fills wider screens instead of leaving dead space.
  const numColumns = useResponsiveColumns(2);
  const cardWidthPercent = numColumns >= 4 ? 23 : numColumns === 3 ? 31 : 47;

  // OPTIMIZED: Use Animated.Value directly for scroll - no useState re-renders
  const scrollY = useRef(new Animated.Value(0)).current;

  // Derived animated values for header animation (computed on native thread)
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Crossfades in just after the inline header has scrolled out of view -
  // was previously driven by the raw scroll offset fed straight into
  // `opacity` (clamps to 1 after ~1px of scroll, not an intentional fade).
  const stickyHeaderOpacity = scrollY.interpolate({
    inputRange: [80, 120],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  // Opacity alone doesn't stop touches - without this, the sticky search
  // bar would still intercept taps meant for the inline header underneath
  // it while invisible at the top of the scroll.
  const [showStickySearch, setShowStickySearch] = useState(false);

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [-20, 0],
    extrapolate: 'clamp',
  });

  // Carousel state
  const [, setLoadingCarousel] = useState(true);
  const [carouselItems, setCarouselItems] = useState<any[]>([]);
  const [, setCarouselError] = useState<string | null>(null);

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

  // iOS FIX: Retry connectivity check with delays (iOS network stack loads slower on cold start)
  const checkConnectivityWithRetry = useCallback(async (retries = 3, delayMs = 400) => {
    for (let i = 0; i < retries; i++) {
      const isOnline = await checkConnectivity();
      if (isOnline) return true;
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    return false;
  }, [checkConnectivity]);

  const fetchProducts = useCallback(async () => {
    if (!apiService) return;

    // iOS FIX: Use retry logic for connectivity check
    const isOnline = await checkConnectivityWithRetry();
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
      const stillOnline = await checkConnectivityWithRetry();
      if (!stillOnline) {
        setErrorProducts('No internet connection. Please check your connection and try again.');
      } else {
        console.error('Error fetching products:', err);
        setErrorProducts('Unable to load products right now. Please try again.');
      }
    } finally {
      setLoadingProducts(false);
    }
  }, [apiService, checkConnectivityWithRetry]);

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
    } catch {
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

    // iOS FIX: Use retry logic for connectivity check
    const isOnline = await checkConnectivityWithRetry();
    if (!isOnline) {
      setCarouselError('No internet connection. Please check your connection and try again.');
      setLoadingCarousel(false);
      return;
    }

    try {
      const items = await fetchCarousels();
      setCarouselItems(items);
    } catch (err: any) {
      const stillOnline = await checkConnectivityWithRetry();
      if (!stillOnline) {
        setCarouselError('No internet connection. Please check your connection and try again.');
      } else {
        console.error('Error fetching carousel items:', err);
        setCarouselError('Failed to load carousel. Please try again.');
      }
    } finally {
      setLoadingCarousel(false);
    }
  }, [checkConnectivityWithRetry]);

  const fetchCategories = useCallback(async () => {
    if (!apiService) return;

    // iOS FIX: Use retry logic for connectivity check
    const isOnline = await checkConnectivityWithRetry();
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
      const stillOnline = await checkConnectivityWithRetry();
      if (!stillOnline) {
        setErrorCategories('No internet connection. Please check your connection and try again.');
      } else {
        console.error('Error fetching categories:', err);
        setErrorCategories('Unable to load categories right now. Please try again.');
      }
    } finally {
      setLoadingCategories(false);
    }
  }, [apiService, checkConnectivity]);

  // OPTIMIZED: Fetch featured products from 'daily-deals' category only
  const fetchFeaturedProducts = useCallback(async () => {
    if (!apiService) return;

    // iOS FIX: Use retry logic for connectivity check
    const isOnline = await checkConnectivityWithRetry();
    if (!isOnline) {
      setErrorFeatured('No internet connection. Please check your connection and try again.');
      setLoadingFeatured(false);
      return;
    }

    // Don't show loading if we already have data (stale-while-revalidate)
    if (featuredProducts.length === 0 && !hasFeaturedRef.current) {
      setLoadingFeatured(true);
    }
    setErrorFeatured(null);

    try {
      // Use getProductsByCategory which properly handles slug-to-ID resolution
      const products = await apiService.getProductsByCategory?.('daily-deals', FEATURED_PRODUCTS_LIMIT);

      if (products && products.length > 0) {
        setFeaturedProducts(transformProducts(products));
      } else {
        // No products in daily-deals category - show empty state
        setFeaturedProducts([]);
      }
      hasFeaturedRef.current = true;
    } catch {
      // Silently fail - keep existing data if available
      if (featuredProducts.length === 0) {
        setErrorFeatured('Failed to load best deals');
      }
    } finally {
      setLoadingFeatured(false);
    }
  }, [apiService, checkConnectivityWithRetry, featuredProducts.length]);

  // OPTIMIZED: Stagger API calls - load visible content first
  useEffect(() => {
    if (!apiService) return;

    // iOS FIX: Add small delay on cold start to let network stack initialize
    const initFetch = async () => {
      // Wait 500ms on first launch to ensure network is ready (iOS fix)
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        // Wave 1: load visible content first (carousel + categories)
        await Promise.all([
          fetchCarouselItems(),
          fetchCategories(),
        ]);

        // Wave 2: below-the-fold content, only once wave 1 has landed -
        // keeps cold start from firing 4-5 requests at once
        await Promise.all([
          fetchProducts(),
          fetchFeaturedProducts(),
        ]);
      } catch (err) {
        console.error('Staggered fetch error:', err);
      }

      if (isAuthenticated) {
        await fetchWishlist();
      }
    };

    initFetch().catch(err => console.error('Init fetch error:', err));
  }, [apiService, isAuthenticated]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // iOS FIX: Use retry logic for connectivity check
    const isOnline = await checkConnectivityWithRetry();
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
  }, [isAuthenticated, checkConnectivityWithRetry, fetchFeaturedProducts]);

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

  // A product can legitimately sit in the 'daily-deals' category AND be
  // among the newest published products, so Best Deals and Latest Products
  // can overlap even with correct fetch logic on both sides. Hiding
  // featured IDs from the Latest Products grid guarantees no repeated
  // product cards between the two sections regardless of how the store's
  // catalog/categories are set up.
  const featuredProductIds = useMemo(
    () => new Set(featuredProducts.map((p: any) => p.id)),
    [featuredProducts]
  );
  const displayedProducts = useMemo(
    () => products.filter((p: any) => !featuredProductIds.has(p.id)),
    [products, featuredProductIds]
  );

  // OPTIMIZED: FlashList data sections
  const sections: SectionType[] = [
    { type: 'header' },
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
              <View style={styles.headerTopRow}>
                <Text style={[styles.greeting, { color: colors.text }]}>
                  {isAuthenticated && user ? `Hello, ${user.first_name || 'User'}` : 'Hello'}
                </Text>
                <TouchableOpacity
                  style={[styles.bellButton, { backgroundColor: colors.surface }]}
                  onPress={() => router.push('/notifications')}
                >
                  <BellIcon size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.searchBar, { backgroundColor: colors.surface }]}
                onPress={() => router.push('/search')}
                activeOpacity={0.7}
              >
                <MagnifyingGlassIcon size={18} color={colors.textSecondary} />
                <Text style={[styles.searchBarPlaceholder, { color: colors.textSecondary }]}>Search products</Text>
              </TouchableOpacity>
            </Animated.View>
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
                  <SkeletonLoader width={80} height={100} borderRadius={40} style={styles.skeletonCategoryItem} />
                  <SkeletonLoader width={80} height={100} borderRadius={40} style={styles.skeletonCategoryItem} />
                  <SkeletonLoader width={80} height={100} borderRadius={40} style={styles.skeletonCategoryItem} />
                </View>
              ) : errorCategories ? (
                <Text style={[styles.errorText, { color: colors.error }]}>Error loading categories: {errorCategories}</Text>
              ) : categories.length === 0 ? (
                <Text style={[styles.noProductsText, { color: colors.textSecondary }]}>No categories found.</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
                  {categories.map((category) => (
                    <CategoryItem
                      key={category.category_id}
                      category={category}
                      colors={colors}
                      isDarkMode={isDarkMode}
                      onPress={() => handleCategoryPress(category.category_id)}
                    />
                  ))}
                </ScrollView>
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
            ) : displayedProducts.length === 0 ? (
              <Text style={[styles.noProductsText, { color: colors.textSecondary }]}>No products found.</Text>
            ) : (
              <View style={styles.productsGrid}>
                {displayedProducts.map((product) => (
                  <ProductItem
                    key={product.id}
                    product={product}
                    colors={colors}
                    wishlist={wishlist}
                    cartSuccess={cartSuccess}
                    cardWidthPercent={cardWidthPercent}
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
    displayedProducts,
    cardWidthPercent,
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sticky search bar - same tap target as the inline header's, just
          persisted once that's scrolled out of view */}
      <Animated.View
        pointerEvents={showStickySearch ? 'auto' : 'none'}
        style={[
          styles.stickyHeader,
          {
            backgroundColor: colors.background,
            opacity: stickyHeaderOpacity,
          }
        ]}
      >
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: colors.surface }]}
          onPress={() => router.push('/search')}
          activeOpacity={0.7}
        >
          <MagnifyingGlassIcon size={18} color={colors.textSecondary} />
          <Text style={[styles.searchBarPlaceholder, { color: colors.textSecondary }]}>Search products</Text>
        </TouchableOpacity>
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
        onScroll={(event) => {
          // Update scroll position for header animation (JS driver)
          const offsetY = event.nativeEvent.contentOffset.y;
          scrollY.setValue(offsetY);

          const shouldShowSticky = offsetY > 100;
          setShowStickySearch(prev => (prev === shouldShowSticky ? prev : shouldShowSticky));

          // Pagination check
          const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
          if (layoutMeasurement && contentSize) {
            const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 500;
            if (isCloseToBottom && hasMoreProducts && !isLoadingMore) {
              loadMoreProducts();
            }
          }
        }}
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
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerSpacer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  header: {
    gap: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: typeScale.headline,
    fontFamily: fontFamily.display.bold,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
  },
  searchBarPlaceholder: {
    fontSize: typeScale.bodyLarge,
    fontFamily: fontFamily.regular,
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
    fontSize: typeScale.title,
    fontFamily: fontFamily.display.bold,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  categoriesScroll: {
    gap: 16,
    paddingBottom: 8,
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
  categoryCard: {
    width: 80,
    alignItems: 'center',
  },
  categoryImageCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  categoryItemImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  categoryName: {
    fontSize: 11,
    textAlign: 'center',
    fontFamily: fontFamily.semiBold,
    marginTop: 8,
    maxWidth: 80,
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
    borderRadius: radius.xl,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
  },
  productImage: {
    width: '100%',
    height: 200,
  },
  saleBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
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
    fontSize: typeScale.body,
    fontFamily: fontFamily.medium,
    marginBottom: 6,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: typeScale.caption,
    fontFamily: fontFamily.regular,
    textDecorationLine: 'line-through',
  },
  productPrice: {
    fontSize: typeScale.bodyLarge,
    fontFamily: fontFamily.bold,
  },
  seeAllButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },
  seeAllButtonText: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
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
    borderRadius: radius.pill,
    minWidth: 120,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
  },
});
