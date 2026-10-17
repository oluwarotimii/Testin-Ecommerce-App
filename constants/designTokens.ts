// Shared layout primitives so screens stop inventing their own one-off
// spacing/radius/font values. Values here match what was already in use
// across the app (not a visual redesign) - this just gives the existing
// scale a name so new screens reach for a token instead of a magic number.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// Material-3-inspired shape scale: a fuller step range than before, leaning
// into bigger corner radii for a softer feel on hero surfaces (cards,
// sheets, banners) while keeping small controls tighter.
export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 9999,
} as const;

export const typeScale = {
  caption: 11,
  small: 12,
  body: 14,
  bodyLarge: 16,
  subtitle: 18,
  title: 20,
  headline: 22,
  display: 28,
} as const;

export const motion = {
  quick: 100,
  fast: 150,
  standard: 300,
} as const;

// Soft, low-contrast shadows (lower opacity, wider blur) read as "gentle"
// rather than the harder shadowOpacity:0.1/shadowRadius:4 combo that was
// copy-pasted across cards before. `elevation` is the Android equivalent -
// kept in the same step so a component only needs one token.
export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  raised: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

// Roboto matches the Material 3 reference directly and reads as a cleaner,
// more neutral UI font. Weight-specific font files (not a single family +
// fontWeight) since that's how custom TTFs work in React Native -
// fontWeight is ignored once a custom fontFamily is set.
export const fontFamily = {
  regular: 'Roboto_400Regular',
  medium: 'Roboto_500Medium',
  semiBold: 'Roboto_600SemiBold',
  bold: 'Roboto_700Bold',
  extraBold: 'Roboto_800ExtraBold',
} as const;

// Deal/urgency accent for a bargain-marketplace feel - kept separate from
// the primary brand blue so discount badges and "sale" signals stand out
// against it rather than blending in.
export const accent = {
  sale: '#FF2D78',
  saleDark: '#FF4D8A',
} as const;
