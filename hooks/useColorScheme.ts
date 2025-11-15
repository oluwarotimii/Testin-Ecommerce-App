import { Colors, ColorScheme } from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';

export function useThemeColors() {
  const { colorScheme } = useTheme();
  return Colors[colorScheme];
}