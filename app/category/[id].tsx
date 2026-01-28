import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Animated } from 'react-native';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useColorScheme';
import SafeImage from '@/components/SafeImage';
import { transformProducts } from '@/utils/woocommerceTransformers';
import BackButton from '@/components/BackButton';
import ProductCard from '@/components/ProductCard';

export default function CategoryScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const colors = useThemeColors();
    const { apiService } = useAuth();
    const { setCartCount } = useCart();

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [wishlist, setWishlist] = useState<number[]>([]);
    const [categoryName, setCategoryName] = useState('Category');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartSuccess, setCartSuccess] = useState<{ [key: number]: boolean }>({});
    const [addingToCart, setAddingToCart] = useState<{ [key: number]: boolean }>({});
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const scrollY = useRef(new Animated.Value(0)).current;

    const formatPrice = (price: string | number) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return numPrice.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const fetchWishlist = useCallback(async () => {
        if (!apiService) return;
        try {
            const wishlistItems = await apiService.getWishlist();
            setWishlist(wishlistItems.map((item: any) => item.id));
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
    }, [apiService]);

    const fetchCategoryProducts = useCallback(async (reset: boolean = false) => {
        if (!apiService || !id) return;

        try {
            if (reset) {
                setLoading(true);
                setError(null);
            } else {
                setLoadingMore(true);
            }

            const idStr = id.toString();

            // Try to fetch category details from WooCommerce
            try {
                const categories = await apiService.getCategories();
                const category = categories.find((cat: any) =>
                    cat.slug === idStr || cat.id.toString() === idStr
                );
                if (category) {
                    setCategoryName(category.name);
                }
            } catch (catError) {
                console.error('Error fetching category details:', catError);
            }

            // Fetch products by category with pagination
            const params: any = {
                category: idStr,
                per_page: 20,
                page: reset ? 1 : page
            };

            // Fetch products using the general getProducts method with category filter
            const categoryProducts = await apiService.getProducts(params);

            // Transform the products to app format
            const transformedProducts = transformProducts(categoryProducts);

            if (reset) {
                setProducts(transformedProducts);
                setPage(1);
                setHasMore(categoryProducts.length >= 20);
            } else {
                // Filter out duplicates and append new products
                const existingIds = new Set(products.map(p => p.id));
                const uniqueNewProducts = transformedProducts.filter(p => !existingIds.has(p.id));
                setProducts(prev => [...prev, ...uniqueNewProducts]);
                setHasMore(categoryProducts.length >= 20);
                setPage(prev => prev + 1);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load products');
        } finally {
            if (reset) {
                setLoading(false);
            } else {
                setLoadingMore(false);
            }
        }
    }, [apiService, id, page]); // Only depend on apiService, id, and page

    useEffect(() => {
        fetchCategoryProducts(true); // Reset and load first page
        fetchWishlist();
    }, [id]); // Only re-run if the category ID actually changes

    const filteredProducts = useMemo(() => {
        if (!searchQuery) return products;
        return products.filter(product =>
            product.title?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);

    const loadMoreProducts = useCallback(() => {
        if (hasMore && !loadingMore) {
            fetchCategoryProducts(false); // Load more (not reset)
        }
    }, [hasMore, loadingMore, fetchCategoryProducts]);

    const toggleWishlist = async (productId: number) => {
        if (!apiService) return;

        const isInWishlist = wishlist.includes(productId);

        // Optimistic update
        if (isInWishlist) {
            setWishlist(prev => prev.filter(id => id !== productId));
        } else {
            setWishlist(prev => [...prev, productId]);
        }

        try {
            if (isInWishlist) {
                await apiService.removeFromWishlist(productId);
            } else {
                await apiService.addToWishlist(productId);
            }
        } catch (error) {
            console.error('Wishlist toggle error:', error);
            // Revert on error
            if (isInWishlist) {
                setWishlist(prev => [...prev, productId]);
            } else {
                setWishlist(prev => prev.filter(id => id !== productId));
            }
        }
    };

    const handleAddToCart = async (productId: number) => {
        // Prevent duplicate additions
        if (addingToCart[productId]) {
            console.log('Already adding to cart, please wait...');
            return;
        }

        // Optimistic update for faster UI response
        setCartCount(prev => prev + 1);
        setAddingToCart(prev => ({ ...prev, [productId]: true }));

        try {
            const result = await apiService.addToCart(productId, 1);
            console.log(`Added product ${productId} to cart!`, result);

            // Show success indicator
            setCartSuccess(prev => ({ ...prev, [productId]: true }));
            setTimeout(() => {
                setCartSuccess(prev => {
                    const newCartSuccess = { ...prev };
                    delete newCartSuccess[productId];
                    return newCartSuccess;
                });
            }, 1500); // Hide after 1.5 seconds

            // Don't fetch cart contents immediately - trust the add operation result
            // Cart sync will happen naturally on next page load or cart screen visit
        } catch (error) {
            console.error('Add to cart error:', error);
            // Revert optimistic update on error
            setCartCount(prev => prev - 1);
        } finally {
            // Remove from adding state after a short delay
            setTimeout(() => {
                setAddingToCart(prev => {
                    const newAddingToCart = { ...prev };
                    delete newAddingToCart[productId];
                    return newAddingToCart;
                });
            }, 500);
        }
    };

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: false,
            listener: (event: any) => {
                const offsetY = event.nativeEvent.contentOffset.y;
                setShowSearch(offsetY > 100);
            },
        }
    );

    // Render item for FlatList
    const renderItem = ({ item }: { item: any }) => (
        <ProductCard
            key={item.id}
            product={item}
            onPress={() => router.push(`/product/${item.id}` as any)}
            isLiked={wishlist.includes(item.id)}
            onToggleWishlist={() => toggleWishlist(item.id)}
            onAddToCart={() => handleAddToCart(item.id)}
            addingToCart={addingToCart[item.id]}
            cartSuccess={cartSuccess[item.id]}
            style={{ marginBottom: 8 }} // Reduced margin to minimize whitespace
        />
    );

    // Key extractor for FlatList
    const keyExtractor = (item: any) => item.id.toString();

    // Render loading more indicator
    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    };

    // Render empty state
    const renderEmpty = () => {
        if (loading) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                        Loading products...
                    </Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle" size={64} color={colors.error} />
                    <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                </View>
            );
        }

        return (
            <View style={styles.centerContainer}>
                <Ionicons name="cube-outline" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No products found in this category
                </Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <BackButton />
                <View style={styles.headerCenter}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                        {categoryName}
                    </Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Sticky Search Bar */}
            {showSearch && (
                <View style={[styles.stickySearchContainer, { backgroundColor: colors.background }]}>
                    <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
                        <Ionicons name="search" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Search products..."
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* Products Count */}
            {!loading && !error && (
                <View style={styles.countContainer}>
                    <Text style={[styles.countText, { color: colors.textSecondary }]}>
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                    </Text>
                </View>
            )}

            {/* Content */}
            <Animated.FlatList
                data={filteredProducts}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                onEndReached={loadMoreProducts}
                onEndReachedThreshold={0.1}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
            />
        </View>
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
        paddingHorizontal: 16,
        paddingTop: 30, // Reduced from 50
        paddingBottom: 8, // Reduced from 12
    },
    backButton: {
        padding: 8,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    stickySearchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        height: 36,
    },
    countContainer: {
        paddingHorizontal: 16,
        paddingBottom: 4, // Reduced from 8
        paddingTop: 2,
    },
    countText: {
        fontSize: 14,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 80, // Further reduced to minimize whitespace
        paddingHorizontal: 4, // Consistent with previous grid padding
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
    },
    columnWrapper: {
        justifyContent: 'space-between',
        gap: 8, // Consistent spacing between columns
        paddingHorizontal: 8, // Add horizontal padding
    },
    loadingMoreContainer: {
        width: '100%',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

});
