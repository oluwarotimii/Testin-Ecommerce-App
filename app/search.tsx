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
  const isDarkMode = String(colors.background).toLowerCase() === '#000000';
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
      }
      // Don't clear results when searchQuery is empty - preserve them for viewing
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
        <View style={styles.searchHeaderLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
            <Ionicons name="search" size={18} color={colors.textSecondary} />
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
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearch}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
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
        {loading && !loadingMore && searchQuery.length > 0 ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />
        ) : error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>Error: {error}</Text>
        ) : searchResults.length > 0 ? (
          /* Search Results */
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {searchResults.length}+ results{searchQuery.length > 0 ? ` for "${searchQuery}"` : ''}
              {hasMore && ' (scroll for more)'}
            </Text>
            {searchResults.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={[styles.resultItem, { borderBottomColor: colors.border }]}
                onPress={() => router.push(`/product/${product.id}`)}
              >
                <SafeImage source={{ uri: product.image }} style={[styles.resultImage, { backgroundColor: colors.surface }]} />
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultName, { color: colors.text }]} numberOfLines={2}>{product.title}</Text>
                  <View style={styles.resultMeta}>
                    <Text style={[styles.resultCategory, { color: colors.textSecondary }]}>{product.category}</Text>
                    <Text style={[styles.resultPrice, { color: colors.primary }]}>
                      {formatPrice(typeof product.price === 'number' ? product.price : parseFloat(product.price || '0'))}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
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
        ) : searchQuery.length === 0 ? (
          /* Recent Searches (shown only when no search has been performed) */
          <>
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent</Text>
                  <TouchableOpacity onPress={clearAllRecentSearches}>
                    <Text style={[styles.clearButton, { color: colors.primary }]}>Clear</Text>
                  </TouchableOpacity>
                </View>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.searchItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      setSearchQuery(search);
                      handleSearch(search);
                    }}
                  >
                    <View style={[styles.recentIcon, { backgroundColor: colors.surface }]}>
                      <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                    </View>
                    <Text style={[styles.searchItemText, { color: colors.text }]}>{search}</Text>
                    <TouchableOpacity onPress={() => removeRecentSearch(search)} style={styles.removeButton}>
                      <Ionicons name="close" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.surface }]}>
              <Ionicons name="search-outline" size={32} color={colors.textSecondary} />
            </View>
            <Text style={[styles.emptyText, { color: colors.text }]}>No results found</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Try a different search term
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
  },
  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  searchHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: 42,
  },
  clearSearch: {
    padding: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  recentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  searchItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  removeButton: {
    padding: 6,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    gap: 12,
  },
  resultImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  resultInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultCategory: {
    fontSize: 12,
    fontWeight: '500',
  },
  resultPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
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
    fontSize: 13,
  },
  noMoreResultsText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 13,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 15,
  },
});
