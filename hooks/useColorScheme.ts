import { useColorScheme as useNativeColorScheme } from 'react-native';
import { Colors, ColorScheme } from '@/constants/Colors';

export function useColorScheme(): ColorScheme {
  return useNativeColorScheme() ?? 'light';
}

export function useThemeColors() {
  const colorScheme = useColorScheme();
  return Colors[colorScheme];
}