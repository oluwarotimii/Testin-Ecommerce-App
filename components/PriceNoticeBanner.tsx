import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useColorScheme';

interface PriceNoticeBannerProps {
  onPress?: () => void;
  onDismiss?: () => void;
}

export default function PriceNoticeBanner({ onPress, onDismiss }: PriceNoticeBannerProps) {
  const colors = useThemeColors();
  const isDarkMode = String(colors.background).toLowerCase() === '#000000';

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: isDarkMode ? '#1C2A1C' : '#E8F5E9' }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconWrapper, { backgroundColor: isDarkMode ? '#2E7D3220' : '#4CAF5020' }]}>
        <Ionicons name="pricetag-outline" size={20} color={isDarkMode ? '#81C784' : '#2E7D32'} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: isDarkMode ? '#A5D6A7' : '#1B5E20' }]}>
          App Exclusive Pricing
        </Text>
        <Text style={[styles.message, { color: isDarkMode ? '#C8E6C9' : '#388E3C' }]}>
          Prices on this app may be lower than in-store prices. Order here for the best deals!
        </Text>
      </View>
      {onDismiss && (
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={18} color={isDarkMode ? '#81C784' : '#2E7D32'} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
});
