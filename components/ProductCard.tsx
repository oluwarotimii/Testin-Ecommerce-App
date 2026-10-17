import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import SafeImage from '@/components/SafeImage';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useColorScheme';
import { formatPrice } from '@/utils/formatNumber';
import { spacing, radius, typeScale, fontFamily, shadow } from '@/constants/designTokens';
import SalePill from '@/components/SalePill';

interface ProductCardProps {
    product: any;
    onPress: () => void;
    isLiked: boolean;
    onToggleWishlist: () => void;
    onAddToCart?: () => void;
    addingToCart?: boolean;
    cartSuccess?: boolean;
    style?: StyleProp<ViewStyle>;
}

export default function ProductCard({ product, onPress, isLiked, onToggleWishlist, onAddToCart, addingToCart, cartSuccess, style }: ProductCardProps) {
    const colors = useThemeColors();
    const isDarkMode = String(colors.background).toLowerCase() === '#000000';

    // Use the real WooCommerce regular/sale price data (already computed by
    // transformProducts) instead of a fabricated markup, so the discount
    // badge and strikethrough price reflect an actual sale.
    const price = typeof product.price === 'number' ? product.price : parseFloat(product.price || '0');
    const originalPrice = typeof product.original_price === 'number'
        ? product.original_price
        : parseFloat(product.original_price ?? product.price ?? '0');
    const isOnSale = originalPrice > price;
    const percentOff = isOnSale ? ((originalPrice - price) / originalPrice) * 100 : 0;

    return (
        <TouchableOpacity
            style={[styles.productCard, { backgroundColor: colors.surface }, style]}
            onPress={onPress}
        >
            <View style={styles.productImageContainer}>
                <SafeImage source={{ uri: product.image }} style={styles.productImage} />

                {isOnSale && (
                    <View style={styles.saleOverlay}>
                        <SalePill percentOff={percentOff} />
                    </View>
                )}

                <View style={styles.wishlistOverlay}>
                    <TouchableOpacity
                        style={[styles.wishlistButton, { backgroundColor: colors.surface }]}
                        onPress={(e) => {
                            e.stopPropagation();
                            onToggleWishlist();
                        }}
                    >
                        <Ionicons
                            name={isLiked ? "heart" : "heart-outline"}
                            size={16}
                            color={isLiked ? colors.error : colors.text}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.cartOverlayBottom}>
                    <TouchableOpacity
                        style={[styles.addToCartButton, { backgroundColor: colors.primary }]}
                        onPress={(e) => {
                            e.stopPropagation();
                            if (onAddToCart) {
                                onAddToCart();
                            }
                        }}
                    >
                        <Ionicons name={addingToCart ? "checkmark" : "cart"} size={18} color={colors.white} />
                    </TouchableOpacity>
                </View>

                {cartSuccess && (
                    <View style={styles.successOverlay}>
                        <Ionicons name="checkmark-circle" size={24} color="#4CD964" />
                    </View>
                )}
            </View>

            <View style={styles.productDetails}>
                <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{product.title}</Text>
                <View style={styles.priceContainer}>
                    <View>
                        {isOnSale && (
                            <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>{formatPrice(originalPrice)}</Text>
                        )}
                        <Text style={[styles.productPrice, { color: isDarkMode ? colors.white : colors.primary }]}>{formatPrice(price)}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    productCard: {
        width: '47%', // Default width for a 2-up grid; override via `style` for other column counts
        borderRadius: radius.xl,
        overflow: 'hidden',
        position: 'relative',
        marginBottom: spacing.lg,
        ...shadow.card,
    },
    productImageContainer: {
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: 200, // Increased height to prevent image cutoff
    },
    saleOverlay: {
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 2,
    },
    wishlistOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 2,
    },
    cartOverlayBottom: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        zIndex: 2,
    },
    wishlistButton: {
        width: 32,
        height: 32,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addToCartButton: {
        width: 36,
        height: 36,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
    },
    productDetails: {
        padding: spacing.md,
    },
    productName: {
        fontSize: typeScale.body,
        fontFamily: fontFamily.medium,
        marginBottom: spacing.xs + 4,
        height: 40,
        lineHeight: 20,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    originalPrice: {
        fontSize: typeScale.small,
        fontFamily: fontFamily.regular,
        textDecorationLine: 'line-through',
    },
    productPrice: {
        fontSize: typeScale.bodyLarge,
        fontFamily: fontFamily.bold,
    },
    successOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3,
    },
});
