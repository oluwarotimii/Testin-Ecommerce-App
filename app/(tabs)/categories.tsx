import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Search, Grid3x3 as Grid3X3, List } from 'lucide-react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function CategoriesScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = [
    { id: 1, name: 'Electronics', icon: '📱', count: 1250, color: '#007AFF' },
    { id: 2, name: 'Fashion & Clothing', icon: '👕', count: 890, color: '#FF6B6B' },
    { id: 3, name: 'Home & Garden', icon: '🏠', count: 567, color: '#4ECDC4' },
    { id: 4, name: 'Sports & Outdoors', icon: '⚽', count: 432, color: '#45B7D1' },
    { id: 5, name: 'Books & Media', icon: '📚', count: 789, color: '#96CEB4' },
    { id: 6, name: 'Health & Beauty', icon: '💄', count: 345, color: '#FFEAA7' },
    { id: 7, name: 'Toys & Games', icon: '🎮', count: 234, color: '#DDA0DD' },
    { id: 8, name: 'Automotive', icon: '🚗', count: 156, color: '#98D8C8' },
    { id: 9, name: 'Food & Beverages', icon: '🍕', count: 678, color: '#F7DC6F' },
    { id: 10, name: 'Office Supplies', icon: '📎', count: 123, color: '#AED6F1' },
  ];

  const renderGridView = () => (
    <View style={styles.gridContainer}>
      {categories.map((category) => (
        <TouchableOpacity 
          key={category.id} 
          style={[styles.gridItem, { backgroundColor: category.color + '20' }]}
          onPress={() => router.push(`/products?category=${category.id}`)}
        >
          <Text style={styles.categoryIconLarge}>{category.icon}</Text>
          <Text style={styles.categoryNameGrid}>{category.name}</Text>
          <Text style={styles.categoryCount}>{category.count} items</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderListView = () => (
    <View style={styles.listContainer}>
      {categories.map((category) => (
        <TouchableOpacity 
          key={category.id} 
          style={styles.listItem}
          onPress={() => router.push(`/products?category=${category.id}`)}
        >
          <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
            <Text style={styles.categoryIconSmall}>{category.icon}</Text>
          </View>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryNameList}>{category.name}</Text>
            <Text style={styles.categoryCountList}>{category.count} items available</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity 
            style={[styles.toggleButton, viewMode === 'grid' && styles.activeToggle]}
            onPress={() => setViewMode('grid')}
          >
            <Grid3X3 size={20} color={viewMode === 'grid' ? '#FFFFFF' : '#8E8E93'} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, viewMode === 'list' && styles.activeToggle]}
            onPress={() => setViewMode('list')}
          >
            <List size={20} color={viewMode === 'list' ? '#FFFFFF' : '#8E8E93'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#8E8E93" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories..."
          placeholderTextColor="#8E8E93"
        />
      </View>

      {/* Categories */}
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
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1D1D1F',
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
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconLarge: {
    fontSize: 40,
    marginBottom: 12,
  },
  categoryNameGrid: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: '#8E8E93',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryIconSmall: {
    fontSize: 24,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryNameList: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  categoryCountList: {
    fontSize: 14,
    color: '#8E8E93',
  },
  arrow: {
    fontSize: 20,
    color: '#8E8E93',
  },
});