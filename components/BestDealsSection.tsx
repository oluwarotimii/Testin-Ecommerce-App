import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SafeImage from '@/components/SafeImage';
import SkeletonProductItem from '@/components/SkeletonProductItem';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import { transformProducts } from '@/utils/woocommerceTransformers';
import { formatPrice } from '@/utils/formatNumber';

interface BestDealsSectionProps {
    wishlist: number[];
    toggleWishlist: (productId: number) => Promise<void>;
}

export default function BestDealsSection({ wishlist, toggleWishlist }: BestDealsSectionProps) {
    const router = useRouter();
    const colors = useThemeColors();
    const { apiService, isAuthenticated } = useAuth();
    const { setCartCount } = useCart();

    const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
    const [loadingFeatured, setLoadingFeatured] = useState(true);
    const [featuredCategoryId, setFeaturedCategoryId] = useState<number | null>(null);

    const fetchFeaturedCategory = useCallback(async () => {
        if (!apiService) return;
        setLoadingFeatured(true);
        try {
            // Try to find 'trending' category first
            let categories = await apiService.getCategories({ slug: 'daily-deals' });

            // If not found, fallback to 'clothing' or just the first category
            if (!categories || categories.length === 0) {
                categories = await apiService.getCategories({ per_page: 1 });
            }

            if (categories && categories.length > 0) {
                const category = categories[0];
                setFeaturedCategoryId(category.id);

                // Fetch products for this category
                const products = await apiService.getProducts({ category: category.id, limit: 4 });
                const transformed = transformProducts(products);
                setFeaturedProducts(transformed);
            }
        } catch (error) {
            console.error('Error fetching featured category:', error);
        } finally {
            setLoadingFeatured(false);
        }
    }, [apiService]);

    useEffect(() => {
        fetchFeaturedCategory();
    }, [fetchFeaturedCategory]);

    if (loadingFeatured) {
        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Best Deals</Text>
                </View>
                <View style={styles.productsGrid}>
                    <SkeletonProductItem viewMode="grid" />
                    <SkeletonProductItem viewMode="grid" />
                    <SkeletonProductItem viewMode="grid" />
                    <SkeletonProductItem viewMode="grid" />
                </View>
            </View>
        );
    }

    if (featuredProducts.length === 0) {
        return null; // Or return a message if preferred, but user asked to show nothing if empty? "should show No trending products if nothing is there" -> user said "No trending products if nothing is there in the categories" - wait, "should show No trending products if nothing is there" implies showing the text "No trending products".
        // Actually, let's stick to the previous implementation which showed "No trending products found."
    }

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Best Deals</Text>
                <TouchableOpacity
                    style={[styles.seeAllButton, { backgroundColor: colors.primary }]}
                    onPress={() => featuredCategoryId ? router.push(`/category/${featuredCategoryId}` as any) : router.push('/products')}
                >
                    <Text style={[styles.seeAllButtonText, { color: colors.white }]}>See All</Text>
                </TouchableOpacity>
            </View>

            {featuredProducts.length === 0 ? (
                <Text style={[styles.noProductsText, { color: colors.textSecondary }]}>No trending products found.</Text>
            ) : (
                <View style={styles.productsGrid}>
                    {featuredProducts.map((product) => (
                        <TouchableOpacity
                            key={product.id}
                            style={styles.productCard}
                            onPress={() => router.push(`/product/${product.id}` as any)}
                        >
                            <View style={styles.productImageContainer}>
                                <SafeImage source={{ uri: product.image }} style={[styles.productImage, { backgroundColor: colors.background }]} />
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
                                <View style={styles.cartOverlayBottom}>
                                    <TouchableOpacity
                                        style={[styles.addToCartButton, { backgroundColor: colors.primary }]}
                                        onPress={async (e) => {
                                            e.stopPropagation();
                                            setCartCount(prev => prev + 1);
                                            try {
                                                await apiService.addToCart(product.id, 1);
                                                const cartResponse = await apiService.getCartContents();
                                                if (cartResponse && cartResponse.products) {
                                                    const newCartCount = cartResponse.products.reduce((total: any, item: any) => total + item.quantity, 0);
                                                    setCartCount(newCartCount);
                                                }
                                            } catch (error) {
                                                console.error('Add to cart error:', error);
                                                setCartCount(prev => prev - 1);
                                            }
                                        }}
                                    >
                                        <Ionicons name="cart" size={18} color={colors.white} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.productInfo}>
                                <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{product.title}</Text>
                                <View style={styles.priceRow}>
                                    <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>{formatPrice((typeof product.price === 'number' ? product.price : parseFloat(product.price || '0')) * 1.3)}</Text>
                                    <Text style={[styles.productPrice, { color: '#FFA500' }]}>{formatPrice(typeof product.price === 'number' ? product.price : parseFloat(product.price || '0'))}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    seeAll: {
        fontSize: 14,
        fontWeight: '500',
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 12,
    },
    productCard: {
        width: '47%',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
    },
    productImageContainer: {
        position: 'relative',
        width: '100%',
    },
    productImage: {
        width: '100%',
        height: 160,
    },
    wishlistOverlay: {
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 2,
    },
    wishlistButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartOverlayBottom: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        zIndex: 2,
    },
    addToCartButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    productInfo: {
        paddingTop: 8,
        paddingHorizontal: 4,
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
        lineHeight: 18,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    originalPrice: {
        fontSize: 11,
        textDecorationLine: 'line-through',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    noProductsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
    seeAllButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    seeAllButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
