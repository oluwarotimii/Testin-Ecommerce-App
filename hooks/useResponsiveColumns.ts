import { useWindowDimensions } from 'react-native';

// Product/category grids were hardcoded to numColumns=2 everywhere, which
// looks sparse and wastes space on tablets/foldables. This picks a column
// count from actual screen width so the same grid code adapts instead of
// every screen needing its own breakpoint logic.
export function useResponsiveColumns(baseColumns: number = 2): number {
  const { width } = useWindowDimensions();

  if (width >= 900) return baseColumns + 2;
  if (width >= 600) return baseColumns + 1;
  return baseColumns;
}
