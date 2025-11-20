import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useColorScheme';
import SafeImage from '@/components/SafeImage';

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

    const categoryName = typeof slug === 'string' ? slug.replace(/-/g, ' ') : '';

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
                const allProducts = await apiService.getProducts();
                const filteredProducts = allProducts.filter(
                    (product: any) => product.category === slug
                );
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

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                        {categoryName}
                    </Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Products Count */}
            {!loading && !error && (
                <View style={styles.countContainer}>
                    <Text style={[styles.countText, { color: colors.textSecondary }]}>
                        {products.length} {products.length === 1 ? 'product' : 'products'} found
                    </Text>
                </View>
            )}

            {/* Content */}
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
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
                ) : products.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="cube-outline" size={64} color={colors.textSecondary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            No products found in this category
                        </Text>
                    </View>
                ) : (
                    <View style={styles.gridContainer}>
                        {products.map((product) => (
                            <TouchableOpacity
                                key={product.id}
                                style={[styles.productCard, { backgroundColor: colors.surface }]}
                                onPress={() => router.push(`/product/${product.id}`)}
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
                                        <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                                            {`₦${(product.price * 1.3).toFixed(2)}`}
                                        </Text>
                                        <Text style={[styles.productPrice, { color: 'red' }]}>
                                            {`₦${product.price.toFixed(2)}`}
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
            </ScrollView>
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
        paddingTop: 60,
        paddingBottom: 16,
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
    countContainer: {
        paddingHorizontal: 24,
        paddingBottom: 12,
    },
    countText: {
        fontSize: 14,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 120,
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
        paddingHorizontal: 16,
        gap: 12,
    },
    productCard: {
        width: '47%',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        minHeight: 220,
    },
    productImage: {
        width: '100%',
        height: 120,
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
    },
    productDetails: {
        padding: 8,
        paddingTop: 4,
        paddingRight: 48,
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    originalPrice: {
        fontSize: 12,
        textDecorationLine: 'line-through',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '500',
    },
    reviewCount: {
        fontSize: 11,
    },
});
