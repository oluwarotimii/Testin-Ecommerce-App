import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import SafeImage from './SafeImage';
import { Ionicons } from '@expo/vector-icons';

interface ProductGridItemProps {
  product: any;
  onPress: () => void;
  onAddToCart: () => void;
}

const ProductGridItem: React.FC<ProductGridItemProps> = ({ product, onPress, onAddToCart }) => {
  return (
    <View style={styles.gridItem}>
      <TouchableOpacity
        style={styles.productCard}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <SafeImage source={{ uri: product.image }} style={styles.productImage} />

        <View style={styles.productDetails}>
          <Text style={styles.productName} numberOfLines={2}>{product.title}</Text>

          <View style={styles.bottomRow}>
            <Text style={styles.productPrice}>{`₦${product.price.toFixed(2)}`}</Text>

            <TouchableOpacity
              style={styles.addToCartButton}
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F2F2F7',
  },
  productDetails: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
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
    color: '#007AFF',
  },
  addToCartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
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