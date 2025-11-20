import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useColorScheme';

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

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted components

    if (id) {
      const fetchProduct = async () => {
        try {
          const fetchedProduct = await apiService.getProduct(Number(id));
          if (isMounted) {
            setProduct(fetchedProduct);
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          if (isMounted) {
            setProduct(null);
          }
        }
      };
      fetchProduct();
    }

    return () => {
      isMounted = false; // Cleanup function to set flag to false
    };
  }, [id]);

  // Check if product is in wishlist when product loads
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (product?.id) {
        try {
          const wishlist = await apiService.getWishlist();
          const isInWishlist = wishlist.some((item: any) => item.id === product.id);
          setIsInWishlist(isInWishlist);
        } catch (error) {
          console.error("Error checking wishlist status:", error);
        }
      }
    };

    checkWishlistStatus();
  }, [product?.id, apiService]);

  // Fetch similar products useEffect - must be defined before conditional return
  useEffect(() => {
    if (!product?.id) return; // Early return if no product ID available

    let isMounted = true; // Flag to prevent state updates on unmounted components

    const fetchSimilarProducts = async () => {
      if (product && product.category) {
        try {
          // Get products from the same category, excluding the current product
          const categoryProducts = await apiService.getCategory(product.category);
          const filteredProducts = categoryProducts.filter((p: any) => p.id !== product.id);
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

  if (!product) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Loading product details...</Text>
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
      Alert.alert("Success", `${quantity} ${product.title}(s) added to cart!`);

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
      Alert.alert("Error", "Failed to add item to cart. Please try again.");
    }
  };

  const buyNow = async () => {
    try {
      // First, add the product to cart temporarily
      await apiService.addToCart(product.id, quantity);

      // Then navigate to checkout
      router.push('/checkout');
    } catch (error) {
      console.error("Buy now error:", error);
      Alert.alert("Error", "Failed to process purchase. Please try again.");
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

          {/* Rating */}
          <View style={styles.ratingSection}>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={[styles.ratingText, { color: colors.text }]}>{product.rating ? product.rating.rate : 0}</Text>
              <Text style={[styles.reviewsText, { color: colors.textSecondary }]}>({product.rating ? product.rating.count : 0} reviews)</Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            <Text style={[styles.currentPrice, { color: colors.primary }]}>₦{product.price.toFixed(2)}</Text>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{product.description}</Text>
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
              <TouchableOpacity onPress={() => router.push('/category/' + product.category)}>
                <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarProductsContainer}
            >
              {similarProducts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.similarProductItem, { backgroundColor: colors.background }]}
                  onPress={() => router.push(`/product/${item.id}`)}
                >
                  <Image source={{ uri: item.image }} style={[styles.similarProductImage, { backgroundColor: colors.surface }]} />
                  <Text style={[styles.similarProductName, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
                  <Text style={[styles.similarProductPrice, { color: colors.primary }]}>₦{item.price.toFixed(2)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    paddingTop: 60,
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
  similarProductItem: {
    width: 140,
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
  },
  similarProductImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  similarProductName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    height: 36,
  },
  similarProductPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
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