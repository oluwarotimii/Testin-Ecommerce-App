import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
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
    const [cartSuccess, setCartSuccess] = useState<{ [key: number]: boolean }>({});
    const isFetching = useRef(false);

    const fetchFeaturedCategory = useCallback(async (reset: boolean = false) => {
        if (!apiService || isFetching.current) return;

        isFetching.current = true;

        if (reset) {
            setLoadingFeatured(true);
        }

        try {
            // Try to find 'daily-deals' category first
            let categories = await apiService.getCategories({ slug: 'daily-deals' });

            // If not found, fallback to first category
            if (!categories || categories.length === 0) {
                categories = await apiService.getCategories({ per_page: 1 });
            }

            if (categories && categories.length > 0) {
                const category = categories[0];

                if (reset) {
                    setFeaturedCategoryId(category.id);
                }

                // Fetch ALL products for this category (no pagination)
                const products = await apiService.getProducts({
                    category: category.id,
                    per_page: 100,  // Fetch all products in one request
                });

                const transformed = transformProducts(products);

                if (reset) {
                    setFeaturedProducts(transformed);
                }
            } else {
                // If no category is found, fetch all products (no pagination)
                const products = await apiService.getProducts({
                    per_page: 100,  // Fetch all products in one request
                });

                const transformed = transformProducts(products);

                if (reset) {
                    setFeaturedProducts(transformed);
                }
            }
        } catch (error) {
            console.error('Error fetching featured category:', error);
        } finally {
            setLoadingFeatured(false);
            isFetching.current = false;
        }
    }, [apiService]); // Simplified dependency array

    // OPTIMIZED: Fetch only once on mount
    useEffect(() => {
        if (apiService) {
            fetchFeaturedCategory(true); // Reset and load first page
        }
    }, [apiService]); // Only apiService as dependency

    // Render individual product item
    const renderProductItem = (item: any) => (
        <TouchableOpacity
            key={item.id}
            style={styles.productCard}
            onPress={() => router.push(`/product/${item.id}` as any)}
        >
            <View style={styles.productImageContainer}>
                <SafeImage source={{ uri: item.image }} style={[styles.productImage, { backgroundColor: colors.background }]} />

                {/* Sales Badge */}
                <View style={styles.saleBadge}>
                    <Text style={styles.saleBadgeText}>SALE</Text>
                </View>

                <View style={styles.wishlistOverlay}>
                    <TouchableOpacity
                        style={[styles.wishlistButton, { backgroundColor: colors.surface }]}
                        onPress={(e) => {
                            e.stopPropagation();
                            toggleWishlist(item.id);
                        }}
                    >
                        <Ionicons
                            name={wishlist.includes(item.id) ? "heart" : "heart-outline"}
                            size={16}
                            color={wishlist.includes(item.id) ? "#FF3B30" : colors.text}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.cartOverlayBottom}>
                    <TouchableOpacity
                        style={[styles.addToCartButton, { backgroundColor: colors.primary }]}
                        onPress={async (e) => {
                            e.stopPropagation();
                            // Optimistic update for faster UI response
                            setCartCount(prev => prev + 1);

                            try {
                                // OPTIMIZED: Pass product data to avoid additional API call
                                const result = await apiService.addToCart(item.id, 1, item);
                                console.log(`Added ${item.title} to cart!`, result);

                                // Show success indicator
                                setCartSuccess(prev => ({ ...prev, [item.id]: true }));
                                setTimeout(() => {
                                    setCartSuccess(prev => {
                                        const newCartSuccess = { ...prev };
                                        delete newCartSuccess[item.id];
                                        return newCartSuccess;
                                    });
                                }, 1500); // Hide after 1.5 seconds

                                
                            } catch (error) {
                                console.error("Add to cart error:", error);
                                // Revert optimistic update on error
                                setCartCount(prev => prev - 1);
                            }
                        }}
                    >
                        <Ionicons name="cart" size={18} color={colors.white} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
                <View style={styles.priceRow}>
                    <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>{formatPrice((typeof item.price === 'number' ? item.price : parseFloat(item.price || '0')) * 1.3)}</Text>
                    <Text style={[styles.productPrice, { color: '#FFA500' }]}>{formatPrice(typeof item.price === 'number' ? item.price : parseFloat(item.price || '0'))}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

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
        return null;
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
                    {featuredProducts.map(renderProductItem)}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
        width: '100%',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 16,
        marginBottom: 12,
        // borderColor: 'red',
        // borderWidth: 2,
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
        paddingBottom: 20,
    },
    productCard: {
        width: '47%', // Two items per row with proper spacing
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        marginBottom: 16,
    },
    productImageContainer: {
        position: 'relative',
        width: '100%',
    },
    productImage: {
        width: '100%',
        height: 200, // Increased height to prevent image cutoff
    },
    saleBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FF3B30', // Red color for sale
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
        zIndex: 3,
    },
    saleBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
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
    loadingMoreContainer: {
        width: '100%',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
