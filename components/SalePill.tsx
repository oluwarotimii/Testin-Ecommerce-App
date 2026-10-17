import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { radius, spacing, typeScale, fontFamily, accent } from '@/constants/designTokens';

interface SalePillProps {
  percentOff: number;
}

// Punchy discount badge for product cards - the "get more for less" brand
// promise should be visible on the card itself, not just implied by a
// strikethrough price.
export default function SalePill({ percentOff }: SalePillProps) {
  if (!percentOff || percentOff <= 0) return null;

  return (
    <View style={styles.pill}>
      <Text style={styles.text}>-{Math.round(percentOff)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: accent.sale,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  text: {
    color: '#FFFFFF',
    fontFamily: fontFamily.bold,
    fontSize: typeScale.caption,
  },
});
