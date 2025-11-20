import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
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

export default function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { apiService } = useAuth();
  const { setCartCount } = useCart();
  const [loadingCarousel, setLoadingCarousel] = useState(false);
  const [carouselItems, setCarouselItems] = useState<any[]>([
    {
      id: '1',
      title: 'Premium Tech Collection',
      subtitle: 'New arrivals with exclusive offers',
      imageUrl: 'https://images.pexels.com/photos/5632371/pexels-photo-5632371.jpeg',
      linkType: 'category',
      linkValue: 'electronics',
    },
    {
      id: '2',
      title: 'Gaming Setup Essentials',
      subtitle: 'Top products for your gaming station',
      imageUrl: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg',
      linkType: 'category',
      linkValue: 'gaming',
    }
  ]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);
  const [productLimit, setProductLimit] = useState(20); // Initial limit
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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

  const fetchProducts = useCallback(async (limit: number) => {
    if (!apiService) return;
    setLoadingProducts(true);
    setErrorProducts(null);
    try {
      const response = await apiService.getProducts({ limit });
      setProducts(response);
      // Check if we have more products available (assuming the API returns max available)
      setHasMoreProducts(response.length >= limit);
    } catch (err: any) {
      setErrorProducts(err.message || 'An unexpected error occurred');
    } finally {
      setLoadingProducts(false);
    }
  }, [apiService]);

  const loadMoreProducts = useCallback(async () => {
    if (!hasMoreProducts || isLoadingMore || !apiService) return;

    setIsLoadingMore(true);
    try {
      const newLimit = productLimit + 20; // Load 20 more products
      const response = await apiService.getProducts({ limit: newLimit });
      setProducts(response);
      setHasMoreProducts(response.length >= newLimit);
      setProductLimit(newLimit);
    } catch (err: any) {
      setErrorProducts(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoadingMore(false);
    }
  }, [apiService, productLimit, hasMoreProducts, isLoadingMore]);

  const fetchCategories = useCallback(async () => {
    if (!apiService) return;
    setLoadingCategories(true);
    setErrorCategories(null);
    try {
      const response = await apiService.getCategories();
      const formattedCategories = response.map((category: string) => ({
        category_id: category,
        name: category,
      }));
      setCategories(formattedCategories);
    } catch (err: any) {
      setErrorCategories(err.message || 'An unexpected error occurred');
    } finally {
      setLoadingCategories(false);
    }
  }, [apiService]);

  useEffect(() => {
    fetchProducts(productLimit);
    fetchCategories();
    fetchWishlist();
  }, [fetchProducts, fetchCategories, fetchWishlist, productLimit]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts(productLimit);
    await fetchCategories();
    await fetchWishlist();
    setRefreshing(false);
  }, [fetchProducts, fetchCategories, fetchWishlist, productLimit]);


  const handleSeeAllProducts = () => {
    setProductLimit(100); // Increase limit to 100
    router.push('/products'); // Navigate to the full products page
  };

  const handleCarouselItemPress = useCallback((item: any) => {
    console.log('Carousel item pressed:', item);
    // Example: Navigate to a product detail page
    router.push(`/product/${item.id}`);
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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]} // Use theme primary color
          tintColor={colors.primary} // For iOS
        />
      }
      onScroll={(event) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 500; // 500 is our threshold

        if (isCloseToBottom && hasMoreProducts && !isLoadingMore) {
          loadMoreProducts();
        }
      }}
      scrollEventThrottle={16} // 16ms between scroll events (60fps)
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Good Morning!</Text>
          <Text style={[styles.username, { color: colors.text }]}>User Name</Text>
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
            {/* <Ionicons name="star" size={20} color={colors.primary} /> */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Categories</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/categories')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
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
              {categories.slice(0, 3).map((category) => ( // Show only first 3 categories
                <TouchableOpacity
                  key={category.category_id}
                  style={[styles.categoryItem, { backgroundColor: colors.surface, flex: 1, marginHorizontal: 4 }]}
                  onPress={() => router.push(`/products?category=${category.category_id}`)}
                >
                  {/* Add category-specific icons */}
                  <View style={[styles.categoryIconContainer, { backgroundColor: colors.background }]}>
                    {category.name.toLowerCase().includes('phone') || category.name.toLowerCase().includes('smart') ? (
                      <Ionicons name="phone-portrait" size={24} color={colors.primary} />
                    ) : category.name.toLowerCase().includes('laptop') || category.name.toLowerCase().includes('computer') ? (
                      <Ionicons name="laptop" size={24} color={colors.primary} />
                    ) : category.name.toLowerCase().includes('headphone') || category.name.toLowerCase().includes('audio') ? (
                      <Ionicons name="headset" size={24} color={colors.primary} />
                    ) : category.name.toLowerCase().includes('gaming') ? (
                      <Ionicons name="game-controller" size={24} color={colors.primary} />
                    ) : category.name.toLowerCase().includes('tablet') ? (
                      <Ionicons name="tablet-landscape" size={24} color={colors.primary} />
                    ) : category.name.toLowerCase().includes('watch') || category.name.toLowerCase().includes('wearable') ? (
                      <Ionicons name="watch" size={24} color={colors.primary} />
                    ) : category.name.toLowerCase().includes('home') ? (
                      <Ionicons name="home" size={24} color={colors.primary} />
                    ) : category.name.toLowerCase().includes('storage') ? (
                      <Ionicons name="save" size={24} color={colors.primary} />
                    ) : category.name.toLowerCase().includes('monitor') ? (
                      <Ionicons name="desktop" size={24} color={colors.primary} />
                    ) : (
                      <Ionicons name="layers" size={24} color={colors.primary} />
                    )}
                  </View>
                  <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={2}>{category.name.replace('-', ' ')}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Latest Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Latest Products</Text>
          <TouchableOpacity onPress={handleSeeAllProducts}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
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
            {products.slice(0, productLimit).map((product) => (
              <TouchableOpacity
                key={product.id}
                style={[styles.productCard, { backgroundColor: colors.surface }]}
                onPress={() => router.push(`/product/${product.id}`)}
              >
                <SafeImage source={{ uri: product.image }} style={[styles.productImage, { backgroundColor: colors.background }]} />
                {/* Wishlist button - top right */}
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
                  <View style={styles.priceContainer}>
                    <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>{`₦${(product.price * 1.3).toFixed(2)}`}</Text>
                    <Text style={[styles.productPrice, { color: '#d32f2f' }]}>{`₦${product.price.toFixed(2)}`}</Text>
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

      {/* Trending Items */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Trending Items</Text>
          <TouchableOpacity onPress={() => router.push('/products')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
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
                style={[styles.productCard, { backgroundColor: colors.surface }]}
                onPress={() => router.push(`/product/${product.id}`)}
              >
                <SafeImage source={{ uri: product.image }} style={[styles.productImage, { backgroundColor: colors.background }]} />
                {/* Wishlist button - top right */}
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
                {/* Actions overlay on image */}
                <View style={styles.productActionsOverlay}>
                  <TouchableOpacity
                    style={[styles.addToCartButton, { backgroundColor: colors.primary }]}
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
                    <Ionicons name="cart" size={18} color={colors.white} />
                  </TouchableOpacity>
                </View>
                {/* Product details below image */}
                <View style={styles.productDetails}>
                  <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{product.title}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>{`₦${(product.price * 1.3).toFixed(2)}`}</Text>
                    <Text style={[styles.productPrice, { color: '#d32f2f' }]}>{`₦${product.price.toFixed(2)}`}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
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
  categoryItem: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 20, // Add padding to ensure last row is not hidden behind tab bar
  },
  productCard: {
    width: '47%', // Slightly less than 50% to account for gaps
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    height: 200, // Increased height to accommodate image + text
  },
  productImage: {
    width: '100%',
    height: 120, // Fixed height for image to prevent width stretching
  },
  wishlistOverlay: {
    position: 'absolute',
    top: 8,
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
  productTextContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  productPrice: {
    fontSize: 18,
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
});