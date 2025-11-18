import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import SkeletonProductItem from '@/components/SkeletonProductItem';

export default function ProductsScreen() {
  const router = useRouter();
  const { apiService } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderGridView = () => (
    <View style={styles.gridContainer}>
      {filteredProducts.map((product) => (
        <View style={styles.gridItem}>
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => router.push(`/product/${product.id}`)}
          >
            <Image source={{ uri: product.image }} style={styles.productImage} />
            {/* Bottom overlay with blur/opacity */}
            <View style={[styles.productOverlay, { backgroundColor: '#F2F2F7CC' }]}>
              <View style={styles.productTextContainer}>
                <Text style={[styles.productName, { color: '#1D1D1F' }]} numberOfLines={2}>{product.title}</Text>
                <Text style={[styles.productPrice, { color: '#007AFF' }]}>{`₦${product.price.toFixed(2)}`}</Text>
              </View>
              <View style={styles.productActions}>
                <TouchableOpacity
                  style={[styles.addToCartButton, { backgroundColor: '#007AFF' }]}
                  onPress={(e) => {
                    e.stopPropagation(); // Prevent triggering the product detail navigation
                    // Add to cart logic here later if needed
                  }}
                >
                  <Ionicons name="cart" size={18} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.wishlistButton}
                  onPress={async (e) => {
                    e.stopPropagation(); // Prevent triggering the product detail navigation
                    try {
                      const result = await apiService.addToWishlist(product.id);
                      console.log('Added to wishlist:', result);
                    } catch (error) {
                      console.error('Wishlist error:', error);
                    }
                  }}
                >
                  <Ionicons name="heart-outline" size={16} color="#1D1D1F" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderListView = () => (
    <View style={styles.listContainer}>
      {filteredProducts.map((product) => (
        <TouchableOpacity 
          key={product.id} 
          style={styles.listItem}
          onPress={() => router.push(`/product/${product.id}`)}
        >
          <View style={styles.listImageContainer}>
            <Image source={{ uri: product.image }} style={styles.listImage} />
          </View>
          <View style={styles.listProductInfo}>
            <Text style={styles.listProductName} numberOfLines={2}>{product.title}</Text>
            <Text style={styles.categoryText} numberOfLines={1}>{product.category?.replace('-', ' ')}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{product.rating ? product.rating.rate : 0}</Text>
              <Text style={styles.reviewsText}>({product.rating ? product.rating.count : 0})</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{`₦${product.price.toFixed(2)}`}</Text>
            </View>
          </View>
          <View style={styles.listProductActions}>
            <TouchableOpacity style={styles.listWishlistButton} onPress={async () => {
              try {
                const result = await apiService.addToWishlist(product.id);
                console.log('Added to wishlist:', result);
              } catch (error) {
                console.error('Wishlist error:', error);
              }
            }}>
              <Ionicons name="heart-outline" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={20} color="#007AFF" />
          </TouchableOpacity>
          <View style={styles.viewToggle}>
            <TouchableOpacity 
              style={[styles.toggleButton, viewMode === 'grid' && styles.activeToggle]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons name="grid" size={16} color={viewMode === 'grid' ? '#FFFFFF' : '#8E8E93'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'list' && styles.activeToggle]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons name="list" size={16} color={viewMode === 'list' ? '#FFFFFF' : '#8E8E93'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        {loading ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : error ? (
          <Text style={styles.errorText}>Error: {error}</Text>
        ) : (
          <Text style={styles.resultsText}>{filteredProducts.length} products found</Text>
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
          <Text style={styles.errorText}>Error loading products: {error}</Text>
        ) : filteredProducts.length === 0 ? (
          <Text style={styles.noProductsText}>No products found.</Text>
        ) : (
          viewMode === 'grid' ? renderGridView() : renderListView()
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1D1D1F',
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
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: '#007AFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
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
    color: '#1D1D1F',
  },
  resultsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Increased to account for elevated tab bar
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  gridItem: {
    width: '47%',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#E5E5EA',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 12,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12,
    color: '#1D1D1F',
    marginLeft: 4,
    fontWeight: '500',
  },
  reviewsText: {
    fontSize: 12,
    color: '#8E8E93',
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
    color: '#007AFF',
  },
  originalPrice: {
    fontSize: 12,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  outOfStock: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '500',
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
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
  listDiscountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  listProductInfo: {
    flex: 1,
    padding: 12,
  },
  listProductName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 6,
  },
  listProductActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  listWishlistButton: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIndicator: {
    marginTop: 50,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
    fontSize: 16,
  },
  noProductsText: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 20,
    fontSize: 16,
  },
  productCard: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E5EA',
  },
  productOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  productTextContainer: {
    flex: 1,
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  addToCartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  wishlistButton: {
    padding: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});