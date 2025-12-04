import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import SafeImage from '@/components/SafeImage';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useColorScheme';
import { formatPrice } from '@/utils/formatNumber';

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

    // Calculate discount percentage if original price exists and is higher than current price
    const price = typeof product.price === 'number' ? product.price : parseFloat(product.price || '0');
    const originalPrice = price * 1.3; // Mock original price as per design

    return (
        <TouchableOpacity
            style={[styles.productCard, { backgroundColor: colors.surface }, style]}
            onPress={onPress}
        >
            <View style={styles.productImageContainer}>
                <SafeImage source={{ uri: product.image }} style={[styles.productImage, { backgroundColor: colors.background }]} />

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
                            color={isLiked ? "#FF3B30" : colors.text}
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
                        <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>{formatPrice(originalPrice)}</Text>
                        <Text style={[styles.productPrice, { color: '#FFA500' }]}>{formatPrice(price)}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    productCard: {
        width: '47%', // Default width for grid
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        marginBottom: 16,
    },
    productImageContainer: {
        position: 'relative',
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
    cartOverlayBottom: {
        position: 'absolute',
        bottom: 8,
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
    addToCartButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    productDetails: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
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
        fontSize: 12,
        textDecorationLine: 'line-through',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    addToCartButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
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
