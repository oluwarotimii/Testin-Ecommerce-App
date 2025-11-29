import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColors } from '@/hooks/useColorScheme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  marginBottom?: number;
  style?: any;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  marginBottom = 8,
  style
}) => {
  const colors = useThemeColors();

  return (
    <View style={[
      styles.skeleton,
      {
        width,
        height,
        borderRadius,
        marginBottom,
        backgroundColor: colors.textSecondary + '40' // 40% opacity
      },
      style
    ]} />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    opacity: 0.6,
    overflow: 'hidden',
  },
});

export default SkeletonLoader;