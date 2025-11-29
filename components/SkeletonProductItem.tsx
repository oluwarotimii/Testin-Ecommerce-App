import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColors } from '@/hooks/useColorScheme';
import SkeletonLoader from './SkeletonLoader';

const SkeletonProductItem: React.FC<{ viewMode?: 'grid' | 'list' }> = ({ viewMode = 'grid' }) => {
  const colors = useThemeColors();

  return (
    <View style={[
      styles.container,
      viewMode === 'list' ? styles.listContainer : styles.gridContainer,
      { backgroundColor: colors.surface }
    ]}>
      <SkeletonLoader
        width={viewMode === 'list' ? 100 : '100%'}
        height={viewMode === 'list' ? 100 : 160}
        borderRadius={viewMode === 'list' ? 12 : 0}
        marginBottom={0}
      />
      <View style={styles.textContainer}>
        <SkeletonLoader width="90%" height={16} marginBottom={8} />
        <SkeletonLoader width="60%" height={16} marginBottom={12} />

        {viewMode === 'grid' && (
          <View style={styles.bottomRow}>
            <SkeletonLoader width="40%" height={20} />
            <SkeletonLoader width={36} height={36} borderRadius={18} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  gridContainer: {
    width: '48%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  listContainer: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
    padding: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
});

export default SkeletonProductItem;