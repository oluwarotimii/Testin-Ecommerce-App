import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useThemeColors } from '@/hooks/useColorScheme';
import { radius, spacing, shadow } from '@/constants/designTokens';

interface CardProps {
  children: React.ReactNode;
  variant?: 'flat' | 'raised';
  style?: StyleProp<ViewStyle>;
}

// Shared surface so cards stop each defining their own one-off
// borderRadius/shadow combo. 'flat' is the default low-emphasis card
// (lists, info boxes); 'raised' is for content that should pop off the
// background (hero promos, modals).
export default function Card({ children, variant = 'flat', style }: CardProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: colors.surface },
        variant === 'raised' ? shadow.raised : shadow.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
});
