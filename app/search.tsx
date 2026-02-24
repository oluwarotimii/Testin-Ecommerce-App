import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { formatPrice } from '@/utils/formatNumber';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SafeImage from '@/components/SafeImage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { apiService } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Load recent searches from storage
  useEffect(() => {
    const loadRecentSearches = async () => {
      try {
        const storedSearches = await AsyncStorage.getItem('recentSearches');
        if (storedSearches) {
          setRecentSearches(JSON.parse(storedSearches));
        }
      } catch (error) {
        console.error('Error loading recent searches:', error);
        // Start with empty array if there's an error
        setRecentSearches([]);
      }
    };

    loadRecentSearches();
  }, []);

  // Search as user types with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery.trim(), true); // Reset to page 1
      } else {
        setSearchResults([]);
        setHasMore(true);
        setCurrentPage(1);
      }
    }, 500); // Increased to 500ms debounce

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const performSearch = async (query: string, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(1);
      } else {
        setLoadingMore(true);
      }

      setError(null);
      const page = reset ? 1 : currentPage + 1;
      const results = await apiService.searchProductsExtended(query, page, 100); // Fetch 100 products per page (max)

      if (reset) {
        setSearchResults(results);
      } else {
        // Append new results, avoiding duplicates
        const existingIds = new Set(searchResults.map((p: any) => p.id));
        const newResults = results.filter((p: any) => !existingIds.has(p.id));
        setSearchResults(prev => [...prev, ...newResults]);
      }

      setHasMore(results.length === 100); // If we got 100 results, there might be more
      setCurrentPage(page);
      setTotalResults(prev => reset ? results.length : prev + results.length);
    } catch (err: any) {
      setError(err.message || 'An error occurred during search');
      if (reset) {
        setSearchResults([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreResults = () => {
    if (!loading && !loadingMore && hasMore && searchQuery.trim()) {
      performSearch(searchQuery.trim(), false);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      // Add to recent searches if not already there
      if (!recentSearches.includes(query)) {
        const newRecentSearches = [query, ...recentSearches.slice(0, 4)];
        setRecentSearches(newRecentSearches);

        // Save to AsyncStorage
        try {
          await AsyncStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
        } catch (error) {
          console.error('Error saving recent search:', error);
        }
      }
    }
  };

  const removeRecentSearch = async (searchToRemove: string) => {
    const newRecentSearches = recentSearches.filter(search => search !== searchToRemove);
    setRecentSearches(newRecentSearches);

    try {
      await AsyncStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
    } catch (error) {
      console.error('Error removing recent search:', error);
    }
  };

  const clearAllRecentSearches = async () => {
    setRecentSearches([]);

    try {
      await AsyncStorage.removeItem('recentSearches');
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search products..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch(searchQuery)}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.cancelButton, { color: colors.primary }]}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
          const paddingToBottom = 100; // Load more when user is 100px from bottom
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            loadMoreResults();
          }
        }}
        scrollEventThrottle={400}
      >
        {searchQuery.length === 0 ? (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Searches</Text>
                  <TouchableOpacity onPress={clearAllRecentSearches}>
                    <Text style={[styles.clearButton, { color: colors.primary }]}>Clear All</Text>
                  </TouchableOpacity>
                </View>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.searchItem}
                    onPress={() => {
                      setSearchQuery(search);
                      handleSearch(search);
                    }}
                  >
                    <Ionicons name="time" size={16} color={colors.textSecondary} />
                    <Text style={[styles.searchItemText, { color: colors.text }]}>{search}</Text>
                    <TouchableOpacity
                      onPress={() => removeRecentSearch(search)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : loading && !loadingMore ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />
        ) : error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>Error: {error}</Text>
        ) : searchResults.length > 0 ? (
          /* Search Results */
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {searchResults.length}+ results for "{searchQuery}"
              {hasMore && ' (scroll for more)'}
            </Text>
            {searchResults.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={[styles.resultItem, { borderBottomColor: colors.border }]}
                onPress={() => router.push(`/product/${product.id}`)}
              >
                <View style={styles.resultImageContainer}>
                  <SafeImage source={{ uri: product.image }} style={styles.resultImage} />
                </View>
                <View style={styles.resultInfo}>
                  <View>
                    <Text style={[styles.resultName, { color: colors.text }]} numberOfLines={2}>{product.title}</Text>
                    <Text style={styles.resultCategory}>{product.category}</Text>
                  </View>
                  <Text style={[styles.resultPrice, { color: '#FFA500' }]}>
                    {formatPrice(typeof product.price === 'number' ? product.price : parseFloat(product.price || '0'))}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            {loadingMore && (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingMoreText, { color: colors.textSecondary }]}>Loading more products...</Text>
              </View>
            )}
            {!hasMore && searchResults.length > 0 && (
              <Text style={[styles.noMoreResultsText, { color: colors.textSecondary }]}>
                No more products to load
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.noResultsText}>No products found matching "{searchQuery}"</Text>
            <Text style={[styles.noResultsSubtext, { color: colors.textSecondary }]}>
              Try searching with different keywords or check the spelling
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    height: 40,
  },
  searchInput: {
    height: 40,
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1D1D1F',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  clearButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  searchItemText: {
    flex: 1,
    fontSize: 16,
    color: '#1D1D1F',
    marginLeft: 12,
  },
  removeButton: {
    padding: 4,
  },
  resultItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  resultImageContainer: {
    position: 'relative',
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  resultCategory: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  resultRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#1D1D1F',
    marginLeft: 4,
  },
  resultPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  noResultsText: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 20,
    fontSize: 16,
  },
  loadingIndicator: {
    marginTop: 40,
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  noMoreResultsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    fontStyle: 'italic',
  },
  noResultsSubtext: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    paddingHorizontal: 20,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});
