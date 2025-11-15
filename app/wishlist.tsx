import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';

export default function WishlistScreen() {
  const router = useRouter();
  const { apiService } = useAuth();
  const { setCartCount } = useCart();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const items = await apiService.getWishlist();
        setWishlistItems(items);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        // If there's an error, we can start with an empty array
        setWishlistItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [apiService]);

  const removeFromWishlist = async (id: number) => {
    try {
      const result = await apiService.removeFromWishlist(id);
      setWishlistItems(items => items.filter(item => item.id !== id));
      console.log('Removed from wishlist:', result);
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      Alert.alert("Error", "Failed to remove item from wishlist. Please try again.");
    }
  };

  const addToCart = async (id: number) => {
    try {
      const result = await apiService.addToCart(id, 1); // Add 1 quantity
      console.log('Added to cart:', result);
      Alert.alert("Success", "Item added to cart!");

      // Update cart count
      setCartCount(prevCount => prevCount + 1);

      // Optionally remove from wishlist after adding to cart
      removeFromWishlist(id);
    } catch (error) {
      console.error('Add to cart error:', error);
      Alert.alert("Error", "Failed to add item to cart. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text>Loading wishlist...</Text>
      </View>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={80} color="#8E8E93" />
        <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
        <Text style={styles.emptySubtitle}>Save products you love to your wishlist</Text>
        <TouchableOpacity 
          style={styles.shopButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1D1D1F" />
          </TouchableOpacity>
          <Text style={styles.title}>Wishlist</Text>
        </View>
        <Text style={styles.itemCount}>{wishlistItems.length} items</Text>
      </View>

      {/* Wishlist Items */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {wishlistItems.map((item) => (
          <View key={item.id} style={styles.wishlistItem}>
            <TouchableOpacity 
              style={styles.itemContent}
              onPress={() => router.push(`/product/${item.id}`)}
            >
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                {item.discount && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{item.discount}%</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                  <Text style={styles.reviewsText}>({item.reviews})</Text>
                </View>
                
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>₦{item.price.toFixed(2)}</Text>
                  {item.originalPrice && (
                    <Text style={styles.originalPrice}>₦{item.originalPrice.toFixed(2)}</Text>
                  )}
                </View>
                
                <Text style={[
                  styles.stockStatus, 
                  { color: item.inStock ? '#34C759' : '#FF3B30' }
                ]}>
                  {item.inStock ? 'In Stock' : 'Out of Stock'}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.itemActions}>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeFromWishlist(item.id)}
              >
                <Ionicons name="trash" size={20} color="#FF3B30" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.addToCartButton, 
                  !item.inStock && styles.disabledButton
                ]}
                onPress={() => addToCart(item.id)}
                disabled={!item.inStock}
              >
                <Ionicons name="cart" size={16} color="#FFFFFF" />
                <Text style={styles.addToCartText}>
                  {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.addAllButton}
          onPress={() => {
            wishlistItems
              .filter(item => item.inStock)
              .forEach(item => addToCart(item.id));
          }}
        >
          <Ionicons name="cart" size={20} color="#FFFFFF" />
          <Text style={styles.addAllText}>Add All to Cart</Text>
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
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  itemCount: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  wishlistItem: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  itemContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#E5E5EA',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
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
  itemDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 6,
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
    gap: 8,
    marginBottom: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  originalPrice: {
    fontSize: 14,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  stockStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removeButton: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 12,
    gap: 6,
  },
  disabledButton: {
    backgroundColor: '#8E8E93',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomActions: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  addAllButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addAllText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});