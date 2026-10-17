import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { formatPrice } from '@/utils/formatNumber';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SafeImage from '@/components/SafeImage';
import SkeletonProductItem from '@/components/SkeletonProductItem';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius, fontFamily } from '@/constants/designTokens';

const RESULTS_PAGE_SIZE = 20;
const MIN_QUERY_LENGTH = 2;

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
  // Guards against a slow earlier keystroke's response landing after a
  // later one and overwriting fresher results with stale ones.
  const latestQueryRef = useRef('');

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
    const trimmed = searchQuery.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      return;
    }

    const debounceTimer = setTimeout(() => {
      performSearch(trimmed, true); // Reset to page 1
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const performSearch = useCallback(async (query: string, reset: boolean = false) => {
    latestQueryRef.current = query;

    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(1);
      } else {
        setLoadingMore(true);
      }

      setError(null);
      const page = reset ? 1 : currentPage + 1;
      const results = await apiService.searchProductsExtended(query, page, RESULTS_PAGE_SIZE);

      // A newer search started while this one was in flight - its response
      // will win instead, so drop this stale one rather than overwrite.
      if (latestQueryRef.current !== query) {
        return;
      }

      if (reset) {
        setSearchResults(results);
      } else {
        // Append new results, avoiding duplicates
        setSearchResults(prev => {
          const existingIds = new Set(prev.map((p: any) => p.id));
          const newResults = results.filter((p: any) => !existingIds.has(p.id));
          return [...prev, ...newResults];
        });
      }

      setHasMore(results.length === RESULTS_PAGE_SIZE);
      setCurrentPage(page);
    } catch (err: any) {
      if (latestQueryRef.current !== query) {
        return;
      }
      console.error('Search error:', err);
      setError('Unable to search right now. Please try again.');
      if (reset) {
        setSearchResults([]);
      }
    } finally {
      if (latestQueryRef.current === query) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [apiService, currentPage]);

  const loadMoreResults = useCallback(() => {
    const trimmed = searchQuery.trim();
    if (!loading && !loadingMore && hasMore && trimmed) {
      performSearch(trimmed, false);
    }
  }, [loading, loadingMore, hasMore, searchQuery, performSearch]);

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

  const renderResultItem = useCallback(({ item: product }: { item: any }) => (
    <TouchableOpacity
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
  ), [colors, router]);

  const keyExtractor = useCallback((item: any) => String(item.id), []);

  const isSearchActive = searchQuery.trim().length >= MIN_QUERY_LENGTH;

  const resultsHeader = useMemo(() => (
    <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 8 }]}>
      {searchResults.length}+ results for &quot;{searchQuery.trim()}&quot;
      {hasMore && ' (scroll for more)'}
    </Text>
  ), [searchResults.length, searchQuery, hasMore, colors]);

  const resultsFooter = useMemo(() => {
    if (loadingMore) {
      return (
        <View style={styles.loadingMoreContainer}>
          <SkeletonProductItem viewMode="list" />
        </View>
      );
    }
    if (!hasMore && searchResults.length > 0) {
      return (
        <Text style={[styles.noMoreResultsText, { color: colors.textSecondary }]}>
          No more products to load
        </Text>
      );
    }
    return null;
  }, [loadingMore, hasMore, searchResults.length, colors]);

  if (isSearchActive && (loading || searchResults.length > 0 || error)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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

        {loading && searchResults.length === 0 ? (
          <View style={styles.content}>
            <SkeletonProductItem viewMode="list" />
            <SkeletonProductItem viewMode="list" />
            <SkeletonProductItem viewMode="list" />
            <SkeletonProductItem viewMode="list" />
          </View>
        ) : error ? (
          <View style={styles.content}>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        ) : (
          // Virtualized - only the rows actually on screen are mounted, so
          // scrolling stays smooth no matter how many pages have loaded.
          <FlashList
            data={searchResults}
            keyExtractor={keyExtractor}
            renderItem={renderResultItem}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={resultsHeader}
            ListFooterComponent={resultsFooter}
            onEndReached={loadMoreResults}
            onEndReachedThreshold={0.5}
          />
        )}
      </SafeAreaView>
    );
  }

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
      >
        {!isSearchActive ? (
          /* Recent Searches (shown until the query reaches MIN_QUERY_LENGTH) */
          recentSearches.length > 0 && (
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
          )
        ) : (
          /* isSearchActive but we got here means the search completed with
             zero matches - loading/results/error are handled by the early
             return above */
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
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 42,
    borderRadius: radius.pill,
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
    fontFamily: fontFamily.bold,
  },
  clearButton: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
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
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  searchItemText: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamily.medium,
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
    borderRadius: radius.lg,
  },
  resultInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  resultName: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    lineHeight: 20,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultCategory: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
  },
  resultPrice: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
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
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 17,
    fontFamily: fontFamily.semiBold,
  },
  emptySubtext: {
    fontSize: 14,
  },
  loadingMoreContainer: {
    paddingVertical: 8,
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
