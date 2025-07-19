import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { Search, Filter, Grid3x3 as Grid3X3, List, Star, Heart } from 'lucide-react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function ProductsScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const products = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      price: 1199,
      originalPrice: 1299,
      rating: 4.8,
      reviews: 1250,
      image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400',
      discount: 8,
      inStock: true,
      category: 'Electronics'
    },
    {
      id: 2,
      name: 'MacBook Air M3',
      price: 1299,
      originalPrice: null,
      rating: 4.9,
      reviews: 890,
      image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400',
      discount: null,
      inStock: true,
      category: 'Electronics'
    },
    {
      id: 3,
      name: 'AirPods Pro 2nd Gen',
      price: 249,
      originalPrice: 279,
      rating: 4.7,
      reviews: 567,
      image: 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400',
      discount: 11,
      inStock: true,
      category: 'Electronics'
    },
    {
      id: 4,
      name: 'iPad Pro 12.9"',
      price: 1099,
      originalPrice: null,
      rating: 4.8,
      reviews: 432,
      image: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=400',
      discount: null,
      inStock: false,
      category: 'Electronics'
    },
    {
      id: 5,
      name: 'Apple Watch Series 9',
      price: 399,
      originalPrice: 429,
      rating: 4.6,
      reviews: 789,
      image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=400',
      discount: 7,
      inStock: true,
      category: 'Electronics'
    },
    {
      id: 6,
      name: 'Sony WH-1000XM5',
      price: 349,
      originalPrice: 399,
      rating: 4.5,
      reviews: 234,
      image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
      discount: 13,
      inStock: true,
      category: 'Electronics'
    },
  ];

  const renderGridView = () => (
    <View style={styles.gridContainer}>
      {products.map((product) => (
        <TouchableOpacity 
          key={product.id} 
          style={styles.gridItem}
          onPress={() => router.push(`/product/${product.id}`)}
        >
          <View style={styles.imageContainer}>
            <Image source={{ uri: product.image }} style={styles.productImage} />
            {product.discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{product.discount}%</Text>
              </View>
            )}
            <TouchableOpacity style={styles.wishlistButton}>
              <Heart size={16} color="#8E8E93" />
            </TouchableOpacity>
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
            <View style={styles.ratingContainer}>
              <Star size={12} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>{product.rating}</Text>
              <Text style={styles.reviewsText}>({product.reviews})</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${product.price}</Text>
              {product.originalPrice && (
                <Text style={styles.originalPrice}>${product.originalPrice}</Text>
              )}
            </View>
            {!product.inStock && (
              <Text style={styles.outOfStock}>Out of Stock</Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderListView = () => (
    <View style={styles.listContainer}>
      {products.map((product) => (
        <TouchableOpacity 
          key={product.id} 
          style={styles.listItem}
          onPress={() => router.push(`/product/${product.id}`)}
        >
          <View style={styles.listImageContainer}>
            <Image source={{ uri: product.image }} style={styles.listImage} />
            {product.discount && (
              <View style={styles.listDiscountBadge}>
                <Text style={styles.discountText}>-{product.discount}%</Text>
              </View>
            )}
          </View>
          <View style={styles.listProductInfo}>
            <Text style={styles.listProductName} numberOfLines={2}>{product.name}</Text>
            <Text style={styles.categoryText}>{product.category}</Text>
            <View style={styles.ratingContainer}>
              <Star size={12} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>{product.rating}</Text>
              <Text style={styles.reviewsText}>({product.reviews})</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${product.price}</Text>
              {product.originalPrice && (
                <Text style={styles.originalPrice}>${product.originalPrice}</Text>
              )}
            </View>
            {!product.inStock && (
              <Text style={styles.outOfStock}>Out of Stock</Text>
            )}
          </View>
          <TouchableOpacity style={styles.listWishlistButton}>
            <Heart size={20} color="#8E8E93" />
          </TouchableOpacity>
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
            <Filter size={20} color="#007AFF" />
          </TouchableOpacity>
          <View style={styles.viewToggle}>
            <TouchableOpacity 
              style={[styles.toggleButton, viewMode === 'grid' && styles.activeToggle]}
              onPress={() => setViewMode('grid')}
            >
              <Grid3X3 size={16} color={viewMode === 'grid' ? '#FFFFFF' : '#8E8E93'} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, viewMode === 'list' && styles.activeToggle]}
              onPress={() => setViewMode('list')}
            >
              <List size={16} color={viewMode === 'list' ? '#FFFFFF' : '#8E8E93'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#8E8E93" />
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
        <Text style={styles.resultsText}>{products.length} products found</Text>
      </View>

      {/* Products */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {viewMode === 'grid' ? renderGridView() : renderListView()}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
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
    marginHorizontal: 20,
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
    paddingHorizontal: 20,
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
    paddingBottom: 100,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 16,
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
  listWishlistButton: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});