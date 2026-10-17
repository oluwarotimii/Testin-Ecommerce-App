import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { HeartIcon, ShoppingCartIcon, CheckIcon } from 'phosphor-react-native';
import SafeImage from '@/components/SafeImage';
import SkeletonProductItem from '@/components/SkeletonProductItem';
import SalePill from '@/components/SalePill';
import { useCart } from '@/context/CartContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import { formatPrice } from '@/utils/formatNumber';

interface Product {
    id: number;
    title: string;
    image: string;
    price: string | number;
    original_price?: string | number;
    categories?: { id: number; name: string; slug: string }[];
}

interface BestDealsSectionProps {
    featuredProducts: Product[];
    loadingFeatured: boolean;
    errorFeatured: string | null;
    wishlist: number[];
    toggleWishlist: (productId: number) => Promise<void>;
    onRefresh?: () => void;
    apiService?: any;
}

export default function BestDealsSection({
    featuredProducts,
    loadingFeatured,
    errorFeatured,
    wishlist,
    toggleWishlist,
    onRefresh,
    apiService,
}: BestDealsSectionProps) {
    const router = useRouter();
    const colors = useThemeColors();
    const isDarkMode = String(colors.background).toLowerCase() === '#000000';
    const { setCartCount } = useCart();
    const [cartSuccess, setCartSuccess] = useState<{ [key: number]: boolean }>({});

    // Render individual product item
    const renderProductItem = (item: any) => {
        const price = typeof item.price === 'number' ? item.price : parseFloat(item.price || '0');
        const originalPrice = typeof item.original_price === 'number' ? item.original_price : parseFloat(item.original_price || '0');
        const isOnSale = originalPrice > price;
        const percentOff = isOnSale ? ((originalPrice - price) / originalPrice) * 100 : 0;

        return (
        <TouchableOpacity
            key={item.id}
            style={styles.productCard}
            onPress={() => router.push(`/product/${item.id}` as any)}
        >
            <View style={styles.productImageContainer}>
                {/* OPTIMIZED: Use WooCommerce thumbnail if available, fallback to regular image */}
                <SafeImage
                    source={{ uri: item.thumbnail || item.image }}
                    style={[styles.productImage, { backgroundColor: colors.background }]}
                />

                {isOnSale && (
                    <View style={styles.saleBadge}>
                        <SalePill percentOff={percentOff} />
                    </View>
                )}

                <View style={styles.wishlistOverlay}>
                    <TouchableOpacity
                        style={[styles.wishlistButton, { backgroundColor: colors.surface }]}
                        onPress={(e) => {
                            e.stopPropagation();
                            toggleWishlist(item.id);
                        }}
                    >
                        <HeartIcon
                            weight={wishlist.includes(item.id) ? "fill" : "regular"}
                            size={16}
                            color={wishlist.includes(item.id) ? colors.error : colors.text}
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
                        {cartSuccess[item.id]
                            ? <CheckIcon weight="bold" size={18} color={colors.white} />
                            : <ShoppingCartIcon weight="fill" size={18} color={colors.white} />}
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
                <View style={styles.priceRow}>
                    {isOnSale && (
                        <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>{formatPrice(originalPrice)}</Text>
                    )}
                    <Text style={[styles.productPrice, { color: isDarkMode ? colors.white : colors.primary }]}>{formatPrice(price)}</Text>
                </View>
            </View>
        </TouchableOpacity>
        );
    };

    if (loadingFeatured) {
        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Best Deals</Text>
                    <TouchableOpacity
                        style={[styles.seeAllButton, { backgroundColor: colors.primary }]}
                        onPress={onRefresh}
                        disabled={true}
                    >
                        <Text style={[styles.seeAllButtonText, { color: colors.white }]}>See All</Text>
                    </TouchableOpacity>
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

    // Show error state but don't block - just show empty
    if (errorFeatured) {
        console.warn('BestDealsSection error:', errorFeatured);
        // Silently fail - don't show error UI, just empty state
        // This provides better UX than an error message
        return null;
    }

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Best Deals</Text>
                <TouchableOpacity
                    style={[styles.seeAllButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                        // Navigate to first product's category if available, otherwise all products
                        const firstCategory = featuredProducts[0]?.categories?.[0];
                        if (firstCategory) {
                            router.push(`/category/${firstCategory.id}` as any);
                        } else {
                            router.push('/products');
                        }
                    }}
                >
                    <Text style={[styles.seeAllButtonText, { color: colors.white }]}>See All</Text>
                </TouchableOpacity>
            </View>

            {loadingFeatured ? (
                <View style={styles.productsGrid}>
                    <SkeletonProductItem viewMode="grid" />
                    <SkeletonProductItem viewMode="grid" />
                    <SkeletonProductItem viewMode="grid" />
                    <SkeletonProductItem viewMode="grid" />
                </View>
            ) : featuredProducts.length === 0 ? (
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
        zIndex: 3,
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
