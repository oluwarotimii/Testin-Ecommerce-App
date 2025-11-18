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
        height={viewMode === 'list' ? 100 : 140} 
        borderRadius={12}
        marginBottom={12}
      />
      <View style={styles.textContainer}>
        <SkeletonLoader width="80%" height={16} marginBottom={8} />
        <SkeletonLoader width="60%" height={14} marginBottom={4} />
        <SkeletonLoader width="40%" height={16} />
      </View>
      {viewMode === 'grid' && (
        <View style={styles.gridBottomContainer}>
          <SkeletonLoader width={60} height={36} borderRadius={18} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gridContainer: {
    width: '47%',
    marginBottom: 12,
  },
  listContainer: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  gridBottomContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
});

export default SkeletonProductItem;