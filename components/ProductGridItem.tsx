import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
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
      >
        <Image source={{ uri: product.image }} style={styles.productImage} />
        {/* Bottom overlay with blur/opacity */}
        <View style={[styles.productOverlay, { backgroundColor: '#F2F2F7CC' }]}>
          <View style={styles.productTextContainer}>
            <Text style={[styles.productName, { color: '#1D1D1F' }]} numberOfLines={2}>{product.title}</Text>
            <Text style={[styles.productPrice, { color: '#007AFF' }]}>{`₦${product.price.toFixed(2)}`}</Text>
          </View>
          <View style={styles.productActions}>
            <TouchableOpacity
              style={[styles.addToCartButton, { backgroundColor: '#007AFF' }]}
              onPress={(e) => {
                e.stopPropagation(); // Prevent triggering the product detail navigation
                onAddToCart();
              }}
            >
              <Ionicons name="cart" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  gridItem: {
    width: '47%',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    overflow: 'hidden',
  },
  productCard: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E5EA',
  },
  productOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  productTextContainer: {
    flex: 1,
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  addToCartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductGridItem;