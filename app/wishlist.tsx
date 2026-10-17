import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import { HeartIcon, TrashIcon, ShoppingCartIcon } from 'phosphor-react-native';
import SkeletonProductItem from '@/components/SkeletonProductItem';
import SkeletonLoader from '@/components/SkeletonLoader';
import BackButton from '@/components/BackButton';
import SafeImage from '@/components/SafeImage';
import Button from '@/components/Button';
import { radius, fontFamily, shadow } from '@/constants/designTokens';
import { useResponsiveColumns } from '@/hooks/useResponsiveColumns';

export default function WishlistScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const isDarkMode = String(colors.background).toLowerCase() === '#000000';
  const { apiService } = useAuth();
  const isFocused = useIsFocused();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const numColumns = useResponsiveColumns(2);
  const gridItemWidthPercent = numColumns >= 4 ? 23 : numColumns === 3 ? 31 : 48;

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getWishlist();
      setWishlist(response);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  // Refetch on every focus - without this, adding/removing an item from the
  // product page and coming back here showed whatever this tab had loaded
  // on its last mount, making wishlist changes look like they didn't save.
  useEffect(() => {
    if (isFocused) {
      fetchWishlist();
    }
  }, [isFocused, fetchWishlist]);

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
          <HeartIcon weight="regular" size={80} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Your wishlist is empty</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Add items to your wishlist to see them here</Text>
          <Button title="Browse Products" onPress={() => router.push('/(tabs)')} fullWidth={false} style={styles.browseButton} />
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
              <View key={item.id} style={[styles.gridItem, { backgroundColor: colors.surface, width: `${gridItemWidthPercent}%` }]}>
                <TouchableOpacity
                  style={styles.gridImageContainer}
                  onPress={() => router.push(`/product/${item.id}`)}
                >
                  <SafeImage source={{ uri: imageUrl }} style={styles.gridImage} resizeMode="cover" />
                  <TouchableOpacity
                    style={[styles.removeButtonAbsolute, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.8)' }]}
                    onPress={() => removeFromWishlist(item.id)}
                  >
                    <TrashIcon weight="regular" size={20} color={colors.error} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.wishlistAddToCartButton, { backgroundColor: colors.primary }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                  >
                    <ShoppingCartIcon weight="fill" size={18} color={colors.white} />
                  </TouchableOpacity>
                </TouchableOpacity>

                <View style={styles.gridInfo}>
                  <Text style={[styles.gridName, { color: colors.text }]} numberOfLines={2}>{productName}</Text>
                  <View style={styles.gridPriceRow}>
                    <Text style={[styles.gridPrice, { color: isDarkMode ? colors.white : colors.primary }]}>₦{formattedPrice}</Text>
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
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: fontFamily.bold,
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
    borderRadius: radius.xl,
    marginBottom: 16,
    overflow: 'hidden',
    ...shadow.card,
  },
  gridImageContainer: {
    width: '100%',
    height: 200, // Increased height to prevent image cutoff
    position: 'relative',
  },
  wishlistAddToCartButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridInfo: {
    padding: 12,
  },
  gridName: {
    fontSize: 14,
    fontFamily: fontFamily.medium,
    marginBottom: 8,
    height: 40, // Fixed height for 2 lines
  },
  gridPriceRow: {
    marginBottom: 12,
  },
  gridPrice: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
  },
  gridAddToCartButton: {
    paddingVertical: 8,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  gridAddToCartText: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
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
    fontFamily: fontFamily.bold,
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
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
