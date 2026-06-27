import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, Share, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useColorScheme';
import { transformProduct } from '@/utils/woocommerceTransformers';
import { formatPrice } from '@/utils/formatNumber';
import { stripHtml } from '@/utils/htmlUtils';
import PriceNoticeBanner from '@/components/PriceNoticeBanner';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SkeletonProductDetail from '@/components/SkeletonProductDetail';
import ProductCard from '@/components/ProductCard';
import SafeImage from '@/components/SafeImage';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { apiService } = useAuth();
  const { setCartCount } = useCart();
  const colors = useThemeColors();
  const isDarkMode = String(colors.background).toLowerCase() === '#000000';
  const insets = useSafeAreaInsets();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  // Removed fullscreen image functionality due to issues

  // Helper function to get all product images (main image + gallery images)
  const getAllProductImages = () => {
    if (!product) return [];

    const allImages = [];
    if (product.image) {
      allImages.push(product.image);
    }
    if (product.gallery_images && product.gallery_images.length > 0) {
      allImages.push(...product.gallery_images);
    }

    return allImages;
  };

  // Helper function to get the current image URL based on selected index
  const getCurrentImageUrl = () => {
    if (!product) return '';

    const allImages = getAllProductImages();

    // Return the image at the selected index, or the first image if invalid
    const imageUrl = allImages[selectedImage] || allImages[0] || '';

    // Ensure the URL is properly formatted
    if (imageUrl && typeof imageUrl === 'string') {
      if (imageUrl.startsWith('http://')) {
        return imageUrl.replace('http://', 'https://');
      }
      return imageUrl;
    }

    return '';
  };

  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [similarProductsInWishlist, setSimilarProductsInWishlist] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted components

    if (id) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const idStr = id.toString();
          let fetchedProduct;

          // Check if the id is a numeric ID or a slug
          const numericId = Number(idStr);
          if (!isNaN(numericId) && idStr === numericId.toString()) {
            // It's a numeric ID, fetch directly
            fetchedProduct = await apiService.getProduct(numericId);
          } else {
            // It's a slug, fetch by slug
            fetchedProduct = await apiService.getProductBySlug(idStr);
          }

          // Use transformation utility
          const transformedProduct = transformProduct(fetchedProduct);

          if (isMounted) {
            setProduct(transformedProduct);
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          if (isMounted) {
            setProduct(null);
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };
      fetchProduct();
    }

    return () => {
      isMounted = false; // Cleanup function to set flag to false
    };
  }, [id]);

  // Check if product and similar products are in wishlist when product loads
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (product?.id) {
        try {
          const wishlist = await apiService.getWishlist();
          const productInWishlist = wishlist.some((item: any) => item.id === product.id);
          setIsInWishlist(productInWishlist);

          // Update similar products wishlist status
          const similarProductIds = similarProducts.map((p: any) => p.id);
          const similarInWishlist = new Set<number>();
          wishlist.forEach((item: any) => {
            if (similarProductIds.includes(item.id)) {
              similarInWishlist.add(item.id);
            }
          });
          setSimilarProductsInWishlist(similarInWishlist);
        } catch (error) {
          console.error("Error checking wishlist status:", error);
        }
      }
    };

    checkWishlistStatus();
  }, [product?.id, similarProducts, apiService]);

  // Fetch similar products useEffect - must be defined before conditional return
  useEffect(() => {
    if (!product?.id) return; // Early return if no product ID available

    let isMounted = true; // Flag to prevent state updates on unmounted components

    const fetchSimilarProducts = async () => {
      if (product && product.category_id) {
        try {
          // Get all products and filter for similar ones based on category
          const allProducts = await apiService.getProducts();

          // Transform products using utility
          const transformedProducts = allProducts.map((p: any) => transformProduct(p));

          // Filter products by same category, excluding the current product
          const filteredProducts = transformedProducts.filter((p: any) =>
            p.category_id === product.category_id && p.id !== product.id
          );

          // Limit to 10 similar products
          if (isMounted) {
            setSimilarProducts(filteredProducts.slice(0, 10));
          }
        } catch (error) {
          console.error("Error fetching similar products:", error);
          if (isMounted) {
            setSimilarProducts([]);
          }
        }
      }
    };

    fetchSimilarProducts();

    return () => {
      isMounted = false; // Cleanup function to set flag to false
    };
  }, [product?.id, apiService]);

  const toggleSimilarProductWishlist = async (productId: number) => {
    try {
      if (similarProductsInWishlist.has(productId)) {
        await apiService.removeFromWishlist(productId);
        setSimilarProductsInWishlist(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else {
        await apiService.addToWishlist(productId);
        setSimilarProductsInWishlist(prev => {
          const newSet = new Set(prev);
          newSet.add(productId);
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error updating similar product wishlist:", error);
    }
  };

  if (loading) {
    return <SkeletonProductDetail />;
  }

  if (!product) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Product not found.</Text>
      </View>
    );
  }

  const updateQuantity = (change: number) => {
    setQuantity(Math.max(1, quantity + change));
  };

  const toggleWishlist = async () => {
    try {
      if (isInWishlist) {
        await apiService.removeFromWishlist(product.id);
        setIsInWishlist(false);
        Alert.alert("Success", "Product removed from wishlist!");
      } else {
        await apiService.addToWishlist(product.id);
        setIsInWishlist(true);
        Alert.alert("Success", "Product added to wishlist!");
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      Alert.alert("Error", "Failed to update wishlist. Please try again.");
    }
  };

  const addToCart = async () => {
    try {
      const result = await apiService.addToCart(product.id, quantity);
      console.log(`Added ${quantity} of ${product.title} to cart!`, result);

      // Update cart count by fetching the current cart contents
      try {
        const cartResponse = await apiService.getCartContents();
        if (cartResponse && cartResponse.products) {
          const newCartCount = cartResponse.products.reduce((total: any, item: any) => total + item.quantity, 0);
          setCartCount(newCartCount);
        }
      } catch (countError) {
        console.error("Error updating cart count:", countError);
        // Fallback: increment by the quantity added
        setCartCount(prevCount => prevCount + quantity);
      }
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  };

  const buyNow = async () => {
    try {
      // Navigate to checkout with product ID and quantity as params
      // This allows checkout page to handle single item purchase bypassing the cart
      router.push({
        pathname: '/checkout',
        params: {
          productId: product.id,
          quantity: quantity
        }
      });
    } catch (error) {
      console.error("Buy now error:", error);
      Alert.alert("Error", "Failed to process purchase. Please try again.");
    }
  };

  const handleShare = async () => {
    try {
      // Get the app URL scheme from constants - using centralized config approach
      const { expoPublicAppUrl } = Constants.expoConfig?.extra || {};
      const appUrl = expoPublicAppUrl || 'https://invalid-url-for-testing.com/product';

      // Create deep link to the specific product
      const productLink = `${appUrl}/${product.id}`;

      const shareMessage = `🛍️ Check out this amazing product!\n\n${product.title}\n\n💰 Price: ${formatPrice(typeof product.price === 'number' ? product.price : parseFloat(product.price || '0'))}\n\n${stripHtml(product.description).substring(0, 150)}${stripHtml(product.description).length > 150 ? '...' : ''}\n\n${productLink}`;

      const result = await Share.share({
        message: shareMessage,
        url: productLink, // Include the URL in the share
        title: `${product.title} - Femtech Mobile App`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type
          console.log('Shared with activity type:', result.activityType);
        } else {
          // Shared
          console.log('Product shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        console.log('Share dismissed');
      }
    } catch (error: any) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share product. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Product Images Gallery */}
        <View style={styles.imageContainer}>
          {/* Header Overlay */}
          <View style={styles.headerOverlay}>
            <TouchableOpacity onPress={() => router.back()} style={[styles.headerIconBg, { backgroundColor: colors.background + 'CC' }]}>
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerOverlayRight}>
              <TouchableOpacity style={[styles.headerIconBg, { backgroundColor: colors.background + 'CC' }]} onPress={() => router.push('/search')}>
                <Ionicons name="search" size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.headerIconBg, { backgroundColor: colors.background + 'CC' }]} onPress={toggleWishlist}>
                <Ionicons
                  name={isInWishlist ? "heart" : "heart-outline"}
                  size={20}
                  color={isInWishlist ? "#FF3B30" : colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Main image display */}
          <View style={styles.mainImageContainer}>
            <SafeImage
              key={`main-image-${selectedImage}`} // Add key to force re-render when selected image changes
              source={{ uri: getCurrentImageUrl() }}
              style={styles.mainProductImage}
              resizeMode="contain"
              // Add error handling to log issues
              onError={(error) => console.error("Main image error:", error)}
            />
          </View>

          {/* Thumbnail Images */}
          {((product.gallery_images && product.gallery_images.length > 0) || product.image) && (
            <View style={styles.thumbnailContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailScroll}
              >
                {/* Main image thumbnail */}
                {product.image && (
                  <TouchableOpacity
                    style={[
                      styles.thumbnail,
                      selectedImage === 0 && styles.selectedThumbnail
                    ]}
                    onPress={() => setSelectedImage(0)}
                  >
                    <SafeImage
                      source={{ uri: product.image }}
                      style={[styles.thumbnailImage, { backgroundColor: colors.background }]}
                    />
                  </TouchableOpacity>
                )}

                {/* Gallery images thumbnails */}
                {product.gallery_images && product.gallery_images.map((image: string, index: number) => (
                  <TouchableOpacity
                    key={`gallery-${index}`}  // Added key prop that was missing
                    style={[
                      styles.thumbnail,
                      selectedImage === index + (product.image ? 1 : 0) && styles.selectedThumbnail
                    ]}
                    onPress={() => setSelectedImage(index + (product.image ? 1 : 0))}
                  >
                    <SafeImage
                      source={{ uri: image }}
                      style={[styles.thumbnailImage, { backgroundColor: colors.background }]}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfoContainer}>
          {/* Category and Title */}
          <View style={styles.titleSection}>
            <Text style={[styles.category, { color: colors.textSecondary }]}>{product.category}</Text>
            <Text style={[styles.productName, { color: colors.text }]}>{product.title}</Text>
            <View style={styles.ratingRow}>
              <View style={styles.starsContainer}>
                <Ionicons name="star" size={14} color="#FFB800" />
                <Ionicons name="star" size={14} color="#FFB800" />
                <Ionicons name="star" size={14} color="#FFB800" />
                <Ionicons name="star" size={14} color="#FFB800" />
                <Ionicons name="star-half" size={14} color="#FFB800" />
              </View>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            <Text style={[styles.currentPrice, { color: isDarkMode ? colors.white : colors.primary }]}>{formatPrice(product.price)}</Text>
            {product.original_price && product.original_price > product.price && (
              <View style={styles.priceRow}>
                <Text style={[styles.originalPriceTag, { color: colors.textSecondary }]}>{formatPrice(product.original_price)}</Text>
                <View style={[styles.savingsBadge, { backgroundColor: colors.success + '20' }]}>
                  <Text style={[styles.savingsText, { color: colors.success }]}>-{Math.round((1 - product.price / product.original_price) * 100)}%</Text>
                </View>
              </View>
            )}
          </View>

          {product.categories?.some((c: any) => c.slug === 'awoof-corner') && <PriceNoticeBanner />}

          {/* Description */}
          <Text style={[styles.detailsLabel, { color: colors.text }]}>Details</Text>
          <Text style={[styles.description, { color: colors.text }]}>{stripHtml(product.description)}</Text>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={[styles.quantityLabel, { color: colors.text }]}>Quantity</Text>
            <View style={[styles.quantityContainer, { backgroundColor: colors.background }]}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(-1)}
              >
                <Ionicons name="remove" size={18} color={colors.primary} />
              </TouchableOpacity>
              <Text style={[styles.quantity, { color: colors.text }]}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(1)}
              >
                <Ionicons name="add" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <View style={[styles.similarProductsSection, { marginTop: 16 }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>You May Also Like</Text>
              <TouchableOpacity onPress={() => router.push(`/category/${product.category_id}` as any)}>
                <Text style={[styles.seeAllLink, { color: colors.primary }]}>See All →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarProductsScroll}
            >
              {similarProducts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.similarProductCardHorizontal}
                  onPress={() => router.push(`/product/${item.id}` as any)}
                >
                  <View style={styles.similarProductImageContainer}>
                    <SafeImage source={{ uri: item.image }} style={[styles.similarProductImage, { backgroundColor: colors.background }]} />
                  </View>
                  <View style={styles.similarProductInfoHorizontal}>
                    <Text style={[styles.similarProductName, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
                    <Text style={[styles.similarProductPrice, { color: isDarkMode ? colors.white : colors.primary }]}>{formatPrice(typeof item.price === 'number' ? item.price : parseFloat(item.price || '0'))}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.actionBar, {
        paddingBottom: insets.bottom + 12
      }]}>
        <TouchableOpacity
          style={[styles.buyNowButton, { backgroundColor: colors.primary }]}
          onPress={buyNow}
        >
          <Text style={[styles.buyNowText, { color: colors.white }]}>Buy Now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addToCartOutline, { borderColor: colors.primary, backgroundColor: colors.background }]}
          onPress={addToCart}
        >
          <Ionicons name="cart-outline" size={18} color={colors.primary} />
          <Text style={[styles.addToCartOutlineText, { color: colors.primary }]}>Cart</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  imageContainer: {
    position: 'relative',
    padding: 20,
    alignItems: 'center',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    zIndex: 10,
  },
  headerOverlayRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainImageContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  productImage: {
    width: width * 0.85,
    height: width * 0.85,
    maxWidth: 350,
    maxHeight: 350,
    borderRadius: 12,
  },
  mainProductImage: {
    width: width * 0.8,
    height: width * 0.8,
    maxWidth: 320,
    maxHeight: 320,
    borderRadius: 16,
  },
  thumbnailContainer: {
    marginTop: 12,
    width: '100%',
    position: 'relative',
  },
  thumbnailScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: '#042861',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  productInfoContainer: {
    padding: 20,
    flex: 1,
  },
  titleSection: {
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  productName: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  priceSection: {
    marginBottom: 16,
    marginTop: 12,
  },
  currentPrice: {
    fontSize: 26,
    fontWeight: '800',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 10,
  },
  originalPriceTag: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  savingsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailsLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 4,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  quantitySection: {
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 4,
    alignSelf: 'flex-start',
    gap: 4,
  },
  quantityButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  quantity: {
    fontSize: 17,
    fontWeight: '600',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  similarProductsSection: {
    paddingTop: 20,
    paddingBottom: 120,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  seeAllLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  similarProductsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  similarProductsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  similarProductCard: {
    width: '47%', // Default width for grid
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  similarProductCardHorizontal: {
    width: 150,
    marginRight: 15,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  similarProductImageContainer: {
    position: 'relative',
    width: '100%',
  },
  similarProductImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
  },
  similarProductInfoHorizontal: {
    padding: 10,
  },
  similarProductName: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
    lineHeight: 17,
  },
  similarProductPrice: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  similarProductsScroll: {
    paddingHorizontal: 20,
    paddingVertical: 6,
  },

  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  buyNowButton: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: '700',
  },
  addToCartOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 6,
  },
  addToCartOutlineText: {
    fontSize: 15,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
