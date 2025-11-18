import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColors } from '@/hooks/useColorScheme';
import SkeletonLoader from './SkeletonLoader';

const SkeletonCartItem: React.FC = () => {
  const colors = useThemeColors();
  
  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <SkeletonLoader width={80} height={80} borderRadius={12} marginBottom={12} />
      <View style={styles.detailsContainer}>
        <SkeletonLoader width="70%" height={16} marginBottom={8} />
        <SkeletonLoader width="40%" height={14} marginBottom={8} />
        <View style={styles.quantityContainer}>
          <SkeletonLoader width={32} height={32} borderRadius={8} />
          <SkeletonLoader width={40} height={16} marginBottom={0} style={styles.quantityText} />
          <SkeletonLoader width={32} height={32} borderRadius={8} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityText: {
    marginHorizontal: 12,
  },
});

export default SkeletonCartItem;