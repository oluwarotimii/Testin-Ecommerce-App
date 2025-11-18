import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import DraggableCartIcon from '@/components/DraggableCartIcon';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { apiService } = useAuth();
  const { setCartCount } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
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
      <View style={styles.loadingContainer}>
        <Text>Loading product details...</Text>
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
  }; // Changed dependency to product.id to avoid hooks error

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="share" size={24} color="#1D1D1F" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={toggleWishlist}
          >
            <Ionicons
              name={isInWishlist ? "heart" : "heart-outline"}
              size={24}
              color={isInWishlist ? "#FF3B30" : "#1D1D1F"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Content with Similar Products at the end */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent} // Add padding to ensure buttons are accessible
      >
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setSelectedImage(index);
            }}
          >
            <Image source={{ uri: product.image }} style={styles.productImage} />
          </ScrollView>
          {/* Wishlist button at the top of the image */}
          <TouchableOpacity style={styles.wishlistTopButton} onPress={toggleWishlist}>
            <Ionicons
              name={isInWishlist ? "heart" : "heart-outline"}
              size={24}
              color={isInWishlist ? "#FF3B30" : "#FFFFFF"}
            />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.brandCategory}>
            <Text style={styles.category}>{product.category}</Text>
          </View>

          <Text style={styles.productName}>{product.title}</Text>

          <View style={styles.ratingContainer}>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{product.rating ? product.rating.rate : 0}</Text>
              <Text style={styles.reviewsText}>({product.rating ? product.rating.count : 0} reviews)</Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>{`₦${product.price.toFixed(2)}`}</Text>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(-1)}
              >
                <Ionicons name="remove" size={16} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.quantity}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(1)}
              >
                <Ionicons name="add" size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        </View>

        {/* Similar Products - now within the scroll view but at the end */}
        {similarProducts.length > 0 && (
          <View style={styles.similarProductsSection}>
            <Text style={styles.similarProductsTitle}>Similar Items</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarProductsContainer}
            >
              {similarProducts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.similarProductItem}
                  onPress={() => router.push(`/product/${item.id}`)}
                >
                  <Image source={{ uri: item.image }} style={styles.similarProductImage} />
                  <Text style={styles.similarProductName} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.similarProductPrice}>₦{item.price.toFixed(2)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Bottom Bar with Buy Now and Add to Cart Buttons - Fixed at bottom */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.buyNowButton, styles.bottomButton]}
          onPress={buyNow}
        >
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addToCartButton, styles.bottomButton]}
          onPress={addToCart}
        >
          <Ionicons name="cart" size={20} color="#FFFFFF" />
          <Text style={styles.addToCartText}>
            Add to Cart
          </Text>
        </TouchableOpacity>
      </View>
      <DraggableCartIcon onPress={() => router.push('/(tabs)/cart')} visible={true} />
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  content: {
    flex: 1,
  },
  imageGallery: {
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 120, // Ensure content doesn't hide behind fixed bottom bar
  },
  productImage: {
    width: width,
    height: width * 0.8,
    backgroundColor: '#F2F2F7',
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5EA',
  },
  activeIndicator: {
    backgroundColor: '#007AFF',
  },
  productInfo: {
    padding: 20,
  },
  brandCategory: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  brand: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  category: {
    fontSize: 14,
    color: '#8E8E93',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  stockText: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  originalPrice: {
    fontSize: 18,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  savingsBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  savingsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  quantitySection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 4,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    color: '#1D1D1F',
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  featureBullet: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 8,
    marginTop: 2,
  },
  featureText: {
    fontSize: 16,
    color: '#1D1D1F',
    flex: 1,
    lineHeight: 22,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  specKey: {
    fontSize: 16,
    color: '#8E8E93',
    flex: 1,
  },
  specValue: {
    fontSize: 16,
    color: '#1D1D1F',
    flex: 2,
    textAlign: 'right',
  },
  relatedProduct: {
    width: 140,
    marginRight: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    overflow: 'hidden',
  },
  relatedImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#E5E5EA',
  },
  relatedName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
    padding: 8,
    paddingBottom: 4,
  },
  relatedRating: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  relatedRatingText: {
    fontSize: 12,
    color: '#1D1D1F',
    marginLeft: 4,
  },
  relatedPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    flexDirection: 'row',
    alignItems: 'center',
  },
  similarProductsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32, // Increased padding to ensure space at the bottom
  },
  similarProductsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  similarProductsContainer: {
    gap: 16,
    paddingBottom: 10,
  },
  similarProductItem: {
    width: 120,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 12,
  },
  similarProductImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
    marginBottom: 8,
  },
  similarProductName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 4,
    height: 36,
  },
  similarProductPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  addToCartButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    flex: 1,
    elevation: 3,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#8E8E93',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomButton: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buyNowButton: {
    backgroundColor: '#FF9500',
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buyNowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  wishlistTopButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
    zIndex: 1,
  },
});