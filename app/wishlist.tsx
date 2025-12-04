import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import SkeletonProductItem from '@/components/SkeletonProductItem';
import SkeletonLoader from '@/components/SkeletonLoader';
import BackButton from '@/components/BackButton';
import SafeImage from '@/components/SafeImage';

export default function WishlistScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { apiService } = useAuth();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const response = await apiService.getWishlist();
        setWishlist(response);
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const removeFromWishlist = async (productId: number) => {
    try {
      await apiService.removeFromWishlist(productId);
      setWishlist(wishlist.filter(item => item.id !== productId));
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    }
  };

  const addToCart = async (product: any) => {
    try {
      await apiService.addToCart(product.id, 1);
      removeFromWishlist(product.id);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <BackButton />
          <Text style={[styles.title, { color: colors.text }]}>Wishlist</Text>
          <SkeletonLoader width={60} height={16} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <SkeletonProductItem viewMode="list" />
          <SkeletonProductItem viewMode="list" />
          <SkeletonProductItem viewMode="list" />
          <SkeletonProductItem viewMode="list" />
        </ScrollView>
      </View>
    );
  }

  if (wishlist.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <BackButton />
          <Text style={[styles.title, { color: colors.text }]}>Wishlist</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Your wishlist is empty</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Add items to your wishlist to see them here</Text>
          <TouchableOpacity
            style={[styles.browseButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={[styles.browseButtonText, { color: colors.white }]}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={[styles.title, { color: colors.text }]}>Wishlist</Text>
        <Text style={[styles.itemCount, { color: colors.textSecondary }]}>{wishlist.length} items</Text>
      </View>

      {/* Wishlist Items */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.gridContainer}>
          {wishlist.map((item) => {
            // Fix image source - use images array if available
            const imageUrl = item.images?.[0]?.src || item.image || '';
            // Handle both WooCommerce format (name) and transformed format (title)
            const productName = item.name || item.title || 'Product';
            // Handle price - WooCommerce returns string, ensure it's a number
            const productPrice = typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0);
            const formattedPrice = productPrice.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            return (
              <View key={item.id} style={[styles.gridItem, { backgroundColor: colors.surface }]}>
                <TouchableOpacity
                  style={styles.gridImageContainer}
                  onPress={() => router.push(`/product/${item.id}`)}
                >
                  <SafeImage source={{ uri: imageUrl }} style={styles.gridImage} resizeMode="cover" />
                  <TouchableOpacity
                    style={[styles.removeButtonAbsolute, { backgroundColor: 'rgba(255,255,255,0.8)' }]}
                    onPress={() => removeFromWishlist(item.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.wishlistAddToCartButton, { backgroundColor: colors.primary }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                  >
                    <Ionicons name="cart" size={18} color={colors.white} />
                  </TouchableOpacity>
                </TouchableOpacity>

                <View style={styles.gridInfo}>
                  <Text style={[styles.gridName, { color: colors.text }]} numberOfLines={2}>{productName}</Text>
                  <View style={styles.gridPriceRow}>
                    <Text style={[styles.gridPrice, { color: '#FFA500' }]}>₦{formattedPrice}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  itemCount: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 10, // Reduced padding for grid
  },
  scrollContent: {
    paddingBottom: 100,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%', // 2 columns with spacing
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gridImageContainer: {
    width: '100%',
    height: 150,
    position: 'relative',
  },
  wishlistAddToCartButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF', // Default primary color
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  removeButtonAbsolute: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridInfo: {
    padding: 12,
  },
  gridName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    height: 40, // Fixed height for 2 lines
  },
  gridPriceRow: {
    marginBottom: 12,
  },
  gridPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  gridAddToCartButton: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  gridAddToCartText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Keep empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  browseButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});