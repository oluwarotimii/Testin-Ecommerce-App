import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Animated, RefreshControl } from 'react-native';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useColorScheme';
import SafeImage from '@/components/SafeImage';
import { transformProducts } from '@/utils/woocommerceTransformers';
import ProductCard from '@/components/ProductCard';
import PriceNoticeBanner from '@/components/PriceNoticeBanner';

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
    const [isAwoofCategory, setIsAwoofCategory] = useState(false);
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

            // WooCommerce REST API v3 only accepts category ID (not slug) for the 'category' parameter
            // So we need to first find the category to get its ID
            let categoryId: string | null = null;
            try {
                const categories = await apiService.getCategories();
                const category = categories.find((cat: any) =>
                    cat.slug === idStr || cat.id.toString() === idStr
                );
                if (category) {
                    setCategoryName(category.name);
                    setIsAwoofCategory(category.slug === 'awoof-corner');
                    categoryId = category.id.toString();
                } else {
                    console.error(`Category "${idStr}" not found - invalid slug or ID`);
                    setError('Category not found');
                    setLoading(false);
                    return;
                }
            } catch (catError) {
                console.error('Error fetching category details:', catError);
                setError('Failed to load category');
                setLoading(false);
                return;
            }

            // Fetch products by category - MUST use numeric ID, slug won't work
            const params: any = {
                category: categoryId,
                per_page: 20,
                page: reset ? 1 : page + 1
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
                setProducts(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const uniqueNew = transformedProducts.filter(p => !existingIds.has(p.id));
                    return [...prev, ...uniqueNew];
                });
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

    // Auto-fetch remaining pages in the background
    useEffect(() => {
        if (!loading && hasMore && !loadingMore && products.length > 0) {
            const timer = setTimeout(() => {
                fetchCategoryProducts(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [loading, hasMore, loadingMore, products.length, fetchCategoryProducts]);

    const filteredProducts = useMemo(() => {
        // Remove duplicates by ID before applying search filter
        const uniqueProducts = products.filter((product, index, self) =>
            index === self.findIndex(p => p.id === product.id)
        );

        if (!searchQuery) return uniqueProducts;
        return uniqueProducts.filter(product =>
            product.title?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);

    const loadMoreProducts = useCallback(() => {
        if (hasMore && !loadingMore && !loading) {
            fetchCategoryProducts(false); // Load more (not reset)
        }
    }, [hasMore, loadingMore, loading, fetchCategoryProducts]);

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
        }
    );

    // Render item for FlatList
    const renderItem = ({ item }: { item: any }) => (
        <ProductCard
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

    // Key extractor for FlatList - ensure uniqueness
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
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                    {categoryName}
                </Text>
                <TouchableOpacity
                    style={[styles.searchIcon, { backgroundColor: colors.surface }]}
                    onPress={() => setShowSearch(!showSearch)}
                >
                    <Ionicons name={showSearch ? "close" : "search"} size={20} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            {showSearch && (
                <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
                    <Ionicons name="search" size={18} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search in this category..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Products Count */}
            {!loading && !error && (
                <View style={styles.countContainer}>
                    <Text style={[styles.countText, { color: colors.textSecondary }]}>
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                    </Text>
                </View>
            )}

            {isAwoofCategory && <PriceNoticeBanner />}

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
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={() => fetchCategoryProducts(true)}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
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
        paddingTop: 6,
        paddingBottom: 6,
        gap: 8,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        paddingHorizontal: 14,
        height: 42,
        borderRadius: 14,
        marginBottom: 4,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        height: 42,
    },
    title: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
        textTransform: 'capitalize',
        textAlign: 'center',
    },
    countContainer: {
        paddingHorizontal: 16,
        paddingBottom: 2,
        paddingTop: 4,
    },
    countText: {
        fontSize: 13,
        fontWeight: '500',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 80,
        paddingHorizontal: 4,
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
        fontSize: 15,
    },
    errorText: {
        marginTop: 16,
        fontSize: 15,
        textAlign: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 15,
        textAlign: 'center',
    },
    columnWrapper: {
        justifyContent: 'space-between',
        gap: 8,
        paddingHorizontal: 8,
    },
    loadingMoreContainer: {
        width: '100%',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
