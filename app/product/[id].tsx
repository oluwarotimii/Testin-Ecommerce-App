import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useColorScheme';
import { transformProduct } from '@/utils/woocommerceTransformers';
import { formatPrice } from '@/utils/formatNumber';
import { stripHtml } from '@/utils/htmlUtils';
import SkeletonProductDetail from '@/components/SkeletonProductDetail';
import ProductCard from '@/components/ProductCard';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { apiService } = useAuth();
  const { setCartCount } = useCart();
  const colors = useThemeColors();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showFullscreenImage, setShowFullscreenImage] = useState(false);

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
          const fetchedProduct = await apiService.getProduct(Number(id));
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
      await Share.share({
        message: `Check out this product: ${product.title} - ₦${product.price}`,
        url: `https://femtech.ng/product/${product.id}`, // Hypothetical URL
        title: product.title,
      });
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/search')}>
            <Ionicons name="search" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={toggleWishlist}>
            <Ionicons
              name={isInWishlist ? "heart" : "heart-outline"}
              size={24}
              color={isInWishlist ? "#FF3B30" : colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Product Image */}
        <View style={[styles.imageContainer, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            onPress={() => setShowFullscreenImage(true)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: product.image }} style={[styles.productImage, { backgroundColor: colors.background }]} />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={[styles.productInfoContainer, { backgroundColor: colors.surface }]}>
          {/* Category and Title */}
          <View style={styles.titleSection}>
            <Text style={[styles.category, { color: colors.textSecondary }]}>{product.category}</Text>
            <Text style={[styles.productName, { color: colors.text }]}>{product.title}</Text>
          </View>

          {/* Rating - Commented out as requested */}
          {/* <View style={styles.ratingSection}>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={[styles.ratingText, { color: colors.text }]}>{product.rating ? product.rating.rate : 0}</Text>
              <Text style={[styles.reviewsText, { color: colors.textSecondary }]}>({product.rating ? product.rating.count : 0} reviews)</Text>
            </View>
          </View> */}

          {/* Price */}
          <View style={styles.priceSection}>
            <Text style={[styles.currentPrice, { color: '#FFA500' }]}>{formatPrice(typeof product.price === 'number' ? product.price : parseFloat(product.price || '0'))}</Text>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{stripHtml(product.description)}</Text>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quantity</Text>
            <View style={[styles.quantityContainer, { backgroundColor: colors.background }]}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(-1)}
              >
                <Ionicons name="remove" size={16} color={colors.primary} />
              </TouchableOpacity>
              <Text style={[styles.quantity, { color: colors.text }]}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(1)}
              >
                <Ionicons name="add" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <View style={[styles.similarProductsSection, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Similar Items</Text>
              <TouchableOpacity onPress={() => router.push(('/category/' + product.category) as any)}>
                <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.similarProductsGrid}>
              {similarProducts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.similarProductCard}
                  onPress={() => router.push(`/product/${item.id}` as any)}
                >
                  <View style={styles.similarProductImageContainer}>
                    <Image source={{ uri: item.image }} style={[styles.similarProductImage, { backgroundColor: colors.background }]} />
                    <View style={styles.similarWishlistOverlay}>
                      <TouchableOpacity
                        style={[styles.wishlistButton, { backgroundColor: colors.surface }]}
                        onPress={async (e) => {
                          e.stopPropagation();
                          await toggleSimilarProductWishlist(item.id);
                        }}
                      >
                        <Ionicons
                          name={similarProductsInWishlist.has(item.id) ? "heart" : "heart-outline"}
                          size={16}
                          color={similarProductsInWishlist.has(item.id) ? "#FF3B30" : colors.text}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.cartOverlayBottom}>
                      <TouchableOpacity
                        style={[styles.addToCartButton, { backgroundColor: colors.primary }]}
                        onPress={(e) => {
                          e.stopPropagation();
                          // Add to cart functionality can be added here
                        }}
                      >
                        <Ionicons name="cart" size={18} color={colors.white} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.similarProductInfo}>
                    <Text style={[styles.similarProductName, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
                    <View style={styles.priceRow}>
                      <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>{formatPrice((typeof item.price === 'number' ? item.price : parseFloat(item.price || '0')) * 1.3)}</Text>
                      <Text style={[styles.similarProductPrice, { color: '#FFA500' }]}>{formatPrice(typeof item.price === 'number' ? item.price : parseFloat(item.price || '0'))}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.actionBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.warning }]}
          onPress={buyNow}
        >
          <Text style={[styles.actionButtonText, { color: colors.white }]}>Buy Now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cartButton, { backgroundColor: colors.primary }]}
          onPress={addToCart}
        >
          <Ionicons name="cart" size={20} color={colors.white} />
          <Text style={[styles.actionButtonText, { color: colors.white }]}>Add to Cart</Text>
        </TouchableOpacity>
      </View>

      {/* Fullscreen Image Overlay */}
      {showFullscreenImage && (
        <View style={styles.fullscreenOverlay}>
          <TouchableOpacity
            style={styles.overlayCloseButton}
            onPress={() => setShowFullscreenImage(false)}
          >
            <Ionicons name="close" size={30} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.fullscreenImageContainer}>
            <TouchableOpacity
              onPress={() => setShowFullscreenImage(false)}
            >
              <Image
                source={{ uri: product?.image }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    paddingTop: 50,
    paddingBottom: 10,
    zIndex: 10,
  },
  headerButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  imageContainer: {
    padding: 20,
    alignItems: 'center',
  },
  productImage: {
    width: width * 0.85,
    height: width * 0.85,
    maxWidth: 350,
    maxHeight: 350,
    resizeMode: 'contain',
    borderRadius: 12,
  },
  productInfoContainer: {
    marginTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    flex: 1,
  },
  titleSection: {
    marginBottom: 15,
  },
  category: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 5,
  },
  ratingSection: {
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  reviewsText: {
    fontSize: 14,
    marginLeft: 8,
  },
  priceSection: {
    marginBottom: 20,
    marginTop: 10,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: '800',
  },
  descriptionSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  quantitySection: {
    marginBottom: 30,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 5,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  quantity: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
    minWidth: 30,
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
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 16,
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
  similarProductImageContainer: {
    position: 'relative',
    width: '100%',
  },
  similarProductImage: {
    width: '100%',
    height: 160,
  },
  similarWishlistOverlay: {
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
  similarProductInfo: {
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  similarProductName: {
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
  similarProductPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Note: similarCartOverlay was removed as we're using cartOverlayBottom now

  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  fullscreenImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  overlayCloseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 101,
    padding: 10,
  },
});