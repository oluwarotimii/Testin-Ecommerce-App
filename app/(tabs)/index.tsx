import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Search, Bell, Heart, Star, RefreshCw, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import airtableService from '@/services/airtableService';
import updateService from '@/services/updateService';
import InstagramCarousel from '@/components/InstagramCarousel';
import { useThemeColors } from '@/hooks/useColorScheme';

export default function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [carouselItems, setCarouselItems] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadCarouselData();
  }, []);

  const loadCarouselData = async () => {
    try {
      const items = await airtableService.getCarouselItems();
      setCarouselItems(items);
    } catch (error) {
      console.error('Failed to load carousel data:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      loadCarouselData(),
      updateService.checkForUpdates(),
    ]);
    setIsRefreshing(false);
  };

  const handleCarouselItemPress = (item: any) => {
    if (item.linkType === 'product') {
      router.push(`/product/${item.linkValue}`);
    } else if (item.linkType === 'category') {
      router.push(`/products?category=${item.linkValue}`);
    }
  };

  const categories = [
    { id: 1, name: 'Smartphones', icon: '📱' },
    { id: 2, name: 'Laptops', icon: '💻' },
    { id: 3, name: 'Audio', icon: '🎧' },
    { id: 4, name: 'Gaming', icon: '🎮' },
  ];

  const products = [
    { id: 1, name: 'iPhone 15 Pro', price: '$999', rating: 4.8, image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 2, name: 'MacBook Air', price: '$1299', rating: 4.9, image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 3, name: 'AirPods Pro', price: '$249', rating: 4.7, image: 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 4, name: 'iPad Pro', price: '$799', rating: 4.8, image: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=400' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Good Morning!</Text>
          <Text style={[styles.username, { color: colors.text }]}>John Doe</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleRefresh}
          >
            <RefreshCw size={24} color={isRefreshing ? colors.primary : colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/wishlist')}>
            <Heart size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <TouchableOpacity 
        style={[styles.searchContainer, { backgroundColor: colors.surface }]}
        onPress={() => router.push('/search')}
      >
        <Search size={20} color={colors.textSecondary} />
        <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>Search products...</Text>
      </TouchableOpacity>

      {/* Carousel */}
      <InstagramCarousel 
        data={carouselItems} 
        onItemPress={handleCarouselItemPress}
      />

      {/* Featured Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Sparkles size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Categories</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/categories')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity 
              key={category.id} 
              style={[styles.categoryItem, { backgroundColor: colors.surface }]}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Latest Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Latest Products</Text>
          <TouchableOpacity onPress={() => router.push('/products')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.productsGrid}>
          {products.map((product) => (
            <TouchableOpacity 
              key={product.id} 
              style={[styles.productCard, { backgroundColor: colors.surface }]}
              onPress={() => router.push(`/product/${product.id}`)}
            >
              <Image source={{ uri: product.image }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{product.name}</Text>
                <View style={styles.productRating}>
                  <Star size={12} color="#FFD700" fill="#FFD700" />
                  <Text style={[styles.ratingText, { color: colors.textSecondary }]}>{product.rating}</Text>
                </View>
                <Text style={[styles.productPrice, { color: colors.primary }]}>{product.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Promo Banner */}
      <TouchableOpacity style={[styles.promoBanner, { backgroundColor: colors.primary }]}>
        <Text style={[styles.promoTitle, { color: colors.white }]}>Special Offer!</Text>
        <Text style={[styles.promoSubtitle, { color: colors.white }]}>Get 20% off on your first order</Text>
        <Text style={[styles.promoCode, { color: colors.white }]}>Use code: WELCOME20</Text>
      </TouchableOpacity>
    </ScrollView>
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
  greeting: {
    fontSize: 14,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  searchPlaceholder: {
    marginLeft: 12,
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  categoryItem: {
    alignItems: 'center',
    width: 80,
    paddingVertical: 12,
    borderRadius: 12,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 16,
  },
  productCard: {
    width: '47%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#E5E5EA',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  promoBanner: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  promoCode: {
    fontSize: 12,
    fontWeight: '500',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
});