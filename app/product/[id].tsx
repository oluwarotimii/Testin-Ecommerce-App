import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { ArrowLeft, Heart, Share, Star, Plus, Minus, ShoppingCart } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { apiService } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      // Fetch product details
      // Replace with actual API call to your OpenCart backend
      // For now, simulating a fetch
      const fetchProduct = async () => {
        try {
          const fetchedProduct = await apiService.getProduct(Number(id));
          if (fetchedProduct.success) {
            setProduct(fetchedProduct.data);
            // Assuming related products are part of the product data or fetched separately
            // setRelatedProducts(fetchedProduct.data.relatedProducts || []);
          } else {
            console.error("Failed to fetch product:", fetchedProduct.error);
            setProduct(null);
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          setProduct(null);
        }
      };
      fetchProduct();
    }
  }, [id]);

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading product details...</Text>
      </View>
    );
  }

  const updateQuantity = (change: number) => {
    setQuantity(Math.max(1, Math.min(product.stockCount, quantity + change)));
  };

  const addToCart = async () => {
    try {
      const response = await apiService.addToCart(Number(id), quantity);
      if (response.success) {
        Alert.alert('Success', `Added ${quantity} of ${product.name} to cart!`);
      } else {
        Alert.alert('Error', response.error || 'Failed to add to cart.');
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      Alert.alert('Error', 'An unexpected error occurred while adding to cart.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <ArrowLeft size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Share size={24} color="#1D1D1F" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Heart 
              size={24} 
              color={isFavorite ? "#FF3B30" : "#1D1D1F"} 
              fill={isFavorite ? "#FF3B30" : "none"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
            {product.images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.productImage} />
            ))}
          </ScrollView>
          <View style={styles.imageIndicators}>
            {product.images.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.indicator, 
                  selectedImage === index && styles.activeIndicator
                ]} 
              />
            ))}
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.brandCategory}>
            <Text style={styles.brand}>{product.brand}</Text>
            <Text style={styles.category}>{product.category}</Text>
          </View>
          
          <Text style={styles.productName}>{product.name}</Text>
          
          <View style={styles.ratingContainer}>
            <View style={styles.rating}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>{product.rating}</Text>
              <Text style={styles.reviewsText}>({product.reviews} reviews)</Text>
            </View>
            <Text style={styles.stockText}>
              {product.inStock ? `${product.stockCount} in stock` : 'Out of stock'}
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>${product.price}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>${product.originalPrice}</Text>
            )}
            {product.originalPrice && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>
                  Save ${product.originalPrice - product.price}
                </Text>
              </View>
            )}
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity(-1)}
              >
                <Minus size={16} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.quantity}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity(1)}
              >
                <Plus size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Features</Text>
            {product.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Specifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            {Object.entries(product.specifications).map(([key, value]) => (
              <View key={key} style={styles.specRow}>
                <Text style={styles.specKey}>{key}</Text>
                <Text style={styles.specValue}>{value}</Text>
              </View>
            ))}
          </View>

          {/* Related Products */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>You might also like</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {relatedProducts.map((relatedProduct) => (
                <TouchableOpacity 
                  key={relatedProduct.id} 
                  style={styles.relatedProduct}
                  onPress={() => router.push(`/product/${relatedProduct.id}`)}
                >
                  <Image source={{ uri: relatedProduct.image }} style={styles.relatedImage} />
                  <Text style={styles.relatedName} numberOfLines={2}>{relatedProduct.name}</Text>
                  <View style={styles.relatedRating}>
                    <Star size={12} color="#FFD700" fill="#FFD700" />
                    <Text style={styles.relatedRatingText}>{relatedProduct.rating}</Text>
                  </View>
                  <Text style={styles.relatedPrice}>${relatedProduct.price}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.addToCartButton, !product.inStock && styles.disabledButton]}
          onPress={addToCart}
          disabled={!product.inStock}
        >
          <ShoppingCart size={20} color="#FFFFFF" />
          <Text style={styles.addToCartText}>
            {product.inStock ? `Add to Cart - $${(product.price * quantity).toFixed(2)}` : 'Out of Stock'}
          </Text>
        </TouchableOpacity>
      </View>
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
  },
  addToCartButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
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
});