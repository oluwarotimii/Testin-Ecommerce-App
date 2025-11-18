import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColors } from '@/hooks/useColorScheme';
import SkeletonLoader from './SkeletonLoader';

const SkeletonCategoryItem: React.FC<{ viewMode?: 'grid' | 'list' }> = ({ viewMode = 'grid' }) => {
  const colors = useThemeColors();
  
  return (
    <View style={[
      styles.container, 
      viewMode === 'list' ? styles.listContainer : styles.gridContainer,
      { backgroundColor: colors.surface }
    ]}>
      {viewMode === 'grid' ? (
        <>
          <SkeletonLoader width="100%" height={80} borderRadius={12} marginBottom={12} />
          <SkeletonLoader width="80%" height={16} style={styles.centerContent} />
        </>
      ) : (
        <>
          <SkeletonLoader width={32} height={32} borderRadius={16} marginBottom={0} />
          <View style={styles.listContent}>
            <SkeletonLoader width="70%" height={16} marginBottom={0} />
          </View>
          <SkeletonLoader width={20} height={20} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  gridContainer: {
    width: '47%',
    padding: 16,
    marginBottom: 12,
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginBottom: 0,
  },
  centerContent: {
    alignSelf: 'center',
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
  },
});

export default SkeletonCategoryItem;