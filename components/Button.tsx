import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useColorScheme';
import { radius, spacing, typeScale, fontFamily } from '@/constants/designTokens';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'filled' | 'outline' | 'text';
  size?: 'md' | 'lg';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

// M3-style fully-rounded (pill) action shape - the single most recognizable
// shape cue for the "softer" direction, used everywhere a screen needs a
// primary/secondary/tertiary action instead of each screen hand-rolling its
// own TouchableOpacity + ad hoc borderRadius.
export default function Button({
  title,
  onPress,
  variant = 'filled',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}: ButtonProps) {
  const colors = useThemeColors();
  const isDisabled = disabled || loading;

  const variantStyle =
    variant === 'filled'
      ? { backgroundColor: isDisabled ? colors.border : colors.primary, borderWidth: 0 }
      : variant === 'outline'
      ? { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: isDisabled ? colors.border : colors.primary }
      : { backgroundColor: 'transparent', borderWidth: 0 };

  const textColor =
    variant === 'filled' ? colors.white : isDisabled ? colors.textSecondary : colors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        variantStyle,
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'filled' ? colors.white : colors.primary} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={20} color={textColor} style={styles.icon} />}
          <Text style={[styles.text, size === 'lg' && styles.textLg, { color: textColor }]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.xs + 4,
  },
  fullWidth: {
    width: '100%',
  },
  md: {
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.xl,
    minHeight: 48,
  },
  lg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },
  text: {
    fontSize: typeScale.body,
    fontFamily: fontFamily.semiBold,
  },
  textLg: {
    fontSize: typeScale.bodyLarge,
  },
});
