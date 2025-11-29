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
        if (!apiService) return;
        try {
            await apiService.addToCart(productId, 1);

            // Update cart count
            try {
                const cartResponse = await apiService.getCartContents();
                if (cartResponse && cartResponse.products) {
                    const newCartCount = cartResponse.products.reduce(
                        (total: any, item: any) => total + item.quantity,
                        0
                    );
                    setCartCount(newCartCount);
                }
            } catch (countError) {
                console.error("Error updating cart count:", countError);
            }
        } catch (error) {
            console.error('Add to cart error:', error);
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
                            <TouchableOpacity
                                key={product.id}
                                style={[styles.productCard, { backgroundColor: colors.surface }]}
                                onPress={() => router.push(`/product/${product.id}` as any)}
                            >
                                <SafeImage
                                    source={{ uri: product.image }}
                                    style={[styles.productImage, { backgroundColor: colors.background }]}
                                />

                                {/* Wishlist button - top right */}
                                <View style={styles.wishlistOverlay}>
                                    <TouchableOpacity
                                        style={[styles.wishlistButton, { backgroundColor: colors.surface }]}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            toggleWishlist(product.id);
                                        }}
                                    >
                                        <Ionicons
                                            name={wishlist.includes(product.id) ? "heart" : "heart-outline"}
                                            size={16}
                                            color={wishlist.includes(product.id) ? "#FF3B30" : colors.text}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Add to cart button - bottom right */}
                                <View style={styles.productActionsOverlay}>
                                    <TouchableOpacity
                                        style={[styles.addToCartButton, { backgroundColor: colors.primary }]}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            handleAddToCart(product.id);
                                        }}
                                    >
                                        <Ionicons name="cart" size={18} color={colors.white} />
                                    </TouchableOpacity>
                                </View>

                                {/* Product details */}
                                <View style={styles.productDetails}>
                                    <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
                                        {product.title}
                                    </Text>
                                    <View style={styles.priceRow}>
                                        <Text style={[styles.productPrice, { color: '#FFA500' }]}>
                                            ₦{formatPrice(typeof product.price === 'number' ? product.price : parseFloat(product.price || '0'))}
                                        </Text>
                                    </View>
                                    {product.rating && (
                                        <View style={styles.ratingRow}>
                                            <Ionicons name="star" size={12} color="#FFD700" />
                                            <Text style={[styles.ratingText, { color: colors.text }]}>
                                                {product.rating.rate}
                                            </Text>
                                            <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>
                                                ({product.rating.count})
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
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
    productCard: {
        width: '48%', // Increased from 47%
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        minHeight: 240, // Increased from 220 to accommodate content
        marginBottom: 4,
    },
    productImage: {
        width: '100%',
        height: 140, // Increased from 120
    },
    wishlistOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 2,
    },
    wishlistButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productActionsOverlay: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        zIndex: 1,
    },
    addToCartButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    productDetails: {
        padding: 10, // Increased from 8
        paddingTop: 6, // Increased from 4
        paddingRight: 48,
    },
    productName: {
        fontSize: 13, // Reduced from 14
        fontWeight: '500',
        marginBottom: 4,
        lineHeight: 18,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6, // Reduced from 8
        marginBottom: 4,
    },
    originalPrice: {
        fontSize: 11, // Reduced from 12
        textDecorationLine: 'line-through',
    },
    productPrice: {
        fontSize: 16, // Reduced from 18
        fontWeight: 'bold',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3, // Reduced from 4
    },
    ratingText: {
        fontSize: 11, // Reduced from 12
        fontWeight: '500',
    },
    reviewCount: {
        fontSize: 10, // Reduced from 11
    },
});
