import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import SafeImage from './SafeImage';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useColorScheme';

interface ProductGridItemProps {
  product: any;
  onPress: () => void;
  onAddToCart: () => void;
}

const ProductGridItem: React.FC<ProductGridItemProps> = ({ product, onPress, onAddToCart }) => {
  const colors = useThemeColors();
  const isDarkMode = String(colors.background).toLowerCase() === '#000000';
  return (
    <View style={styles.gridItem}>
      <TouchableOpacity
        style={[styles.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <SafeImage source={{ uri: product.image }} style={[styles.productImage, { backgroundColor: colors.background }]} />

        <View style={styles.productDetails}>
          <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{product.title}</Text>

          <View style={styles.bottomRow}>
            <Text style={[styles.productPrice, { color: isDarkMode ? colors.white : colors.primary }]}>{`₦${product.price.toFixed(2)}`}</Text>

            <TouchableOpacity
              style={[styles.addToCartButton, { backgroundColor: colors.primary }]}
              onPress={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
            >
              <Ionicons name="cart" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  gridItem: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  productCard: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 16,
  },
  productImage: {
    width: '100%',
    height: 160,
  },
  productDetails: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
    lineHeight: 20,
    height: 40, // Fixed height for 2 lines to keep alignment
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  addToCartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#042861',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default ProductGridItem;
