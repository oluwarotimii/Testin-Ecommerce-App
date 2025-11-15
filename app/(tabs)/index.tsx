import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import InstagramCarousel from '@/components/InstagramCarousel';
import { useThemeColors } from '@/hooks/useColorScheme';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { apiService } = useAuth();
  const [loadingCarousel, setLoadingCarousel] = useState(false);
  const [carouselItems, setCarouselItems] = useState([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);
  const [productLimit, setProductLimit] = useState(20); // Initial limit
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = useCallback(async (limit: number) => {
    if (!apiService) return;
    setLoadingProducts(true);
    setErrorProducts(null);
    try {
      const response = await apiService.getProducts({ limit });
      setProducts(response);
    } catch (err: any) {
      setErrorProducts(err.message || 'An unexpected error occurred');
    } finally {
      setLoadingProducts(false);
    }
  }, [apiService]);

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
  }, [fetchProducts, fetchCategories, productLimit]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts(productLimit);
    await fetchCategories();
    setRefreshing(false);
  }, [fetchProducts, fetchCategories, productLimit]);

  const handleRefresh = useCallback(() => {
    fetchProducts(productLimit);
    fetchCategories();
  }, [fetchProducts, fetchCategories, productLimit]);

  const handleSeeAllProducts = () => {
    setProductLimit(100); // Increase limit to 100
    router.push('/products'); // Navigate to the full products page
  };

  const handleCarouselItemPress = useCallback((item: any) => {
    console.log('Carousel item pressed:', item);
    // Example: Navigate to a product detail page
    router.push(`/product/${item.id}`); 
  }, [router]);

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
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Good Morning!</Text>
          <Text style={[styles.username, { color: colors.text }]}>User Name</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleRefresh}
          >
            <Ionicons name="refresh" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/wishlist')}>
            <Ionicons name="heart" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        style={[styles.searchContainer, { backgroundColor: colors.surface }]}
        onPress={() => router.push('/search')}
      >
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>Search products...</Text>
      </TouchableOpacity>

      {/* Carousel */}
      {loadingCarousel ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />
      ) : (
        <InstagramCarousel 
          data={carouselItems} 
          onItemPress={handleCarouselItemPress}
        />
      )}

      {/* Featured Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="star" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Categories</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/categories')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {loadingCategories ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : errorCategories ? (
            <Text style={[styles.errorText, { color: colors.error }]}>Error loading categories: {errorCategories}</Text>
          ) : categories.length === 0 ? (
            <Text style={[styles.noProductsText, { color: colors.textSecondary }]}>No categories found.</Text>
          ) : (
            categories.map((category) => (
              <TouchableOpacity 
                key={category.category_id} 
                style={[styles.categoryItem, { backgroundColor: colors.surface }]}
                onPress={() => router.push(`/products?category=${category.category_id}`)}
              >
                {/* Assuming category.image is available for category icon */}
                {category.image && <Image source={{ uri: category.image }} style={styles.categoryImage} />}
                <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
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
          <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />
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
                <Image source={{ uri: product.image }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{product.title}</Text>
                  <View style={styles.productRating}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={[styles.ratingText, { color: colors.textSecondary }]}>{product.rating ? product.rating.rate : 0}</Text>
                  </View>
                  <Text style={[styles.productPrice, { color: colors.primary }]}>{`$${product.price}`}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Promo Banner - Replace with dynamic content from API */}
      {/* <TouchableOpacity style={[styles.promoBanner, { backgroundColor: colors.primary }]}>
        <Text style={[styles.promoTitle, { color: colors.white }]}>Dynamic Offer!</Text>
        <Text style={[styles.promoSubtitle, { color: colors.white }]}>Fetched from API</Text>
        <Text style={[styles.promoCode, { color: colors.white }]}>CODE123</Text>
      </TouchableOpacity> */}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
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
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
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
    paddingHorizontal: 20,
    gap: 16,
  },
  categoryItem: {
    alignItems: 'center',
    width: 80,
    paddingVertical: 12,
    borderRadius: 12,
  },
  categoryImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    paddingHorizontal: 20,
    gap: 16,
  },
  productCard: {
    width: '47%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#E5E5EA',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
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
});