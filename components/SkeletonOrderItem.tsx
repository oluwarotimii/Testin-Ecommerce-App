import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColors } from '@/hooks/useColorScheme';
import SkeletonLoader from './SkeletonLoader';

const SkeletonOrderItem: React.FC = () => {
  const colors = useThemeColors();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.infoContainer}>
          <SkeletonLoader width={100} height={16} marginBottom={4} />
          <SkeletonLoader width={80} height={14} />
        </View>
        <View style={styles.statusContainer}>
          <SkeletonLoader width={60} height={20} borderRadius={10} />
        </View>
      </View>
      
      <View style={styles.details}>
        <SkeletonLoader width="30%" height={14} marginBottom={8} />
        <SkeletonLoader width="40%" height={18} />
      </View>
      
      <View style={styles.actions}>
        <SkeletonLoader width={80} height={32} borderRadius={8} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoContainer: {
    flex: 1,
  },
  statusContainer: {
    marginLeft: 12,
  },
  details: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default SkeletonOrderItem;