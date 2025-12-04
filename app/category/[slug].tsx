import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Animated } from 'react-native';
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
    const { slug } = useLocalSearchParams();
    const colors = useThemeColors();
    const { apiService } = useAuth();
    const { setCartCount } = useCart();

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [wishlist, setWishlist] = useState<number[]>([]);
    const [categoryName, setCategoryName] = useState('Category');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartSuccess, setCartSuccess] = useState<{ [key: number]: boolean }>({});
    const [addingToCart, setAddingToCart] = useState<{ [key: number]: boolean }>({});
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

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            if (!apiService || !slug) return;
            try {
                setLoading(true);
                setError(null);

                const slugStr = slug.toString();

                // Try to fetch category details from WooCommerce
                try {
                    const categories = await apiService.getCategories();
                    const category = categories.find((cat: any) =>
                        cat.slug === slugStr || cat.id.toString() === slugStr
                    );
                    if (category) {
                        setCategoryName(category.name);
                    }
                } catch (catError) {
                    console.error('Error fetching category details:', catError);
                }

                // Fetch all products
                const allProducts = await apiService.getProducts();

                // Use transformation utility
                const transformedProducts = transformProducts(allProducts);

                // Filter products by category - handle both ID and slug
                const filteredProducts = transformedProducts.filter((product: any) => {
                    // Check if product has categories array
                    if (product.categories && Array.isArray(product.categories)) {
                        return product.categories.some((cat: any) =>
                            cat.slug === slugStr || cat.id.toString() === slugStr
                        );
                    }

                    // Fallback to old logic
                    const isNumericSlug = !isNaN(Number(slugStr));
                    if (isNumericSlug) {
                        return product.category_id?.toString() === slugStr;
                    } else {
                        const categoryName = product.category?.toLowerCase() || '';
                        const categorySlug = categoryName.replace(/\s+/g, '-');
                        return categoryName.includes(slugStr.toLowerCase()) ||
                            categorySlug === slugStr ||
                            categoryName === slugStr.replace(/-/g, ' ');
                    }
                });

                setProducts(filteredProducts);
            } catch (err: any) {
                setError(err.message || 'Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryProducts();
        fetchWishlist();
    }, [apiService, slug, fetchWishlist]);

    const filteredProducts = useMemo(() => {
        if (!searchQuery) return products;
        return products.filter(product =>
            product.title?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);

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

            // Update cart count to actual value from server
            const cartResponse = await apiService.getCartContents();
            if (cartResponse && cartResponse.products) {
                const newCartCount = cartResponse.products.reduce((total: any, item: any) => total + item.quantity, 0);
                setCartCount(newCartCount);
            }
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
            <Animated.ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                            Loading products...
                        </Text>
                    </View>
                ) : error ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="alert-circle" size={64} color={colors.error} />
                        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                    </View>
                ) : filteredProducts.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="cube-outline" size={64} color={colors.textSecondary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            No products found in this category
                        </Text>
                    </View>
                ) : (
                    <View style={styles.gridContainer}>
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onPress={() => router.push(`/product/${product.id}` as any)}
                                isLiked={wishlist.includes(product.id)}
                                onToggleWishlist={() => toggleWishlist(product.id)}
                                onAddToCart={() => handleAddToCart(product.id)}
                                addingToCart={addingToCart[product.id]}
                                cartSuccess={cartSuccess[product.id]}
                            />
                        ))}
                    </View>
                )}
            </Animated.ScrollView>
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
        paddingTop: 50, // Reduced from 60
        paddingBottom: 12, // Reduced from 16
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
        paddingVertical: 8,
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
    },
    countContainer: {
        paddingHorizontal: 20,
        paddingBottom: 8, // Reduced from 12
        paddingTop: 4,
    },
    countText: {
        fontSize: 14,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100, // Reduced from 120
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
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12, // Reduced from 16
        gap: 10, // Reduced from 12
    },

});
