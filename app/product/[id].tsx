import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';

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
      const fetchProduct = async () => {
        try {
          const fetchedProduct = await apiService.getProduct(Number(id));
          setProduct(fetchedProduct);
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
    setQuantity(Math.max(1, quantity + change));
  };

  const addToCart = async () => {
    console.log(`Added ${quantity} of ${product.title} to cart!`);
  };

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
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "#FF3B30" : "#1D1D1F"}
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
            <Image source={{ uri: product.image }} style={styles.productImage} />
          </ScrollView>
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
            <Text style={styles.price}>{`$${product.price}`}</Text>
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
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={addToCart}
        >
          <ShoppingCart size={20} color="#FFFFFF" />
          <Text style={styles.addToCartText}>
            {`Add to Cart - $${(product.price * quantity).toFixed(2)}`}
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