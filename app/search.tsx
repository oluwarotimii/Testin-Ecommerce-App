import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { formatPrice } from '@/utils/formatNumber';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SearchScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { apiService } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        performSearch(searchQuery.trim());
      } else {
        setSearchResults([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const results = await apiService.searchProducts(query);
      setSearchResults(results);
    } catch (err: any) {
      setError(err.message || 'An error occurred during search');
      setSearchResults([]);
    } finally {
      setLoading(false);
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
        ) : loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />
        ) : error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>Error: {error}</Text>
        ) : searchResults.length > 0 ? (
          /* Search Results */
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {searchResults.length} results for "{searchQuery}"
            </Text>
            {searchResults.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={[styles.resultItem, { borderBottomColor: colors.border }]}
                onPress={() => router.push(`/product/${product.id}`)}
              >
                <Image source={{ uri: product.image }} style={styles.resultImage} />
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
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.noResultsText}>No products found matching "{searchQuery}"</Text>
          </View>
        )}
      </ScrollView>
    </View>
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
    paddingTop: 60,
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
  },
  searchInput: {
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
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});
